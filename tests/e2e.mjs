// End-to-end: plays every lesson and the Daily Charge in a real browser,
// solving benches with real taps. Needs the app served (npm run serve).
// Usage: node tests/e2e.mjs  [BASE=http://127.0.0.1:5173]
import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { UNIT } from '../js/lessons.js';
import { fmtOhms } from '../js/sim.js';
import { solution } from './lib/solver.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const SHOTS = fileURLToPath(new URL('./screens/', import.meta.url));
mkdirSync(SHOTS, { recursive: true });
const plain = (t) => t.replace(/\*\*/g, '').replace(/\[\[|\]\]/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const browser = await chromium.launch({ channel: process.env.CHANNEL ?? 'msedge' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: process.env.SCHEME ?? 'light', reducedMotion: 'reduce', serviceWorkers: 'block' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', (d) => d.accept());

const shot = (name) => page.screenshot({ path: `${SHOTS}${name}.png` });
const continueSheet = async (tone = 'good') => {
  await page.locator(`.sheet.${tone} [data-close]`).click();
  await page.locator('.sheet').waitFor({ state: 'detached' });
};

async function answer(step, { tryWrongFirst = false } = {}) {
  if (step.type === 'learn') return page.locator('.actions button', { hasText: 'Continue' }).click();
  if (step.type === 'bench') {
    const sol = solution(step);
    for (const t of sol.taps) await page.locator('.hit').nth(t).click();
    for (const [row, v] of sol.picks) await page.locator('.chip-row').nth(row).getByRole('radio', { name: fmtOhms(v), exact: true }).click();
    await page.locator('.sheet.good').waitFor();
    return continueSheet();
  }
  if (step.type === 'mcq') {
    if (tryWrongFirst) {
      await page.locator('.choice').nth((step.answer + 1) % step.choices.length).click();
      await page.getByRole('button', { name: 'Check' }).click();
      await page.locator('.sheet.bad').waitFor();
      await continueSheet('bad');
    }
    await page.locator('.choice').nth(step.answer).click();
  }
  if (step.type === 'numeric') await page.locator('.numeric input').fill(String(step.answer));
  await page.getByRole('button', { name: 'Check' }).click();
  await page.locator('.sheet.good').waitFor();
  await continueSheet();
}

await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await shot('01-home');

for (const [li, lesson] of UNIT.lessons.entries()) {
  if (li + 1 < UNIT.lessons.length) {
    assert.ok(await page.getByRole('button', { name: `${UNIT.lessons[li + 1].title} (locked)` }).isDisabled(), 'next lesson locked');
  }
  await page.getByRole('button', { name: lesson.title, exact: true }).click();
  for (const [si, step] of lesson.steps.entries()) {
    if (li === 0 && si === 1) await shot('02-bench-before');
    if (li === 0 && si === 0) { // glossary sheet
      await page.locator('.term').first().click();
      await page.locator('.sheet .sheet-title').waitFor();
      await page.getByRole('button', { name: 'Got it' }).click();
    }
    if (li === 4 && si === 2) { // burn an LED first, then reset
      await page.getByRole('radio', { name: '10 Ω', exact: true }).click();
      assert.match(await page.locator('.bench-status').innerText(), /burnt out/);
      await shot('04-led-burnt');
      await page.getByRole('button', { name: /Reset bench/ }).click();
    }
    await answer(step, { tryWrongFirst: li === 0 && step.type === 'mcq' && si === 3 });
    if (li === 0 && si === 1) await shot('03-after-bench');
  }
  await page.getByRole('heading', { name: 'Lesson complete!' }).waitFor();
  if (li === 0) await shot('05-lesson-complete');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: `${lesson.title} (completed)` }).waitFor();
  console.log(`✔ ${lesson.id} ${lesson.title}`);
}

// Daily Charge: questions are random, so look each one up by its text
await page.getByRole('button', { name: 'Start' }).click();
const pool = UNIT.lessons.flatMap((l) => l.steps).filter((s) => s.q);
for (let k = 0; k < 5; k++) {
  const text = plain(await page.locator('.prompt').innerText());
  const step = pool.find((s) => plain(s.q) === text);
  assert.ok(step, `unknown charge question: ${text}`);
  await answer(step);
}
await page.getByRole('heading', { name: 'Fully charged!' }).waitFor();
await page.getByRole('button', { name: 'Continue' }).click();
console.log('✔ Daily Charge');

// progress survives a reload
await page.reload();
const xp = Number((await page.locator('.stat.xp').innerText()).replace(/\D/g, ''));
const streak = await page.locator('.stat').first().innerText();
assert.ok(xp >= 6 * 20 + 15, `xp too low: ${xp}`);
assert.match(streak, /1/);
assert.equal(await page.locator('.quests li.ok').count(), 3, 'all quests done');
assert.ok(await page.getByRole('button', { name: 'Done' }).isDisabled(), 'charge spent for today');
await shot('06-home-after');
console.log(`✔ persisted: ${xp} XP, streak ${streak}`);

assert.deepEqual(errors, [], `console errors: ${errors.join(' | ')}`);
console.log('✔ no console errors');
await browser.close();
