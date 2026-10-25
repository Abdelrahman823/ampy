import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UNITS, LESSONS, GLOSSARY } from '../js/lessons.js';
import { startsSolved, solution } from './lib/solver.mjs';

const INTERACTIVE = new Set(['bench', 'logic', 'cpu']);

test('lesson ids are unique', () => {
  const ids = LESSONS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
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
