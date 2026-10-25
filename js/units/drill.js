// Practice-drill builders. Every answer and worked explanation is computed
// from the inputs, so a drill can't carry a hand-typed arithmetic mistake.

/** Round to 3 significant figures and drop trailing zeros. */
export const nice = (x) => +(+x).toPrecision(3);
const fmt = (x) => String(nice(x));

export function num(q, answer, unit, hint, explain, tol = 0.02) {
  // exact drills (binary, counts) keep their answer; measured ones round to 3 s.f.
  return { type: 'numeric', q, answer: tol < 0.001 ? answer : nice(answer), tol, unit, hint, explain };
}

export function mcq(q, choices, answer, hint, explain) {
  return { type: 'mcq', q, choices, answer, hint, explain };
}

/** A practice lesson: a short intro card, then the drill steps. */
export function drill(id, title, icon, intro, steps) {
  return { id, title, icon, steps: [{ type: 'learn', title, body: intro }, ...steps] };
}

// ---------- Ohm's law & power ----------
export const ohmI = (v, r) => num(`${fmt(v)} V across ${fmt(r)} Ω. Current in amps?`, v / r, 'A', 'I = V ÷ R', `${fmt(v)} ÷ ${fmt(r)} = ${fmt(v / r)} A.`);
export const ohmImA = (v, r) => num(`${fmt(v)} V across ${fmt(r)} Ω. Current in mA?`, (v / r) * 1000, 'mA', 'I = V ÷ R, then × 1000 for mA.', `${fmt(v)} ÷ ${fmt(r)} = ${fmt(v / r)} A = ${fmt((v / r) * 1000)} mA.`);
export const ohmV = (i, r) => num(`${fmt(i)} A flows through ${fmt(r)} Ω. Voltage across it?`, i * r, 'V', 'V = I × R', `${fmt(i)} × ${fmt(r)} = ${fmt(i * r)} V.`);
export const ohmR = (v, i) => num(`${fmt(v)} V pushes ${fmt(i)} A through a part. Its resistance?`, v / i, 'Ω', 'R = V ÷ I', `${fmt(v)} ÷ ${fmt(i)} = ${fmt(v / i)} Ω.`);
export const powVI = (v, i) => num(`${fmt(v)} V and ${fmt(i)} A. Power in watts?`, v * i, 'W', 'P = V × I', `${fmt(v)} × ${fmt(i)} = ${fmt(v * i)} W.`);
export const powVR = (v, r) => num(`${fmt(v)} V across ${fmt(r)} Ω. Power in watts?`, (v * v) / r, 'W', 'P = V² ÷ R', `${fmt(v)}² ÷ ${fmt(r)} = ${fmt((v * v) / r)} W.`);
export const powIR = (i, r) => num(`${fmt(i)} A through ${fmt(r)} Ω. Power in watts?`, i * i * r, 'W', 'P = I² × R', `${fmt(i)}² × ${fmt(r)} = ${fmt(i * i * r)} W.`);

// ---------- combinations ----------
export const series = (rs) => num(`${rs.map((r) => `${fmt(r)} Ω`).join(', ')} in series. Total?`, rs.reduce((a, b) => a + b, 0), 'Ω', 'In series, add them.', `${rs.map(fmt).join(' + ')} = ${fmt(rs.reduce((a, b) => a + b, 0))} Ω.`);
export const parallel = (rs) => {
  const t = 1 / rs.reduce((a, r) => a + 1 / r, 0);
  return num(`${rs.map((r) => `${fmt(r)} Ω`).join(' and ')} in parallel. Total?`, t, 'Ω', rs.length === 2 ? 'Product over sum.' : '1/R = 1/R1 + 1/R2 + …', `1 ÷ (${rs.map((r) => `1/${fmt(r)}`).join(' + ')}) = ${fmt(t)} Ω.`);
};
export const divider = (vin, r1, r2) => num(`${fmt(vin)} V into a divider: R1 = ${fmt(r1)} Ω on top, R2 = ${fmt(r2)} Ω on the bottom. Vout?`, (vin * r2) / (r1 + r2), 'V', 'Vout = Vin × R2 ÷ (R1 + R2)', `${fmt(vin)} × ${fmt(r2)} ÷ ${fmt(r1 + r2)} = ${fmt((vin * r2) / (r1 + r2))} V.`);
export const kvl = (vs, drops) => num(`A ${fmt(vs)} V loop has drops of ${drops.map((d) => `${fmt(d)} V`).join(', ')} and one more part. What does that last part drop?`, vs - drops.reduce((a, b) => a + b, 0), 'V', 'All the drops add up to the supply.', `${fmt(vs)} − ${drops.map(fmt).join(' − ')} = ${fmt(vs - drops.reduce((a, b) => a + b, 0))} V.`);
export const kcl = (inA, outs) => num(`${fmt(inA)} A enters a junction. ${outs.map((o) => `${fmt(o)} A`).join(' and ')} leave on known branches. How much leaves on the last branch?`, inA - outs.reduce((a, b) => a + b, 0), 'A', 'In = out.', `${fmt(inA)} − ${outs.map(fmt).join(' − ')} = ${fmt(inA - outs.reduce((a, b) => a + b, 0))} A.`);

