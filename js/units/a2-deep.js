// A2 deep practice: concepts, drills and bench challenges, inserted before the checkpoint.
import { N3, bat, wire, res, vm, am, near } from './kit.js';
import { drill, mcq, num, kvl, kcl, divider, parallel, powVI, powVR, powIR } from './drill.js';

export const glossary = {
  ground: 'The point in a circuit we call 0 V. Every other voltage is measured from it.',
  superposition: 'With several sources, you can work out each one\'s effect alone and add them up.',
};

const N3B = { tl: [55, 40], tm: [140, 40], tr: [215, 40], xr: [300, 40], m1: [140, 110], m2: [215, 110], x1: [300, 110], bl: [55, 180], bm: [140, 180], b2: [215, 180], xb: [300, 180] };
const dividerBench = (vin, r1, target, choices, start) => ({
  type: 'bench', prompt: `Pick **R2** so the divider makes **${target} V** from ${vin} V.`,
  circuit: { nodes: N3, ground: 'bl', parts: [
    bat(vin), wire('W0', 'tl', 'tr'), res('R1', 'tr', 'mr', r1, { labelSide: -1 }),
    res('R2', 'mr', 'br', start, { choices, label: 'R2', labelSide: -1 }),
    wire('W', 'br', 'bl'), wire('V1', 'mr', 'vt'), wire('V2', 'br', 'vb'), vm('V', 'vt', 'vb'),
  ] },
  goal: (s) => near(s.parts.V.voltage, target, 0.06),
  hint: `R2 ÷ (R1 + R2) must equal ${target} ÷ ${vin}.`,
  explain: `That ratio gives exactly ${target} V. Dividers like this feed sensors and microcontroller inputs.`,
});

