// End-to-end: plays every lesson of the track and the Daily Charge in a real
// browser, solving interactive steps with real taps, chips, sliders, switches
// and CPU edits. Needs the app served (npm run serve).
// Usage: node tests/e2e.mjs   env: BASE, CHANNEL (msedge), SCHEME, ONLY=<unit id>, NOSHOTS=1
import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { UNITS, LESSONS } from '../js/lessons.js';
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

async function doBench(step, sol) {
  for (const t of sol.taps) await page.locator('.hit').nth(t).click();
  for (const k of sol.knobs) {
    const part = step.circuit.parts.find((p) => p.id === k.part);
    if (k.kind === 'choice') {
      await page.locator(`.chip-row[aria-label="${part.label ?? part.prop ?? 'r'}"] .chip`).nth(part.choices.indexOf(k.value)).click();
    } else {
      await page.locator(`input[type=range][aria-label="${part.slider.label}"]`).evaluate((el, v) => {
        el.value = v; el.dispatchEvent(new Event('input', { bubbles: true }));
      }, k.value);
    }
  }
}

async function doLogic(step, sol) {
  for (const [id, type] of sol.gates) {
    const g = step.lab.gates.find((x) => x.id === id);
    await page.locator(`.chip-row[aria-label="${g.label ?? g.id}"]`).getByRole('radio', { name: type, exact: true }).click();
  }
  const seq = sol.seq ?? [...sol.toggles, ...Array(sol.pulses).fill('clock')];
  for (const a of seq) {
    if (a === 'clock') { await page.getByRole('button', { name: 'clock pulse' }).click(); continue; }
    const inp = step.lab.inputs.find((x) => x.id === a);
    await page.getByRole('switch', { name: `input ${inp.label ?? inp.id}`, exact: true }).click();
  }
}

async function doCpu(step, sol) {
  for (const e of sol.edits) {
    if (e.op !== undefined) await page.locator(`select[aria-label="instruction at ${e.addr}"]`).selectOption(e.op);
    if (e.arg !== undefined) await page.locator(`select[aria-label="operand at ${e.addr}"]`).selectOption(String(e.arg));
    if (e.data !== undefined) {
      const box = page.locator(`input[aria-label="data at ${e.addr}"]`);
      await box.fill(String(e.data));
      await box.dispatchEvent('change');
    }
  }
  await page.locator('[data-act="run"]').click();
}

async function answer(step, { tryWrongFirst = false } = {}) {
  if (step.type === 'learn') return page.locator('.actions button', { hasText: 'Continue' }).click();
  if (step.type === 'bench' || step.type === 'logic' || step.type === 'cpu') {
    const sol = solution(step);
    assert.ok(sol, `no solution for ${step.prompt}`);
    if (step.type === 'bench') await doBench(step, sol);
    if (step.type === 'logic') await doLogic(step, sol);
    if (step.type === 'cpu') await doCpu(step, sol);
    await page.locator('.sheet.good').waitFor({ timeout: 25000 });
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

// ONLY=a7 plays just that unit, with earlier lessons marked done
const only = process.env.ONLY;
let lessons = LESSONS;
if (only) {
  const first = LESSONS.findIndex((l) => l.unit.id === only);
  const done = Object.fromEntries(LESSONS.slice(0, first).map((l) => [l.id, { best: 1 }]));
  await page.evaluate((d) => localStorage.setItem('ampy.v1', JSON.stringify({ completed: d })), done);
  lessons = LESSONS.filter((l) => l.unit.id === only);
}
await page.reload();
await shot('01-home');

let wrongTried = false;
for (const lesson of lessons) {
  const t0 = Date.now();
  await page.getByRole('button', { name: lesson.title, exact: true }).click();
  for (const step of lesson.steps) {
    const tryWrong = !wrongTried && step.type === 'mcq';
    if (tryWrong) wrongTried = true;
    if (['bench', 'logic', 'cpu'].includes(step.type) && !process.env.NOSHOTS) {
      await page.waitForTimeout(200);
      await shot(`step-${lesson.id}-${step.key.split('#')[1]}`);
    }
    await answer(step, { tryWrongFirst: tryWrong });
  }
  await page.getByRole('heading', { name: /complete/ }).waitFor();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: `${lesson.title} (completed)`, includeHidden: true }).waitFor({ state: 'attached' });
  console.log(`✔ ${lesson.unit.id}/${lesson.id} ${lesson.title} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

if (!only) {
  await page.getByRole('button', { name: 'Start' }).click();
  const pool = LESSONS.flatMap((l) => l.steps).filter((s) => s.q);
  for (let k = 0; k < 5; k++) {
    const text = plain(await page.locator('.prompt').innerText());
    const step = pool.find((s) => plain(s.q) === text);
    assert.ok(step, `unknown charge question: ${text}`);
    await answer(step);
  }
  await page.getByRole('heading', { name: 'Fully charged!' }).waitFor();
  await page.getByRole('button', { name: 'Continue' }).click();
  console.log('✔ Daily Charge');
  await page.reload();
  const xp = Number((await page.locator('.stat.xp').innerText()).replace(/\D/g, ''));
  assert.ok(xp >= LESSONS.length * 20, `xp too low: ${xp}`);
  assert.equal(await page.locator('.quests li.ok').count(), 3, 'all quests done');
  await shot('99-home-after');
  console.log(`✔ persisted: ${xp} XP, ${UNITS.length} units`);
}

assert.deepEqual(errors, [], `console errors: ${errors.join(' | ')}`);
console.log('✔ no console errors');
await browser.close();
