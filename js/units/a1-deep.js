// A1 deep practice: concepts, drills and bench challenges, inserted before the checkpoint.
import { N, N2, bat, wire, res, lamp, sw } from './kit.js';
import { drill, mcq, ohmI, ohmImA, ohmR, ohmV, series, parallel, ledR, ledI } from './drill.js';

export const glossary = {
  'water analogy': 'Thinking of a circuit like water in pipes: voltage is the pressure, current is the flow, resistance is a narrow pipe.',
};

const ledChallenge = (id, title, vs, vf, choices, start, color) => ({
  id, title, icon: '🎯',
  steps: [
    { type: 'learn', title: 'Bench challenge', body: `A ${color} LED needs about **${vf} V** and is happiest around **20 mA**. Your supply is **${vs} V**. Use R = (V_supply − V_LED) ÷ I.` },
    { type: 'bench', prompt: `Pick the resistor that runs this ${color} LED at a safe **15–25 mA** from ${vs} V.`,
      circuit: { nodes: N, ground: 'bl', parts: [
        bat(vs), res('R', 'tl', 'tr', start, { choices, label: 'Resistor' }), { id: 'D', kind: 'led', a: 'tr', b: 'br', vf }, wire('W', 'br', 'bl'),
      ] },
      goal: (s, parts) => s.parts.D.ma >= 15 && s.parts.D.ma <= 25 && !parts.find((p) => p.id === 'D').burnt,
      hint: `(${vs} − ${vf}) ÷ 0.02 ≈ ${Math.round((vs - vf) / 0.02)} Ω. Pick the closest.`,
      explain: 'Right in the safe zone. Too little resistance burns it, too much makes it dim.' },
    ledR(vs, vf, 20),
  ],
});

