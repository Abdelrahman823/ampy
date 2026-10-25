// A4 deep practice: concepts, drills and bench challenges, inserted before the checkpoint.
import { N, N3, bat, wire, res, vm } from './kit.js';
import { drill, mcq, num, ledR, ledI, diodeI, zenerI } from './drill.js';

export const glossary = {
  'Schottky diode': 'A diode with a low forward voltage (about 0.3 V) and very fast switching. Used where every volt counts.',
  'IR LED': 'An infrared LED: its light is invisible to us but cameras and TV receivers can see it.',
  'seven-segment display': 'Seven LED bars arranged in an 8 shape that can show any digit.',
};

export const lessons = [
  {
    id: 'a4-13', title: 'Challenge: green LED', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Bench challenge', body: 'A **green** LED (2.2 V) on a **6 V** supply. Aim for about 20 mA.' },
      { type: 'bench', prompt: 'Pick the resistor for a safe **15–25 mA**.',
        circuit: { nodes: N, ground: 'bl', parts: [
          bat(6), res('R', 'tl', 'tr', 1000, { choices: [68, 180, 1000], label: 'Resistor' }), { id: 'D', kind: 'led', a: 'tr', b: 'br', vf: 2.2 }, wire('W', 'br', 'bl'),
        ] },
        goal: (s, parts) => s.parts.D.ma >= 15 && s.parts.D.ma <= 25 && !parts.find((p) => p.id === 'D').burnt,
        hint: '(6 − 2.2) ÷ 0.02 = 190 Ω.', explain: '180 Ω gives about 21 mA.' },
      ledR(6, 2.2, 20),
    ],
  },
  {
    id: 'a4-14', title: 'Challenge: 3.3 V zener', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Choosing the zener resistor', body: 'A **3.3 V** zener on **9 V**. The resistor sets the zener current: aim for **10–40 mA**. Too little and it can\'t regulate well, too much and it gets hot.' },
      { type: 'bench', prompt: 'Pick the resistor that gives the zener **10–40 mA** while the output stays at 3.3 V.',
        circuit: { nodes: N3, ground: 'bl', parts: [
          bat(9), res('R', 'tl', 'tr', 1000, { choices: [47, 220, 1000], label: 'Resistor', show: 'i' }), wire('W0', 'tr', 'mr'),
          { id: 'Z', kind: 'zener', a: 'br', b: 'mr', vz: 3.3, labelSide: -1 }, wire('W', 'br', 'bl'),
          wire('V1', 'mr', 'vt'), wire('V2', 'br', 'vb'), vm('V', 'vt', 'vb'),
        ] },
        goal: (s) => { const ma = s.parts.R.current * 1000; return ma >= 10 && ma <= 40 && Math.abs(s.parts.V.voltage - 3.3) < 0.2; },
        hint: '(9 − 3.3) ÷ R between 10 and 40 mA.', explain: '5.7 ÷ 220 ≈ 26 mA: comfortably in range. 47 Ω would push 121 mA and roast it.' },
      zenerI(9, 3.3, 220),
    ],
  },
  {
    id: 'a4-15', title: 'Schottky diodes', icon: '⚡',
    steps: [
      { type: 'learn', title: 'The low-drop diode',
        body: 'A [[Schottky diode]] uses a metal-to-silicon junction. It drops only about **0.3 V** instead of 0.7 V and switches very fast.\n\nGreat for battery protection, where every tenth of a volt matters, and in switching power supplies.' },
      num('A 3 V battery feeds a circuit through a Schottky diode (0.3 V). Voltage after the diode?', 2.7, 'V', '3 − 0.3', '2.7 V. A silicon diode would leave only 2.3 V.'),
      num('Same circuit with a silicon diode (0.7 V) instead?', 2.3, 'V', '3 − 0.7', '2.3 V, which may be too low for a 2.5 V chip.'),
      mcq('Why pick a Schottky for reverse-battery protection on a 3 V gadget?', ['It wastes less of the small voltage', 'It glows', 'It blocks more current'], 0, 'Smaller drop.', 'Only 0.3 V is lost instead of 0.7 V.'),
    ],
  },
  {
    id: 'a4-16', title: 'Invisible light: IR', icon: '📺',
    steps: [
      { type: 'learn', title: 'Remote controls',
        body: 'Your TV remote has an [[IR LED]]. It flashes invisible infrared light in coded patterns, and a photodiode in the TV decodes them.\n\nTip: point a remote at a phone camera and press a button, and you\'ll see it flash!' },
      mcq('Why can\'t you see a remote control\'s LED working?', ['It emits infrared, beyond what our eyes detect', 'It\'s too fast', 'It\'s broken'], 0, 'IR.', 'Infrared is invisible to us, but cameras can see it.'),
      mcq('What part in the TV receives the remote\'s signal?', ['A photodiode (light sensor)', 'A speaker', 'A fuse'], 0, 'It senses light.', 'A photodiode turns the light pulses back into electrical pulses.'),
    ],
  },
  {
    id: 'a4-17', title: 'Seven-segment displays', icon: '8️⃣',
    steps: [
      { type: 'learn', title: 'Seven LEDs make a digit',
        body: 'A [[seven-segment display]] is seven LED bars (a–g). Light the right ones and you get any digit 0–9.\n\nEach segment still needs its own current-limiting resistor.' },
      num('How many segments light up to show **8**?', 7, 'segments', 'All of them.', 'All 7.', 0.0001),
      num('How many segments light up to show **1**?', 2, 'segments', 'Just the right side.', 'Two: the right-hand top and bottom bars.', 0.0001),
      num('Each segment draws 10 mA. Showing **8** draws how many mA in total?', 70, 'mA', '7 × 10', '70 mA, too much for one microcontroller pin, so drivers or transistors are used.'),
    ],
  },
  {
    id: 'a4-18', title: 'Review: which diode?', icon: '🧠',
    steps: [
      { type: 'learn', title: 'Pick the right diode', body: 'Regular silicon, Schottky, zener, LED, photodiode: each has its own job.' },
      mcq('Hold a voltage at exactly 5.1 V:', ['Zener', 'Schottky', 'LED'], 0, 'Breaks down at a set voltage.', 'A 5.1 V zener.'),
      mcq('Detect light from a remote:', ['Photodiode', 'Zener', 'Silicon diode'], 0, 'It senses light.', 'A photodiode.'),
      mcq('Rectify mains AC in a charger:', ['Silicon diodes (a bridge)', 'An LED', 'A photodiode'], 0, 'Handles high reverse voltages.', 'Rugged silicon rectifier diodes in a bridge.'),
      mcq('Lose as little voltage as possible in a 3 V gadget:', ['Schottky', 'Zener', 'Silicon'], 0, 'Lowest drop.', 'A Schottky: about 0.3 V.'),
    ],
  },
  drill('a4-19', 'Practice: LED colours', '🧮', 'R = (V_supply − V_LED) ÷ I. Red 2 V · green 2.2 V · blue/white 3 V.', [
    ledR(5, 2.2, 15), ledR(12, 2, 20), ledR(3.3, 2, 10), ledR(9, 3, 25), ledI(12, 3, 470),
  ]),
  drill('a4-20', 'Practice: diode circuits', '🧮', 'A silicon diode always takes about **0.7 V** first.', [
    diodeI(5, 430), diodeI(12, 1130), diodeI(3.3, 260), diodeI(9, 830),
  ]),
  drill('a4-21', 'Practice: zener regulators', '🧮', 'The resistor drops **V_supply − V_zener**.', [
    zenerI(12, 5.1, 330), zenerI(9, 5.1, 220), zenerI(15, 12, 100), zenerI(5, 3.3, 68),
  ]),
  {
    id: 'a4-22', title: 'Review: rectifiers', icon: '🧠',
    steps: [
      { type: 'learn', title: 'AC to DC, step by step', body: '**Transformer** (lower the voltage) → **bridge** (flip both halves positive) → **capacitor** (smooth) → **regulator** (hold it steady).' },
      mcq('In a power supply, what comes straight after the bridge rectifier?', ['A smoothing capacitor', 'The transformer', 'The wall socket'], 0, 'Fill the gaps.', 'The capacitor smooths the bumpy DC.'),
      mcq('A full-wave rectifier\'s output bumps at what rate for 60 Hz mains?', ['60 per second', '120 per second', '30 per second'], 1, 'Both halves become bumps.', '120 per second: every half-cycle becomes a bump.'),
      mcq('What does the regulator at the end do?', ['Removes the remaining ripple and holds a fixed voltage', 'Turns DC back into AC', 'Stores energy for days'], 0, 'Steady output.', 'It gives a clean, fixed DC voltage.'),
    ],
  },
];
