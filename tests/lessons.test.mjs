import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UNITS, LESSONS, GLOSSARY } from '../js/lessons.js';
import { startsSolved, solution } from './lib/solver.mjs';

const INTERACTIVE = new Set(['bench', 'logic', 'cpu']);

test('lesson ids are unique', () => {
  const ids = LESSONS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('lesson titles are unique', () => {
  const seen = new Map();
  for (const l of LESSONS) {
    assert.ok(!seen.has(l.title), `"${l.title}" used by ${seen.get(l.title)} and ${l.id}`);
    seen.set(l.title, l.id);
  }
});

for (const unit of UNITS) {
  for (const lesson of unit.lessons) {
    test(`${unit.id}/${lesson.id} ${lesson.title}`, () => {
      assert.ok(lesson.steps.length >= 3, 'too short');
      for (const step of lesson.steps) {
        const where = `${lesson.id}: ${step.prompt ?? step.q ?? step.title}`;
        const text = [step.body, step.prompt, step.q, step.explain, step.hint].filter(Boolean).join(' ');
        for (const [, w] of text.matchAll(/\[\[([^\]]+)\]\]/g)) assert.ok(GLOSSARY[w], `missing glossary word "${w}" in ${where}`);
        if (step.type === 'mcq') assert.ok(step.answer < step.choices.length, where);
        if (step.type === 'numeric') assert.ok(Number.isFinite(step.answer) && step.tol > 0 && step.unit !== undefined, where);
        if (step.type !== 'learn') assert.ok(step.hint && step.explain, `needs hint + explain: ${where}`);
        if (INTERACTIVE.has(step.type)) {
          assert.equal(startsSolved(step), false, `already solved: ${where}`);
          assert.ok(solution(step), `unsolvable: ${where}`);
        }
      }
    });
  }
}

// A bench must not destroy a part the moment it opens: Reset would restore
// the same doomed state and trap the learner.
import { solve } from '../js/sim.js';
test('no bench burns a part on open', () => {
  for (const l of LESSONS) {
    for (const step of l.steps.filter((s) => s.type === 'bench' && !s.circuit.transient)) {
      const s = solve({ parts: structuredClone(step.circuit.parts), ground: step.circuit.ground });
      const bad = Object.values(s.parts).filter((p) => p.overload).map((p) => p.id);
      assert.deepEqual(bad, [], `${l.id}: ${step.prompt}`);
    }
  }
});

// Generated drills must never show broken text or impossible answers.
test('no broken text or answers anywhere', () => {
  for (const l of LESSONS) {
    for (const s of l.steps) {
      const text = [s.title, s.body, s.prompt, s.q, s.hint, s.explain, ...(s.choices ?? [])].filter(Boolean).join(' ');
      assert.ok(!/NaN|undefined|Infinity|\[object/.test(text), `${l.id}: broken text in "${text.slice(0, 80)}"`);
      if (s.type === 'numeric') assert.ok(Number.isFinite(s.answer), `${l.id}: answer ${s.answer}`);
      if (s.type === 'mcq') assert.equal(new Set(s.choices).size, s.choices.length, `${l.id}: duplicate choices`);
    }
  }
});
