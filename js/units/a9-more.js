// A9 extra depth: summing amp, voltage follower, difference amp, Schmitt trigger.
import { wire, res, vm, sw, near } from './kit.js';

export const glossary = {
  'summing amplifier': 'An inverting amplifier with several inputs. Its output is the (negative) sum of the inputs, like an audio mixer.',
  'voltage follower': 'An op-amp whose output is wired straight to its − input. Gain 1: it copies a voltage while supplying current.',
  'Schmitt trigger': 'A comparator with two thresholds, one for rising and one for falling, so a noisy input can\'t make it flicker.',
};

const NS = { v1: [40, 70], g1: [40, 200], v2: [90, 130], g2: [90, 200], nn: [140, 70], n2: [140, 130], ft: [140, 30], ot: [270, 30], o: [270, 100], pg: [150, 200], vo: [320, 100], vg: [320, 200] };
const NF = { tl: [40, 40], tm: [110, 40], m: [110, 120], bm: [110, 200], bl: [40, 200], nf: [150, 165], o: [250, 120], of: [250, 165], lt: [310, 120], lb: [310, 200] };

export const lessons = [
  {
    id: 'a9-8', title: 'The summing amplifier', icon: '🎚️',
    steps: [
      { type: 'learn', title: 'Mixing signals',
        body: 'Feed several inputs, each through its own resistor, into an inverting amplifier\'s − input and they **add up**:\n\n**Vout = −Rf × (V1/R1 + V2/R2)**\n\nThat\'s how a mixing desk combines microphones.' },
      { type: 'bench', prompt: 'Inputs are 1 V and 2 V, each through 1 kΩ. Pick **Rf** so the output is **−3 V**: the plain (negative) sum.',
        circuit: { nodes: NS, view: '0 0 360 220', ground: 'g1', parts: [
          { id: 'B1', kind: 'battery', a: 'v1', b: 'g1', v: 1, rInt: 0.001 }, { id: 'B2', kind: 'battery', a: 'v2', b: 'g2', v: 2, rInt: 0.001 },
          res('R1', 'v1', 'nn', 1000), res('R2', 'v2', 'n2', 1000), wire('W1', 'n2', 'nn'), wire('W2', 'nn', 'ft'),
          res('RF', 'ft', 'ot', 2000, { choices: [500, 1000, 2000], label: 'Rf' }), wire('W3', 'ot', 'o'),
          { id: 'U', kind: 'opamp', pins: { n: 'nn', p: 'pg', out: 'o' }, at: [190, 100] },
          wire('W4', 'o', 'vo'), vm('V', 'vo', 'vg'), wire('W5', 'vg', 'pg'), wire('W6', 'pg', 'g2'), wire('W7', 'g2', 'g1'),
        ] },
        goal: (s) => near(s.parts.V.voltage, -3, 0.05),
        hint: 'Equal resistors everywhere give a plain sum.', explain: '−1k × (1/1k + 2/1k) = −3 V. With Rf = 2 kΩ you\'d get double the sum.' },
      { type: 'numeric', q: 'Summing amp, all resistors 10 kΩ, inputs 0.5 V and 1.5 V. Vout?', answer: -2, tol: 0.01, unit: 'V',
        hint: '−(0.5 + 1.5)', explain: '−2 V.' },
    ],
  },
  {
    id: 'a9-9', title: 'The voltage follower', icon: '🪞',
    steps: [
      { type: 'learn', title: 'Copy and carry',
        body: 'Connect the output straight to the − input: a [[voltage follower]]. The golden rule makes the output equal the + input, with a gain of exactly 1.\n\nIt seems pointless, but its input takes almost no current while its output can supply plenty.' },
      { type: 'bench', prompt: 'A weak 10 k / 10 k divider makes 4.5 V and feeds a follower. **Connect the 1 kΩ load** and check the load still gets ~4.5 V.',
        circuit: { nodes: NF, ground: 'bl', parts: [
          { id: 'B', kind: 'battery', a: 'tl', b: 'bl', v: 9, rInt: 0.001 }, wire('W0', 'tl', 'tm'),
          res('R1', 'tm', 'm', 10000), res('R2', 'm', 'bm', 10000), wire('W1', 'bm', 'bl'),
          { id: 'U', kind: 'opamp', pins: { p: 'm', n: 'nf', out: 'o' }, at: [190, 120], flip: true },
          wire('W2', 'o', 'of'), wire('W3', 'of', 'nf'),
          sw('S', 'o', 'lt', { label: '' }), res('RL', 'lt', 'lb', 1000, { show: 'v' }), wire('W4', 'lb', 'bm'),
        ] },
        goal: (s) => near(s.parts.RL.voltage, 4.5, 0.1),
        hint: 'Close the switch on the right.', explain: 'Without the follower, that load would drag the divider down to about 0.8 V. With it, the load gets the full 4.5 V. This fixes the sagging divider from the Analysis unit.' },
      { type: 'mcq', q: 'What is the gain of a voltage follower?', choices: ['0', '1', '100 000'], answer: 1,
        hint: 'Out equals in.', explain: 'Exactly 1: the output copies the input.' },
    ],
  },
  {
    id: 'a9-10', title: 'Differences and hysteresis', icon: '📏',
    steps: [
      { type: 'learn', title: 'Two more classics',
        body: '**Difference amplifier**: amplifies V2 − V1 and ignores anything both inputs share, like noise picked up on both wires. Medical sensors (ECG) rely on it.\n\n**[[Schmitt trigger]]**: a comparator with two thresholds, say switching on at 3 V but off only below 2 V. A noisy signal near the threshold can\'t make it flicker.' },
      { type: 'numeric', q: 'A difference amplifier with gain 10 sees V2 = 2.1 V and V1 = 2.0 V. Output?', answer: 1, tol: 0.02, unit: 'V',
        hint: '10 × (V2 − V1)', explain: '10 × 0.1 = 1 V. The shared 2 V is ignored.' },
      { type: 'mcq', q: 'A thermostat clicks on and off rapidly when the temperature sits right at the set point. What fixes it?', choices: ['A Schmitt trigger (hysteresis)', 'A bigger fuse', 'A higher gain'], answer: 0,
        hint: 'Two thresholds.', explain: 'Hysteresis gives a gap between on and off, so small wobbles don\'t toggle it.' },
    ],
  },
];