export const lessons = [
  {
    id: 'a2-15', title: 'Challenge: 12 V to 4 V', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Design a divider', body: 'You need **4 V** from a **12 V** supply, for a sensor input. R1 is fixed at 2 kΩ.' },
      dividerBench(12, 2000, 4, [500, 1000, 4000], 4000),
      divider(12, 2000, 1000),
    ],
  },
  {
    id: 'a2-16', title: 'Challenge: 5 V to 3.3 V', icon: '🎯',
    steps: [
      { type: 'learn', title: 'A real-world divider', body: 'Many sensors run at **3.3 V** but your Arduino gives **5 V** signals. A divider can shift the level down. R1 is 1 kΩ.' },
      dividerBench(5, 1000, 3.3, [1000, 2000, 4700], 1000),
      mcq('Why can a divider shift a **signal** down but not power a motor?', ['Signals draw almost no current; a motor would make it sag', 'Motors need AC', 'Dividers only work at 5 V'], 0, 'Remember loading.', 'A signal input barely loads it. A motor\'s current would drag the output down.'),
    ],
  },
  {
    id: 'a2-17', title: 'Challenge: three branches', icon: '🔱',
    steps: [
      { type: 'learn', title: 'Junctions with three paths', body: 'Three branches share 6 V. Two are fixed at 60 Ω (0.1 A each). The total must be **0.5 A**.' },
      { type: 'bench', prompt: 'Pick **R3** so the ammeter shows **0.5 A** total.',
        circuit: { nodes: N3B, view: '0 0 330 220', ground: 'bl', parts: [
          bat(6), am('A', 'tl', 'tm'), wire('W1', 'tm', 'tr'), wire('W2', 'tr', 'xr'),
          res('R1', 'tm', 'bm', 60), res('R2', 'tr', 'b2', 60),
          res('R3', 'xr', 'xb', 60, { choices: [20, 30, 60], label: 'R3' }),
          wire('W3', 'xb', 'b2'), wire('W4', 'b2', 'bm'), wire('W5', 'bm', 'bl'),
        ] },
        goal: (s) => near(s.parts.A.current, 0.5, 0.01),
        hint: 'R3 must carry 0.5 − 0.2 = 0.3 A.', explain: '6 ÷ 20 = 0.3 A, plus 0.1 + 0.1 gives 0.5 A in.' },
      kcl(0.5, [0.1, 0.1]),
    ],
  },
  {
    id: 'a2-18', title: 'Fine-tuning with a pot', icon: '🎛️',
    steps: [
      { type: 'learn', title: 'Trim to an exact value', body: 'Real circuits often use a small **trimmer potentiometer** to dial in an exact voltage, because resistor values are never perfect.' },
      { type: 'bench', prompt: 'Drag the trimmer until the output reads **5.0 V** (±0.1).',
        circuit: { nodes: N3, ground: 'bl', parts: [
          bat(9), wire('W0', 'tl', 'tr'), res('R1', 'tr', 'mr', 4000, { labelSide: -1 }),
          res('P', 'mr', 'br', 1000, { slider: { label: 'Trimmer', min: 1000, max: 8000, step: 100 }, labelSide: -1 }),
          wire('W', 'br', 'bl'), wire('V1', 'mr', 'vt'), wire('V2', 'br', 'vb'), vm('V', 'vt', 'vb'),
        ] },
        goal: (s) => near(s.parts.V.voltage, 5, 0.1),
        hint: 'You need P = 5 kΩ for a 5 : 4 split.', explain: '9 × 5k ÷ 9k = 5 V. That\'s why trimmers are on so many circuit boards.' },
      divider(9, 4000, 5000),
    ],
  },
  {
    id: 'a2-19', title: 'Ground: the 0 V reference', icon: '⏚',
    steps: [
      { type: 'learn', title: 'Measured from where?',
        body: 'Voltage is always **between two points**. To keep it simple we pick one point, usually the battery\'s −, and call it [[ground]] (0 V). Every other voltage is measured from there.\n\nSo "this point is at 5 V" means "5 V above ground".' },
      mcq('A point is "at 3 V" and ground is 0 V. The voltage between them is…', ['3 V', '0 V', 'Unknown'], 0, 'Measured from ground.', 'Exactly 3 V, because that\'s what "at 3 V" means.'),
      mcq('Point X is at 9 V and point Y is at 4 V. A voltmeter from Y to X reads…', ['5 V', '13 V', '9 V'], 0, 'The difference.', '9 − 4 = 5 V.'),
      mcq('Does the ground symbol have to be connected to the actual Earth?', ['No, it\'s just the circuit\'s 0 V reference', 'Yes, always'], 0, 'Batteries float.', 'In battery circuits, "ground" is just the agreed 0 V point.'),
    ],
  },
  {
    id: 'a2-20', title: 'Superposition', icon: '➕',
    steps: [
      { type: 'learn', title: 'One source at a time',
        body: 'With **two** batteries in a resistor network, you can use [[superposition]]: work out what each battery does alone (with the other replaced by a wire), then **add** the results.\n\nIt works for any circuit made of resistors and sources.' },
      num('Battery A alone makes 2 V at a point. Battery B alone makes 3 V at the same point. With both?', 5, 'V', 'Add the effects.', '2 + 3 = 5 V.'),
      num('Source 1 alone pushes 0.2 A through a resistor; source 2 alone pushes −0.05 A (the other way). Together?', 0.15, 'A', 'Add them, signs included.', '0.2 − 0.05 = 0.15 A.'),
      mcq('When you "remove" a battery for superposition, you replace it with…', ['A plain wire', 'An open gap', 'A bigger battery'], 0, 'Its voltage is set to zero.', 'A wire: zero volts, but still a connection.'),
    ],
  },
  drill('a2-21', 'Practice: loop rule', '🧮', '**Kirchhoff\'s voltage law**: every drop around a loop adds up to the supply.', [
    kvl(12, [5, 4]), kvl(9, [2.5, 3.5]), kvl(5, [1.2, 2]), kvl(24, [10, 6, 3]),
  ]),
  drill('a2-22', 'Practice: junction rule', '🧮', '**Kirchhoff\'s current law**: current in = current out.', [
    kcl(1, [0.4]), kcl(2.5, [1, 0.5]), kcl(0.3, [0.12, 0.08]), kcl(10, [3, 3, 3]),
  ]),
  drill('a2-23', 'Practice: dividers', '🧮', '**Vout = Vin × R2 ÷ (R1 + R2)**', [
    divider(10, 1000, 1000), divider(12, 3000, 1000), divider(5, 10000, 15000), divider(9, 2200, 4700), divider(3.3, 1000, 2000),
  ]),
  drill('a2-24', 'Practice: power', '🧮', '**P = V × I = V² ÷ R = I² × R**. Pick whichever fits what you know.', [
    powVI(230, 2), powVR(12, 24), powIR(0.5, 100), powVR(5, 1000), parallel([1000, 1000, 1000]),
  ]),
];
