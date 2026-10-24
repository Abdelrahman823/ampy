import { solve } from '../../js/sim.js';

// Apply one tap the same way the bench does.
export function tap(p) {
  if (p.tap === 'toggle') p.closed = !p.closed;
  else if (p.tap === 'repair' || p.tap === 'probe') p.broken = false;
  else if (p.tap === 'cut') p.broken = !p.broken;
  else if (p.tap === 'flip') [p.a, p.b] = [p.b, p.a];
  else if (p.tap === 'replace') p.burnt = false;
}

export function evaluate(step, parts) {
  let s = solve({ parts, ground: step.circuit.ground });
  for (const p of parts) if (p.kind === 'led' && s.parts[p.id].overload) p.burnt = true;
  s = solve({ parts, ground: step.circuit.ground });
  return step.goal(s, parts);
}

// Every combination of tapped / not tapped parts and every resistor choice.
export function* states(parts) {
  const tappable = parts.map((p, i) => (p.tap ? i : -1)).filter((i) => i >= 0);
  const choosers = parts.map((p, i) => (p.choices ? i : -1)).filter((i) => i >= 0);
  const choiceCombos = choosers.reduce((acc, i) => acc.flatMap((c) => parts[i].choices.map((v) => [...c, [i, v]])), [[]]);
  for (let mask = 0; mask < 1 << tappable.length; mask++) {
    for (const combo of choiceCombos) {
      const ps = structuredClone(parts);
      tappable.forEach((i, bit) => { if (mask & (1 << bit)) tap(ps[i]); });
      for (const [i, v] of combo) ps[i].r = v;
      yield ps;
    }
  }
}

/** First winning state as a list of actions: tapped part indexes + resistor picks. */
export function solution(step) {
  const parts = step.circuit.parts;
  const tappable = parts.map((p, i) => (p.tap ? i : -1)).filter((i) => i >= 0);
  const choosers = parts.map((p, i) => (p.choices ? i : -1)).filter((i) => i >= 0);
  const combos = choosers.reduce((acc, i) => acc.flatMap((c) => parts[i].choices.map((v) => [...c, [i, v]])), [[]]);
  for (let mask = 0; mask < 1 << tappable.length; mask++) {
    for (const combo of combos) {
      const ps = structuredClone(parts);
      const taps = tappable.filter((_, bit) => mask & (1 << bit));
      taps.forEach((i) => tap(ps[i]));
      for (const [i, v] of combo) ps[i].r = v;
      if (evaluate(step, ps)) return { taps: taps.map((i) => tappable.indexOf(i)), picks: combo.map(([i, v]) => [choosers.indexOf(i), v]) };
    }
  }
  return null;
}