export const lessons = [
  {
    id: 'a1-13', title: 'Pressure, flow and pipes', icon: '💧',
    steps: [
      { type: 'learn', title: 'The water analogy',
        body: 'The [[water analogy]] helps you picture a circuit:\n\n• **voltage** = water pressure from a pump\n• **current** = how much water flows\n• **resistance** = a narrow pipe\n\nMore pressure, more flow. A narrower pipe, less flow. That\'s Ohm\'s law in water.' },
      mcq('In the water analogy, what is a battery?', ['A pump making pressure', 'A narrow pipe', 'A tap'], 0, 'It pushes.', 'A pump: it creates the pressure (voltage) that drives the flow.'),
      mcq('In the water analogy, what is a switch?', ['A valve that opens or closes the pipe', 'The water itself', 'A pump'], 0, 'It stops or starts the flow.', 'A valve. Closed means no flow at all.'),
      mcq('Making a pipe narrower is like…', ['Increasing resistance', 'Increasing voltage', 'Adding a battery'], 0, 'Harder to flow.', 'More resistance, so less current.'),
    ],
  },
  {
    id: 'a1-14', title: 'Independent switches', icon: '🎚️',
    steps: [
      { type: 'learn', title: 'One switch per lamp',
        body: 'Put each lamp on its own **parallel** branch with its own switch and you can control each one separately. That\'s how rooms in a house work.' },
      { type: 'bench', prompt: 'Turn on **lamp 1 only**. Lamp 2 should stay off.',
        circuit: { nodes: { ...N2, m1: [130, 110], x1: [300, 110] }, view: '0 0 330 220', ground: 'bl', parts: [
          bat(9), wire('W0', 'tl', 'tm'), wire('W1', 'tm', 'tr'), wire('W2', 'tr', 'xr'),
          sw('S1', 'tm', 'm1', { labelSide: -1 }), lamp('L1', 'm1', 'bm'),
          sw('S2', 'xr', 'x1'), lamp('L2', 'x1', 'xb'), wire('W3', 'xb', 'bm'), wire('W4', 'bm', 'bl'),
        ] },
        goal: (s) => s.parts.L1.on && !s.parts.L2.on,
        hint: 'Each switch only controls its own branch.', explain: 'Parallel branches with their own switches give independent control.' },
      mcq('If these two lamps were in **series** with one switch, could you light just one?', ['No, they\'d always be on or off together', 'Yes'], 0, 'Series = one path.', 'One path means both or neither.'),
    ],
  },
  ledChallenge('a1-15', 'Challenge: 9 V LED', 9, 2, [100, 330, 1000], 1000, 'red'),
  {
    id: 'a1-16', title: 'Challenge: double fault', icon: '🔧',
    steps: [
      { type: 'learn', title: 'Fault-finding practice', body: 'Two lamps in series are both dark. There may be **more than one** fault. Test, fix, test again.' },
      { type: 'bench', prompt: 'Get **both lamps** lit. Tap wires to test them and tap a blown lamp to replace it.',
        circuit: { nodes: N, ground: 'bl', parts: [
          bat(9), wire('W1', 'tl', 'tm', { tap: 'probe' }), wire('W2', 'tm', 'tr', { tap: 'probe', broken: true, hidden: true }),
          lamp('L1', 'tr', 'br', { r: 9, ratedW: 2.25, burnt: true, tap: 'replace', label: 'lamp 1' }),
          wire('W3', 'br', 'bm', { tap: 'probe' }), lamp('L2', 'bm', 'bl', { r: 9, ratedW: 2.25 }),
        ] },
        goal: (s) => s.parts.L1.on && s.parts.L2.on,
        hint: 'One lamp looks broken, and one wire is secretly broken too.', explain: 'Two faults: a blown lamp and a broken wire. Real repairs often hide a second problem.' },
      ohmI(9, 18),
    ],
  },
  drill('a1-17', 'Practice: finding current', '🧮', 'Five quick Ohm\'s law problems. **I = V ÷ R**.', [
    ohmI(12, 6), ohmI(9, 3), ohmImA(5, 250), ohmImA(9, 450), ohmI(24, 8),
  ]),
  drill('a1-18', 'Practice: voltage and resistance', '🧮', 'Rearrange Ohm\'s law: **V = I × R** and **R = V ÷ I**.', [
    ohmV(2, 6), ohmV(0.5, 18), ohmR(12, 0.5), ohmR(9, 0.03), ohmV(0.02, 470),
  ]),
  drill('a1-19', 'Practice: series and parallel', '🧮', 'Series resistances **add**. Two equal resistors in parallel make **half**.', [
    series([100, 220]), series([10, 20, 30]), parallel([100, 100]), parallel([60, 30]), parallel([12, 6]),
  ]),
  drill('a1-20', 'Practice: LED resistors', '🧮', 'For every LED: **R = (V_supply − V_LED) ÷ I**. Red ≈ 2 V, blue ≈ 3 V.', [
    ledR(5, 2, 20), ledR(9, 2, 20), ledR(12, 3, 20), ledI(5, 2, 150), ledI(9, 2, 330),
  ]),
  {
    id: 'a1-21', title: 'Review: circuit sense', icon: '🧠',
    steps: [
      { type: 'learn', title: 'Quick-fire review', body: 'Four questions mixing everything from this unit.' },
      mcq('A lamp is connected to a battery but is dark. Which is NOT a possible cause?', ['A broken wire', 'A blown lamp', 'The loop is complete and the battery is good'], 2, 'Which one would make it work?', 'If the loop is complete and the battery is good, the lamp would light.'),
      mcq('Doubling the battery voltage across the same resistor makes the current…', ['Double', 'Halve', 'Stay the same'], 0, 'I = V ÷ R', 'Twice the push, twice the current.'),
      mcq('Which part protects an LED from too much current?', ['A series resistor', 'A second LED', 'A switch'], 0, 'It limits the flow.', 'The resistor limits the current.'),
      mcq('Conventional current flows…', ['From + round the circuit to −', 'From − to + outside the battery', 'Only inside the battery'], 0, 'The way we draw the arrows.', 'Out of +, around the loop, back to −.'),
    ],
  },
  {
    id: 'a1-22', title: 'Challenge: brightest pair', icon: '🌟',
    steps: [
      { type: 'learn', title: 'Series or parallel?', body: 'Two identical lamps, one battery. Wire them in parallel and each gets the full voltage. In series they share it.' },
      { type: 'bench', prompt: 'Close the switch that puts lamp 2 **in parallel** with lamp 1 so **both** lamps are at full brightness.',
        circuit: { nodes: { ...N2, m1: [130, 110], x1: [300, 110] }, view: '0 0 330 220', ground: 'bl', parts: [
          bat(9), wire('W0', 'tl', 'tm'), wire('W1', 'tm', 'tr'), lamp('L1', 'tm', 'bm', { labelSide: -1 }),
          sw('S', 'tr', 'xr'), lamp('L2', 'xr', 'xb'), wire('W3', 'xb', 'bm'), wire('W4', 'bm', 'bl'),
        ] },
        goal: (s) => s.parts.L1.brightness > 0.9 && s.parts.L2.brightness > 0.9,
        hint: 'The switch is on the top right.', explain: 'In parallel, each lamp gets the full 9 V, so both shine at full brightness.' },
      { type: 'numeric', q: 'In that circuit, each 18 Ω lamp draws 0.5 A. Total battery current?', answer: 1, tol: 0.02, unit: 'A',
        hint: 'Add the branches.', explain: '0.5 + 0.5 = 1 A. Parallel lamps are bright, but they drain the battery faster.' },
    ],
  },
];
