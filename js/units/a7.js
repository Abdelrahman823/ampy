// A7 · AC: mains, RMS, capacitors and inductors with frequency, transformers.
import { N, wire, res, lamp } from './kit.js';

export const glossary = {
  mains: 'The AC electricity from wall sockets. In Saudi Arabia it\'s 230 V at 60 Hz.',
  RMS: 'Root-mean-square: the "equivalent DC" value of an AC voltage. 230 V RMS heats a heater the same as 230 V DC.',
  reactance: 'How much a capacitor or inductor resists AC, in ohms. It changes with frequency.',
  inductor: 'A coil of wire. It stores energy in a magnetic field and resists changes in current.',
  transformer: 'Two coils on an iron core. It changes AC voltage up or down by the ratio of their turns.',
};

const src = (amp, freq, slider) => ({ id: 'AC', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'sine', amp, freq }, label: `${amp} V AC`, slider });
const peak = (hist, k) => hist.reduce((m, h) => Math.max(m, Math.abs(h[k])), 0);

export default {
  id: 'a7',
  title: 'AC',
  subtitle: 'The wall\'s wave, RMS, coils and transformers',
  lessons: [
    {
      id: 'a7-1', title: 'The wall socket', icon: '🔌',
      steps: [
        { type: 'learn', title: 'Alternating current',
          body: '[[mains]] power is [[AC]]: the voltage swings positive and negative, again and again.\n\n**Saudi Arabia: 230 V at 60 Hz.** Much of the world uses 50 Hz.\n\nAC won because it\'s easy to step up and down with [[transformer]]s.' },
        { type: 'mcq', q: 'How many times per second does Saudi mains complete a full wave?', choices: ['50', '60', '230'], answer: 1,
          hint: 'That\'s the frequency.', explain: '60 Hz means 60 complete waves every second.' },
        { type: 'mcq', q: 'Is it safe to measure the wall socket with your multimeter as a beginner?',
          choices: ['Yes, meters are safe', 'No, mains can kill. Stick to batteries.'], answer: 1,
          hint: 'Remember the Power unit.', explain: 'Never experiment with mains. Everything in Ampy is safe at battery voltages.' },
      ],
    },
    {
      id: 'a7-2', title: 'RMS: the fair average', icon: '⚖️',
      steps: [
        { type: 'learn', title: 'Peak vs RMS',
          body: 'A sine wave spends only an instant at its peak. Its [[RMS]] value is the DC voltage that would deliver the same power:\n\n**V_rms = V_peak ÷ 1.414**\n\nSo "230 V" mains actually peaks at about **325 V**.' },
        { type: 'bench', prompt: 'Set the amplitude (peak) so this AC delivers the same power as **6 V DC**.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.002, speed: 1 }, testSeconds: 4,
            scope: { traces: [{ node: 'tl', label: 'AC' }], vmin: -11, vmax: 11, window: 1 }, parts: [
              src(4, 2, { label: 'Peak', prop: 'amp', min: 4, max: 10, step: 0.5, fmt: 'v' }),
              wire('W1', 'tl', 'tr'), res('R', 'tr', 'br', 1000), wire('W', 'br', 'bl'),
            ] },
          goal: (s, parts) => Math.abs(parts[0].wave.amp - 8.5) < 0.01,
          hint: 'Peak = RMS × 1.414', explain: '6 × 1.414 ≈ 8.5 V peak. That AC is "6 V RMS".' },
        { type: 'numeric', q: 'Mains is 230 V RMS. What is its peak voltage (to the nearest volt)?', answer: 325, tol: 0.01, unit: 'V',
          hint: '× 1.414', explain: '230 × 1.414 ≈ 325 V.' },
        { type: 'numeric', q: 'A sine wave peaks at 14.14 V. What is its RMS value?', answer: 10, tol: 0.02, unit: 'V',
          hint: '÷ 1.414', explain: '14.14 ÷ 1.414 = 10 V RMS.' },
      ],
    },
    {
      id: 'a7-3', title: 'Capacitors love AC', icon: '💨',
      steps: [
        { type: 'learn', title: 'Reactance',
          body: 'A capacitor blocks steady DC. But AC keeps charging and discharging it, so current flows back and forth.\n\nThe **faster** the AC, the **easier** it gets through. Its [[reactance]] falls as frequency rises.' },
        { type: 'bench', prompt: 'A capacitor feeds this lamp. Raise the frequency until the lamp current (on the scope) peaks above **0.45 A**.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.001, speed: 1 }, testSeconds: 4,
            scope: { traces: [{ part: 'L', field: 'current', label: 'lamp current' }], vmin: -0.6, vmax: 0.6, window: 1 }, parts: [
              src(10, 1, { label: 'Frequency', prop: 'freq', min: 1, max: 25, step: 1, fmt: 'hz' }),
              { id: 'C', kind: 'capacitor', a: 'tl', b: 'tr', c: 1e-3, label: '1 mF', vmax: 10 }, lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
            ] },
          goal: (s, parts, info) => info.t > 0.6 && peak(info.history, 1) > 0.45,
          hint: 'Go faster.', explain: 'At low frequency the capacitor blocks most current. Faster AC passes through easily. Tone controls and filters use this.' },
        { type: 'mcq', q: 'What happens to a capacitor\'s reactance as frequency goes **up**?',
          choices: ['It goes up', 'It goes down', 'It stays the same'], answer: 1,
          hint: 'Think about what you just saw.', explain: 'It goes down, so more current flows at high frequency.' },
      ],
    },
    {
      id: 'a7-4', title: 'Inductors fight change', icon: '🌀',
      steps: [
        { type: 'learn', title: 'Coils',
          body: 'An [[inductor]] is a coil of wire. Its magnetic field resists any **change** in current.\n\nSteady DC passes easily. Fast AC is blocked. It\'s the **opposite** of a capacitor.' },
        { type: 'bench', prompt: 'An inductor feeds this lamp. Raise the frequency until the lamp current peaks **below 0.1 A**.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.0005, speed: 1 }, testSeconds: 4,
            scope: { traces: [{ part: 'L', field: 'current', label: 'lamp current' }], vmin: -0.6, vmax: 0.6, window: 0.5 }, parts: [
              src(10, 2, { label: 'Frequency', prop: 'freq', min: 2, max: 40, step: 2, fmt: 'hz' }),
              { id: 'IND', kind: 'inductor', a: 'tl', b: 'tr', l: 0.5 }, lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
            ] },
          goal: (s, parts, info) => info.t > 0.6 && peak(info.history, 1) < 0.1,
          hint: 'Go faster.', explain: 'The faster the AC, the harder the coil pushes back. Inductors filter noise out of power lines.' },
        { type: 'mcq', q: 'Which part lets **DC** through but blocks fast AC?', choices: ['Capacitor', 'Inductor', 'Diode'], answer: 1,
          hint: 'The coil.', explain: 'An inductor. A capacitor does the opposite.' },
      ],
    },
    {
      id: 'a7-5', title: 'Transformers', icon: '🔁',
      steps: [
        { type: 'learn', title: 'Changing voltage with coils',
          body: 'A [[transformer]] has two coils on an iron core. AC in the first coil makes a changing magnetic field, which makes AC in the second.\n\n**V_out ÷ V_in = turns_out ÷ turns_in**\n\nFewer turns on the output means a lower voltage. That\'s how chargers step 230 V down.' },
        { type: 'numeric', q: '230 V into a transformer with 1000 turns in and 50 turns out. Output voltage?', answer: 11.5, tol: 0.01, unit: 'V',
          hint: '230 × 50 ÷ 1000', explain: '230 × 50 ÷ 1000 = 11.5 V.' },
        { type: 'mcq', q: 'Why do power lines carry very **high** voltages over long distances?',
          choices: ['Higher voltage means less current for the same power, so less is lost as heat in the wires', 'It\'s faster', 'Birds don\'t like it'], answer: 0,
          hint: 'Heat in a wire depends on current.', explain: 'Same power at higher voltage needs less current, and wire losses depend on current squared.' },
        { type: 'mcq', q: 'Does a transformer work with steady DC?',
          choices: ['Yes', 'No, it needs a changing current'], answer: 1,
          hint: 'It works by a *changing* magnetic field.', explain: 'No. Steady DC makes a steady field, which induces nothing in the second coil.' },
      ],
    },
    {
      id: 'a7-6', title: 'Checkpoint: AC', icon: '🏁',
      steps: [
        { type: 'learn', title: 'Waves at work', body: 'Mains, RMS, capacitors versus inductors, and transformers.' },
        { type: 'bench', prompt: 'Choose a frequency where the capacitor lets **at least 0.4 A** (peak) reach the lamp, using the **lowest** frequency that works.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.001, speed: 1 }, testSeconds: 4,
            scope: { traces: [{ part: 'L', field: 'current', label: 'lamp current' }], vmin: -0.6, vmax: 0.6, window: 1 }, parts: [
              { id: 'AC', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'sine', amp: 10, freq: 2 }, label: '10 V AC', choices: [2, 5, 10, 20], prop: 'freq', fmt: 'hz' },
              { id: 'C', kind: 'capacitor', a: 'tl', b: 'tr', c: 1e-3, label: '1 mF', vmax: 10 }, lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
            ] },
          goal: (s, parts, info) => parts[0].wave.freq === 10 && info.t > 0.6 && peak(info.history, 1) >= 0.4,
          hint: 'Try each and watch the peak.', explain: 'At 10 Hz the 1 mF capacitor\'s reactance is about 16 Ω, low enough to pass 0.4 A.' },
        { type: 'numeric', q: 'A UPS outputs 120 V RMS. What is the peak voltage (nearest volt)?', answer: 170, tol: 0.01, unit: 'V',
          hint: '× 1.414', explain: '120 × 1.414 ≈ 170 V.' },
        { type: 'numeric', q: 'A transformer turns 230 V into 23 V. If the input coil has 500 turns, how many does the output coil have?', answer: 50, tol: 0.01, unit: 'turns',
          hint: 'The voltage ratio equals the turns ratio.', explain: '23 ÷ 230 = 1/10, so 500 ÷ 10 = 50 turns.' },
      ],
    },
  ],
};
