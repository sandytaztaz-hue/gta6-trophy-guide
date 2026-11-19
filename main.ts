// Leonida Trophy Atlas — hand-in program (Node 22, standard library only).
// The guide itself is the static app/ folder: index.html plus ES modules, CSS and
// the trophy data, all offline. This program copies app/ and screenshots/ from
// beside this file into the hand-in folder and writes dossier.json there with the
// vendored make.fun library. Leave vendor/makefun-frontend.ts untouched: the
// scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app locally while building with `node serve.ts` (http://localhost:8080).

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const handInDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  const index = join(repoRoot, 'app', 'index.html');
  if (!existsSync(index) || !statSync(index).isFile()) {
    throw new Error('app/index.html is missing — the guide cannot be handed in');
  }
  const shots = join(repoRoot, 'screenshots');
  const shotFiles = existsSync(shots)
    ? readdirSync(shots).filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    : [];
  if (shotFiles.length < 3 || shotFiles.length > 4) {
    throw new Error(`expected 3-4 screenshots, found ${shotFiles.length}`);
  }
  mkdirSync(handInDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(handInDir, 'app'), { recursive: true });
  mkdirSync(join(handInDir, 'screenshots'), { recursive: true });
  if (existsSync(shots)) cpSync(shots, join(handInDir, 'screenshots'), { recursive: true });

  // The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
  // bytes; the others refuse an entry the scorer would refuse (more than 4
  // screenshots or one over 256 KiB; more than 993 files and directories in app/
  // or 48 MiB of app files — app/ counts beside /output's own 1000-entry cap,
  // its screenshots/ and dossier.json).
  const dossier = buildDossier(handInDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(handInDir, 'dossier.json'), dossier);
}

handIn();
