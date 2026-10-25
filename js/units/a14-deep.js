// A14 deep practice: measuring, colour codes, building and debugging.
import { N3, bat, wire, res, vm, am, sw } from './kit.js';
import { mcq, num } from './drill.js';

export const glossary = {
  'side cutters': 'Small pliers for snipping component leads and wires.',
  'divide and conquer': 'A debugging method: test the middle of the circuit first, then keep halving the area where the fault could be.',
};

const DIGITS = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'];
const colour = (a, b, zeros) => {
  const value = (DIGITS.indexOf(a) * 10 + DIGITS.indexOf(b)) * 10 ** DIGITS.indexOf(zeros);
  return num(`Bands: **${a}, ${b}, ${zeros}**. Value in ohms?`, value, 'Ω', 'Digit, digit, number of zeros.',
    `${DIGITS.indexOf(a)}${DIGITS.indexOf(b)} followed by ${DIGITS.indexOf(zeros)} zero${DIGITS.indexOf(zeros) === 1 ? '' : 's'} = ${value} Ω.`, 0.0001);
};

export const lessons = [
  {
    id: 'a14-10', title: 'Challenge: identify the resistor', icon: '🔎',
    steps: [
      { type: 'learn', title: 'Measure, then calculate', body: 'Another mystery resistor, this time on **5 V**. Read both meters, then work out R.' },
      { type: 'bench', prompt: '**Close the switch** and read the meters.',
        circuit: { nodes: N3, ground: 'bl', parts: [
          bat(5), sw('S', 'tl', 'tr'), am('A', 'tr', 'mr', { labelSide: -1 }), res('RX', 'mr', 'br', 220, { label: 'R = ?', labelSide: -1 }),
          wire('W', 'br', 'bl'), wire('V1', 'mr', 'vt'), wire('V2', 'br', 'vb'), vm('V', 'vt', 'vb'),
        ] },
        goal: (s) => s.parts.A.current > 0.01,
        hint: 'Top switch.', explain: 'About 5 V and about 22.7 mA.' },
      num('The meters read 5 V and 22.7 mA. What is R (nearest 10 Ω)?', 5 / 0.0227, 'Ω', 'R = V ÷ I', '5 ÷ 0.0227 ≈ 220 Ω.'),
    ],
  },
  {
    id: 'a14-11', title: 'Practice: colour codes', icon: '🌈',
    steps: [
      { type: 'learn', title: 'Band drill', body: 'black 0 · brown 1 · red 2 · orange 3 · yellow 4 · green 5 · blue 6 · violet 7 · grey 8 · white 9.' },
      colour('brown', 'black', 'orange'), colour('red', 'violet', 'red'), colour('blue', 'grey', 'brown'), colour('orange', 'white', 'yellow'), colour('green', 'blue', 'black'),
    ],
  },
  {
    id: 'a14-12', title: 'How to solder', icon: '🔥',
    steps: [
      { type: 'learn', title: 'A good joint in four steps',
        body: '1. **Heat** the pad and the component lead together with the iron tip\n2. **Feed solder** into the joint (not onto the iron)\n3. **Remove the solder**, then\n4. **Remove the iron**, and let it cool without moving\n\nA good joint is shiny and shaped like a small volcano.' },
      mcq('What should you heat first?', ['The pad and the lead together', 'The solder', 'Nothing, just drip solder on'], 0, 'Step 1.', 'Heat both parts so the solder flows onto them.'),
      mcq('What does a good solder joint look like?', ['Shiny and cone-shaped', 'A dull, grey ball', 'A thin film'], 0, 'Volcano.', 'Shiny and cone-shaped. A dull ball is a "cold joint" that may not conduct.'),
      mcq('What do you remove first at the end?', ['The solder', 'The iron'], 0, 'Step 3 before step 4.', 'Solder first, then the iron, so the joint stays hot while the solder flows.'),
    ],
  },
  {
    id: 'a14-13', title: 'Your toolkit', icon: '🧰',
    steps: [
      { type: 'learn', title: 'Basic tools',
        body: '• **Multimeter**: volts, amps, ohms, continuity\n• **Breadboard + jumper wires**: build without soldering\n• **[[side cutters]]**: trim leads\n• **Wire strippers**: remove insulation cleanly\n• **Soldering iron + stand**: permanent joints\n\nA starter kit with all of these costs much less than one game.' },
      mcq('Which tool removes plastic insulation from a wire?', ['Wire strippers', 'Side cutters', 'Multimeter'], 0, 'It strips.', 'Wire strippers.'),
      mcq('Which tool would you use to check a fuse is OK?', ['Multimeter in continuity mode', 'Side cutters', 'Soldering iron'], 0, 'Is it connected?', 'Continuity: a good fuse beeps.'),
    ],
  },
  {
    id: 'a14-14', title: 'Debugging like a pro', icon: '🕵️',
    steps: [
      { type: 'learn', title: 'A method beats guessing',
        body: '1. **Look** for obvious problems: loose wires, backwards parts\n2. **Power**: is the battery voltage right at the circuit?\n3. **Ground**: is everything connected to −?\n4. **[[divide and conquer]]**: measure the middle, then halve the search area\n5. **Change one thing at a time**' },
      mcq('Your circuit is dead. What do you check first?', ['That power actually reaches the circuit', 'Replace every part', 'Rewrite the code'], 0, 'Start simple.', 'Check the supply first: it\'s quick and the most common fault.'),
      mcq('A signal is correct at the start of a long chain but wrong at the end. Next you should…', ['Measure in the middle', 'Measure at the start again', 'Give up'], 0, 'Divide and conquer.', 'The middle reading tells you which half has the fault.'),
      mcq('Why change only one thing at a time?', ['So you know which change fixed (or broke) it', 'It\'s faster', 'Parts get jealous'], 0, 'Cause and effect.', 'Otherwise you can\'t tell what made the difference.'),
    ],
  },
  {
    id: 'a14-15', title: 'Project: LED flasher', icon: '✨',
    steps: [
      { type: 'learn', title: 'Your second build',
        body: 'A **555 timer** blinking an LED: 9 V battery, a 555 chip, R1 = 1 kΩ, R2 = 47 kΩ, C = 10 µF, an LED + 330 Ω.\n\nBlink rate ≈ 1.44 ÷ ((R1 + 2·R2) × C).' },
      num('With R1 = 1 kΩ, R2 = 47 kΩ, C = 10 µF, roughly how many blinks per second?', 1.44 / ((1000 + 2 * 47000) * 0.00001), 'Hz', '1.44 ÷ (95 000 × 0.00001)', '≈ 1.5 blinks per second.'),
      mcq('To blink faster, you could…', ['Use a smaller capacitor', 'Use a bigger capacitor', 'Use a bigger battery'], 0, 'Smaller C, faster.', 'A smaller capacitor charges faster.'),
    ],
  },
  {
    id: 'a14-16', title: 'Review: real tools', icon: '🧠',
    steps: [
      { type: 'learn', title: 'Workbench sense', body: 'Mixed questions on Real tools.' },
      mcq('To measure current, the meter goes…', ['In series, after breaking the circuit', 'Across the part', 'Anywhere'], 0, 'Current flows through it.', 'In series.'),
      mcq('Red, red, red bands mean…', ['2200 Ω', '222 Ω', '22 Ω'], 0, '2, 2, two zeros.', '2200 Ω = 2.2 kΩ.'),
      mcq('A breadboard\'s 5-hole strip on one side of the gap is…', ['All connected', 'All separate'], 0, 'Spring clip.', 'All connected by one clip.'),
      mcq('Best first debugging step:', ['Check the power supply', 'Replace the chip'], 0, 'Simple first.', 'Check power first.'),
    ],
  },
];
