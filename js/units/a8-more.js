// A8 extra depth: inverter, Darlington, H-bridge, relays.
import { bat, wire, res, lamp, sw } from './kit.js';

export const glossary = {
  inverter: 'A NOT gate made from a transistor: input high gives output low, and input low gives output high.',
  'Darlington pair': 'Two transistors chained so the first feeds the second\'s base. Their gains multiply: 100 × 100 = 10 000.',
  'H-bridge': 'Four switches around a motor, arranged like the letter H. Closing opposite pairs reverses the current, and so the motor.',
  relay: 'A switch flipped by an electromagnet. A small current in its coil switches a completely separate, bigger circuit.',
};

const NI = { tl: [40, 40], tm: [140, 40], tr: [250, 40], c: [250, 100], o: [300, 100], ob: [300, 200], sb: [140, 140], b: [200, 140], e: [250, 200], bl: [40, 200] };
const ND = { tl: [40, 40], tm: [110, 40], tr: [250, 40], c: [250, 90], c1: [178, 90], b1: [110, 120], b2: [190, 150], e: [250, 200], bl: [40, 200] };
const NH = { tl: [40, 40], t1: [130, 40], tr: [250, 40], ml: [130, 110], mr: [250, 110], b1: [130, 180], br: [250, 180], bl: [40, 180] };

export const lessons = [
  {
    id: 'a8-8', title: 'A transistor NOT gate', icon: '🔄',
    steps: [
      { type: 'learn', title: 'From switch to logic',
        body: 'Put the output on the transistor\'s **collector**, with a resistor up to the supply. Input low: the transistor is off and the output is pulled **high**. Input high: the transistor pulls the output **low**.\n\nThat\'s an [[inverter]], a NOT gate made from one transistor.' },
      { type: 'bench', prompt: 'The output LED is on (output high). Give the input a **1** (close the switch) and watch the output go to **0**.',
        circuit: { nodes: NI, ground: 'bl', parts: [
          bat(9), wire('W1', 'tl', 'tm'), wire('W2', 'tm', 'tr'), res('RC', 'tr', 'c', 330), wire('W3', 'c', 'o'),
          { id: 'D', kind: 'led', a: 'o', b: 'ob', label: '' }, wire('W4', 'ob', 'e'),
          sw('S', 'tm', 'sb', { labelSide: -1, label: 'input' }), res('RB', 'sb', 'b', 10000),
          { id: 'Q', kind: 'npn', pins: { c: 'c', b: 'b', e: 'e' }, at: [242, 140], label: '' }, wire('W5', 'e', 'bl'),
        ] },
        goal: (s) => !s.parts.D.on,
        hint: 'Close the input switch.', explain: 'Input 1, output 0. The transistor steals the current away from the LED. Billions of these make up a processor.' },
      { type: 'mcq', q: 'In a transistor inverter, the input is 0. The output is…', choices: ['1 (high)', '0 (low)'], answer: 0,
        hint: 'It flips.', explain: 'Transistor off, so the resistor pulls the output high.' },
    ],
  },
  {
    id: 'a8-9', title: 'The Darlington pair', icon: '🔗',
    steps: [
      { type: 'learn', title: 'Gain × gain',
        body: 'Feed one transistor\'s emitter into another\'s base and their gains multiply: 100 × 100 = **10 000**. That\'s a [[Darlington pair]].\n\nA really tiny current can now switch a big load. The cost is about 1.4 V instead of 0.7 V.' },
      { type: 'bench', prompt: 'Only a tiny base current flows through the 100 kΩ resistor. **Close the switch** and see the Darlington pair light the lamp anyway.',
        circuit: { nodes: ND, ground: 'bl', parts: [
          bat(9), sw('S', 'tl', 'tm'), wire('W1', 'tm', 'tr'), lamp('L', 'tr', 'c'), wire('W2', 'c1', 'c'),
          res('RB', 'tm', 'b1', 100000, { labelSide: -1 }),
          { id: 'Q1', kind: 'npn', pins: { c: 'c1', b: 'b1', e: 'b2' }, at: [170, 120], label: '' },
          { id: 'Q2', kind: 'npn', pins: { c: 'c', b: 'b2', e: 'e' }, at: [242, 150] }, wire('W3', 'e', 'bl'),
        ] },
        goal: (s) => s.parts.L.on,
        hint: 'Top-left switch.', explain: 'About 76 µA in, multiplied by roughly 10 000. One transistor alone would barely glow the lamp.' },
      { type: 'numeric', q: 'Two transistors with β = 50 each in a Darlington. Total gain?', answer: 2500, tol: 0.001, unit: '×',
        hint: 'Multiply.', explain: '50 × 50 = 2500.' },
    ],
  },
  {
    id: 'a8-10', title: 'The H-bridge', icon: '↔️',
    steps: [
      { type: 'learn', title: 'Forwards and backwards',
        body: 'Robots need motors that reverse. An [[H-bridge]] has four switches around the motor:\n\n• top-left + bottom-right on: **forwards**\n• top-right + bottom-left on: **backwards**\n\nNever close both switches on one side: that shorts the battery! Motor driver chips are H-bridges made of transistors.' },
      { type: 'bench', prompt: 'The motor spins forwards. Make it spin **backwards**, without shorting the battery.',
        circuit: { nodes: NH, ground: 'bl', parts: [
          bat(9, { rInt: 0.05 }), wire('W1', 'tl', 't1'), wire('W2', 't1', 'tr'),
          sw('S1', 't1', 'ml', { closed: true, labelSide: -1 }), sw('S2', 'ml', 'b1', { labelSide: -1 }),
          sw('S3', 'tr', 'mr', { label: 'S3' }), sw('S4', 'mr', 'br', { closed: true, label: 'S4' }),
          { id: 'M', kind: 'motor', a: 'ml', b: 'mr', r: 12, ratedW: 6, labelSide: -1 }, wire('W3', 'br', 'b1'), wire('W4', 'b1', 'bl'),
        ] },
        goal: (s) => s.parts.M.current < -0.3 && !s.short,
        hint: 'Open S1 and S4, close S3 and S2.', explain: 'Current now enters the motor from the right, so it spins the other way. Robots, drones and electric windows all do this.' },
      { type: 'mcq', q: 'What happens if S1 and S2 (the same side) are both closed?', choices: ['A short circuit straight across the battery', 'The motor spins faster', 'Nothing'], answer: 0,
        hint: 'Trace from + to − without the motor.', explain: 'It shorts the battery, which is called "shoot-through". Good drivers prevent it.' },
    ],
  },
  {
    id: 'a8-11', title: 'Relays', icon: '🧲',
    steps: [
      { type: 'learn', title: 'A switch flipped by a magnet',
        body: 'A [[relay]] has a coil and a separate switch. Current in the coil makes a magnet that pulls the switch closed.\n\nThe two circuits aren\'t connected electrically, so a 5 V microcontroller can safely control something big. It still needs a transistor to drive the coil, plus a flyback diode.' },
      { type: 'mcq', q: 'Why use a relay instead of a transistor?', choices: ['The controlled circuit is completely separate, and it can switch AC or high voltages', 'Relays are faster', 'Relays never wear out'], answer: 0,
        hint: 'Isolation.', explain: 'Total isolation, and it can switch almost anything. But it\'s slower and wears out over time.' },
      { type: 'mcq', q: 'A relay coil needs 70 mA. Can an Arduino pin (about 20 mA) drive it directly?', choices: ['No, use a transistor', 'Yes'], answer: 0,
        hint: 'Compare the currents.', explain: 'No. A transistor drives the coil, and a flyback diode protects it.' },
    ],
  },
];
