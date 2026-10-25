// Finds a winning set of learner actions for any interactive step, the same
// way a learner would act in the UI. Used by unit tests (solvable, not
// pre-solved) and by the e2e test (which then performs the actions).
import { solve } from '../../js/sim.js';
import { createLogic, toggleInput, pulseClock, setGate, truthTable, displayValue } from '../../js/logic.js';
import { createCpu, stepCpu } from '../../js/cpu.js';

// ---------- circuit benches ----------
export function tap(p) {
  if (p.tap === 'toggle') p.closed = !p.closed;
  else if (p.tap === 'repair' || p.tap === 'probe') p.broken = false;
  else if (p.tap === 'cut') p.broken = !p.broken;
  else if (p.tap === 'flip') [p.a, p.b] = [p.b, p.a];
  else if (p.tap === 'replace') p.burnt = false;
}

const setProp = (p, prop, v) => { if (prop === 'freq') p.wave.freq = v; else if (prop === 'amp') p.wave.amp = v; else p[prop] = v; };

function sliderValues(sl) {
  const step = sl.step ?? 1;
  const n = Math.round((sl.max - sl.min) / step);
  const k = Math.min(n, 60);
  return [...new Set(Array.from({ length: k + 1 }, (_, i) => +(sl.min + Math.round((i * n) / k) * step).toFixed(6)))];
}

/** DC: one solve with burn-out applied, like the bench. */
function evalDc(step, parts) {
  let s = solve({ parts, ground: step.circuit.ground });
  let burnt = false;
  for (const p of parts) if (s.parts[p.id]?.overload && !p.burnt) { p.burnt = true; burnt = true; }
  if (burnt) s = solve({ parts, ground: step.circuit.ground });
  return step.goal(s, parts, { t: 0, history: [] });
}

/** Transient: run like the bench, checking the goal every 1/60 s of real time. */
export function evalTransient(step, parts, realSeconds = step.testSeconds ?? 6) {
  const c = step.circuit, tr = c.transient;
  let mem = { v: {}, i: {} }, state, t = 0, history = [];
  const frame = tr.speed / 60;
  for (let f = 0; f < realSeconds * 60; f++) {
    let todo = frame, s;
    while (todo > 1e-12) {
      const dt = Math.min(tr.dt, todo);
      t += dt; todo -= dt;
      s = solve({ parts, ground: c.ground }, { dt, t, mem, state });
      mem = s.mem; state = s.state;
      if (c.scope) history.push([t, ...c.scope.traces.map((x) => (x.node ? s.v[x.node] : s.parts[x.part]?.[x.field ?? 'voltage'] ?? 0))]);
    }
    for (const p of parts) if (s.parts[p.id]?.overload && !p.burnt) p.burnt = true;
    if (c.scope) history = history.filter((h) => h[0] >= t - c.scope.window);
    if (step.goal(s, parts, { t, history })) return true;
  }
  return false;
}

function* benchCandidates(parts) {
  const tappable = parts.map((p, i) => (p.tap ? i : -1)).filter((i) => i >= 0);
  const knobs = [];
  parts.forEach((p, i) => {
    if (p.choices) knobs.push({ i, prop: p.prop ?? 'r', values: p.choices, kind: 'choice' });
    if (p.slider) knobs.push({ i, prop: p.slider.prop ?? 'r', values: sliderValues(p.slider), kind: 'slider' });
  });
  const combos = knobs.reduce((acc, k) => acc.flatMap((c) => k.values.map((v) => [...c, [k, v]])), [[]]);
  for (let mask = 0; mask < 1 << tappable.length; mask++) {
    for (const combo of combos) {
      const ps = structuredClone(parts);
      const taps = tappable.filter((_, bit) => mask & (1 << bit));
      taps.forEach((i) => tap(ps[i]));
      for (const [k, v] of combo) setProp(ps[k.i], k.prop, v);
      yield { ps, action: { taps: taps.map((i) => tappable.indexOf(i)), knobs: combo.map(([k, v]) => ({ part: parts[k.i].id, kind: k.kind, value: v, label: parts[k.i].slider?.label ?? parts[k.i].label })) } };
    }
  }
}

// ---------- logic labs ----------
function* logicCandidates(lab) {
  const pick = (lab.gates ?? []).filter((g) => g.choices);
  const combos = pick.reduce((acc, g) => acc.flatMap((c) => g.choices.map((t) => [...c, [g.id, t]])), [[]]);
  const ins = lab.inputs ?? [];
  const pulses = lab.clock ? (lab.maxPulses ?? 16) : 0;
  for (const combo of combos) {
    for (let mask = 0; mask < 1 << ins.length; mask++) {
      const st = createLogic(lab);
      for (const [id, t] of combo) setGate(st, id, t);
      const toggles = ins.filter((inp, k) => !!(mask & (1 << k)) !== !!inp.value).map((inp) => inp.id);
      for (const id of toggles) toggleInput(st, id);
      for (let k = 0; k <= pulses; k++) {
        if (k) pulseClock(st);
        yield { st, action: { gates: combo, toggles, pulses: k } };
      }
    }
  }
}

const logicApi = (st) => ({ table: () => truthTable(st), value: (bits) => displayValue(st, bits) });
const logicGoal = (step, st) => step.goal(st.sig, st, logicApi(st));

// ---------- CPU ----------
function applyEdits(machine, edits = []) {
  const m = structuredClone(machine);
  for (const e of edits) {
    const cell = m.ram[e.addr];
    if (e.data !== undefined) cell.data = e.data;
    if (e.op !== undefined) cell.op = e.op;
    if (e.arg !== undefined) cell.arg = e.arg;
  }
  return m;
}

function cpuReaches(step, machine) {
  const s = createCpu(machine);
  if (step.goal(s, machine)) return true;
  for (let k = 0; k < 400 && !s.halted; k++) {
    stepCpu(s);
    if (step.goal(s, machine)) return true;
  }
  return false;
}

// ---------- public ----------
export function startsSolved(step) {
  return !!startsSolvedRaw(step);
}

function startsSolvedRaw(step) {
  if (step.watch) return false;
  if (step.type === 'bench') {
    const ps = structuredClone(step.circuit.parts);
    return step.circuit.transient ? evalTransient(step, ps, 2) : evalDc(step, ps);
  }
  if (step.type === 'logic') return logicGoal(step, createLogic(step.lab));
  if (step.type === 'cpu') return cpuReaches(step, step.machine);
  return false;
}

/** A winning action list, or null. */
export function solution(step) {
  if (step.type === 'bench') {
    for (const { ps, action } of benchCandidates(step.circuit.parts)) {
      if (step.circuit.transient ? evalTransient(step, ps) : evalDc(step, ps)) return action;
    }
    return null;
  }
  if (step.type === 'logic') {
    for (const { st, action } of logicCandidates(step.lab)) if (logicGoal(step, st)) return action;
    return null;
  }
  if (step.type === 'cpu') {
    return cpuReaches(step, applyEdits(step.machine, step.solution)) ? { edits: step.solution ?? [] } : null;
  }
  return null;
}