// ---------- LEDs & diodes ----------
export const ledR = (vs, vf, ma) => num(`${fmt(vs)} V supply, LED needing ${fmt(vf)} V, target ${fmt(ma)} mA. Resistor?`, (vs - vf) / (ma / 1000), 'Ω', 'R = (Vsupply − Vled) ÷ I', `(${fmt(vs)} − ${fmt(vf)}) ÷ ${fmt(ma / 1000)} = ${fmt((vs - vf) / (ma / 1000))} Ω.`);
export const ledI = (vs, vf, r) => num(`${fmt(vs)} V, LED ${fmt(vf)} V, resistor ${fmt(r)} Ω. Current in mA?`, ((vs - vf) / r) * 1000, 'mA', 'I = (Vsupply − Vled) ÷ R', `(${fmt(vs)} − ${fmt(vf)}) ÷ ${fmt(r)} = ${fmt(((vs - vf) / r) * 1000)} mA.`);
export const diodeI = (vs, r) => num(`${fmt(vs)} V, a silicon diode and ${fmt(r)} Ω in series. Current in mA?`, ((vs - 0.7) / r) * 1000, 'mA', 'Take 0.7 V off first.', `(${fmt(vs)} − 0.7) ÷ ${fmt(r)} = ${fmt(((vs - 0.7) / r) * 1000)} mA.`);
export const zenerI = (vs, vz, r) => num(`${fmt(vs)} V supply, ${fmt(r)} Ω resistor, ${fmt(vz)} V zener. Resistor current in mA?`, ((vs - vz) / r) * 1000, 'mA', 'The resistor has Vsupply − Vz across it.', `(${fmt(vs)} − ${fmt(vz)}) ÷ ${fmt(r)} = ${fmt(((vs - vz) / r) * 1000)} mA.`);

// ---------- capacitors ----------
export const tau = (r, c, cLabel) => num(`R = ${fmt(r)} Ω, C = ${cLabel}. Time constant τ in seconds?`, r * c, 's', 'τ = R × C (in ohms and farads)', `${fmt(r)} × ${c} = ${fmt(r * c)} s.`);
export const energyC = (c, v, cLabel) => num(`${cLabel} charged to ${fmt(v)} V. Energy in joules?`, 0.5 * c * v * v, 'J', 'E = ½ × C × V²', `0.5 × ${c} × ${fmt(v)}² = ${fmt(0.5 * c * v * v)} J.`);
export const capParallel = (cs) => num(`${cs.map((c) => `${fmt(c)} µF`).join(' and ')} in parallel. Total in µF?`, cs.reduce((a, b) => a + b, 0), 'µF', 'Parallel capacitors add.', `${cs.map(fmt).join(' + ')} = ${fmt(cs.reduce((a, b) => a + b, 0))} µF.`);
export const capSeries = (a, b) => num(`${fmt(a)} µF and ${fmt(b)} µF in series. Total in µF?`, (a * b) / (a + b), 'µF', 'Series capacitors: product over sum.', `${fmt(a * b)} ÷ ${fmt(a + b)} = ${fmt((a * b) / (a + b))} µF.`);
export const charged = (v, n) => {
  const pct = [63, 86, 95, 98, 99][n - 1];
  return num(`A capacitor charges from 0 towards ${fmt(v)} V. Roughly what voltage after ${n} τ?`, (v * pct) / 100, 'V', `After ${n} τ it's at about ${pct}%.`, `${pct}% of ${fmt(v)} = ${fmt((v * pct) / 100)} V.`, 0.03);
};

