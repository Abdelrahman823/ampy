import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fresh, completeLesson, completeCharge, rollover, XP } from '../js/progress.js';

const at = (s) => new Date(`${s}T10:00:00`);

test('streak grows on consecutive days, once per day', () => {
  const st = fresh();
  completeLesson(st, 'l1', 1, at('2026-10-20'));
  completeLesson(st, 'l2', 1, at('2026-10-20'));
  assert.equal(st.streak.count, 1);
  completeLesson(st, 'l3', 1, at('2026-10-21'));
  assert.equal(st.streak.count, 2);
});

test('a freeze covers one missed day', () => {
  const st = fresh();
  completeLesson(st, 'l1', 1, at('2026-10-20'));
  rollover(st, at('2026-10-22')); // missed the 21st
  assert.equal(st.streak.freezes, 0);
  completeLesson(st, 'l2', 1, at('2026-10-22'));
  assert.equal(st.streak.count, 2);
});

test('missing too many days resets the streak', () => {
  const st = fresh();
  completeLesson(st, 'l1', 1, at('2026-10-20'));
  rollover(st, at('2026-10-25'));
  assert.equal(st.streak.count, 0);
  completeLesson(st, 'l2', 1, at('2026-10-25'));
  assert.equal(st.streak.count, 1);
});

test('daily charge pays once a day', () => {
  const st = fresh();
  assert.equal(completeCharge(st, at('2026-10-20')), true);
  assert.equal(completeCharge(st, at('2026-10-20')), false);
  assert.equal(st.xp, XP.charge);
  assert.equal(completeCharge(st, at('2026-10-21')), true);
  assert.equal(st.today.xp, XP.charge);
});

test('7-day streak earns a freeze (max 2)', () => {
  const st = fresh();
  for (let d = 10; d < 17; d++) completeLesson(st, 'l1', 1, at(`2026-10-${d}`));
  assert.equal(st.streak.count, 7);
  assert.equal(st.streak.freezes, 2);
});
