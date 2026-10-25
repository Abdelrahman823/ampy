// A7 deep practice: concepts, drills and bench challenges, inserted before the checkpoint.
import { N, wire, lamp } from './kit.js';
import { drill, mcq, num, rmsToPeak, peakToRms, xc, xl, transformer } from './drill.js';

export const glossary = {
  'power factor': 'How well an AC load\'s current lines up with the voltage. 1 is perfect (a heater). Motors are lower.',
  generator: 'A machine that spins magnets past coils to make electricity, which is induction in action.',
  'voltage converter': 'A device that changes the voltage itself, unlike a plug adapter, which only changes the shape of the plug.',
};

const peak = (hist, k) => hist.reduce((m, h) => Math.max(m, Math.abs(h[k])), 0);
const acLamp = (extraPart, src, dt, window = 0.5) => ({
  nodes: N, ground: 'bl', transient: { dt, speed: 1 }, testSeconds: 6,
  scope: { traces: [{ part: 'L', field: 'current', label: 'lamp current' }], vmin: -0.6, vmax: 0.6, window },
  parts: [src, extraPart, lamp('L', 'tr', 'br'), wire('W', 'br', 'bl')],
});

export const lessons = [
  {
    id: 'a7-11', title: 'Challenge: dim with a coil', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Choke it down', body: 'At 20 Hz, pick the inductor that keeps the lamp\'s current peak between **0.1 A and 0.2 A**: dim, but still on.' },
      { type: 'bench', prompt: 'Pick the inductor for a lamp-current peak of **0.1–0.2 A** at 20 Hz.',
        circuit: acLamp({ id: 'IND', kind: 'inductor', a: 'tl', b: 'tr', l: 0.1, choices: [0.1, 0.5, 2], prop: 'l', label: 'Inductor' },
          { id: 'AC', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'sine', amp: 10, freq: 20 }, label: '' }, 0.0005),
        goal: (s, parts, info) => { if (info.t < 0.6) return false; const p = peak(info.history, 1); return p > 0.1 && p < 0.2; },
        hint: 'XL = 2π f L. You want XL around 60 Ω.', explain: '0.5 H at 20 Hz gives XL ≈ 63 Ω, so about 0.15 A peak.' },
      xl(20, 0.5),
    ],
  },
  {
    id: 'a7-12', title: 'Challenge: tune to 10 Hz', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Choose the capacitor', body: 'A 1 H coil and a capacitor are in series with the lamp, driven at **10 Hz**. Pick the capacitor that makes the circuit **resonate at 10 Hz**.' },
      { type: 'bench', prompt: 'Pick C so the circuit resonates at 10 Hz (lamp-current peak above **0.45 A**).',
        circuit: { nodes: { ...N, tm: [160, 40] }, ground: 'bl', transient: { dt: 0.0002, speed: 1 }, testSeconds: 6,
          scope: { traces: [{ part: 'L', field: 'current', label: 'lamp current' }], vmin: -0.6, vmax: 0.6, window: 0.5 }, parts: [
            { id: 'AC', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'sine', amp: 10, freq: 10 }, label: '' },
            { id: 'IND', kind: 'inductor', a: 'tl', b: 'tm', l: 1 },
            { id: 'C', kind: 'capacitor', a: 'tm', b: 'tr', c: 1e-4, choices: [1e-4, 2.5e-4, 1e-3], prop: 'c', label: 'Capacitor', vmax: 10 },
            lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
          ] },
        goal: (s, parts, info) => info.t > 1 && peak(info.history, 1) > 0.45,
        hint: 'C = 1 ÷ (4π² f² L) ≈ 0.00025 F.', explain: '250 µF with 1 H resonates at about 10 Hz. Radio tuners do exactly this, just at millions of hertz.' },
      num('L = 1 H, C = 250 µF. Resonant frequency in Hz?', 1 / (2 * Math.PI * Math.sqrt(1 * 0.00025)), 'Hz', 'f = 1 ÷ (2π √(L C))', '1 ÷ (2π × 0.0158) ≈ 10.1 Hz.'),
    ],
  },
  {
    id: 'a7-13', title: 'AC power', icon: '⚡',
    steps: [
      { type: 'learn', title: 'Real power and power factor',
        body: 'For a heater, current follows voltage perfectly: P = V_rms × I_rms.\n\nMotors and coils make the current lag behind, so less of it does useful work. That\'s the [[power factor]]: **P = V × I × PF**.' },
      num('A heater on 230 V draws 4 A (PF = 1). Power in W?', 920, 'W', '230 × 4 × 1', '920 W.'),
      num('A motor on 230 V draws 4 A with PF = 0.8. Real power in W?', 736, 'W', '230 × 4 × 0.8', '736 W.'),
      mcq('Which load has a power factor of about 1?', ['An electric heater', 'A big motor', 'A transformer with no load'], 0, 'Just resistance.', 'A heater is pure resistance, so its current lines up with the voltage.'),
    ],
  },
  {
    id: 'a7-14', title: 'Motors and generators', icon: '🌀',
    steps: [
      { type: 'learn', title: 'Two sides of one idea',
        body: 'Current in a coil near a magnet makes a **force**: that\'s a motor. Spin a coil near a magnet and it makes **current**: that\'s a [[generator]].\n\nThe same machine can do both. Electric cars recover energy when braking by using their motor as a generator.' },
      mcq('A bicycle dynamo lighting a lamp is a…', ['Generator', 'Motor', 'Transformer'], 0, 'Motion → electricity.', 'A generator: you spin it, it makes current.'),
      mcq('How do electric cars recover energy when braking?', ['The motor works as a generator and charges the battery', 'They use solar panels', 'They don\'t'], 0, 'Reverse the motor\'s job.', 'Regenerative braking: motion is turned back into electricity.'),
    ],
  },
  {
    id: 'a7-15', title: 'Adapters vs converters', icon: '🧳',
    steps: [
      { type: 'learn', title: 'Travelling with electronics',
        body: 'Countries use different mains: Saudi Arabia 230 V / 60 Hz, the USA 120 V / 60 Hz, the UK 230 V / 50 Hz.\n\nA **plug adapter** only changes the plug shape. A [[voltage converter]] changes the voltage. Most phone and laptop chargers accept 100–240 V, so they only need an adapter. Always check the label.' },
      mcq('Your charger says "INPUT 100–240 V ~ 50/60 Hz". In the USA you need…', ['Just a plug adapter', 'A voltage converter', 'A new charger'], 0, 'It accepts 120 V.', 'It already handles 120 V, so it only needs the right plug shape.'),
      mcq('A 120 V-only hair dryer from the USA is plugged into 230 V here. What happens?', ['It gets about twice its voltage and can burn out', 'It runs slower', 'Nothing'], 0, 'P = V² ÷ R.', 'Nearly double the voltage means about four times the power, so it\'s likely to burn out.'),
    ],
  },
  drill('a7-16', 'Practice: RMS and peak', '🧮', 'Peak = RMS × 1.414 · RMS = peak ÷ 1.414.', [
    rmsToPeak(230), rmsToPeak(120), rmsToPeak(12), peakToRms(10), peakToRms(325),
  ]),
  drill('a7-17', 'Practice: reactance', '🧮', 'Capacitors: **Xc = 1 ÷ (2π f C)**, falls with f. Inductors: **XL = 2π f L**, rises with f.', [
    xc(50, 0.0001, '100 µF'), xc(1000, 0.000001, '1 µF'), xl(50, 0.1), xl(1000, 0.01),
  ]),
  drill('a7-18', 'Practice: transformers', '🧮', '**Vout = Vin × turns_out ÷ turns_in**', [
    transformer(230, 1000, 100), transformer(230, 2000, 104), transformer(12, 100, 500), transformer(120, 600, 30),
  ]),
  {
    id: 'a7-19', title: 'Review: AC', icon: '🧠',
    steps: [
      { type: 'learn', title: 'AC sense', body: 'Mixed AC questions.' },
      mcq('A capacitor\'s reactance at very high frequency is…', ['Very low', 'Very high', 'Unchanged'], 0, 'Xc = 1 ÷ (2πfC).', 'Very low: high frequencies pass easily.'),
      mcq('Which device steps 230 V down to 12 V AC?', ['A transformer', 'A diode', 'A fuse'], 0, 'Two coils.', 'A transformer.'),
      mcq('At resonance, a series LC circuit\'s current is…', ['At its maximum', 'At its minimum', 'Zero'], 0, 'The reactances cancel.', 'At its maximum: only the resistance limits it.'),
      mcq('What does the earth wire protect against?', ['A fault making a metal case live', 'Lightning', 'Low batteries'], 0, 'Safety wire.', 'A live metal case. Earth carries the fault current away and trips the breaker.'),
    ],
  },
  {
    id: 'a7-20', title: 'Generators and frequency', icon: '🏭',
    steps: [
      { type: 'learn', title: 'Why exactly 60 Hz?',
        body: 'A generator\'s frequency depends on how fast it spins. A 2-pole generator spinning **3600 times a minute** makes 60 Hz (3600 ÷ 60 = 60 turns per second).\n\nAll generators on a grid spin in perfect step: they\'re synchronised.' },
      num('A 2-pole generator spins 3000 times a minute. Frequency in Hz?', 50, 'Hz', 'Turns per second.', '3000 ÷ 60 = 50 Hz, which is the European standard.'),
      num('How many turns per minute does a 2-pole generator need for 60 Hz?', 3600, 'rpm', '60 × 60', '3600 rpm.', 0.0001),
    ],
  },
];