// ---------- AC & signals ----------
export const period = (f) => num(`A ${fmt(f)} Hz signal. Period in milliseconds?`, 1000 / f, 'ms', 'Period = 1 ÷ f', `1 ÷ ${fmt(f)} = ${fmt(1 / f)} s = ${fmt(1000 / f)} ms.`);
export const freq = (ms) => num(`One wave takes ${fmt(ms)} ms. Frequency in Hz?`, 1000 / ms, 'Hz', 'f = 1 ÷ period (in seconds)', `1 ÷ ${fmt(ms / 1000)} = ${fmt(1000 / ms)} Hz.`);
export const rmsToPeak = (v) => num(`${fmt(v)} V RMS. Peak voltage?`, v * Math.SQRT2, 'V', 'Peak = RMS × 1.414', `${fmt(v)} × 1.414 = ${fmt(v * Math.SQRT2)} V.`);
export const peakToRms = (v) => num(`A sine wave peaks at ${fmt(v)} V. RMS?`, v / Math.SQRT2, 'V', 'RMS = peak ÷ 1.414', `${fmt(v)} ÷ 1.414 = ${fmt(v / Math.SQRT2)} V.`);
export const xc = (f, c, cLabel) => num(`Reactance of ${cLabel} at ${fmt(f)} Hz, in ohms?`, 1 / (2 * Math.PI * f * c), 'Ω', 'Xc = 1 ÷ (2π f C)', `1 ÷ (2π × ${fmt(f)} × ${c}) = ${fmt(1 / (2 * Math.PI * f * c))} Ω.`);
export const xl = (f, l) => num(`Reactance of a ${fmt(l)} H inductor at ${fmt(f)} Hz, in ohms?`, 2 * Math.PI * f * l, 'Ω', 'XL = 2π f L', `2π × ${fmt(f)} × ${fmt(l)} = ${fmt(2 * Math.PI * f * l)} Ω.`);
export const cutoff = (r, c, cLabel) => num(`RC filter: R = ${fmt(r)} Ω, C = ${cLabel}. Cutoff frequency in Hz?`, 1 / (2 * Math.PI * r * c), 'Hz', 'fc = 1 ÷ (2π R C)', `1 ÷ (2π × ${fmt(r)} × ${c}) = ${fmt(1 / (2 * Math.PI * r * c))} Hz.`);
export const transformer = (vin, np, ns) => num(`${fmt(vin)} V into a transformer: ${fmt(np)} turns in, ${fmt(ns)} turns out. Output?`, (vin * ns) / np, 'V', 'Vout = Vin × Nout ÷ Nin', `${fmt(vin)} × ${fmt(ns)} ÷ ${fmt(np)} = ${fmt((vin * ns) / np)} V.`);
export const adc = (bits, vref, reading) => num(`A ${bits}-bit ADC on ${fmt(vref)} V reads ${reading}. Voltage?`, (reading / 2 ** bits) * vref, 'V', `Reading ÷ ${2 ** bits} × Vref`, `${reading} ÷ ${2 ** bits} × ${fmt(vref)} = ${fmt((reading / 2 ** bits) * vref)} V.`, 0.03);
export const pwm = (v, duty) => num(`PWM on ${fmt(v)} V at ${duty}% duty. Average voltage?`, (v * duty) / 100, 'V', 'Average = supply × duty', `${fmt(v)} × ${duty / 100} = ${fmt((v * duty) / 100)} V.`);

