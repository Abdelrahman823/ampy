// Screenshot the first step of chosen lessons (for visual review of figures).
// Usage: node tests/shots.mjs a10-1 a10-2 ...   (needs the app served)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LESSONS } from '../js/lessons.js';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const out = fileURLToPath(new URL('./screens/', import.meta.url));
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: process.env.CHANNEL ?? 'msedge' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme: process.env.SCHEME ?? 'light' });
await page.goto(BASE);
const done = Object.fromEntries(LESSONS.map((l) => [l.id, { best: 1 }]));
await page.evaluate((d) => localStorage.setItem('ampy.v1', JSON.stringify({ completed: d })), done);
await page.reload();
for (const id of process.argv.slice(2)) {
  await page.goto(`${BASE}/#/lesson/${id}`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}fig-${id}.png` });
}
await browser.close();
