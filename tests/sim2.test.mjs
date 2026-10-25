import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve } from '../js/sim.js';

const near = (a, b, tol = 0.02) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);
const bat = (v, extra = {}) => ({ id: 'B', kind: 'battery', a: 'p', b: 'g', v, rInt: 1e-6, ...extra });

test('voltmeter reads a divider without loading it', () => {
  const s = solve({ ground: 'g', parts: [
    bat(12), { id: 'R1', kind: 'resistor', a: 'p', b: 'm', r: 1000 }, { id: 'R2', kind: 'resistor', a: 'm', b: 'g', r: 2000 },
    { id: 'V', kind: 'voltmeter', a: 'm', b: 'g' },
  ] });
  near(s.parts.V.voltage, 8);
});

test('silicon diode drops about 0.7 V', () => {
  const s = solve({ ground: 'g', parts: [
    bat(5), { id: 'R', kind: 'resistor', a: 'p', b: 'x', r: 430 }, { id: 'D', kind: 'diode', a: 'x', b: 'g' },
  ] });
  near(s.v.x, 0.7, 0.1);
  near(s.parts.R.current, 0.01, 0.05);
});

test('zener holds the output near its voltage', () => {
  for (const vin of [9, 12]) {
    const s = solve({ ground: 'g', parts: [
      bat(vin), { id: 'R', kind: 'resistor', a: 'p', b: 'x', r: 220 }, { id: 'Z', kind: 'zener', a: 'g', b: 'x', vz: 5.1 },
    ] });
    near(s.v.x, 5.1, 0.05);
  }
});

test('fuse reports overload above its rating', () => {
  const s = solve({ ground: 'g', parts: [
    bat(9), { id: 'F', kind: 'fuse', a: 'p', b: 'x', rating: 0.5 }, { id: 'R', kind: 'resistor', a: 'x', b: 'g', r: 9 },
  ] });
  assert.equal(s.parts.F.overload, true);
});

test('NPN as a switch saturates and lights the lamp', () => {
  const circuit = (rb) => ({ ground: 'g', parts: [
    bat(9), { id: 'L', kind: 'lamp', a: 'p', b: 'c', r: 18 },
    { id: 'RB', kind: 'resistor', a: 'p', b: 'b', r: rb },
    { id: 'Q', kind: 'npn', pins: { c: 'c', b: 'b', e: 'g' } },
  ] });
  const on = solve(circuit(1000));
  assert.equal(on.parts.Q.state, 'sat');
  assert.ok(on.parts.L.on);
  near(on.parts.Q.vce, 0.2, 0.2);
  const open = solve({ ...circuit(1000), parts: circuit(1000).parts.filter((p) => p.id !== 'RB') });
  assert.equal(open.parts.Q.state, 'off');
  assert.equal(open.parts.L.on, false);
});

test('NPN in the active region multiplies base current by beta', () => {
  const s = solve({ ground: 'g', parts: [
    bat(9), { id: 'RC', kind: 'resistor', a: 'p', b: 'c', r: 100 },
    { id: 'RB', kind: 'resistor', a: 'p', b: 'b', r: 830000 },
    { id: 'Q', kind: 'npn', pins: { c: 'c', b: 'b', e: 'g' }, beta: 100 },
  ] });
  assert.equal(s.parts.Q.state, 'active');
  near(s.parts.Q.ib, 1e-5, 0.05);
  near(s.parts.Q.ic, 1e-3, 0.05);
});

test('MOSFET turns on above its threshold', () => {
  const mk = (vg) => solve({ ground: 'g', parts: [
    bat(9), { id: 'G', kind: 'battery', a: 'gate', b: 'g', v: vg, rInt: 1e-6 },
    { id: 'L', kind: 'lamp', a: 'p', b: 'd', r: 18 }, { id: 'M', kind: 'nmos', pins: { d: 'd', g: 'gate', s: 'g' } },
  ] });
  assert.equal(mk(1).parts.L.on, false);
  assert.equal(mk(5).parts.L.on, true);
});

test('op-amp non-inverting amplifier: gain 1 + Rf/Rg', () => {
  const s = solve({ ground: 'g', parts: [
    { id: 'VIN', kind: 'battery', a: 'in', b: 'g', v: 0.5, rInt: 1e-6 },
    { id: 'U', kind: 'opamp', pins: { p: 'in', n: 'fb', out: 'o' } },
    { id: 'RF', kind: 'resistor', a: 'o', b: 'fb', r: 9000 }, { id: 'RG', kind: 'resistor', a: 'fb', b: 'g', r: 1000 },
  ] });
  near(s.v.o, 5, 0.01);
  assert.equal(s.parts.U.state, 'lin');
});

test('op-amp comparator slams into the rails', () => {
  const mk = (vin) => solve({ ground: 'g', parts: [
    { id: 'VIN', kind: 'battery', a: 'in', b: 'g', v: vin, rInt: 1e-6 },
    { id: 'VR', kind: 'battery', a: 'ref', b: 'g', v: 2, rInt: 1e-6 },
    { id: 'U', kind: 'opamp', pins: { p: 'in', n: 'ref', out: 'o' } },
    { id: 'RL', kind: 'resistor', a: 'o', b: 'g', r: 10000 },
  ] });
  near(mk(3).v.o, 9, 0.02);
  near(mk(1).v.o, -9, 0.02);
});

// run a transient simulation
function run(circuit, seconds, dt) {
  let mem = { v: {}, i: {} }, s, state;
  for (let t = dt; t <= seconds + 1e-12; t += dt) {
    s = solve(circuit, { dt, t, mem, state });
    mem = s.mem; state = s.state;
  }
  return s;
}

test('RC charges to 63% after one time constant', () => {
  const c = { ground: 'g', parts: [
    bat(10), { id: 'R', kind: 'resistor', a: 'p', b: 'x', r: 1000 }, { id: 'C', kind: 'capacitor', a: 'x', b: 'g', c: 1e-3 },
  ] };
  near(run(c, 1, 0.002).parts.C.voltage, 6.32, 0.02);
  near(run(c, 5, 0.01).parts.C.voltage, 9.93, 0.01);
});

test('inductor current rises with time constant L/R', () => {
  const c = { ground: 'g', parts: [
    bat(10), { id: 'R', kind: 'resistor', a: 'p', b: 'x', r: 10 }, { id: 'L', kind: 'inductor', a: 'x', b: 'g', l: 1 },
  ] };
  near(run(c, 0.1, 0.0005).parts.L.current, 0.632, 0.03);
});

test('AC sine source follows its wave', () => {
  const c = { ground: 'g', parts: [
    bat(0, { wave: { type: 'sine', amp: 10, freq: 50 } }), { id: 'R', kind: 'resistor', a: 'p', b: 'g', r: 100 },
  ] };
  near(solve(c, { dt: 1e-4, t: 0.005 }).v.p, 10, 0.01); // quarter period = peak
  near(solve(c, { dt: 1e-4, t: 0.015 }).v.p, -10, 0.01);
});

test('half-wave rectifier blocks the negative half', () => {
  const c = { ground: 'g', parts: [
    bat(0, { wave: { type: 'sine', amp: 10, freq: 50 } }), { id: 'D', kind: 'diode', a: 'p', b: 'x' },
    { id: 'R', kind: 'resistor', a: 'x', b: 'g', r: 1000 },
  ] };
  assert.ok(solve(c, { dt: 1e-4, t: 0.005 }).v.x > 9);
  assert.ok(Math.abs(solve(c, { dt: 1e-4, t: 0.015 }).v.x) < 0.01);
});
