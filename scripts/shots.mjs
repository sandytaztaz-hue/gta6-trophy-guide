// Leonida Trophy Atlas — scripts/shots.mjs takes the 4 screenshots in shots.json.
// It serves app/ on a local port, drives headless Chrome over CDP, waits for
// window.__shotReady on each ?shot= view, and saves JPEG q85 renders into
// screenshots/. Run: node scripts/shots.mjs  (Node 22; no dependencies).
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const shots = JSON.parse(readFileSync(join(repo, 'shots.json'), 'utf8'));
const CHROME = process.env.CHROME_PATH
  ?? '/home/hatch/.cache/puppeteer/chrome/linux-157.0.8103.50/chrome-linux64/chrome';
const PORT = Number(process.env.SHOT_PORT || '8123');
const DEBUG_PORT = Number(process.env.SHOT_DEBUG_PORT || '9222');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/`);
      if (res.ok) return;
    } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error('serve.ts did not come up');
}

async function waitForDebug() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (res.ok) return await res.json();
    } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error('Chrome DevTools did not come up');
}

// Minimal CDP client over Node's built-in WebSocket.
function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const ready = new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  return { ready, send, close: () => ws.close() };
}

async function waitShotReady(client, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const r = await client.send('Runtime.evaluate', { expression: 'window.__shotReady === true', returnByValue: true });
    if (r.result && r.result.value === true) return;
    await sleep(150);
  }
  throw new Error('__shotReady never became true');
}

async function main() {
  mkdirSync(join(repo, 'screenshots'), { recursive: true });
  const server = spawn(process.execPath, ['serve.ts', '--port', String(PORT)], { cwd: repo, stdio: 'ignore' });
  try {
    await waitForServer();
    const chrome = spawn(CHROME, [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
      `--remote-debugging-port=${DEBUG_PORT}`, '--window-size=1280,800', 'about:blank',
    ], { stdio: 'ignore' });
    try {
      await waitForDebug();
      const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      const page = targets.find((t) => t.type === 'page');
      if (!page) throw new Error('no page target');
      const client = cdp(page.webSocketDebuggerUrl);
      await client.ready;
      await client.send('Page.enable');
      await client.send('Runtime.enable');
      for (const shot of shots) {
        const url = `http://127.0.0.1:${PORT}${shot.path}`;
        await client.send('Emulation.setDeviceMetricsOverride', {
          width: shot.viewport.width, height: shot.viewport.height, deviceScaleFactor: 1, mobile: false,
        });
        await client.send('Page.navigate', { url });
        await waitShotReady(client);
        await sleep(400);
        const snap = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: shot.quality || 85 });
        const file = join(repo, 'screenshots', shot.file);
        writeFileSync(file, Buffer.from(snap.data, 'base64'));
        const { statSync } = await import('node:fs');
        console.log(`shot ${shot.file} <- ${shot.path} (${statSync(file).size} bytes)`);
      }
      client.close();
    } finally {
      chrome.kill('SIGKILL');
    }
  } finally {
    server.kill('SIGKILL');
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
