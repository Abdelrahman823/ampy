// A8 · Switches: transistors (BJT and MOSFET), motor drivers, sensors.
import { bat, wire, res, lamp, am, sw, near } from './kit.js';

export const glossary = {
  transistor: 'A part where a small signal controls a big current. It can act as an electronic switch or an amplifier.',
  NPN: 'A common type of bipolar transistor with three legs: collector, base and emitter. Current into the base lets a bigger current flow from collector to emitter.',
  gain: 'How many times bigger the output is than the input. For a transistor, β (beta) = collector current ÷ base current.',
  saturation: 'When a transistor is switched fully on, it acts like a closed switch with only about 0.2 V across it.',
  MOSFET: 'A transistor controlled by voltage on its gate. The gate draws almost no current.',
  'flyback diode': 'A diode across a motor or relay coil that safely absorbs the voltage spike when it switches off.',
  'pull-down resistor': 'A resistor that holds a pin at 0 V when nothing else is driving it, so it doesn\'t float.',
};

// NPN switch layout
const NT = { tl: [40, 40], tm: [140, 40], tr: [250, 40], c: [250, 100], sb: [140, 140], b: [200, 140], e: [250, 200], bl: [40, 200] };
const npn = (extra = {}) => ({ id: 'Q', kind: 'npn', pins: { c: 'c', b: 'b', e: 'e' }, at: [242, 140], ...extra });
// MOSFET layout with a gate battery
const NM = { tl: [40, 40], tr: [250, 40], d: [250, 100], g: [200, 140], gt: [150, 140], gb: [150, 200], s: [250, 200], bl: [40, 200] };
// Night-light layout
const NL = { tl: [40, 40], tm: [140, 40], tr: [250, 40], cm: [250, 82], c: [250, 125], b: [140, 155], e: [250, 200], bm: [140, 200], bl: [40, 200] };

