// A3 · Capacitors: storing charge, time constants, energy, blocking DC.
import { N, bat, wire, res, lamp, sw } from './kit.js';

export const glossary = {
  capacitor: 'Two metal plates separated by an insulator. It stores charge and releases it later, like a tiny fast-charging battery.',
  capacitance: 'How much charge a capacitor stores per volt, in farads (F). Most are in µF (millionths) or nF (billionths).',
  'time constant': 'τ = R × C, in seconds. After one τ a charging capacitor reaches about 63% of the supply. After 5τ it\'s basically full.',
  oscilloscope: 'A screen that draws voltage over time, so you can watch a signal change.',
  farad: 'The unit of capacitance. 1 F is huge; 1 µF = 0.000001 F, 1 nF = 0.000000001 F.',
};

const rc = (extra = {}) => ({ id: 'C', kind: 'capacitor', a: 'tr', b: 'br', c: 1e-3, vmax: 9, ...extra });
const scope = (window = 5, vmax = 10) => ({ traces: [{ part: 'C', label: 'capacitor' }], vmin: 0, vmax, window });

export default {
  id: 'a3',
  title: 'Capacitors',
  subtitle: 'Store charge, time it, release it',
  lessons: [
    {
      id: 'a3-1', title: 'Meet the capacitor', icon: '🔋',
      steps: [
        { type: 'learn', title: 'A bucket for charge',
          body: 'A [[capacitor]] is two metal plates with a gap between them. Push current in and charge piles up on the plates. Its voltage rises as it fills.\n\nThe screen under the next circuit is an [[oscilloscope]]: it draws voltage over time.' },
        { type: 'bench', prompt: '**Close the switch** and watch the capacitor charge. Wait until it reaches **63%** of 9 V (about 5.7 V).',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.005, speed: 1 }, scope: scope(), parts: [
            bat(9), sw('S', 'tl', 'tm'), res('R', 'tm', 'tr', 1000), rc(), wire('W', 'br', 'bl'),
          ] },
          goal: (s) => s.parts.C.voltage >= 5.6,
          hint: 'Close the switch, then just wait about a second.',
          explain: 'It shoots up fast at first, then slows down as it fills. The fuller it gets, the less push is left to drive current in. That curved shape is the signature of every capacitor.' },
        { type: 'mcq', q: 'Why does charging slow down as the capacitor fills?',
          choices: ['The resistor gets hot', 'The capacitor\'s voltage pushes back against the battery', 'The battery runs out'], answer: 1,
          hint: 'Current depends on the difference between the battery and the capacitor.',
          explain: 'As the capacitor\'s voltage rises, the difference that drives current through the resistor shrinks.' },
        { type: 'mcq', q: 'What\'s between a capacitor\'s plates?',
          choices: ['A wire', 'An insulator (a gap)', 'A tiny battery'], answer: 1,
          hint: 'Current can\'t flow straight across.',
          explain: 'An insulator. Charge collects on the plates but can\'t jump across.' },
      ],
    },
    {
      id: 'a3-2', title: 'Time constant', icon: '⏱️',
      steps: [
        { type: 'learn', title: 'τ = R × C',
          body: 'How fast a capacitor charges depends on the resistor and the [[capacitance]]:\n\n**τ = R × C** (seconds)\n\nAfter 1 τ it\'s at 63%. After 5 τ it\'s basically full. Bigger R or bigger C means slower.' },
        { type: 'bench', prompt: 'With a 1 kΩ resistor, pick the capacitor that gives τ = **2 seconds**, then close the switch and let it reach 63%.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.01, speed: 1 }, scope: scope(8), parts: [
            bat(9), sw('S', 'tl', 'tm'), res('R', 'tm', 'tr', 1000),
            rc({ c: 1e-3, choices: [1e-3, 2e-3, 4.7e-3], prop: 'c', label: 'Capacitor' }), wire('W', 'br', 'bl'),
          ] },
          goal: (s, parts) => parts.find((p) => p.id === 'C').c === 2e-3 && s.parts.C.voltage >= 5.6,
          hint: 'C = τ ÷ R = 2 ÷ 1000.',
          explain: '1000 Ω × 0.002 F = 2 s. Timers in real circuits use exactly this trick.' },
        { type: 'numeric', q: 'R = 10 kΩ and C = 100 µF. What is τ in seconds?', answer: 1, tol: 0.02, unit: 's',
          hint: '100 µF = 0.0001 F. Multiply.', explain: '10 000 × 0.0001 = 1 s.' },
        { type: 'numeric', q: 'If τ = 2 s, about how long until the capacitor is basically full?', answer: 10, tol: 0.05, unit: 's',
          hint: 'Full ≈ 5 τ.', explain: '5 × 2 = 10 s.' },
      ],
    },
    {
      id: 'a3-3', title: 'Release the charge', icon: '⚡',
      steps: [
        { type: 'learn', title: 'Stored energy',
          body: 'A charged capacitor holds energy. Connect it to something and it pushes current out, fast at first and then fading.\n\nCamera flashes charge a capacitor slowly, then dump it all at once.' },
        { type: 'bench', prompt: 'This capacitor is already charged to 9 V. **Close the switch** and watch the LED until it goes out.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.005, speed: 1 }, testSeconds: 8,
            scope: { traces: [{ part: 'C', label: 'capacitor' }], vmin: 0, vmax: 10, window: 4 }, parts: [
              { id: 'C', kind: 'capacitor', a: 'tl', b: 'bl', c: 4.7e-3, v0: 9, vmax: 9, label: '4.7 mF', labelSide: -1 },
              sw('S', 'tl', 'tr'), res('R', 'tr', 'br', 330, { labelSide: -1 }), { id: 'D', kind: 'led', a: 'br', b: 'bm' }, wire('W', 'bm', 'bl'),
            ] },
          goal: (s, parts) => parts.find((p) => p.id === 'S').closed && s.parts.C.voltage < 2.2,
          hint: 'Close the switch and wait a couple of seconds.',
          explain: 'The LED glowed with no battery at all, powered only by stored charge. Once the capacitor dropped below about 2 V, the LED switched off.' },
        { type: 'mcq', q: 'Why does a camera flash use a capacitor instead of the battery directly?',
          choices: ['Capacitors are cheaper than batteries', 'A capacitor can release its energy much faster', 'Batteries can\'t make light'], answer: 1,
          hint: 'A flash is very short and very bright.',
          explain: 'A battery can\'t deliver a huge burst. A capacitor can dump its charge in a fraction of a second.' },
      ],
    },
    {
      id: 'a3-4', title: 'Capacitors block DC', icon: '🚧',
      steps: [
        { type: 'learn', title: 'Only change gets through',
          body: 'Current flows **into** a capacitor only while its voltage is changing. Once it\'s charged, steady DC stops completely.\n\nThis turns out to be super useful in the AC unit.' },
        { type: 'bench', prompt: 'A capacitor is in series with the lamp. **Close the switch** and watch until the lamp goes dark.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.005, speed: 1 }, testSeconds: 8,
            scope: { traces: [{ part: 'C', label: 'capacitor' }], vmin: 0, vmax: 10, window: 4 }, parts: [
              bat(9), sw('S', 'tl', 'tm'), { id: 'C', kind: 'capacitor', a: 'tm', b: 'tr', c: 0.05, vmax: 9, label: '50 mF' },
              lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
            ] },
          goal: (s, parts) => parts.find((p) => p.id === 'S').closed && s.parts.C.voltage > 8 && !s.parts.L.on,
          hint: 'Close the switch and wait.',
          explain: 'The lamp flashed while the capacitor filled, then went dark. A full capacitor blocks steady DC.' },
        { type: 'mcq', q: 'A fully charged capacitor sits in a DC circuit. How much current flows through it?',
          choices: ['A lot', 'About half', 'Basically none'], answer: 2,
          hint: 'Its voltage isn\'t changing any more.',
          explain: 'No change, no current. It acts like an open switch to steady DC.' },
      ],
    },
    {
      id: 'a3-5', title: 'Farads and friends', icon: 'µ',
      steps: [
        { type: 'learn', title: 'Tiny units',
          body: 'One [[farad]] is enormous, so real capacitors use small units:\n\n**1 µF** (microfarad) = 0.000 001 F\n**1 nF** (nanofarad) = 0.000 000 001 F\n**1000 nF = 1 µF**\n\nCapacitors **in parallel add up**, like making a bigger bucket.' },
        { type: 'numeric', q: 'How many µF is 0.001 F?', answer: 1000, tol: 0.01, unit: 'µF', hint: 'Multiply by 1 000 000.', explain: '0.001 × 1 000 000 = 1000 µF.' },
        { type: 'numeric', q: 'How many nF is 4.7 µF?', answer: 4700, tol: 0.01, unit: 'nF', hint: '1 µF = 1000 nF.', explain: '4.7 × 1000 = 4700 nF.' },
        { type: 'numeric', q: 'A 100 µF and a 220 µF capacitor in parallel. Total capacitance?', answer: 320, tol: 0.01, unit: 'µF',
          hint: 'In parallel, capacitors add.', explain: '100 + 220 = 320 µF. It\'s like two buckets side by side.' },
        { type: 'mcq', q: 'An electrolytic capacitor has a stripe marking its **−** leg. What happens if you wire it backwards?',
          choices: ['Nothing', 'It can overheat or even pop', 'It charges faster'], answer: 1,
          hint: 'Some capacitors have a polarity, like LEDs.',
          explain: 'Electrolytic capacitors are polarised. Backwards, they can bulge, leak or pop. Always match the stripe to −.' },
      ],
    },
    {
      id: 'a3-6', title: 'Checkpoint: timing', icon: '🏁',
      steps: [
        { type: 'learn', title: 'Capacitors as timers',
          body: 'Pick R and C and you choose how long something takes. Blinkers, delays and debouncers all use this.' },
        { type: 'bench', prompt: 'With a 1 mF capacitor, pick the resistor that makes τ = **0.5 s**, then charge it to 63%.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.005, speed: 1 }, scope: scope(3), parts: [
            bat(9), sw('S', 'tl', 'tm'), res('R', 'tm', 'tr', 100, { choices: [100, 500, 2000], label: 'Resistor' }), rc(), wire('W', 'br', 'bl'),
          ] },
          goal: (s, parts) => parts.find((p) => p.id === 'R').r === 500 && s.parts.C.voltage >= 5.6,
          hint: 'R = τ ÷ C = 0.5 ÷ 0.001.',
          explain: '500 Ω × 0.001 F = 0.5 s.' },
        { type: 'numeric', q: 'R = 47 kΩ, C = 10 µF. What is τ in seconds?', answer: 0.47, tol: 0.02, unit: 's',
          hint: '10 µF = 0.00001 F.', explain: '47 000 × 0.00001 = 0.47 s.' },
        { type: 'mcq', q: 'You want a delay to last **longer**. What could you do?',
          choices: ['Use a bigger capacitor', 'Use a smaller resistor', 'Use a higher voltage'], answer: 0,
          hint: 'τ = R × C.',
          explain: 'A bigger C (or bigger R) makes τ longer. Voltage doesn\'t change the timing.' },
      ],
    },
  ],
};
