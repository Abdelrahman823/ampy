// A4 extra depth: LED colours, diode-OR backup, bridge rectifier, solar, protection.
import { N, bat, wire, res, sw } from './kit.js';

export const glossary = {
  'bridge rectifier': 'Four diodes arranged so both halves of AC come out the same way: full-wave DC.',
  'solar cell': 'A large, flat diode that turns light into electricity. Each cell gives about 0.5 V.',
  'diode OR': 'Two supplies each joined through a diode. Whichever is higher powers the load, and neither can feed the other.',
  ESD: 'Electrostatic discharge: the tiny spark from your body, often thousands of volts. It can kill chips.',
};

const NO = { tl: [40, 40], s1: [100, 40], j: [170, 40], bl: [40, 180], jb: [170, 180], r2: [300, 40], rb: [300, 180] };
const NBR = { n1: [150, 40], m1: [150, 110], n2: [150, 180], t2: [220, 40], m2: [220, 110], b2: [220, 180], lr: [300, 40], lb: [300, 180] };

export const lessons = [
  {
    id: 'a4-8', title: 'LED colours', icon: '🌈',
    steps: [
      { type: 'learn', title: 'Colour sets the voltage',
        body: 'Different LED colours need different forward voltages:\n\n• red ≈ 2.0 V · yellow ≈ 2.1 V · green ≈ 2.2 V\n• **blue and white ≈ 3.0 V**\n\nSo a blue LED needs a different resistor from a red one on the same supply.' },
      { type: 'bench', prompt: 'This is a **blue** LED (3 V) on 5 V. Pick the resistor that gives a safe **15–25 mA**.',
        circuit: { nodes: N, ground: 'bl', parts: [
          bat(5), res('R', 'tl', 'tr', 220, { choices: [47, 100, 220], label: 'Resistor' }),
          { id: 'D', kind: 'led', a: 'tr', b: 'br', vf: 3 }, wire('W', 'br', 'bl'),
        ] },
        goal: (s, parts) => s.parts.D.ma >= 15 && s.parts.D.ma <= 25 && !parts.find((p) => p.id === 'D').burnt,
        hint: '(5 − 3) ÷ 0.02', explain: '2 V ÷ 100 Ω = 20 mA. With a red LED the same resistor would give 30 mA, which is too much.' },
      { type: 'numeric', q: 'A white LED (3 V) on 9 V at 20 mA. Resistor?', answer: 300, tol: 0.01, unit: 'Ω',
        hint: '(9 − 3) ÷ 0.02', explain: '6 ÷ 0.02 = 300 Ω.' },
    ],
  },
  {
    id: 'a4-9', title: 'Backup power', icon: '🔁',
    steps: [
      { type: 'learn', title: 'Diode OR',
        body: 'Join two supplies through diodes and the higher one powers the load. If the main supply fails, the backup takes over instantly. That\'s a [[diode OR]].\n\nThe diodes also stop one battery from charging the other.' },
      { type: 'bench', prompt: 'The main supply is switched off. The backup diode is in backwards. **Flip it** so the backup keeps the lamp lit.',
        circuit: { nodes: NO, view: '0 0 330 220', ground: 'bl', parts: [
          bat(9, { label: 'main' }), sw('S', 'tl', 's1', { label: '' }), { id: 'D1', kind: 'diode', a: 's1', b: 'j' },
          { id: 'L', kind: 'lamp', a: 'j', b: 'jb', r: 18 }, wire('W1', 'jb', 'bl'),
          { id: 'B2', kind: 'battery', a: 'r2', b: 'rb', v: 6, rInt: 0.001 },
          { id: 'D2', kind: 'diode', a: 'j', b: 'r2', tap: 'flip', label: '' }, wire('W2', 'rb', 'jb'),
        ] },
        goal: (s, parts) => !parts.find((p) => p.id === 'S').closed && s.parts.L.on,
        hint: 'Current must flow from the backup\'s + towards the lamp.', explain: 'The backup now feeds the lamp through its diode. Turn the main on and it takes over, because 9 V beats 6 V.' },
      { type: 'mcq', q: 'In a diode-OR, why doesn\'t the 9 V main battery push current into the 6 V backup?', choices: ['The backup\'s diode blocks current going that way', 'Batteries can\'t be charged', 'It does'], answer: 0,
        hint: 'One-way valves.', explain: 'The backup\'s diode only lets current out of the backup, never into it.' },
    ],
  },
  {
    id: 'a4-10', title: 'The bridge rectifier', icon: '💠',
    steps: [
      { type: 'learn', title: 'Use both halves',
        body: 'A [[bridge rectifier]] steers both halves of the AC wave the same way through the load, so nothing is wasted.\n\nIt uses four diodes. If one fails, you\'re back to half-wave.' },
      { type: 'bench', prompt: 'One bridge diode has failed, so only half the wave gets through. **Tap the dead diode** to replace it, then watch the output.',
        circuit: { nodes: NBR, ground: 'n2', transient: { dt: 0.004, speed: 1 }, testSeconds: 8,
          scope: { traces: [{ part: 'AC', label: 'AC in' }, { node: 'lr', label: 'output' }], vmin: -11, vmax: 11, window: 1.5 }, parts: [
            { id: 'AC', kind: 'battery', a: 'm1', b: 'm2', v: 0, rInt: 0.01, wave: { type: 'sine', amp: 10, freq: 2 }, label: '' },
            { id: 'D1', kind: 'diode', a: 'm1', b: 'n1' }, { id: 'D3', kind: 'diode', a: 'n2', b: 'm1' },
            { id: 'D2', kind: 'diode', a: 'm2', b: 't2' }, { id: 'D4', kind: 'diode', a: 'b2', b: 'm2', burnt: true, tap: 'replace' },
            wire('W1', 'n1', 't2'), wire('W2', 't2', 'lr'), res('RL', 'lr', 'lb', 1000, { label: 'load' }), wire('W3', 'lb', 'b2'), wire('W4', 'b2', 'n2'),
          ] },
        goal: (s, parts, info) => {
          if (info.history.length < 300) return false;
          const vals = info.history.map((h) => h[2]);
          const pk = Math.max(...vals);
          return pk > 8 && vals.filter((v) => v > pk / 2).length / vals.length > 0.55;
        },
        hint: 'The dead diode is bottom-right.', explain: 'Now every half-wave comes out positive: full-wave DC, with twice as many bumps and much less to smooth.' },
      { type: 'mcq', q: 'How many diodes are in a bridge rectifier?', choices: ['1', '2', '4'], answer: 2,
        hint: 'Count the bench.', explain: 'Four: two conduct on each half of the wave.' },
    ],
  },
  {
    id: 'a4-11', title: 'Solar cells', icon: '☀️',
    steps: [
      { type: 'learn', title: 'Diodes that make power',
        body: 'A [[solar cell]] is a big PN junction. Light knocks electrons loose at the junction and they flow out as current.\n\nEach cell gives about **0.5 V**, so panels wire many cells in series. Saudi Arabia\'s sunshine makes it a great place for them.' },
      { type: 'numeric', q: 'How many 0.5 V solar cells in series make 6 V?', answer: 12, tol: 0.001, unit: 'cells',
        hint: '6 ÷ 0.5', explain: '6 ÷ 0.5 = 12 cells.' },
      { type: 'mcq', q: 'What happens to a solar panel\'s output when a cloud covers it?', choices: ['It drops', 'It rises', 'It stays the same'], answer: 0,
        hint: 'Less light, fewer electrons knocked loose.', explain: 'Less light means less current, so less power.' },
    ],
  },
  {
    id: 'a4-12', title: 'Protecting inputs', icon: '🧤',
    steps: [
      { type: 'learn', title: 'Clamp diodes',
        body: 'Chip inputs are delicate. A spark of [[ESD]] from your finger can be thousands of volts.\n\nInside most chips, tiny diodes from each pin to + and − **clamp** any spike, steering it safely into the supply instead of the delicate transistors.' },
      { type: 'mcq', q: 'Why do you touch something metal and grounded before handling chips?', choices: ['To discharge static so it doesn\'t zap the chip', 'To clean your hands', 'For luck'], answer: 0,
        hint: 'ESD.', explain: 'It releases the static on your body harmlessly.' },
      { type: 'mcq', q: 'A clamp diode from an input pin to the + supply conducts when…', choices: ['The input rises above the supply voltage', 'The input is at 0 V', 'Always'], answer: 0,
        hint: 'It only conducts forward.', explain: 'Only when the input goes higher than the supply. Then it steers the excess into the supply.' },
    ],
  },
];
