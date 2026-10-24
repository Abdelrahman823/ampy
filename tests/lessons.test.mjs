import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UNIT, GLOSSARY } from '../js/lessons.js';
import { evaluate, states } from './lib/solver.mjs';

for (const lesson of UNIT.lessons) {
  test(`${lesson.id} ${lesson.title}: benches start unsolved and are solvable`, () => {
    for (const step of lesson.steps.filter((s) => s.type === 'bench')) {
      assert.equal(evaluate(step, structuredClone(step.circuit.parts)), false, `already solved: ${step.prompt}`);
      let ok = false;
      for (const ps of states(step.circuit.parts)) if (evaluate(step, ps)) { ok = true; break; }
      assert.ok(ok, `unsolvable: ${step.prompt}`);
    }
  });

  test(`${lesson.id}: questions are well formed`, () => {
    for (const step of lesson.steps) {
      const text = [step.body, step.prompt, step.q, step.explain, step.hint].filter(Boolean).join(' ');
      for (const [, w] of text.matchAll(/\[\[([^\]]+)\]\]/g)) assert.ok(GLOSSARY[w], `missing glossary word: ${w}`);
      if (step.type === 'mcq') assert.ok(step.answer < step.choices.length);
      if (step.type !== 'learn') assert.ok(step.hint && step.explain, 'needs hint + explain');
    }
  });
}
