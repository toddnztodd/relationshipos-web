/**
 * stamp-sw.mjs
 *
 * Replaces the __RELATE_SW_VERSION__ placeholder in dist/public/sw.js with a
 * unique build-time version string so every deploy invalidates the old cache.
 *
 * Run automatically as part of the build via package.json "build" script.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Generate a version string: timestamp + short random suffix
const version = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Paths to stamp
const targets = [
  join(rootDir, 'dist', 'public', 'sw.js'),  // production build
  join(rootDir, 'client', 'public', 'sw.js'), // dev (so dev SW also gets a fresh version)
];

let stamped = 0;
for (const target of targets) {
  if (!existsSync(target)) continue;
  const src = readFileSync(target, 'utf-8');
  const replaced = src.replace(/__RELATE_SW_VERSION__/g, version);
  if (replaced !== src) {
    writeFileSync(target, replaced, 'utf-8');
    console.log(`[stamp-sw] Stamped ${target} → version ${version}`);
    stamped++;
  }
}

if (stamped === 0) {
  console.warn('[stamp-sw] No __RELATE_SW_VERSION__ placeholder found — skipping stamp.');
}