// ---------- transistors & op-amps ----------
export const icFromIb = (beta, ibmA) => num(`β = ${beta}, base current ${fmt(ibmA)} mA. Collector current in mA?`, beta * ibmA, 'mA', 'Ic = β × Ib', `${beta} × ${fmt(ibmA)} = ${fmt(beta * ibmA)} mA.`);
export const rbFor = (vin, ibmA) => num(`A ${fmt(vin)} V signal must give ${fmt(ibmA)} mA into a base (Vbe = 0.7 V). Base resistor?`, (vin - 0.7) / (ibmA / 1000), 'Ω', 'Rb = (Vin − 0.7) ÷ Ib', `(${fmt(vin)} − 0.7) ÷ ${fmt(ibmA / 1000)} = ${fmt((vin - 0.7) / (ibmA / 1000))} Ω.`);
export const minIb = (icA, beta) => num(`A transistor (β = ${beta}) must switch ${fmt(icA)} A. Minimum base current in mA?`, (icA / beta) * 1000, 'mA', 'Ib = Ic ÷ β', `${fmt(icA)} ÷ ${beta} = ${fmt((icA / beta) * 1000)} mA.`);
export const nonInvGain = (rf, rg) => num(`Non-inverting amp, Rf = ${fmt(rf)} Ω, Rg = ${fmt(rg)} Ω. Gain?`, 1 + rf / rg, '×', 'Gain = 1 + Rf ÷ Rg', `1 + ${fmt(rf)} ÷ ${fmt(rg)} = ${fmt(1 + rf / rg)}.`);
export const nonInvOut = (vin, rf, rg) => num(`Non-inverting amp, Rf = ${fmt(rf)} Ω, Rg = ${fmt(rg)} Ω, input ${fmt(vin)} V. Output?`, vin * (1 + rf / rg), 'V', 'Vout = Vin × (1 + Rf ÷ Rg)', `${fmt(vin)} × ${fmt(1 + rf / rg)} = ${fmt(vin * (1 + rf / rg))} V.`);
export const invOut = (vin, rf, rin) => num(`Inverting amp, Rf = ${fmt(rf)} Ω, Rin = ${fmt(rin)} Ω, input ${fmt(vin)} V. Output?`, (-rf / rin) * vin, 'V', 'Vout = −(Rf ÷ Rin) × Vin', `−(${fmt(rf)} ÷ ${fmt(rin)}) × ${fmt(vin)} = ${fmt((-rf / rin) * vin)} V.`);
export const rfFor = (gain, rg) => num(`You want a non-inverting gain of ${fmt(gain)} with Rg = ${fmt(rg)} Ω. Rf?`, (gain - 1) * rg, 'Ω', 'Rf = (gain − 1) × Rg', `(${fmt(gain)} − 1) × ${fmt(rg)} = ${fmt((gain - 1) * rg)} Ω.`);
export const clipOut = (vin, gain, rail) => num(`Gain ${fmt(gain)}, input peak ${fmt(vin)} V, rails ±${fmt(rail)} V. Output peak?`, Math.min(vin * gain, rail), 'V', 'It can\'t pass the rails.', vin * gain > rail ? `It wants ${fmt(vin * gain)} V but clips at ${fmt(rail)} V.` : `${fmt(vin)} × ${fmt(gain)} = ${fmt(vin * gain)} V, inside the rails.`);

// ---------- digital ----------
export const binToDec = (bits) => num(`Binary **${bits}** in decimal?`, parseInt(bits, 2), '', 'Add the place values that hold a 1.', `${bits.split('').map((b, i) => (b === '1' ? 2 ** (bits.length - 1 - i) : 0)).filter(Boolean).join(' + ')} = ${parseInt(bits, 2)}.`, 0.0001);
export const decToBin = (n) => num(`Decimal **${n}** in binary?`, +n.toString(2), '', 'Find the biggest powers of 2 that fit.', `${n} = ${n.toString(2)} in binary.`, 0.000001);
export const hexToDec = (h) => num(`Hex **${h}** in decimal?`, parseInt(h, 16), '', 'Each hex place is worth 16× the next. A=10 … F=15.', `${h} = ${parseInt(h, 16)}.`, 0.0001);
export const wrap8 = (a, b) => num(`In 8 bits, what does ${a} + ${b} wrap around to?`, (a + b) % 256, '', 'Subtract 256 if it goes past 255.', a + b > 255 ? `${a + b} − 256 = ${(a + b) % 256}, and the carry flag is set.` : `${a + b} fits, so no wrap.`, 0.0001);
