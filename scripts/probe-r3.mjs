// Leonida Trophy Codex — scripts/probe-r3.mjs: 13 live checks for the r3
// revision (light theme + 310 claims + 1 missable + cited steps).
// Serves app/ on a local port, drives headless Chrome over CDP, and asserts
// against the rendered DOM of the same four views shots.mjs captures.
// Run: node scripts/probe-r3.mjs   (Node 22; no dependencies.)
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const CHROME = process.env.CHROME_PATH
  ?? '/home/hatch/.cache/puppeteer/chrome/linux-157.0.8103.50/chrome-linux64/chrome';
const PORT = Number(process.env.PROBE_PORT || '8124');
const DEBUG_PORT = Number(process.env.PROBE_DEBUG_PORT || '9223');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/`); if (r.ok) return; } catch { /* retry */ }
    await sleep(200);
  }
  throw new Error('serve.ts did not come up');
}

async function waitForDebug() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (r.ok) return await r.json();
    } catch { /* retry */ }
    await sleep(200);
  }
  throw new Error('Chrome DevTools did not come up');
}

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const ready = new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
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
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (r.exceptionDetails) throw new Error('page eval failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
  };
  return { ready, send, evalJs, close: () => ws.close() };
}

async function waitShotReady(client, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await client.evalJs('window.__shotReady === true')) return;
    await sleep(150);
  }
  throw new Error('__shotReady never became true');
}

async function go(client, path) {
  await client.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}${path}` });
  await waitShotReady(client);
  await sleep(300);
}

// A claim is one guide paragraph or one step; every claim cites its trophy's
// sources, and every trophy lists at least two sources.
function auditStats(trophies) {
  let claims = 0, backed = 0;
  for (const t of trophies) {
    const n = 1 + (t.steps || []).length;
    claims += n;
    if ((t.sources || []).length >= 2) backed += n;
  }
  return { claims, backed };
}

