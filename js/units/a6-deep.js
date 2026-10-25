// A6 deep practice: concepts, drills and bench challenges, inserted before the checkpoint.
import { N, wire, res } from './kit.js';
import { drill, mcq, num, period, freq, adc, pwm, cutoff } from './drill.js';

export const glossary = {
  decibel: 'A log scale for comparing signal levels. +10 dB = 10× the power; +6 dB ≈ 2× the voltage.',
  DAC: 'Digital-to-Analog Converter: turns a number into a voltage. The opposite of an ADC.',
  accelerometer: 'A sensor that measures acceleration and tilt. It\'s why your phone knows which way is up.',
};

const peak = (hist, k) => hist.reduce((m, h) => Math.max(m, Math.abs(h[k])), 0);

export const lessons = [
  {
    id: 'a6-11', title: 'Challenge: five waves', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Scope challenge', body: 'The screen shows **1 second**. Make **5 complete waves** fit.' },
      { type: 'bench', prompt: 'Set the frequency so exactly **5 waves** fit on screen.',
        circuit: { nodes: N, ground: 'bl', transient: { dt: 0.002, speed: 1 }, testSeconds: 4,
          scope: { traces: [{ node: 'tl', label: 'signal' }], vmin: -11, vmax: 11, window: 1 }, parts: [
            { id: 'AC', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'sine', amp: 8, freq: 1 },
              slider: { label: 'Frequency', prop: 'freq', min: 1, max: 10, step: 1, fmt: 'hz' } },
            wire('W1', 'tl', 'tr'), res('R', 'tr', 'br', 1000), wire('W', 'br', 'bl'),
          ] },
        goal: (s, parts, info) => parts[0].wave.freq === 5 && info.t > 1,
        hint: '5 waves in 1 second.', explain: '5 Hz: each wave takes 0.2 s.' },
      period(5),
    ],
  },
  {
    id: 'a6-12', title: 'Challenge: filter out 10 Hz', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Pick the filter capacitor', body: 'A 10 Hz wobble is spoiling a slow sensor signal. Choose the low-pass capacitor (R = 1 kΩ) that squashes it to **under a quarter** of its size.' },
      { type: 'bench', prompt: 'Pick C so the 10 Hz output (blue) is **less than ¼** of the input.',
        circuit: { nodes: N, ground: 'bl', transient: { dt: 0.001, speed: 1 }, testSeconds: 4,
          scope: { traces: [{ node: 'tl', label: 'in' }, { node: 'tr', label: 'out' }], vmin: -9, vmax: 9, window: 0.5 }, parts: [
            { id: 'AC', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'sine', amp: 8, freq: 10 }, label: '' },
            res('R', 'tl', 'tr', 1000), { id: 'C', kind: 'capacitor', a: 'tr', b: 'br', c: 1e-6, choices: [1e-6, 1e-5, 1e-4], prop: 'c', label: 'Capacitor', vmax: 8 },
            wire('W', 'br', 'bl'),
          ] },
        goal: (s, parts, info) => info.t > 0.8 && peak(info.history, 2) < 2,
        hint: 'You need a cutoff well below 10 Hz: bigger C.', explain: '100 µF puts the cutoff near 1.6 Hz, so 10 Hz is cut to about a sixth.' },
      cutoff(1000, 0.0001, '100 µF'),
    ],
  },
  {
    id: 'a6-13', title: 'Decibels', icon: '🔊',
    steps: [
      { type: 'learn', title: 'Measuring ratios',
        body: 'Signals span huge ranges, so engineers use [[decibel]]s:\n\n• **+3 dB** ≈ double the power\n• **+10 dB** = 10× the power\n• **+20 dB** = 10× the voltage\n• **−6 dB** ≈ half the voltage' },
      num('An amplifier makes the power 100 times bigger. How many dB?', 20, 'dB', '10 dB per ×10 power.', '×10 → 10 dB, and ×10 again → 20 dB.'),
      mcq('A filter output is "−3 dB" at its cutoff. That means the power is…', ['About half', 'Doubled', 'Zero'], 0, '−3 dB ≈ half power.', 'About half. That\'s the standard definition of the cutoff frequency.'),
      num('A voltage gain of 10× is how many dB?', 20, 'dB', 'Voltage: 20 dB per ×10.', '20 dB.'),
    ],
  },
  {
    id: 'a6-14', title: 'Sensor zoo', icon: '🦎',
    steps: [
      { type: 'learn', title: 'Turning the world into volts',
        body: '• **LDR**: light → resistance\n• **Thermistor**: temperature → resistance\n• **Potentiometer**: position → voltage\n• **Microphone**: sound → tiny AC voltage\n• **[[accelerometer]]**: tilt and motion → voltage or digital data\n\nMost need a divider or an amplifier before an ADC reads them.' },
      mcq('Which sensor would detect a phone being turned sideways?', ['Accelerometer', 'LDR', 'Thermistor'], 0, 'Tilt.', 'The accelerometer senses which way gravity pulls.'),
      mcq('A microphone\'s signal is only a few millivolts. Before the ADC it needs…', ['An amplifier', 'A fuse', 'A bigger battery'], 0, 'Make it bigger.', 'An amplifier boosts it to use the ADC\'s full range.'),
      mcq('Which sensor is just a variable resistor turned by a knob?', ['Potentiometer', 'Accelerometer', 'Microphone'], 0, 'Volume knob.', 'A potentiometer.'),
    ],
  },
  {
    id: 'a6-15', title: 'From numbers back to voltage', icon: '🔁',
    steps: [
      { type: 'learn', title: 'The DAC',
        body: 'A [[DAC]] does the opposite of an ADC: a number in, a voltage out. Speakers in phones are driven by DACs.\n\nA cheap trick: PWM followed by a low-pass filter smooths into a steady average voltage, a "poor man\'s DAC".' },
      num('An 8-bit DAC on 5 V is given 128. About what voltage comes out?', 2.5, 'V', '128 ÷ 256 × 5', 'About 2.5 V, half way.', 0.03),
      mcq('Why does PWM + a low-pass filter give a steady voltage?', ['The filter averages the fast pulses', 'The filter adds voltage', 'PWM is already steady'], 0, 'Remember filters.', 'The filter blocks the fast switching and keeps the average.'),
    ],
  },
  drill('a6-16', 'Practice: period and frequency', '🧮', '**Period = 1 ÷ f** and **f = 1 ÷ period**.', [
    period(50), period(1000), freq(20), freq(2), freq(0.5),
  ]),
  drill('a6-17', 'Practice: ADC readings', '🧮', 'Voltage = reading ÷ 2^bits × Vref.', [
    adc(10, 5, 256), adc(10, 3.3, 512), adc(8, 5, 64), adc(12, 3.3, 2048),
  ]),
  drill('a6-18', 'Practice: PWM', '🧮', 'Average = supply × duty cycle.', [
    pwm(5, 50), pwm(5, 20), pwm(12, 75), pwm(3.3, 10),
  ]),
  drill('a6-19', 'Practice: filter cutoffs', '🧮', '**fc = 1 ÷ (2π R C)**: below it passes, above it\'s cut (for low-pass).', [
    cutoff(1000, 0.000001, '1 µF'), cutoff(10000, 0.0000001, '100 nF'), cutoff(1000, 0.0001, '100 µF'), cutoff(4700, 0.00000001, '10 nF'),
  ]),
  {
    id: 'a6-20', title: 'Review: signals', icon: '🧠',
    steps: [
      { type: 'learn', title: 'Signal sense', body: 'Mixed questions on everything in Analog.' },
      mcq('Which wave has sharp jumps between two levels?', ['Square', 'Sine', 'Triangle'], 0, 'Clock signals.', 'A square wave.'),
      mcq('A 12-bit ADC has how many steps?', ['4096', '1024', '256'], 0, '2¹²', '2¹² = 4096 steps.'),
      mcq('To remove fast noise from a slow sensor, use a…', ['Low-pass filter', 'High-pass filter', 'Bigger LED'], 0, 'Keep the slow.', 'Low-pass keeps slow changes and removes fast noise.'),
      mcq('Duty cycle 100% on 5 V gives an average of…', ['5 V', '2.5 V', '0 V'], 0, 'Always on.', 'Always on means 5 V.'),
    ],
  },
];
