// A3 extra depth: discharging, combining capacitors, energy, timers, decoupling.
import { N, bat, wire, res, sw } from './kit.js';

export const glossary = {
  '555 timer': 'A famous little chip that uses a capacitor charging and discharging to make blinks, beeps and delays.',
  'decoupling capacitor': 'A small capacitor right next to a chip\'s power pins. It supplies quick bursts of current and soaks up noise.',
};

const cap = (id, a, b, c, extra = {}) => ({ id, kind: 'capacitor', a, b, c, vmax: 9, ...extra });

export const lessons = [
  {
    id: 'a3-7', title: 'Discharging', icon: '📉',
    steps: [
      { type: 'learn', title: 'The curve in reverse',
        body: 'A capacitor discharging through a resistor follows the same curve, upside down. After **one τ** it has **37%** of its voltage left. After 5 τ it\'s basically empty.' },
      { type: 'bench', prompt: 'The capacitor holds 9 V. **Close the switch** and let it discharge to **37%** (about 3.3 V).',
        circuit: { nodes: N, ground: 'bl', transient: { dt: 0.005, speed: 1 }, testSeconds: 6,
          scope: { traces: [{ part: 'C', label: 'capacitor' }], vmin: 0, vmax: 10, window: 4 }, parts: [
            cap('C', 'tl', 'bl', 1e-3, { v0: 9, label: '1 mF', labelSide: -1 }), sw('S', 'tl', 'tr'), res('R', 'tr', 'br', 1000), wire('W', 'br', 'bl'),
          ] },
        goal: (s, parts) => parts.find((p) => p.id === 'S').closed && s.parts.C.voltage <= 3.4,
        hint: 'Close the switch and wait about a second.', explain: '1 kΩ × 1 mF = 1 s. After one second, 37% remains.' },
      { type: 'numeric', q: 'A capacitor at 10 V discharges. Roughly what voltage is left after one τ?', answer: 3.7, tol: 0.03, unit: 'V',
        hint: '37%', explain: '37% of 10 V ≈ 3.7 V.' },
    ],
  },
  {
    id: 'a3-8', title: 'Combining capacitors', icon: '🧱',
    steps: [
      { type: 'learn', title: 'Opposite to resistors',
        body: 'Capacitors combine the **opposite** way to resistors:\n\n• **Parallel: add up** (a bigger bucket)\n• **Series: product over sum** (a smaller total)\n\nMore capacitance means a longer τ.' },
      { type: 'bench', prompt: 'Close **S2** to put a second 1 mF capacitor in parallel, then **S1** to charge. Wait for 63%.',
        circuit: { nodes: { ...N, xr: [310, 40], xb: [310, 180] }, view: '0 0 330 220', ground: 'bl', transient: { dt: 0.01, speed: 1 }, testSeconds: 6,
          scope: { traces: [{ part: 'C1', label: 'capacitors' }], vmin: 0, vmax: 10, window: 5 }, parts: [
            bat(9), sw('S1', 'tl', 'tm'), res('R', 'tm', 'tr', 1000), cap('C1', 'tr', 'br', 1e-3, { label: '1 mF each' }),
            sw('S2', 'tr', 'xr'), cap('C2', 'xr', 'xb', 1e-3, { label: '' }), wire('W1', 'xb', 'br'), wire('W', 'br', 'bl'),
          ] },
        goal: (s, parts) => parts.find((p) => p.id === 'S2').closed && s.parts.C1.voltage >= 5.6,
        hint: 'Both switches closed, then wait about 2 seconds.', explain: '2 mF in total doubles τ to 2 s. Paralleled capacitors are a bigger bucket.' },
      { type: 'numeric', q: 'Two 100 µF capacitors in **series**. Total capacitance?', answer: 50, tol: 0.01, unit: 'µF',
        hint: 'Product over sum.', explain: '10 000 ÷ 200 = 50 µF.' },
    ],
  },
  {
    id: 'a3-9', title: 'Stored energy', icon: '💥',
    steps: [
      { type: 'learn', title: 'E = ½ C V²',
        body: 'The energy in a charged capacitor is:\n\n**E = ½ × C × V²** (joules)\n\nDoubling the voltage stores **four times** the energy. That\'s why big high-voltage capacitors are dangerous even when unplugged.' },
      { type: 'numeric', q: 'A 1 mF capacitor is charged to 10 V. Energy in joules?', answer: 0.05, tol: 0.02, unit: 'J',
        hint: '½ × 0.001 × 100', explain: '0.5 × 0.001 × 100 = 0.05 J.' },
      { type: 'numeric', q: 'The same capacitor at 20 V. Energy?', answer: 0.2, tol: 0.02, unit: 'J',
        hint: 'V doubled, so energy ×4.', explain: '0.5 × 0.001 × 400 = 0.2 J, four times as much.' },
      { type: 'mcq', q: 'Why are old TVs and microwaves dangerous to open even when unplugged?', choices: ['Their capacitors can still hold a deadly charge', 'They\'re heavy', 'Glass can break'], answer: 0,
        hint: 'Stored energy.', explain: 'High-voltage capacitors can hold a dangerous charge long after unplugging.' },
    ],
  },
  {
    id: 'a3-10', title: 'Blinkers and the 555', icon: '⏰',
    steps: [
      { type: 'learn', title: 'Charge, discharge, repeat',
        body: 'A [[555 timer]] chip charges a capacitor to ⅔ of the supply, then discharges it to ⅓, over and over. Its output flips each time, so an LED blinks.\n\nBlink rate ≈ **1.44 ÷ ((R1 + 2·R2) × C)**' },
      { type: 'numeric', q: 'R1 = 1 kΩ, R2 = 10 kΩ, C = 10 µF. Blink frequency (Hz, one decimal)?', answer: 6.9, tol: 0.03, unit: 'Hz',
        hint: '1.44 ÷ (21 000 × 0.00001)', explain: '1.44 ÷ 0.21 ≈ 6.9 Hz.' },
      { type: 'mcq', q: 'You want the 555 to blink **slower**. Change C to…', choices: ['A bigger capacitor', 'A smaller capacitor'], answer: 0,
        hint: 'Bigger bucket, longer to fill.', explain: 'A bigger C takes longer to charge and discharge, so it blinks slower.' },
    ],
  },
  {
    id: 'a3-11', title: 'Little helpers by every chip', icon: '🛟',
    steps: [
      { type: 'learn', title: 'Decoupling',
        body: 'Chips draw current in sudden bursts. The long wires from the battery can\'t respond fast enough, so the voltage dips.\n\nA small [[decoupling capacitor]] (often 100 nF) right next to each chip supplies those bursts instantly.' },
      { type: 'mcq', q: 'Where should a decoupling capacitor go?', choices: ['As close to the chip\'s power pins as possible', 'Next to the battery', 'Anywhere'], answer: 0,
        hint: 'It needs to be quick.', explain: 'Right at the chip, so the burst doesn\'t have to travel down a long wire.' },
      { type: 'mcq', q: 'An Arduino project resets randomly when a motor starts. A likely fix?', choices: ['Add capacitors on the power rails', 'Use a longer wire', 'Paint it'], answer: 0,
        hint: 'The motor makes the voltage dip.', explain: 'Capacitors (plus a good supply) smooth the dip so the microcontroller doesn\'t brown out.' },
    ],
  },
];
