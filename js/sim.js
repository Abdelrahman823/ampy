// Circuit solver: modified nodal analysis in Norton form.
// Every part becomes conductances, current injections and (for transistors
// and op-amps) voltage-controlled current sources, so the only unknowns are
// node voltages. Nonlinear parts (diodes, transistors, op-amp rails) are
// piecewise-linear and solved by iterating on their state until it settles.
// Pass {dt, t, mem} for a time step (capacitors, inductors, AC sources);
// without dt it is a DC solve (capacitors open, inductors shorted).

const WIRE_R = 1e-3;
const GMIN = 1e-9;
const VCE_SAT = 0.2;
const R_SAT = 0.05;

export const PART_DEFAULTS = {
  battery: { v: 9, rInt: 0.2 },
  wire: { broken: false },
  switch: { closed: false },
  pushbutton: { closed: false },
  lamp: { r: 18, ratedW: 4.5 },
  resistor: { r: 100 },
  motor: { r: 12, ratedW: 6 },
  buzzer: { r: 200 },
  led: { vf: 2, ron: 5, maxMa: 30 },
  diode: { vf: 0.7, ron: 0.5 },
  zener: { vf: 0.7, vz: 5.1, ron: 0.5 },
  ammeter: {},
  voltmeter: {},
  fuse: { rating: 1 },
  capacitor: { c: 1e-3 },
  inductor: { l: 1 },
  npn: { beta: 100, vbe: 0.7, rbe: 1 },
  nmos: { vth: 2, ron: 0.1 },
  opamp: { gain: 1e5, vpos: 9, vneg: -9, rout: 1 },
};

const DIODES = new Set(['led', 'diode', 'zener']);

