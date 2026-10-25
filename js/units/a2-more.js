// A2 extra depth: parallel formula, networks, bridges, internal resistance,
// Thévenin, maximum power.
import { N, N2, N3, bat, wire, res, vm, am, sw, near } from './kit.js';

export const glossary = {
  'Wheatstone bridge': 'Two voltage dividers side by side with a meter between their middles. When it reads zero, the bridge is balanced and the resistor ratios match.',
  'internal resistance': 'The small resistance inside every battery. It makes the voltage drop when you draw more current.',
  'Thévenin equivalent': 'Any network of batteries and resistors acts, from outside, like one battery in series with one resistor.',
};

const NW = { tl: [55, 40], tm: [130, 40], tr: [215, 40], xr: [300, 40], m1: [130, 110], x1: [300, 110], bl: [55, 180], bm: [130, 180], xb: [300, 180] };

export const lessons = [
  {
    id: 'a2-9', title: 'Resistors in parallel', icon: '∥',
    steps: [
      { type: 'learn', title: 'Two paths are easier than one',
        body: 'Parallel resistors make a **smaller** total, because there are more paths:\n\n**R = (R1 × R2) ÷ (R1 + R2)**\n\nThe total is always smaller than the smallest one.' },
      { type: 'bench', prompt: '12 V. Pick **R2** so the battery supplies **0.6 A** in total.',
        circuit: { nodes: NW, view: '0 0 330 220', ground: 'bl', parts: [
          bat(12), am('A', 'tl', 'tm'), wire('W1', 'tm', 'tr'), wire('W2', 'tr', 'xr'),
          res('R1', 'tm', 'bm', 60, { labelSide: -1 }), res('R2', 'xr', 'xb', 60, { choices: [60, 30, 20], label: 'R2' }),
          wire('W3', 'xb', 'bm'), wire('W4', 'bm', 'bl'),
        ] },
        goal: (s) => near(s.parts.A.current, 0.6, 0.01),
        hint: 'You need a total of 12 ÷ 0.6 = 20 Ω.', explain: '60 × 30 ÷ 90 = 20 Ω, and 12 ÷ 20 = 0.6 A.' },
      { type: 'numeric', q: '6 Ω and 3 Ω in parallel. Total resistance?', answer: 2, tol: 0.01, unit: 'Ω',
        hint: 'Product over sum.', explain: '18 ÷ 9 = 2 Ω.' },
      { type: 'numeric', q: 'Three 30 Ω resistors in parallel. Total?', answer: 10, tol: 0.01, unit: 'Ω',
        hint: 'Equal resistors: divide by how many.', explain: '30 ÷ 3 = 10 Ω.' },
    ],
  },
  {
    id: 'a2-10', title: 'Series and parallel together', icon: '🕸️',
    steps: [
      { type: 'learn', title: 'Simplify step by step',
        body: 'Real circuits mix both. Squash each parallel group into one resistor, then add up the series parts.' },
      { type: 'bench', prompt: 'R1 feeds two 20 Ω resistors in parallel. Pick **R1** so the ammeter reads **0.3 A** from 9 V.',
        circuit: { nodes: N2, view: '0 0 330 220', ground: 'bl', parts: [
          bat(9), res('R1', 'tl', 'tm', 10, { choices: [10, 20, 40], label: 'R1' }), wire('W1', 'tm', 'tr'), wire('W2', 'tr', 'xr'),
          res('Ra', 'tm', 'bm', 20, { labelSide: -1 }), res('Rb', 'xr', 'xb', 20), wire('W3', 'xb', 'bm'), am('A', 'bm', 'bl'),
        ] },
        goal: (s) => near(s.parts.A.current, 0.3, 0.005),
        hint: 'You need 30 Ω total. The parallel pair is 10 Ω.', explain: '20 ∥ 20 = 10 Ω, plus R1 = 20 Ω gives 30 Ω. 9 ÷ 30 = 0.3 A.' },
      { type: 'numeric', q: 'A 5 Ω resistor in series with (10 Ω ∥ 10 Ω). Total?', answer: 10, tol: 0.01, unit: 'Ω',
        hint: 'Parallel pair first.', explain: '10 ∥ 10 = 5, plus 5 = 10 Ω.' },
    ],
  },
  {
    id: 'a2-11', title: 'The Wheatstone bridge', icon: '⚖️',
    steps: [
      { type: 'learn', title: 'Measuring by balancing',
        body: 'A [[Wheatstone bridge]] is two dividers with a voltmeter between their middles. When the left and right ratios match, the meter reads **zero**.\n\nScales, strain gauges and thermometers use this to detect tiny changes.' },
      { type: 'bench', prompt: 'Rx is unknown. Drag **R2** until the bridge balances (voltmeter ≈ 0 V).',
        circuit: { nodes: NW, view: '0 0 330 220', ground: 'bl', parts: [
          bat(9), wire('W0', 'tl', 'tm'), wire('W1', 'tm', 'tr'), wire('W2', 'tr', 'xr'),
          res('R1', 'tm', 'm1', 1000, { labelSide: -1 }), res('R2', 'm1', 'bm', 100, { slider: { label: 'R2', min: 100, max: 2000, step: 100 }, labelSide: -1 }),
          res('R3', 'xr', 'x1', 1000), res('RX', 'x1', 'xb', 1500, { label: 'Rx = ?' }),
          vm('V', 'm1', 'x1', { labelSide: -1 }), wire('W3', 'xb', 'bm'), wire('W4', 'bm', 'bl'),
        ] },
        goal: (s) => Math.abs(s.parts.V.voltage) < 0.05,
        hint: 'Balance when R2 ÷ R1 = Rx ÷ R3.', explain: 'Balanced at R2 = 1.5 kΩ, so Rx must also be 1.5 kΩ. You measured a resistor without an ohmmeter.' },
      { type: 'mcq', q: 'A bridge is balanced with R1 = R3. What does that tell you?', choices: ['R2 = Rx', 'R2 = 0', 'The battery is flat'], answer: 0,
        hint: 'Same ratios on both sides.', explain: 'Equal top resistors and zero volts in the middle means the bottom resistors are equal too.' },
    ],
  },
  {
    id: 'a2-12', title: 'Batteries aren\'t perfect', icon: '🪫',
    steps: [
      { type: 'learn', title: 'Internal resistance',
        body: 'Every battery has a little [[internal resistance]]. With no load its voltage is full. Draw current and some voltage is lost inside it.\n\nThat\'s why a torch dims when the batteries get old: their internal resistance rises.' },
      { type: 'bench', prompt: 'The voltmeter shows the battery\'s terminals. **Connect the load** and watch the reading drop.',
        circuit: { nodes: N3, ground: 'bl', parts: [
          { id: 'B', kind: 'battery', a: 'tl', b: 'bl', v: 9, rInt: 1 }, wire('W0', 'tl', 'tr'), sw('S', 'tr', 'mr', { labelSide: -1 }),
          res('RL', 'mr', 'br', 8, { label: 'load 8 Ω', labelSide: -1 }), wire('W', 'br', 'bl'),
          wire('W1', 'tr', 'vtt'), vm('V', 'vtt', 'vb'), wire('W2', 'vb', 'br'),
        ] },
        goal: (s) => s.parts.V.voltage < 8.5,
        hint: 'Close the switch.', explain: '9 V with no load, 8 V with 1 A flowing. The missing volt was lost across the 1 Ω inside the battery.' },
      { type: 'numeric', q: 'A battery reads 9 V with no load and 8 V while supplying 1 A. Its internal resistance?', answer: 1, tol: 0.02, unit: 'Ω',
        hint: 'Lost volts ÷ current.', explain: '(9 − 8) ÷ 1 = 1 Ω.' },
    ],
  },
  {
    id: 'a2-13', title: 'Thévenin\'s shortcut', icon: '🎁',
    steps: [
      { type: 'learn', title: 'Any network, one battery',
        body: 'Look into any network of batteries and resistors from two terminals and it behaves like **one battery and one resistor**: its [[Thévenin equivalent]].\n\nFor a divider: **V = the open-circuit output** and **R = R1 ∥ R2**.' },
      { type: 'numeric', q: '12 V feeds a divider of 6 kΩ and 6 kΩ. What is the Thévenin voltage?', answer: 6, tol: 0.01, unit: 'V',
        hint: 'The unloaded output.', explain: 'Half of 12 = 6 V.' },
      { type: 'numeric', q: 'And its Thévenin resistance, in kΩ?', answer: 3, tol: 0.01, unit: 'kΩ',
        hint: 'R1 ∥ R2.', explain: '6 ∥ 6 = 3 kΩ. So the divider acts like a 6 V battery with 3 kΩ inside it, which is why it sagged under load.' },
      { type: 'mcq', q: 'Why is Thévenin\'s idea useful?', choices: ['It turns a complicated network into a simple one when you only care about one output', 'It makes batteries last longer', 'It removes resistance'], answer: 0,
        hint: 'Simplify.', explain: 'You can predict what any load will do without re-solving the whole network.' },
    ],
  },
  {
    id: 'a2-14', title: 'Getting the most power out', icon: '🏋️',
    steps: [
      { type: 'learn', title: 'Maximum power transfer',
        body: 'A source with internal resistance Rs gives the **most power** to a load when the load equals Rs.\n\nToo small and most power is lost inside the source. Too big and too little current flows.' },
      { type: 'bench', prompt: 'The source has 10 Ω inside it. Drag the load until it gets the **most power** (watch the watts).',
        circuit: { nodes: N, ground: 'bl', parts: [
          bat(9), res('RS', 'tl', 'tr', 10, { label: 'source 10 Ω' }),
          res('RL', 'tr', 'br', 2, { slider: { label: 'Load', min: 1, max: 40, step: 1 }, show: 'p' }), wire('W', 'br', 'bl'),
        ] },
        goal: (s) => s.parts.RL.current ** 2 * s.parts.RL.r >= 2.02,
        hint: 'Match the source\'s resistance.', explain: 'At 10 Ω the load gets about 2.03 W, the most possible. Speakers and antennas are matched like this.' },
      { type: 'numeric', q: 'A 9 V source with 10 Ω inside drives a 10 Ω load. Load power in watts?', answer: 2.025, tol: 0.02, unit: 'W',
        hint: 'I = 9 ÷ 20, P = I² × 10.', explain: '0.45² × 10 ≈ 2.03 W.' },
    ],
  },
];
