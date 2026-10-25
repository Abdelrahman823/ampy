// A9 · Amplifiers: op-amps as comparators, non-inverting and inverting
// amplifiers, AC amplification, clipping, buffers.
import { wire, res, vm, near } from './kit.js';

export const glossary = {
  'op-amp': 'Operational amplifier: a chip with two inputs (+ and −) and one output. It amplifies the difference between its inputs enormously.',
  comparator: 'An op-amp used without feedback: its output slams high if + is above −, and low otherwise.',
  'negative feedback': 'Feeding part of the output back to the − input. It tames the op-amp so it amplifies by an exact, chosen amount.',
  clipping: 'When an amplifier\'s output tries to go beyond its supply voltage and gets flattened at the rails.',
  buffer: 'An op-amp with a gain of 1. It copies a voltage but can supply much more current, so it stops loading.',
  rails: 'The supply voltages of an op-amp. Its output can\'t go beyond them.',
};

// comparator: + on top (flip), sensor on +, reference on −
const NC = { vs: [40, 90], gs: [40, 200], pp: [110, 90], nr: [100, 150], rb: [100, 200], o: [220, 100], ol: [290, 100], lg: [290, 200] };
// non-inverting amp: + on top (flip)
const NN = { vin: [40, 80], gnd: [40, 200], pnode: [100, 80], nn: [110, 140], fo: [250, 140], o: [250, 90], ng: [110, 200], vo: [300, 90], vg: [300, 200] };
// inverting amp
const NI = { vin: [40, 90], gnd: [40, 200], nn: [110, 90], ft: [110, 40], ot: [250, 40], o: [250, 100], pg: [130, 200], vo: [300, 100], vg: [300, 200] };

const nonInv = (vinPart, rf, extra = []) => [
  vinPart, wire('W1', 'vin', 'pnode'),
  { id: 'U', kind: 'opamp', pins: { p: 'pnode', n: 'nn', out: 'o' }, at: [170, 90], flip: true },
  rf, wire('W2', 'fo', 'o'), res('RG', 'nn', 'ng', 1000, { label: 'Rg 1 kΩ' }), wire('W3', 'ng', 'gnd'), ...extra,
];
const peak = (hist, k) => hist.reduce((m, h) => Math.max(m, Math.abs(h[k])), 0);