async function main() {
  // --- Static data checks (no browser) ----------------------------------
  const data = JSON.parse(readFileSync(join(repo, 'app/data/trophies.json'), 'utf8'));
  const trophies = data.trophies;
  const named = trophies.filter((t) => t.name && t.name.trim() && t.guide && t.guide.trim()).length;
  check('1. 55 trophies, every one named with a non-blank guide', trophies.length === 55 && named === 55, `${named}/55 named+guided`);

  const a = auditStats(trophies);
  check('2. 310/310 claims cited, all backed by 2+ sources', a.claims === 310 && a.backed === 310, `${a.claims} claims, ${a.backed} backed`);

  const late = trophies.filter((t) => t.id >= 47);
  const lateSteps = late.reduce((n, t) => n + (t.steps || []).length, 0);
  check('3. trophies 47-55 carry 41 steps (24 + 17 new)', lateSteps === 41, `${lateSteps} steps`);

  const igClaims = trophies
    .filter((t) => (t.sources || []).some((s) => s.startsWith('Insider Gaming')))
    .reduce((n, t) => n + 1 + (t.steps || []).length, 0);
  check('4. Insider Gaming cited (no 0 count in SOURCES panel)', igClaims > 0, `${igClaims} claims`);

  const missable = trophies.filter((t) => t.missable).length;
  const atRisk = trophies.filter((t) => t.watch).length;
  check('5. 1 missable, 5 at risk', missable === 1 && atRisk === 5, `${missable} missable, ${atRisk} at risk`);

  // --- Live DOM checks ----------------------------------------------------
  const server = spawn(process.execPath, ['serve.ts', '--port', String(PORT)], { cwd: repo, stdio: 'ignore' });
  try {
    await waitForServer();
    const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
      `--remote-debugging-port=${DEBUG_PORT}`, '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' });
    try {
      await waitForDebug();
      const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      const page = targets.find((t) => t.type === 'page');
      if (!page) throw new Error('no page target');
      const client = cdp(page.webSocketDebuggerUrl);
      await client.ready;
      await client.send('Page.enable');
      await client.send('Runtime.enable');

      const views = [
        ['/?shot=cover&demo=1&trophy=28', 'cover'],
        ['/?shot=roadmap&demo=1&spoiler=off', 'roadmap'],
        ['/?shot=missables&demo=1&spoiler=off', 'missables'],
        ['/?shot=detail&demo=1&trophy=28', 'detail'],
      ];

      // 6. Audit strip numbers, read off the rendered cover strip.
      await go(client, views[0][0]);
      const strip = await client.evalJs('document.getElementById("auditStrip").textContent');
      const stripOk = ['310/310 claims cited', '310 backed by 2+ sources', '8 disputes shown both ways',
        '28 pages', '20 sites', '1 missable', '5 at risk'].every((s) => strip.includes(s));
      check('6. audit strip reads 310/310, 8 disputes, 28 pages, 20 sites, 1 missable, 5 at risk', stripOk, strip.slice(0, 160));

      // 7. Light theme: the page background is near-white in every view.
      let lightOk = true, lightDetail = '';
      for (const [path, name] of views) {
        await go(client, path);
        const bg = await client.evalJs('getComputedStyle(document.body).backgroundColor');
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const lum = m ? (Number(m[1]) + Number(m[2]) + Number(m[3])) / 3 : 0;
        lightDetail += `${name}:${bg} `;
        if (lum < 200) lightOk = false;
      }
      check('7. WHITE/light theme in all 4 views', lightOk, lightDetail.trim());

      // 8-11. Cover view: NEXT UP, SOURCES panel, SOURCES DIFFER, PMA leads.
      await go(client, views[0][0]);
      const nextUp = await client.evalJs('document.querySelector(".nextup-list")?.textContent || ""');
      check('8. NEXT UP queue leads with Positive Mental Attitude (MISSABLE)', nextUp.includes('Positive Mental Attitude') && nextUp.includes('MISSABLE'), nextUp.slice(0, 90).replace(/\s+/g, ' '));

      const srcRows = await client.evalJs('[...document.querySelectorAll(".src-list li")].map((li) => li.textContent)');
      const zeroRows = srcRows.filter((r) => /—\s*0\s*$/.test(r.trim()));
      check('9. SOURCES panel visible, no source at 0 claims', srcRows.length >= 20 && zeroRows.length === 0, `${srcRows.length} sources, ${zeroRows.length} at 0`);

      const differ = await client.evalJs('document.querySelector(".sources-differ")?.textContent || ""');
      check('10. SOURCES DIFFER box visible on cover', differ.includes('SOURCES DIFFER') && differ.includes('Our call:'), differ.slice(0, 60).replace(/\s+/g, ' '));

      const paneTitle = await client.evalJs('document.querySelector(".detail-pane h2")?.textContent || ""');
      check('11. PMA leads the detail pane on cover', paneTitle === 'Positive Mental Attitude', paneTitle);

      // 12. Detail view: every HOW TO EARN IT step carries inline [n] cites.
      await go(client, views[3][0]);
      const steps = await client.evalJs('[...document.querySelectorAll(".guide-steps li")].map((li) => ({ text: li.textContent.slice(0, 40), cites: li.querySelectorAll(".cites").length, marks: (li.textContent.match(/\\[\\d+\\]/g) || []).length }))');
      const stepsOk = steps.length > 0 && steps.every((s) => s.cites > 0 && s.marks > 0);
      check('12. every step has inline source numbers [n]', stepsOk, `${steps.length} steps, all cited: ${stepsOk}`);

      // 13. Missables + Sources pages carry the r3 numbers, no stale r2 text.
      await go(client, views[2][0]);
      const missText = await client.evalJs('document.body.innerText');
      const missOk = missText.includes('Only one trophy is possibly missable') && !missText.includes('two missable trophies');
      await go(client, '/?r3probe=1#sources');
      const srcText = await client.evalJs('document.body.innerText');
      const srcOk = srcText.includes('310 of 310 claims carry a citation');
      check('13. Missables says 1 missable; Sources page says 310 of 310', missOk && srcOk, `missables:${missOk} sources:${srcOk}`);

      client.close();
    } finally {
      chrome.kill('SIGKILL');
    }
  } finally {
    server.kill('SIGKILL');
  }

  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
