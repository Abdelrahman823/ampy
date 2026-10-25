// A3 deep practice: concepts, drills and bench challenges, inserted before the checkpoint.
import { N, bat, wire, res, sw } from './kit.js';
import { drill, mcq, num, tau, energyC, capParallel, capSeries, charged } from './drill.js';

export const glossary = {
  electrolytic: 'A capacitor type with large values (µF to mF) in a small can. It has a + and − leg and must not be reversed.',
  ceramic: 'A small, cheap, non-polarised capacitor, usually pF to µF. Great for decoupling.',
  supercapacitor: 'A capacitor with enormous capacitance (whole farads) that can store enough energy to briefly power small devices.',
  'coupling capacitor': 'A capacitor in series with a signal. It passes the changing part and blocks any steady DC offset.',
};

const rcBench = (prompt, r, c, choices, prop, goalFn, hint, explain, extra = {}) => ({
  type: 'bench', prompt,
  circuit: { nodes: N, ground: 'bl', transient: { dt: 0.005, speed: 1 }, testSeconds: extra.testSeconds ?? 8,
    scope: { traces: [{ part: 'C', label: 'capacitor' }], vmin: 0, vmax: 10, window: extra.window ?? 5 }, parts: [
      bat(9), sw('S', 'tl', 'tm'), res('R', 'tm', 'tr', r, prop === 'r' ? { choices, label: 'Resistor' } : {}),
      { id: 'C', kind: 'capacitor', a: 'tr', b: 'br', c, vmax: 9, ...(prop === 'c' ? { choices, prop: 'c', label: 'Capacitor' } : {}) },
      wire('W', 'br', 'bl'),
    ] },
  goal: goalFn, hint, explain,
});

export const lessons = [
  {
    id: 'a3-12', title: 'Challenge: 0.47 s timer', icon: '⏱️',
    steps: [
      { type: 'learn', title: 'Design a delay', body: 'You need τ = **0.47 s** with a **470 Ω** resistor. Pick the capacitor, then charge it to 63%.' },
      rcBench('Pick C for τ = 0.47 s, then close the switch and charge to 63%.', 470, 2.2e-3, [2.2e-4, 1e-3, 2.2e-3], 'c',
        (s, parts) => parts.find((p) => p.id === 'C').c === 1e-3 && s.parts.C.voltage >= 5.6,
        'C = τ ÷ R = 0.47 ÷ 470.', '470 Ω × 1 mF = 0.47 s.'),
      tau(470, 0.001, '1 mF'),
    ],
  },
  {
    id: 'a3-13', title: 'Two time constants', icon: '⏳',
    steps: [
      { type: 'learn', title: '63%, 86%, 95%…', body: 'Each extra τ closes most of the remaining gap: **1τ → 63%**, **2τ → 86%**, **3τ → 95%**, **5τ → over 99%**.' },
      rcBench('Close the switch and wait for **86%** (about 7.7 V), two time constants.', 1000, 1e-3, null, null,
        (s) => s.parts.C.voltage >= 7.7, 'Wait about 2 seconds.', 'Two τ, 86%. The last bit always takes the longest.'),
      charged(9, 3),
    ],
  },
  {
    id: 'a3-14', title: 'Capacitor types', icon: '🧃',
    steps: [
      { type: 'learn', title: 'Pick the right one',
        body: '• [[ceramic]]: tiny, cheap, small values, any way round\n• [[electrolytic]]: big values, has a − stripe, **polarised**\n• film: stable and precise, for timing and audio\n• [[supercapacitor]]: whole farads, briefly powers clocks and memory' },
      mcq('You need 1000 µF to smooth a power supply. Most likely type?', ['Electrolytic', 'Ceramic', 'Film'], 0, 'Big value, small can.', 'Electrolytic: the usual choice for big values.'),
      mcq('Which capacitor can you insert either way round?', ['Ceramic', 'Electrolytic'], 0, 'Polarised or not?', 'Ceramic capacitors aren\'t polarised.'),
      mcq('What could keep a clock\'s time running for a few minutes during a power cut?', ['A supercapacitor', 'A 100 nF ceramic', 'A fuse'], 0, 'Needs lots of stored charge.', 'A supercapacitor stores enough energy for that.'),
    ],
  },
  {
    id: 'a3-15', title: 'Reading capacitor codes', icon: '🔢',
    steps: [
      { type: 'learn', title: 'Three-digit codes',
        body: 'Small capacitors print a 3-digit code in **picofarads**: two digits, then the number of zeros.\n\n**104** = 10 + 0000 = 100 000 pF = **100 nF** = 0.1 µF\n**103** = 10 nF · **472** = 4.7 nF' },
      num('A capacitor is marked **102**. How many pF?', 1000, 'pF', '10 followed by 2 zeros.', '1000 pF = 1 nF.', 0.0001),
      num('A capacitor is marked **104**. How many nF?', 100, 'nF', '100 000 pF ÷ 1000.', '100 nF, the classic decoupling capacitor.', 0.0001),
      num('A capacitor is marked **473**. How many nF?', 47, 'nF', '47 000 pF.', '47 nF.', 0.0001),
    ],
  },
  {
    id: 'a3-16', title: 'Coupling capacitors', icon: '🔗',
    steps: [
      { type: 'learn', title: 'Pass the wiggle, block the offset',
        body: 'Audio signals often ride on a steady DC voltage. A [[coupling capacitor]] in series passes the changing sound but blocks the steady part.\n\nYou\'ll see one at the input of almost every amplifier.' },
      mcq('A signal wiggles ±1 V around a steady 4.5 V. After a coupling capacitor, it wiggles around…', ['0 V', '4.5 V', '9 V'], 0, 'The steady part is blocked.', 'Around 0 V: the DC part is gone and only the wiggle remains.'),
      mcq('Why can\'t a coupling capacitor pass a steady DC voltage?', ['Once charged, no more current flows through it', 'It\'s too small', 'DC is too fast'], 0, 'Remember the Capacitors-block-DC lesson.', 'A charged capacitor blocks steady current.'),
    ],
  },
  drill('a3-17', 'Practice: time constants', '🧮', '**τ = R × C** in ohms and farads. 1 µF = 0.000001 F.', [
    tau(1000, 0.001, '1 mF'), tau(10000, 0.0001, '100 µF'), tau(4700, 0.00001, '10 µF'), tau(220, 0.0047, '4.7 mF'), tau(1000000, 0.000001, '1 µF'),
  ]),
  drill('a3-18', 'Practice: how full?', '🧮', 'After 1τ: 63% · 2τ: 86% · 3τ: 95% · 4τ: 98% · 5τ: 99%.', [
    charged(10, 1), charged(5, 2), charged(12, 3), charged(9, 5),
  ]),
  drill('a3-19', 'Practice: energy', '🧮', '**E = ½ × C × V²**, in joules.', [
    energyC(0.001, 10, '1 mF'), energyC(0.0001, 20, '100 µF'), energyC(1, 2.7, 'A 1 F supercapacitor'), energyC(0.01, 5, '10 mF'),
  ]),
  drill('a3-20', 'Practice: combining capacitors', '🧮', 'Parallel: **add**. Series: **product over sum**. The opposite of resistors!', [
    capParallel([10, 22]), capParallel([100, 100, 100]), capSeries(10, 10), capSeries(100, 47),
  ]),
];