export default {
  id: 'a8',
  title: 'Switches',
  subtitle: 'Transistors: tiny signals, big currents',
  lessons: [
    {
      id: 'a8-1', title: 'The transistor switch', icon: '🎛️',
      steps: [
        { type: 'learn', title: 'A switch with no moving parts',
          body: 'A [[transistor]] is an electronic switch. In an [[NPN]] transistor, a **small** current into the **base** lets a **big** current flow from **collector** to **emitter**.\n\nYour phone has billions of them.' },
        { type: 'bench', prompt: 'The lamp is on the transistor\'s collector. **Close the small switch** to feed the base.',
          circuit: { nodes: NT, ground: 'bl', parts: [
            bat(9), wire('W1', 'tl', 'tm'), wire('W2', 'tm', 'tr'), lamp('L', 'tr', 'c'),
            sw('S', 'tm', 'sb', { labelSide: -1 }), res('RB', 'sb', 'b', 1000), npn(), wire('W3', 'e', 'bl'),
          ] },
          goal: (s) => s.parts.L.on,
          hint: 'The switch is in the middle.',
          explain: 'About 8 mA into the base switched on almost 0.5 A through the lamp. The small switch only ever carries the tiny base current.' },
        { type: 'mcq', q: 'Which leg of an NPN transistor do you feed to switch it on?', choices: ['Collector', 'Base', 'Emitter'], answer: 1,
          hint: 'The control input.', explain: 'The base. It\'s the control input.' },
      ],
    },
    {
      id: 'a8-2', title: 'Gain: β', icon: '✖️',
      steps: [
        { type: 'learn', title: 'Current multiplier',
          body: 'When a transistor is partly on, collector current = **β × base current**. β ([[gain]]) is often around 100.\n\nThat\'s amplification: a tiny current controls one a hundred times bigger.' },
        { type: 'bench', prompt: 'β = 100. Drag the base resistor so the collector current is about **50 mA** (±3 mA).',
          circuit: { nodes: NT, ground: 'bl', parts: [
            bat(9), wire('W1', 'tl', 'tm'), wire('W2', 'tm', 'tr'), res('RC', 'tr', 'c', 100),
            res('RB', 'tm', 'sb', 100000, { slider: { label: 'Base resistor', min: 5000, max: 100000, step: 1000 }, labelSide: -1 }),
            am('AB', 'sb', 'b'), npn({ show: 'ic', labelDx: 22 }), wire('W3', 'e', 'bl'),
          ] },
          goal: (s) => near(s.parts.Q.ic, 0.05, 0.003),
          hint: 'You need 0.5 mA into the base. Rb ≈ (9 − 0.7) ÷ 0.0005.',
          explain: '(9 − 0.7) ÷ 17 kΩ ≈ 0.49 mA into the base, and × 100 gives about 49 mA in the collector.' },
        { type: 'numeric', q: 'β = 200 and base current = 0.1 mA. Collector current in mA?', answer: 20, tol: 0.01, unit: 'mA',
          hint: 'Ic = β × Ib', explain: '200 × 0.1 = 20 mA.' },
        { type: 'mcq', q: 'In the first lesson, extra base current didn\'t make the lamp brighter. Why?',
          choices: ['The transistor was fully on, in saturation', 'The battery was flat', 'β had dropped to zero'], answer: 0,
          hint: 'A switch can\'t be more than closed.', explain: 'In [[saturation]] it\'s already a closed switch. The lamp and battery set the current.' },
      ],
    },
    {
      id: 'a8-3', title: 'The MOSFET', icon: '🚪',
      steps: [
        { type: 'learn', title: 'Voltage-controlled switch',
          body: 'A [[MOSFET]] is switched by **voltage** on its **gate**, not current. The gate draws almost nothing. Above its threshold (here 2 V) it turns on.\n\nMOSFETs switch the big currents in drones, e-bikes and chargers.' },
        { type: 'bench', prompt: 'Raise the **gate voltage** until the MOSFET switches the lamp on.',
          circuit: { nodes: NM, ground: 'bl', parts: [
            bat(9), wire('W1', 'tl', 'tr'), lamp('L', 'tr', 'd'),
            { id: 'G', kind: 'battery', a: 'gt', b: 'gb', v: 0, rInt: 0.001, slider: { label: 'Gate voltage', prop: 'v', min: 0, max: 5, step: 0.5, fmt: 'v' }, labelSide: -1 },
            wire('W2', 'gt', 'g'), { id: 'M', kind: 'nmos', pins: { d: 'd', g: 'g', s: 's' }, at: [242, 140] },
            wire('W3', 's', 'gb'), wire('W4', 'gb', 'bl'),
          ] },
          goal: (s) => s.parts.L.on,
          hint: 'It needs more than 2 V.', explain: 'Past 2 V the channel opens and the lamp lights. The gate battery supplied zero current.' },
        { type: 'mcq', q: 'Why are MOSFETs great for battery projects?',
          choices: ['Their gate draws almost no current', 'They glow', 'They make AC'], answer: 0,
          hint: 'Voltage-controlled.', explain: 'Holding them on costs almost nothing, so batteries last longer.' },
      ],
    },
    {
      id: 'a8-4', title: 'Driving a motor', icon: '⚙️',
      steps: [
        { type: 'learn', title: 'Motors need help',
          body: 'Motors are coils of wire. When you switch one off, the collapsing magnetic field makes a big **voltage spike** that can kill your transistor.\n\nA [[flyback diode]] across the motor gives that spike a safe path. The [[pull-down resistor]] keeps the gate at 0 V when the switch is open.' },
        { type: 'bench', prompt: '**Close the switch** to start the motor through the MOSFET.',
          circuit: { nodes: { ...NM, tm: [150, 40], tr2: [300, 40], d2: [300, 100] }, view: '0 0 330 220', ground: 'bl', parts: [
            bat(9), wire('W1', 'tl', 'tm'), wire('W1b', 'tm', 'tr'), { id: 'MO', kind: 'motor', a: 'tr', b: 'd', r: 12, ratedW: 6 },
            wire('W5', 'tr', 'tr2'), { id: 'D', kind: 'diode', a: 'd2', b: 'tr2' }, wire('W6', 'd', 'd2'),
            sw('S', 'tm', 'gt', { labelSide: -1 }), res('RP', 'gt', 'gb', 10000, { label: 'pull-down' }),
            wire('W2', 'gt', 'g'), { id: 'M', kind: 'nmos', pins: { d: 'd', g: 'g', s: 's' }, at: [242, 140] },
            wire('W3', 's', 'gb'), wire('W4', 'gb', 'bl'),
          ] },
          goal: (s) => s.parts.MO.on,
          hint: 'The switch feeds the gate.', explain: 'The switch puts 9 V on the gate, the MOSFET turns on and the motor spins. The diode sits backwards across the motor until it\'s needed.' },
        { type: 'mcq', q: 'What is the flyback diode for?', choices: ['Making the motor faster', 'Absorbing the voltage spike when the motor turns off', 'Reversing the motor'], answer: 1,
          hint: 'Coils kick back.', explain: 'It safely soaks up the spike from the motor\'s coil.' },
        { type: 'mcq', q: 'Without the pull-down resistor, the open switch leaves the gate…', choices: ['At exactly 0 V', 'Floating, so the MOSFET might randomly turn on', 'At 9 V'], answer: 1,
          hint: 'Nothing holds it.', explain: 'A floating gate can pick up stray charge and turn on by itself. The pull-down holds it firmly off.' },
      ],
    },
    {
      id: 'a8-5', title: 'Talking to microcontrollers', icon: '🤖',
      steps: [
        { type: 'learn', title: 'Small pins, big loads',
          body: 'An Arduino pin gives 5 V but only about **20 mA**, which is fine for an LED but not for a motor or a lamp.\n\nSo the pin drives a transistor, and the transistor drives the load. That\'s the bridge between code and the real world.' },
        { type: 'numeric', q: 'A 5 V pin should give 2 mA into a transistor\'s base. What base resistor do you need (Vbe = 0.7 V)?', answer: 2150, tol: 0.03, unit: 'Ω',
          hint: '(5 − 0.7) ÷ 0.002', explain: '4.3 ÷ 0.002 = 2150 Ω. You\'d use a standard 2.2 kΩ.' },
        { type: 'mcq', q: 'Your robot\'s motor needs 1 A. Can you connect it straight to an Arduino pin?',
          choices: ['Yes', 'No, use a transistor or a motor driver'], answer: 1,
          hint: 'The pin is good for about 20 mA.', explain: 'No. 1 A would damage the pin. A transistor or driver chip carries the motor\'s current.' },
      ],
    },
    {
      id: 'a8-6', title: 'Automatic night-light', icon: '🌙',
      steps: [
        { type: 'learn', title: 'Sensor + transistor',
          body: 'Combine an [[LDR]] divider with a transistor: when it gets dark, the base voltage rises past 0.7 V and the transistor switches the light on, with no microcontroller needed.' },
        { type: 'bench', prompt: 'Make it **dark**: raise the LDR\'s resistance until the LED switches on.',
          circuit: { nodes: NL, ground: 'bl', parts: [
            bat(9), wire('W1', 'tl', 'tm'), wire('W2', 'tm', 'tr'), res('RL', 'tr', 'cm', 330), { id: 'D', kind: 'led', a: 'cm', b: 'c' },
            res('R1', 'tm', 'b', 47000, { labelSide: -1 }),
            res('LDR', 'b', 'bm', 1000, { slider: { label: 'LDR (dark → high)', min: 1000, max: 100000, step: 1000 }, labelSide: -1 }),
            { id: 'Q', kind: 'npn', pins: { c: 'c', b: 'b', e: 'e' }, at: [242, 155] }, wire('W3', 'e', 'bm'), wire('W4', 'bm', 'bl'),
          ] },
          goal: (s) => s.parts.D.on,
          hint: 'Darker means higher LDR resistance.', explain: 'In the dark, the LDR takes more of the voltage, the base rises past 0.7 V, and the transistor lights the LED. Street lights work this way.' },
        { type: 'mcq', q: 'To make the night-light switch on **earlier** (while it\'s still a bit bright), you could…',
          choices: ['Use a smaller top resistor', 'Use a bigger top resistor', 'Use a red LED'], answer: 0,
          hint: 'You want the base voltage higher for the same LDR value.', explain: 'A smaller top resistor gives the LDR a bigger share, so the base reaches 0.7 V sooner.' },
      ],
    },
    {
      id: 'a8-7', title: 'Checkpoint: switching', icon: '🏁',
      steps: [
        { type: 'learn', title: 'Pick your switch', body: 'BJTs need base current. MOSFETs need gate voltage. Both turn small signals into big currents.' },
        { type: 'bench', prompt: 'Pick a base resistor that switches the lamp **fully on** (saturated). Use the largest value that still works.',
          circuit: { nodes: NT, ground: 'bl', parts: [
            bat(9), wire('W1', 'tl', 'tm'), wire('W2', 'tm', 'tr'), lamp('L', 'tr', 'c'),
            sw('S', 'tm', 'sb', { labelSide: -1, closed: true }), res('RB', 'sb', 'b', 100000, { choices: [100000, 10000, 1000], label: 'Base resistor' }), npn(), wire('W3', 'e', 'bl'),
          ] },
          goal: (s, parts) => parts.find((p) => p.id === 'RB').r === 1000 && s.parts.Q.state === 'sat' && s.parts.L.on,
          hint: 'The lamp needs about 0.5 A, so the base needs at least 0.5 ÷ 100 = 5 mA.', explain: '1 kΩ gives about 8 mA of base current, more than enough to saturate. 10 kΩ gives only 0.8 mA, which is 83 mA in the lamp: barely glowing.' },
        { type: 'numeric', q: 'A transistor with β = 50 must switch 1 A. What is the minimum base current, in mA?', answer: 20, tol: 0.01, unit: 'mA',
          hint: 'Ib = Ic ÷ β', explain: '1 ÷ 50 = 0.02 A = 20 mA.' },
        { type: 'mcq', q: 'Which transistor type is controlled by **voltage** rather than current?', choices: ['NPN', 'MOSFET'], answer: 1,
          hint: 'Gate.', explain: 'The MOSFET. Its gate draws almost no current.' },
      ],
    },
  ],
};
