import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../js/sim.js';

const near = (a, b, tol = 0.02) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);

const loop = (extra = {}) => ({
  ground: 'n0',
  parts: [
    { id: 'B', kind: 'battery', a: 'n1', b: 'n0', v: 9, rInt: 0.2 },
    { id: 'W1', kind: 'wire', a: 'n1', b: 'n2', ...extra },
    { id: 'L', kind: 'lamp', a: 'n2', b: 'n0', r: 18, ratedW: 4.5 },
  ],
});

test('closed loop lights the lamp (Ohm\'s law)', () => {
  const s = solve(loop());
  near(s.parts.L.current, 9 / 18.2);
  assert.equal(s.parts.L.on, true);
  near(s.parts.B.current, 9 / 18.2);
  assert.equal(s.short, false);
});

test('broken wire means no current', () => {
  const s = solve(loop({ broken: true }));
  assert.equal(s.parts.L.current, 0);
  assert.equal(s.parts.L.on, false);
});

test('series resistors add, parallel split current', () => {
  const series = solve({
    ground: 'g',
    parts: [
      { id: 'B', kind: 'battery', a: 'p', b: 'g', v: 10, rInt: 1e-6 },
      { id: 'R1', kind: 'resistor', a: 'p', b: 'm', r: 100 },
      { id: 'R2', kind: 'resistor', a: 'm', b: 'g', r: 400 },
    ],
  });
  near(series.parts.R1.current, 0.02);
  near(series.v.m, 8);

  const parallel = solve({
    ground: 'g',
    parts: [
      { id: 'B', kind: 'battery', a: 'p', b: 'g', v: 12, rInt: 1e-6 },
      { id: 'R1', kind: 'resistor', a: 'p', b: 'g', r: 100 },
      { id: 'R2', kind: 'resistor', a: 'p', b: 'g', r: 300 },
    ],
  });
  near(parallel.parts.R1.current, 0.12);
  near(parallel.parts.R2.current, 0.04);
  near(parallel.parts.B.current, 0.16);
});

test('LED with resistor: (V - Vf) / R', () => {
  const s = solve({
    ground: 'g',
    parts: [
      { id: 'B', kind: 'battery', a: 'p', b: 'g', v: 5, rInt: 1e-6 },
      { id: 'R', kind: 'resistor', a: 'p', b: 'x', r: 150 },
      { id: 'D', kind: 'led', a: 'x', b: 'g', vf: 2, maxMa: 30 },
    ],
  });
  near(s.parts.D.ma, 3000 / 155, 0.05);
  assert.equal(s.parts.D.on, true);
  assert.equal(s.parts.D.overload, false);
});

test('reversed LED blocks current', () => {
  const s = solve({
    ground: 'g',
    parts: [
      { id: 'B', kind: 'battery', a: 'p', b: 'g', v: 5 },
      { id: 'R', kind: 'resistor', a: 'p', b: 'x', r: 150 },
      { id: 'D', kind: 'led', a: 'g', b: 'x' },
    ],
  });
  assert.equal(s.parts.D.on, false);
});

test('LED without resistor overloads', () => {
  const s = solve({
    ground: 'g',
    parts: [
      { id: 'B', kind: 'battery', a: 'p', b: 'g', v: 9, rInt: 0.2 },
      { id: 'D', kind: 'led', a: 'p', b: 'g' },
    ],
  });
  assert.equal(s.parts.D.overload, true);
});

test('a wire across the battery is a short', () => {
  const c = loop();
  c.parts.push({ id: 'S', kind: 'switch', a: 'n2', b: 'n0', closed: true });
  const s = solve(c);
  assert.equal(s.short, true);
  assert.equal(s.parts.L.on, false);
});

test('series switches: both must be closed', () => {
  const mk = (s1, s2) => solve({
    ground: 'g',
    parts: [
      { id: 'B', kind: 'battery', a: 'p', b: 'g' },
      { id: 'S1', kind: 'switch', a: 'p', b: 'x', closed: s1 },
      { id: 'S2', kind: 'switch', a: 'x', b: 'y', closed: s2 },
      { id: 'L', kind: 'lamp', a: 'y', b: 'g' },
    ],
  }).parts.L.on;
  assert.equal(mk(true, false), false);
  assert.equal(mk(false, true), false);
  assert.equal(mk(true, true), true);
});
