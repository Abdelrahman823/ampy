// A14 extra depth: measuring R with meters, continuity, schematics.
import { N3, bat, wire, res, vm, am, sw } from './kit.js';

export const glossary = {
  continuity: 'Whether there\'s an unbroken path between two points. Multimeters beep in continuity mode when there is.',
  schematic: 'A circuit diagram drawn with standard symbols: the map of a circuit.',
};

export const lessons = [
  {
    id: 'a14-7', title: 'Ohm\'s law with real meters', icon: '🔎',
    steps: [
      { type: 'learn', title: 'Measure V and I, work out R',
        body: 'You can find an unknown resistance with a voltmeter **across** it and an ammeter **in series**:\n\n**R = V ÷ I**\n\nThat\'s how engineers measure parts that are still in a working circuit.' },
      { type: 'bench', prompt: '**Close the switch** and read both meters for the unknown resistor.',
        circuit: { nodes: N3, ground: 'bl', parts: [
          bat(9), sw('S', 'tl', 'tr'), am('A', 'tr', 'mr', { labelSide: -1 }), res('RX', 'mr', 'br', 470, { label: 'R = ?', labelSide: -1 }),
          wire('W', 'br', 'bl'), wire('V1', 'mr', 'vt'), wire('V2', 'br', 'vb'), vm('V', 'vt', 'vb'),
        ] },
        goal: (s) => s.parts.A.current > 0.01,
        hint: 'Top switch.', explain: 'The voltmeter shows 9 V and the ammeter about 19 mA.' },
      { type: 'numeric', q: 'The meters read 9 V and 19.1 mA. What is R, to the nearest 10 Ω?', answer: 470, tol: 0.02, unit: 'Ω',
        hint: '9 ÷ 0.0191', explain: '9 ÷ 0.0191 ≈ 471 Ω: a 470 Ω resistor.' },
    ],
  },
  {
    id: 'a14-8', title: 'Continuity testing', icon: '🔊',
    steps: [
      { type: 'learn', title: 'Beep means connected',
        body: 'In [[continuity]] mode a multimeter beeps if there\'s an unbroken path between its probes. With the power **off**, you can check wires, solder joints and switches in seconds.\n\nNo beep along a wire? The break is somewhere between your probes.' },
      { type: 'mcq', q: 'You probe both ends of a wire and get no beep. The wire is…', choices: ['Broken somewhere', 'Perfect', 'Too short'], answer: 0,
        hint: 'No continuity.', explain: 'There\'s no unbroken path, so it\'s broken (or not the same wire).' },
      { type: 'mcq', q: 'Why must the circuit be **unpowered** for continuity testing?', choices: ['The meter uses its own small current; outside voltage gives false results or damage', 'It\'s louder', 'To save the battery'], answer: 0,
        hint: 'Same reason as resistance mode.', explain: 'Continuity is really a resistance test, so outside power ruins it.' },
      { type: 'mcq', q: 'Your LED circuit doesn\'t work. With power off, continuity across a closed switch gives no beep. Conclusion?', choices: ['The switch is faulty', 'The LED is backwards', 'The battery is flat'], answer: 0,
        hint: 'A closed switch should beep.', explain: 'A closed switch should be continuous. No beep means it\'s faulty.' },
    ],
  },
  {
    id: 'a14-9', title: 'Reading schematics', icon: '🗺️',
    steps: [
      { type: 'learn', title: 'The language of circuits',
        body: 'A [[schematic]] shows **connections**, not where parts physically sit. You\'ve been reading them all along:\n\n• zig-zag = resistor\n• two plates = capacitor, long + short plates = battery\n• triangle + bar = diode, with arrows for an LED\n• circle with an X = lamp\n• a dot where wires cross = joined, no dot = not joined' },
      { type: 'mcq', q: 'Two wires cross on a schematic **without** a dot. Are they connected?', choices: ['No', 'Yes'], answer: 0,
        hint: 'Dots mean joined.', explain: 'No. Only a dot means a junction.' },
      { type: 'mcq', q: 'Which symbol is a capacitor?', choices: ['Two parallel plates of equal length', 'A zig-zag line', 'A triangle with a bar'], answer: 0,
        hint: 'Remember the Capacitors unit.', explain: 'Two equal plates with a gap. A battery\'s plates are long and short.' },
      { type: 'mcq', q: 'On a schematic, does a resistor drawn at the top mean it sits at the top of the real board?', choices: ['No, schematics show connections, not positions', 'Yes, always'], answer: 0,
        hint: 'A map of connections.', explain: 'Schematics show what connects to what. The board layout is a separate drawing.' },
    ],
  },
];
