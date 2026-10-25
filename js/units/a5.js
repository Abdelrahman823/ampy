// A5 · Power: batteries, fuses, regulators, efficiency, energy, safety.
import { N, bat, wire, res, lamp, am, sw, near } from './kit.js';

export const glossary = {
  cell: 'One single battery unit, like an AA (1.5 V). A "battery" is often several cells together.',
  mAh: 'Milliamp-hours: how much charge a battery holds. 2000 mAh can give 200 mA for 10 hours.',
  fuse: 'A thin wire that melts and breaks the circuit if too much current flows. It sacrifices itself to prevent fires.',
  regulator: 'A part that outputs a steady voltage even when the input or the load changes.',
  efficiency: 'How much of the input power becomes useful output, as a percentage. The rest becomes heat.',
  kWh: 'Kilowatt-hour: the energy used by 1000 W for one hour. Electricity bills are in kWh.',
};

export default {
  id: 'a5',
  title: 'Power',
  subtitle: 'Batteries, fuses, regulators and safety',
  lessons: [
    {
      id: 'a5-1', title: 'Cells and batteries', icon: '🔋',
      steps: [
        { type: 'learn', title: 'Stacking cells',
          body: 'One AA [[cell]] gives 1.5 V. Stack cells **in series** and the voltages add: four AAs give 6 V.\n\nCapacity is measured in [[mAh]]. More mAh means it lasts longer.' },
        { type: 'bench', prompt: 'This is a 6 V motor. Pick the battery pack that runs it at **full speed** without overdoing it.',
          circuit: { nodes: N, ground: 'bl', parts: [
            bat(1.5, { choices: [1.5, 3, 4.5, 6, 9], prop: 'v', label: 'Pack', fmt: 'v' }), wire('W1', 'tl', 'tr'),
            { id: 'M', kind: 'motor', a: 'tr', b: 'br', r: 12, ratedW: 3 }, wire('W', 'br', 'bl'),
          ] },
          goal: (s) => s.parts.M.power > 2.7 && s.parts.M.power < 3.3,
          hint: 'A 6 V motor wants 6 V: that\'s four AA cells.',
          explain: '4 × 1.5 V = 6 V. At 9 V it would spin too fast, get hot and wear out quickly.' },
        { type: 'numeric', q: 'How many 1.5 V cells in series make 9 V?', answer: 6, tol: 0.01, unit: 'cells',
          hint: '9 ÷ 1.5', explain: '9 ÷ 1.5 = 6 cells. That\'s what\'s inside a 9 V battery.' },
        { type: 'numeric', q: 'A 2000 mAh battery powers a 200 mA toy. Roughly how many hours will it last?', answer: 10, tol: 0.02, unit: 'h',
          hint: 'mAh ÷ mA = hours.', explain: '2000 ÷ 200 = 10 hours.' },
      ],
    },
    {
      id: 'a5-2', title: 'Fuses', icon: '🧯',
      steps: [
        { type: 'learn', title: 'The part that fails on purpose',
          body: 'A [[fuse]] is a thin wire. Normal current passes fine. Too much current melts it and opens the circuit.\n\nPick a fuse a bit **above** the normal current, so it blows only when something is wrong.' },
        { type: 'bench', prompt: 'Something is wrong in this circuit. **Close the switch** and see what the fuse does.',
          circuit: { nodes: { ...N, mm: [160, 110] }, ground: 'bl', parts: [
            bat(9, { rInt: 0.05 }), { id: 'F', kind: 'fuse', a: 'tl', b: 'tm', labelSide: -1, rating: 1 }, wire('W1', 'tm', 'tr'),
            lamp('L', 'tr', 'br'), sw('S', 'tm', 'mm', { label: 'oops' }), wire('W2', 'mm', 'bm'), wire('W3', 'br', 'bm'), wire('W4', 'bm', 'bl'),
          ] },
          goal: (s, parts) => parts.find((p) => p.id === 'F').burnt,
          hint: 'The switch is in the middle.',
          explain: 'The switch made a [[short circuit]]. Huge current flowed, and the fuse melted before the wires could overheat.' },
        { type: 'bench', prompt: 'The lamp draws 0.5 A. Pick the fuse that lets it run normally but would still blow on a short.',
          circuit: { nodes: N, ground: 'bl', parts: [
            bat(9, { rInt: 0.05 }), { id: 'F', kind: 'fuse', a: 'tl', b: 'tm', labelSide: -1, rating: 10, choices: [0.25, 1, 10], prop: 'rating', label: 'Fuse' },
            am('A', 'tm', 'tr'), lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
          ] },
          goal: (s, parts) => parts.find((p) => p.id === 'F').rating === 1 && s.parts.L.on,
          hint: 'A bit above 0.5 A, but nowhere near the huge current of a short.',
          explain: '1 A is comfortably above 0.5 A. A 10 A fuse would let the wires cook before it blew. If you blew the 0.25 A one, that\'s why it\'s too small.' },
        { type: 'mcq', q: 'A fuse keeps blowing. What should you do?',
          choices: ['Put in a bigger fuse', 'Find out why too much current is flowing', 'Replace it with a wire'], answer: 1,
          hint: 'The fuse is telling you something.', explain: 'A blowing fuse means there\'s a fault. Fix the fault. Never use a bigger fuse or a wire.' },
      ],
    },
    {
      id: 'a5-3', title: 'Dropping voltage', icon: '⬇️',
      steps: [
        { type: 'learn', title: 'Getting a lower voltage',
          body: 'Need 6 V from a 12 V supply? A series resistor can drop the extra 6 V, but that energy turns into **heat**.\n\nA [[regulator]] does the same job and keeps the output steady.' },
        { type: 'bench', prompt: 'Run this **6 V, 0.5 A** lamp from 12 V. Pick the series resistor that gives it exactly its rated power.',
          circuit: { nodes: N, ground: 'bl', parts: [
            bat(12), res('R', 'tl', 'tr', 6, { choices: [6, 12, 24] }), lamp('L', 'tr', 'br', { r: 12, ratedW: 3 }), wire('W', 'br', 'bl'),
          ] },
          goal: (s) => near(s.parts.L.voltage, 6, 0.15),
          hint: 'The resistor must drop 6 V at 0.5 A.', explain: '6 V ÷ 0.5 A = 12 Ω. The resistor and lamp share 12 V equally.' },
        { type: 'numeric', q: 'In that circuit, how much power turns into heat in the 12 Ω resistor?', answer: 3, tol: 0.02, unit: 'W',
          hint: 'P = V × I, with 6 V across it and 0.5 A through it.', explain: '6 × 0.5 = 3 W wasted, as much as the lamp itself uses.' },
        { type: 'numeric', q: 'A regulator turns 12 V into 5 V for a 1 A load. How much power does it waste as heat?', answer: 7, tol: 0.02, unit: 'W',
          hint: 'It drops 12 − 5 V at 1 A.', explain: '7 V × 1 A = 7 W. That\'s why regulators often need a metal heatsink.' },
      ],
    },
    {
      id: 'a5-4', title: 'Efficiency', icon: '♻️',
      steps: [
        { type: 'learn', title: 'Where does the energy go?',
          body: '[[efficiency]] = useful power out ÷ power in.\n\nA simple (linear) regulator going from 12 V to 5 V is only about 42% efficient. A **switching** regulator flicks on and off thousands of times a second and can reach 90% or more.' },
        { type: 'numeric', q: 'A charger takes 20 W from the wall and delivers 18 W to the phone. Efficiency in %?', answer: 90, tol: 0.01, unit: '%',
          hint: 'Out ÷ in × 100.', explain: '18 ÷ 20 = 0.9 = 90%. The other 2 W warms the charger.' },
        { type: 'mcq', q: 'Why does an old filament bulb get so hot?',
          choices: ['Most of its power becomes heat, not light', 'It uses DC', 'It has a fuse inside'], answer: 0,
          hint: 'Think about efficiency.', explain: 'A filament bulb turns about 95% of its power into heat. LEDs are far more efficient.' },
        { type: 'mcq', q: 'Which regulator would you pick for a battery-powered robot?',
          choices: ['A switching regulator', 'A linear regulator', 'A big resistor'], answer: 0,
          hint: 'Batteries are precious.', explain: 'Switching regulators waste far less, so the battery lasts longer.' },
      ],
    },
    {
      id: 'a5-5', title: 'Energy and your bill', icon: '🧾',
      steps: [
        { type: 'learn', title: 'Power × time = energy',
          body: 'Power is how fast. **Energy** is how much in total:\n\n**Energy = Power × time**\n\nHomes are billed in [[kWh]]. 1 kWh is 1000 W for 1 hour.' },
        { type: 'numeric', q: 'A 2000 W heater runs for 3 hours. How many kWh?', answer: 6, tol: 0.01, unit: 'kWh',
          hint: '2 kW × 3 h.', explain: '2 × 3 = 6 kWh.' },
        { type: 'numeric', q: 'A 10 W LED lamp is on for 100 hours. How many kWh?', answer: 1, tol: 0.01, unit: 'kWh',
          hint: '10 × 100 = 1000 Wh.', explain: '1000 Wh = 1 kWh. A whole month of evenings for one unit of energy.' },
        { type: 'numeric', q: 'A 3.7 V, 5 Ah phone battery stores how many watt-hours?', answer: 18.5, tol: 0.02, unit: 'Wh',
          hint: 'Wh = V × Ah.', explain: '3.7 × 5 = 18.5 Wh.' },
      ],
    },
    {
      id: 'a5-6', title: 'Stay safe', icon: '⚠️',
      steps: [
        { type: 'learn', title: 'Respect electricity',
          body: 'Batteries under 12 V are safe to experiment with. **Wall sockets are not**: mains voltage can kill.\n\n• Never open mains devices\n• Keep water away from electronics\n• Shorted batteries get very hot, and lithium cells can catch fire\n• It\'s the **current through your body** that harms you' },
        { type: 'mcq', q: 'Which is safe to experiment with at home?',
          choices: ['A 9 V battery', 'A wall socket', 'The inside of a microwave'], answer: 0,
          hint: 'Low voltage only.', explain: 'Low-voltage batteries only. Mains and microwave capacitors can be deadly even when unplugged.' },
        { type: 'mcq', q: 'Why are wet hands more dangerous near electricity?',
          choices: ['Water lowers your skin\'s resistance, so more current can flow', 'Water makes the voltage higher', 'It isn\'t more dangerous'], answer: 0,
          hint: 'I = V ÷ R.', explain: 'Wet skin has much lower resistance, so the same voltage pushes far more current through you.' },
        { type: 'mcq', q: 'A lithium battery gets hot and puffy while charging. What should you do?',
          choices: ['Keep charging it', 'Unplug it and move it away from anything flammable', 'Put it in water while plugged in'], answer: 1,
          hint: 'It\'s a fire risk.', explain: 'Stop charging and move it somewhere safe. Swollen lithium cells can catch fire.' },
      ],
    },
    {
      id: 'a5-7', title: 'Checkpoint: power', icon: '🏁',
      steps: [
        { type: 'learn', title: 'Power check',
          body: 'Volts, amps, watts and watt-hours, plus a fuse to keep it all safe.' },
        { type: 'bench', prompt: 'Two lamps in parallel draw about 1 A in total. Pick a fuse that lets **both** stay lit but is still the smallest that works.',
          circuit: { nodes: { ...N, m1: [160, 110] }, ground: 'bl', parts: [
            bat(9, { rInt: 0.05 }), { id: 'F', kind: 'fuse', a: 'tl', b: 'tm', labelSide: -1, rating: 5, choices: [0.5, 1.5, 5], prop: 'rating', label: 'Fuse' },
            wire('W1', 'tm', 'tr'), lamp('L1', 'tm', 'bm'), lamp('L2', 'tr', 'br'), wire('W2', 'br', 'bm'), wire('W3', 'bm', 'bl'),
          ] },
          goal: (s, parts) => parts.find((p) => p.id === 'F').rating === 1.5 && s.parts.L1.on && s.parts.L2.on,
          hint: 'Just above 1 A.', explain: '1.5 A sits comfortably above the 1 A load but far below a short circuit\'s current.' },
        { type: 'numeric', q: 'A USB fan uses 5 V at 0.4 A. What is its power?', answer: 2, tol: 0.02, unit: 'W',
          hint: 'P = V × I', explain: '5 × 0.4 = 2 W.' },
        { type: 'numeric', q: 'That fan runs from a 10 Wh power bank. About how many hours does it last?', answer: 5, tol: 0.02, unit: 'h',
          hint: 'Energy ÷ power.', explain: '10 Wh ÷ 2 W = 5 hours.' },
      ],
    },
  ],
};