export default {
  id: 'a9',
  title: 'Amplifiers',
  subtitle: 'Op-amps: compare, amplify, buffer',
  lessons: [
    {
      id: 'a9-1', title: 'Meet the op-amp', icon: '🔺',
      steps: [
        { type: 'learn', title: 'A difference machine',
          body: 'An [[op-amp]] has a **+** input, a **−** input and an output. It multiplies the difference between them by about **100 000**.\n\nWithout feedback that\'s a [[comparator]]: if + is even a tiny bit above −, the output jumps to the top [[rails]]. Otherwise it drops to the bottom.' },
        { type: 'bench', prompt: 'A 4.5 V reference sits on the **−** input. Raise the sensor voltage on **+** until the LED turns on.',
          circuit: { nodes: NC, ground: 'gs', parts: [
            { id: 'VS', kind: 'battery', a: 'vs', b: 'gs', v: 1, rInt: 0.001, slider: { label: 'Sensor voltage', prop: 'v', min: 0, max: 9, step: 0.5, fmt: 'v' } },
            wire('W1', 'vs', 'pp'), { id: 'VR', kind: 'battery', a: 'nr', b: 'rb', v: 4.5, rInt: 0.001, labelSide: -1 },
            { id: 'U', kind: 'opamp', pins: { p: 'pp', n: 'nr', out: 'o' }, at: [170, 100], flip: true, vpos: 9, vneg: 0 },
            res('R', 'o', 'ol', 330), { id: 'D', kind: 'led', a: 'ol', b: 'lg' }, wire('W2', 'gs', 'rb'), wire('W3', 'rb', 'lg'),
          ] },
          goal: (s) => s.parts.D.on,
          hint: 'Go above 4.5 V.', explain: 'As soon as + passed −, the output snapped from 0 V to 9 V. Thermostats and battery alarms work exactly like this.' },
        { type: 'mcq', q: 'A comparator\'s + input is at 3.1 V and its − input at 3.0 V. The output is…',
          choices: ['High', 'Low', 'Exactly 0.1 V'], answer: 0, hint: 'Which input is bigger?',
          explain: 'High. Even 0.1 V of difference × 100 000 hits the top rail.' },
      ],
    },
    {
      id: 'a9-2', title: 'Taming it with feedback', icon: '🔄',
      steps: [
        { type: 'learn', title: 'The golden rule',
          body: 'Connect the output back to the **−** input through resistors ([[negative feedback]]) and the op-amp settles so that **both inputs are equal**.\n\nNon-inverting amplifier gain:\n**gain = 1 + Rf ÷ Rg**' },
        { type: 'bench', prompt: '1 V goes in. Pick **Rf** so the output is **3 V** (gain of 3).',
          circuit: { nodes: NN, view: '0 0 360 220', ground: 'gnd', parts: nonInv(
            { id: 'VIN', kind: 'battery', a: 'vin', b: 'gnd', v: 1, rInt: 0.001 },
            res('RF', 'nn', 'fo', 1000, { choices: [1000, 2000, 4000], label: 'Rf' }),
            [wire('W4', 'o', 'vo'), vm('V', 'vo', 'vg', { labelSide: -1 }), wire('W5', 'vg', 'ng')],
          ) },
          goal: (s) => near(s.parts.V.voltage, 3, 0.05),
          hint: '3 = 1 + Rf ÷ 1 kΩ', explain: '1 + 2k ÷ 1k = 3, so 1 V in gives 3 V out. Change the resistors and you choose the gain exactly.' },
        { type: 'numeric', q: 'Non-inverting amplifier: Rf = 47 kΩ, Rg = 10 kΩ. What is the gain?', answer: 5.7, tol: 0.01, unit: '×',
          hint: '1 + Rf ÷ Rg', explain: '1 + 4.7 = 5.7.' },
      ],
    },
    {
      id: 'a9-3', title: 'The inverting amplifier', icon: '🙃',
      steps: [
        { type: 'learn', title: 'Flip and scale',
          body: 'Feed the signal into the **−** input through Rin, with + on ground. The output is flipped:\n\n**Vout = −(Rf ÷ Rin) × Vin**\n\nThis op-amp has rails at +9 V and −9 V, so it can go negative.' },
        { type: 'bench', prompt: '1 V in. Pick **Rf** so the output reads **−4 V**.',
          circuit: { nodes: NI, view: '0 0 360 220', ground: 'gnd', parts: [
            { id: 'VIN', kind: 'battery', a: 'vin', b: 'gnd', v: 1, rInt: 0.001 }, res('RIN', 'vin', 'nn', 1000, { label: 'Rin 1 kΩ' }),
            wire('W1', 'nn', 'ft'), res('RF', 'ft', 'ot', 1000, { choices: [1000, 2000, 4000], label: 'Rf' }), wire('W2', 'ot', 'o'),
            { id: 'U', kind: 'opamp', pins: { n: 'nn', p: 'pg', out: 'o' }, at: [170, 100] },
            wire('W3', 'o', 'vo'), vm('V', 'vo', 'vg', { labelSide: -1 }), wire('W4', 'vg', 'pg'), wire('W5', 'pg', 'gnd'),
          ] },
          goal: (s) => near(s.parts.V.voltage, -4, 0.05),
          hint: 'Rf ÷ Rin = 4.', explain: '−(4k ÷ 1k) × 1 V = −4 V.' },
        { type: 'numeric', q: 'Inverting amp with Rin = 10 kΩ, Rf = 100 kΩ and Vin = 0.2 V. What is Vout?', answer: -2, tol: 0.01, unit: 'V',
          hint: '−(Rf ÷ Rin) × Vin', explain: '−10 × 0.2 = −2 V.' },
      ],
    },
    {
      id: 'a9-4', title: 'Amplify a signal', icon: '🔊',
      steps: [
        { type: 'learn', title: 'Making small signals big',
          body: 'A microphone makes tiny wiggles, just millivolts. An amplifier makes them big enough to use, with the same shape, only taller.' },
        { type: 'bench', prompt: 'A 0.5 V signal goes in. Drag **Rf** for a gain of **10**, so the output peaks at about **5 V**.',
          circuit: { nodes: NN, view: '0 0 360 220', ground: 'gnd', transient: { dt: 0.002, speed: 1 }, testSeconds: 4,
            scope: { traces: [{ node: 'vin', label: 'in' }, { node: 'o', label: 'out' }], vmin: -10, vmax: 10, window: 1 },
            parts: nonInv(
              { id: 'VIN', kind: 'battery', a: 'vin', b: 'gnd', v: 0, rInt: 0.001, wave: { type: 'sine', amp: 0.5, freq: 2 }, label: '' },
              res('RF', 'nn', 'fo', 1000, { slider: { label: 'Rf', min: 1000, max: 30000, step: 1000 } }),
            ) },
          goal: (s, parts, info) => info.t > 0.6 && near(peak(info.history, 2), 5, 0.4),
          hint: 'gain = 1 + Rf ÷ 1 kΩ = 10.', explain: 'Rf = 9 kΩ gives 1 + 9 = 10. Same wave shape, ten times taller.' },
        { type: 'mcq', q: 'What does an amplifier change about a signal?', choices: ['Its shape', 'Its size', 'Its frequency'], answer: 1,
          hint: 'Taller, not different.', explain: 'Only its size. A good amplifier keeps the shape and frequency the same.' },
      ],
    },
    {
      id: 'a9-5', title: 'Hitting the rails', icon: '✂️',
      steps: [
        { type: 'learn', title: 'Clipping',
          body: 'An op-amp\'s output can\'t go past its [[rails]]. Ask for too much gain and the tops of the wave get chopped flat. That\'s [[clipping]], and it sounds harsh and distorted.' },
        { type: 'bench', prompt: 'Turn the gain up until the output **clips** flat at the 9 V rail.',
          circuit: { nodes: NN, view: '0 0 360 220', ground: 'gnd', transient: { dt: 0.002, speed: 1 }, testSeconds: 4,
            scope: { traces: [{ node: 'vin', label: 'in' }, { node: 'o', label: 'out' }], vmin: -10, vmax: 10, window: 1 },
            parts: nonInv(
              { id: 'VIN', kind: 'battery', a: 'vin', b: 'gnd', v: 0, rInt: 0.001, wave: { type: 'sine', amp: 0.5, freq: 2 }, label: '' },
              res('RF', 'nn', 'fo', 1000, { slider: { label: 'Rf', min: 1000, max: 30000, step: 1000 } }),
            ) },
          goal: (s, parts, info) => info.t > 0.6 && peak(info.history, 2) > 8.95,
          hint: 'You need a gain above 18.', explain: 'With 0.5 V × 18 = 9 V and beyond, the peaks get sliced off at the rail. Guitar distortion pedals do this on purpose!' },
        { type: 'mcq', q: 'An amplifier on ±12 V rails has a gain of 50. What happens to a 0.5 V peak input?',
          choices: ['Output peaks at 25 V', 'Output clips at about 12 V', 'Output is 0.5 V'], answer: 1,
          hint: '0.5 × 50 = 25 V, but the rails…', explain: 'It wants 25 V but can only reach about 12 V, so it clips.' },
      ],
    },
    {
      id: 'a9-6', title: 'Buffers and real uses', icon: '🧰',
      steps: [
        { type: 'learn', title: 'Op-amps everywhere',
          body: 'Wire the output straight to − and you get a [[buffer]] (gain 1). It copies a voltage but can drive a load, which fixes the sagging divider from the Analysis unit.\n\nOp-amps also run audio mixers, sensor amplifiers, filters and alarms.' },
        { type: 'mcq', q: 'Your voltage divider sags when you connect a load. What fixes it?',
          choices: ['An op-amp buffer between them', 'A bigger battery', 'A fuse'], answer: 0, hint: 'Copy the voltage, supply the current.',
          explain: 'The buffer copies the divider\'s voltage while drawing almost nothing from it, and supplies the load itself.' },
        { type: 'numeric', q: 'A microphone gives 10 mV. You need 1 V. What gain do you need?', answer: 100, tol: 0.01, unit: '×',
          hint: '1 V ÷ 0.01 V', explain: '1 ÷ 0.01 = 100.' },
        { type: 'mcq', q: 'A **transistor** can also amplify. In a simple common-emitter amplifier, a small change in base current makes…',
          choices: ['A bigger change in collector current', 'No change at all', 'The battery voltage rise'], answer: 0,
          hint: 'Remember β.', explain: 'β multiplies base-current changes into bigger collector-current changes. Op-amps are built from many transistors doing this.' },
      ],
    },
    {
      id: 'a9-7', title: 'Checkpoint: amplifiers', icon: '🏁',
      steps: [
        { type: 'learn', title: 'Choose the gain', body: 'Comparator, non-inverting and inverting amplifiers, plus the rails that limit them.' },
        { type: 'bench', prompt: '1 V in. Pick **Rf** for an output of **5 V**.',
          circuit: { nodes: NN, view: '0 0 360 220', ground: 'gnd', parts: nonInv(
            { id: 'VIN', kind: 'battery', a: 'vin', b: 'gnd', v: 1, rInt: 0.001 },
            res('RF', 'nn', 'fo', 1000, { choices: [1000, 4000, 5000, 10000], label: 'Rf' }),
            [wire('W4', 'o', 'vo'), vm('V', 'vo', 'vg', { labelSide: -1 }), wire('W5', 'vg', 'ng')],
          ) },
          goal: (s) => near(s.parts.V.voltage, 5, 0.05),
          hint: 'gain = 1 + Rf ÷ Rg = 5', explain: '1 + 4k ÷ 1k = 5. Did you pick 5 kΩ first? That gives 6, a classic trap.' },
        { type: 'numeric', q: 'Inverting amp, Rin = 2 kΩ, Rf = 10 kΩ. What is the gain (with sign)?', answer: -5, tol: 0.01, unit: '×',
          hint: '−Rf ÷ Rin', explain: '−10 ÷ 2 = −5.' },
        { type: 'mcq', q: 'Which circuit turns an analog voltage into a clean on/off signal?', choices: ['Buffer', 'Comparator', 'Inverting amplifier'], answer: 1,
          hint: 'No feedback, output slams to a rail.', explain: 'A comparator: above the reference it\'s high, below it it\'s low.' },
      ],
    },
  ],
};