/** Source voltage at time t (DC batteries ignore t). */
export function sourceVolts(p, t = 0) {
  const w = p.wave;
  if (!w) return p.v;
  const off = w.offset ?? 0;
  if (w.type === 'sine') return off + w.amp * Math.sin(2 * Math.PI * w.freq * t);
  if (w.type === 'square') return off + (((t * w.freq) % 1) < 0.5 ? w.amp : -w.amp);
  return p.v;
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

/** Node names a part touches. */
export function terminals(p) {
  return p.pins ? Object.values(p.pins) : [p.a, p.b];
}

/** Two-terminal Norton model: current a→b = g·vab − i. */
function twoTerminal(p, st, ctx) {
  switch (p.kind) {
    case 'battery': {
      const g = 1 / p.rInt;
      return { g, i: sourceVolts(p, ctx.t) * g };
    }
    case 'wire': return { g: p.broken ? 0 : 1 / WIRE_R, i: 0 };
    case 'switch': case 'pushbutton': return { g: p.closed ? 1 / WIRE_R : 0, i: 0 };
    case 'ammeter': return { g: 1 / (p.r ?? WIRE_R), i: 0 }; // optional internal resistance
    case 'fuse': return { g: p.burnt ? 0 : 1 / WIRE_R, i: 0 };
    case 'voltmeter': return { g: 0, i: 0 };
    case 'lamp': case 'resistor': case 'motor': case 'buzzer':
      return { g: p.burnt ? 0 : 1 / p.r, i: 0 };
    case 'led': case 'diode': case 'zener':
      if (p.burnt || st === 'off') return { g: 0, i: 0 };
      if (st === 'rev') return { g: 1 / p.ron, i: -p.vz / p.ron };
      return { g: 1 / p.ron, i: p.vf / p.ron };
    case 'capacitor': {
      if (!ctx.dt) return { g: 0, i: 0 };
      const g = p.c / ctx.dt;
      return { g, i: g * (ctx.mem.v[p.id] ?? p.v0 ?? 0) };
    }
    case 'inductor': {
      if (!ctx.dt) return { g: 1 / WIRE_R, i: 0 };
      return { g: ctx.dt / p.l, i: -(ctx.mem.i[p.id] ?? 0) };
    }
    default:
      throw new Error(`unknown part kind: ${p.kind}`);
  }
}

function initialState(p) {
  if (DIODES.has(p.kind)) return 'fwd';
  if (p.kind === 'npn') return 'active';
  if (p.kind === 'nmos') return 'off';
  if (p.kind === 'opamp') return 'lin';
  return null;
}

/**
 * @param {{parts: object[], ground: string}} circuit
 * @param {{dt?: number, t?: number, mem?: {v: object, i: object}}} [opts]
 */
export function solve(circuit, opts = {}) {
  const ctx = { dt: opts.dt ?? 0, t: opts.t ?? 0, mem: opts.mem ?? { v: {}, i: {} } };
  const parts = circuit.parts.map((p) => ({ ...PART_DEFAULTS[p.kind], ...p }));
  const gnd = circuit.ground;
  const names = new Set();
  for (const p of parts) for (const n of terminals(p)) names.add(n);
  names.delete(gnd);
  const idx = new Map([...names].map((n, i) => [n, i]));
  const n = idx.size;
  const state = new Map(parts.map((p) => [p.id, opts.state?.[p.id] ?? initialState(p)]));
  let volts = new Array(n).fill(0);
  const V = (name) => (name === gnd ? 0 : volts[idx.get(name)]);

  for (let iter = 0; iter < 200; iter++) {
    const A = Array.from({ length: n }, () => new Array(n).fill(0));
    const b = new Array(n).fill(0);
    for (let k = 0; k < n; k++) A[k][k] += GMIN;
    const G = (x, y, g) => {
      const ix = idx.get(x), iy = idx.get(y);
      if (ix !== undefined) A[ix][ix] += g;
      if (iy !== undefined) A[iy][iy] += g;
      if (ix !== undefined && iy !== undefined) { A[ix][iy] -= g; A[iy][ix] -= g; }
    };
    const I = (x, y, i) => { // current i pushed into x, out of y
      const ix = idx.get(x), iy = idx.get(y);
      if (ix !== undefined) b[ix] += i;
      if (iy !== undefined) b[iy] -= i;
    };
    const VCCS = (op, om, cp, cm, gm) => { // current op→om = gm·(Vcp − Vcm)
      for (const [o, so] of [[op, 1], [om, -1]]) {
        const io = idx.get(o);
        if (io === undefined) continue;
        const icp = idx.get(cp), icm = idx.get(cm);
        if (icp !== undefined) A[io][icp] += so * gm;
        if (icm !== undefined) A[io][icm] -= so * gm;
      }
    };

    for (const p of parts) {
      const st = state.get(p.id);
      if (p.kind === 'npn') {
        const { c, b: base, e } = p.pins;
        if (st === 'off') continue;
        const gbe = 1 / p.rbe;
        G(base, e, gbe); I(base, e, p.vbe * gbe);
        if (st === 'active') {
          const gm = p.beta * gbe; // Ic = β·Ib = β·(Vbe − vbe)/rbe
          VCCS(c, e, base, e, gm);
          I(c, e, gm * p.vbe);
        } else { // saturated: Vce ≈ 0.2 V
          G(c, e, 1 / R_SAT); I(c, e, VCE_SAT / R_SAT);
        }
        continue;
      }
      if (p.kind === 'nmos') {
        if (st === 'on') G(p.pins.d, p.pins.s, 1 / p.ron);
        continue;
      }
      if (p.kind === 'opamp') {
        const { p: pp, n: nn, out } = p.pins;
        const g = 1 / p.rout;
        G(out, gnd, g);
        if (st === 'lin') VCCS(out, gnd, pp, nn, -g * p.gain);
        else I(out, gnd, (st === 'hi' ? p.vpos : p.vneg) * g);
        continue;
      }
      const { g, i } = twoTerminal(p, st, ctx);
      if (g) G(p.a, p.b, g);
      if (i) I(p.a, p.b, i);
    }
    volts = solveLinear(A, b);

    // Change at most one device per pass: flipping several at once can make
    // coupled parts (e.g. a Darlington pair) oscillate between states forever.
    let changed = false;
    const set = (p, s) => { if (!changed && state.get(p.id) !== s) { state.set(p.id, s); changed = true; } };
    for (const p of parts) {
      const st = state.get(p.id);
      if (DIODES.has(p.kind)) {
        const vd = V(p.a) - V(p.b);
        let next = 'off';
        if (vd > p.vf - (st === 'fwd' ? 1e-9 : 0)) next = 'fwd';
        else if (p.kind === 'zener' && -vd > p.vz - (st === 'rev' ? 1e-9 : 0)) next = 'rev';
        set(p, next);
      } else if (p.kind === 'npn') {
        const { c, b: base, e } = p.pins;
        const vbe = V(base) - V(e), vce = V(c) - V(e);
        if (vbe <= p.vbe) { set(p, 'off'); continue; }
        const ib = (vbe - p.vbe) / p.rbe;
        if (st === 'off') set(p, 'active');
        else if (st === 'active' && vce < VCE_SAT) set(p, 'sat');
        else if (st === 'sat' && (vce - VCE_SAT) / R_SAT >= p.beta * ib) set(p, 'active');
      } else if (p.kind === 'nmos') {
        set(p, V(p.pins.g) - V(p.pins.s) > p.vth ? 'on' : 'off');
      } else if (p.kind === 'opamp') {
        const want = p.gain * (V(p.pins.p) - V(p.pins.n));
        set(p, want > p.vpos ? 'hi' : want < p.vneg ? 'lo' : 'lin');
      }
    }
    if (!changed) break;
  }

  const out = {};
  let short = false;
  const mem = { v: { ...ctx.mem.v }, i: { ...ctx.mem.i } };
  for (const p of parts) {
    const st = state.get(p.id);
    const r = { ...p, state: st };
    if (p.kind === 'npn') {
      const { c, b: base, e } = p.pins;
      const vbe = V(base) - V(e);
      r.ib = st === 'off' ? 0 : round((vbe - p.vbe) / p.rbe);
      r.ic = st === 'off' ? 0 : st === 'active' ? round(p.beta * r.ib) : round((V(c) - V(e) - VCE_SAT) / R_SAT);
      r.vce = V(c) - V(e);
      r.on = r.ic > 1e-4;
    } else if (p.kind === 'nmos') {
      r.on = st === 'on';
      r.id = r.on ? round((V(p.pins.d) - V(p.pins.s)) / p.ron) : 0;
    } else if (p.kind === 'opamp') {
      r.vout = V(p.pins.out);
    } else {
      const vab = V(p.a) - V(p.b);
      const { g, i } = twoTerminal(p, st, ctx);
      let current = vab * g - i;
      if (p.kind === 'battery') current = -current;
      if (Math.abs(current) < 1e-9) current = 0;
      r.voltage = vab;
      r.current = round(current);
      if (p.kind === 'lamp' || p.kind === 'motor') {
        r.power = current * current * p.r;
        r.brightness = Math.min(1, r.power / p.ratedW);
        r.on = r.brightness > 0.05;
      }
      if (p.kind === 'buzzer') r.on = Math.abs(current) > 0.005;
      if (p.kind === 'led') {
        r.ma = current * 1000;
        r.on = r.ma > 1;
        r.brightness = Math.min(1, r.ma / 20);
        r.overload = r.ma > p.maxMa;
      }
      if (p.kind === 'fuse') r.overload = Math.abs(current) > p.rating;
      if (p.kind === 'resistor' && p.maxW) {
        r.power = current * current * p.r;
        r.overload = r.power > p.maxW;
      }
      if (p.kind === 'battery') {
        const v = p.wave ? p.wave.amp + (p.wave.offset ?? 0) : p.v;
        if (current > (Math.abs(v) / p.rInt) * 0.5) short = true;
      }
      if (p.kind === 'capacitor') mem.v[p.id] = vab;
      if (p.kind === 'inductor') mem.i[p.id] = current;
    }
    out[p.id] = r;
  }
  return {
    v: Object.fromEntries([...names, gnd].map((nm) => [nm, V(nm)])),
    parts: out,
    short,
    mem,
    state: Object.fromEntries(state),
  };
}

function round(x) {
  return Math.round(x * 1e6) / 1e6;
}

/** Format an amp value for people: 0.0201 -> "20.1 mA" */
export function fmtAmps(a) {
  const x = Math.abs(a);
  if (x < 1e-6) return '0 A';
  if (x < 1e-3) return `${+(x * 1e6).toPrecision(3)} µA`;
  if (x < 1) return `${+(x * 1000).toPrecision(3)} mA`;
  return `${+x.toPrecision(3)} A`;
}

export function fmtVolts(v) {
  const x = Math.abs(v) < 0.005 ? 0 : v;
  return `${+x.toFixed(Math.abs(x) >= 10 ? 1 : 2)} V`;
}

export function fmtOhms(r) {
  if (r >= 1e6) return `${+(r / 1e6).toPrecision(3)} MΩ`;
  if (r >= 1000) return `${+(r / 1000).toPrecision(3)} kΩ`;
  return `${+r.toPrecision(3)} Ω`;
}

export function fmtFarads(c) {
  if (c >= 1e-3) return `${+(c * 1e3).toPrecision(3)} mF`;
  if (c >= 1e-6) return `${+(c * 1e6).toPrecision(3)} µF`;
  return `${+(c * 1e9).toPrecision(3)} nF`;
}
