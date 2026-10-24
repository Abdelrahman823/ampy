// DC circuit solver (modified nodal analysis, Norton form).
// Every part becomes a conductance plus an optional current injection, so the
// only unknowns are node voltages. Batteries carry a small internal resistance,
// which keeps shorts finite and detectable. LEDs are piecewise-linear and
// solved by iterating on their on/off state.

const WIRE_R = 1e-3;
const GMIN = 1e-9;
const LED_RON = 5;

export const PART_DEFAULTS = {
  battery: { v: 9, rInt: 0.2 },
  wire: { broken: false },
  switch: { closed: false },
  lamp: { r: 18, ratedW: 4.5 },
  resistor: { r: 100 },
  led: { vf: 2, maxMa: 30 },
  ammeter: {},
};

function stamps(part, ledOn) {
  // returns { g, i } : conductance between a-b, current injected into a (out of b)
  switch (part.kind) {
    case 'battery': {
      const g = 1 / part.rInt;
      return { g, i: part.v * g };
    }
    case 'wire':
      return { g: part.broken ? 0 : 1 / WIRE_R, i: 0 };
    case 'switch':
      return { g: part.closed ? 1 / WIRE_R : 0, i: 0 };
    case 'ammeter':
      return { g: 1 / WIRE_R, i: 0 };
    case 'lamp':
    case 'resistor':
      return { g: part.burnt ? 0 : 1 / part.r, i: 0 };
    case 'led':
      if (part.burnt || !ledOn) return { g: 0, i: 0 };
      // anode = a. Conducting: I = (Va - Vb - vf) / Ron
      return { g: 1 / LED_RON, i: part.vf / LED_RON };
    default:
      throw new Error(`unknown part kind: ${part.kind}`);
  }
}

function solveLinear(A, b) {
  const n = b.length;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    [b[c], b[p]] = [b[p], b[c]];
    const piv = A[c][c];
    if (Math.abs(piv) < 1e-300) continue;
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / piv;
      if (!f) continue;
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k];
    x[r] = Math.abs(A[r][r]) < 1e-300 ? 0 : s / A[r][r];
  }
  return x;
}

/**
 * @param {{parts: object[], ground: string}} circuit
 * @returns {{v: Record<string, number>, parts: Record<string, object>, short: boolean}}
 */
export function solve(circuit) {
  const parts = circuit.parts.map((p) => ({ ...PART_DEFAULTS[p.kind], ...p }));
  const names = new Set();
  for (const p of parts) { names.add(p.a); names.add(p.b); }
  names.delete(circuit.ground);
  const idx = new Map([...names].map((n, i) => [n, i]));
  const n = idx.size;

  const ledOn = new Map(parts.filter((p) => p.kind === 'led').map((p) => [p.id, true]));
  let volts = new Array(n).fill(0);

  for (let iter = 0; iter < 30; iter++) {
    const A = Array.from({ length: n }, () => new Array(n).fill(0));
    const b = new Array(n).fill(0);
    for (let k = 0; k < n; k++) A[k][k] += GMIN;
    for (const p of parts) {
      const { g, i } = stamps(p, ledOn.get(p.id));
      const ia = idx.get(p.a), ib = idx.get(p.b);
      if (ia !== undefined) { A[ia][ia] += g; b[ia] += i; }
      if (ib !== undefined) { A[ib][ib] += g; b[ib] -= i; }
      if (ia !== undefined && ib !== undefined) { A[ia][ib] -= g; A[ib][ia] -= g; }
    }
    volts = solveLinear(A, b);
    const V = (name) => (name === circuit.ground ? 0 : volts[idx.get(name)]);

    let changed = false;
    for (const p of parts) {
      if (p.kind !== 'led') continue;
      const vd = V(p.a) - V(p.b);
      const on = ledOn.get(p.id);
      const shouldBeOn = on ? (vd - p.vf) / LED_RON > 0 : vd > p.vf;
      if (shouldBeOn !== on) { ledOn.set(p.id, shouldBeOn); changed = true; }
    }
    if (!changed) break;
  }

  const V = (name) => (name === circuit.ground ? 0 : volts[idx.get(name)]);
  const out = {};
  let short = false;
  for (const p of parts) {
    const vab = V(p.a) - V(p.b);
    const { g, i } = stamps(p, ledOn.get(p.id));
    // current flowing through the part from a to b
    let current = vab * g - i;
    if (p.kind === 'battery') current = -current; // report as current delivered out of +
    if (Math.abs(current) < 1e-9) current = 0;
    const r = { ...p, voltage: vab, current };
    if (p.kind === 'lamp') {
      r.power = current * current * p.r;
      r.brightness = Math.min(1, r.power / p.ratedW);
      r.on = r.brightness > 0.05;
    }
    if (p.kind === 'led') {
      r.ma = current * 1000;
      r.on = r.ma > 1;
      r.brightness = Math.min(1, r.ma / 20);
      r.overload = r.ma > p.maxMa;
    }
    if (p.kind === 'battery' && current > (p.v / p.rInt) * 0.5) short = true;
    out[p.id] = r;
  }
  for (const k of Object.keys(out)) out[k].current = round(out[k].current);
  return { v: Object.fromEntries([...names, circuit.ground].map((nm) => [nm, V(nm)])), parts: out, short };
}

function round(x) {
  return Math.round(x * 1e6) / 1e6;
}

/** Format an amp value for people: 0.0201 -> "20.1 mA" */
export function fmtAmps(a) {
  const x = Math.abs(a);
  if (x === 0) return '0 A';
  if (x < 1) return `${+(x * 1000).toPrecision(3)} mA`;
  return `${+x.toPrecision(3)} A`;
}

export function fmtOhms(r) {
  if (r >= 1000) return `${+(r / 1000).toPrecision(3)} kΩ`;
  return `${r} Ω`;
}
