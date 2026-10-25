// A6 extra depth: square waves, PWM, thermistors, noise.
import { N, N3, bat, wire, res, vm } from './kit.js';

export const glossary = {
  'square wave': 'A signal that jumps between two levels, high and low, with sharp edges. Digital clocks are square waves.',
  PWM: 'Pulse-width modulation: switching power on and off very fast. The fraction of time it\'s on (the duty cycle) sets the average power.',
  'duty cycle': 'The percentage of each cycle a PWM signal spends high.',
  thermistor: 'A resistor whose resistance changes with temperature. NTC types drop in resistance as they get hotter.',
  noise: 'Random wiggles added to a signal by interference, other circuits or the sensor itself.',
};

export const lessons = [
  {
    id: 'a6-7', title: 'Square waves', icon: '⬛',
    steps: [
      { type: 'learn', title: 'High, low, high, low',
        body: 'A [[square wave]] jumps instantly between two levels. It\'s the heartbeat of every digital circuit: the clock.\n\nIts frequency works exactly like a sine wave\'s: cycles per second.' },
      { type: 'bench', prompt: 'Set the frequency so each **high** part lasts **0.25 s** (watch the 1-second screen).',
        circuit: { nodes: N, ground: 'bl', transient: { dt: 0.002, speed: 1 }, testSeconds: 4,
          scope: { traces: [{ node: 'tl', label: 'square' }], vmin: -6, vmax: 6, window: 1 }, parts: [
            { id: 'SQ', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'square', amp: 5, freq: 1 },
              slider: { label: 'Frequency', prop: 'freq', min: 1, max: 5, step: 1, fmt: 'hz' } },
            wire('W1', 'tl', 'tr'), res('R', 'tr', 'br', 1000), wire('W', 'br', 'bl'),
          ] },
        goal: (s, parts, info) => parts[0].wave.freq === 2 && info.t > 1,
        hint: 'Each cycle is one high part plus one low part.', explain: 'At 2 Hz each cycle is 0.5 s: 0.25 s high, 0.25 s low.' },
      { type: 'mcq', q: 'Which signal is a computer\'s clock?', choices: ['A sine wave', 'A square wave', 'A flat line'], answer: 1,
        hint: 'Sharp ticks.', explain: 'A square wave: each sharp edge is a tick.' },
    ],
  },
  {
    id: 'a6-8', title: 'PWM: fake analog', icon: '🎛️',
    steps: [
      { type: 'learn', title: 'Fast on-off = in-between',
        body: 'A microcontroller pin can only be 0 V or 5 V. But switch it on and off thousands of times a second and an LED or motor only feels the **average**. That\'s [[PWM]].\n\n**Average = supply × duty cycle**' },
      { type: 'numeric', q: 'A 5 V PWM signal with a 50% [[duty cycle]]. Average voltage?', answer: 2.5, tol: 0.01, unit: 'V',
        hint: '5 × 0.5', explain: '2.5 V on average, so an LED shines at about half brightness.' },
      { type: 'numeric', q: 'A 12 V motor driven with 25% duty. Average voltage?', answer: 3, tol: 0.01, unit: 'V',
        hint: '12 × 0.25', explain: '3 V, so it spins slowly.' },
      { type: 'mcq', q: 'Why use PWM instead of a resistor to dim an LED?', choices: ['The transistor is fully on or off, so almost no power is wasted as heat', 'It\'s more colourful', 'Resistors can\'t dim LEDs'], answer: 0,
        hint: 'Think about efficiency.', explain: 'A switch is either fully on (no voltage across it) or off (no current), so it wastes almost nothing.' },
    ],
  },
  {
    id: 'a6-9', title: 'Sensing temperature', icon: '🌡️',
    steps: [
      { type: 'learn', title: 'The thermistor',
        body: 'An NTC [[thermistor]]\'s resistance drops as it heats up. Put it at the top of a divider and the output **rises** with temperature.\n\nCar engines, ovens and phone batteries all watch their temperature this way.' },
      { type: 'bench', prompt: 'Heat the thermistor (lower its resistance) until the output passes **6 V**, the "too hot" alarm level.',
        circuit: { nodes: N3, ground: 'bl', parts: [
          bat(9), wire('W0', 'tl', 'tr'), res('TH', 'tr', 'mr', 50000, { slider: { label: 'Thermistor (hot → low)', min: 1000, max: 50000, step: 1000 }, labelSide: -1 }),
          res('R', 'mr', 'br', 10000, { labelSide: -1 }), wire('W', 'br', 'bl'), wire('V1', 'mr', 'vt'), wire('V2', 'br', 'vb'), vm('V', 'vt', 'vb'),
        ] },
        goal: (s) => s.parts.V.voltage > 6,
        hint: 'Hotter means lower resistance on top.', explain: 'Below about 5 kΩ the output passes 6 V. A comparator watching it could switch on a fan.' },
      { type: 'mcq', q: 'If you swapped the thermistor to the **bottom** of the divider, heating it would make the output…', choices: ['Fall', 'Rise'], answer: 0,
        hint: 'Its share of the voltage shrinks.', explain: 'Its resistance drops, so its share of the voltage drops.' },
    ],
  },
  {
    id: 'a6-10', title: 'Noise and averaging', icon: '📶',
    steps: [
      { type: 'learn', title: 'Real signals are messy',
        body: 'Real sensor readings wobble with [[noise]]. A simple fix in code: take several readings and **average** them. Random noise cancels out, and the real value stays.' },
      { type: 'numeric', q: 'Five readings: 498, 503, 501, 497, 501. What is their average?', answer: 500, tol: 0.001, unit: '',
        hint: 'Add them and divide by 5.', explain: '2500 ÷ 5 = 500.' },
      { type: 'mcq', q: 'Which helps reduce noise on a long sensor wire?', choices: ['Twisting the wires together or using shielded cable', 'Making the wire longer', 'Using a bigger battery'], answer: 0,
        hint: 'Keep interference out.', explain: 'Twisted or shielded cable picks up much less interference.' },
    ],
  },
];
