// A6 · Analog: signals, frequency, amplitude, ADCs, filters.
import { N, wire, res } from './kit.js';

export const glossary = {
  analog: 'A signal that can take any value in a range, like a dimmer or a microphone voltage.',
  digital: 'A signal with only two levels, 0 and 1 (low and high).',
  frequency: 'How many complete waves happen each second, in hertz (Hz).',
  period: 'How long one complete wave takes. Period = 1 ÷ frequency.',
  amplitude: 'How far a wave swings from its middle line to its peak.',
  'peak-to-peak': 'The full height of a wave, from its lowest point to its highest. For a sine wave it\'s 2 × amplitude.',
  ADC: 'Analog-to-Digital Converter: turns a voltage into a number a microcontroller can use.',
  filter: 'A circuit that lets some frequencies through and weakens others.',
};

const wave = (amp, freq, slider) => ({ id: 'AC', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'sine', amp, freq }, label: 'signal', slider });
const peak = (hist, k) => hist.reduce((m, h) => Math.max(m, Math.abs(h[k])), 0);

export default {
  id: 'a6',
  title: 'Analog',
  subtitle: 'Signals, scopes, ADCs and filters',
  lessons: [
    {
      id: 'a6-1', title: 'Analog vs digital', icon: '📶',
      steps: [
        { type: 'learn', title: 'Smooth or stepped',
          body: 'An [[analog]] signal can be **any** value: 2.31 V, 2.32 V and everything in between. Sound, temperature and light are analog.\n\nA [[digital]] signal has just **two** levels: 0 (low) and 1 (high). Computers think in digital.' },
        { type: 'mcq', q: 'Which of these is analog?', choices: ['A light switch (on/off)', 'The voltage from a microphone', 'A computer\'s 1s and 0s'], answer: 1,
          hint: 'Which can take any value?', explain: 'A microphone\'s voltage follows the sound smoothly, so it can be any value.' },
        { type: 'mcq', q: 'Why do computers use digital signals?',
          choices: ['Two clear levels are hard to confuse, even with noise', 'Digital wires are cheaper', 'Analog is too fast'], answer: 0,
          hint: 'Imagine a noisy signal.', explain: 'With only "low" and "high", a little noise can\'t change the meaning. That makes digital very reliable.' },
      ],
    },
    {
      id: 'a6-2', title: 'Frequency and period', icon: '🌀',
      steps: [
        { type: 'learn', title: 'How fast it wiggles',
          body: '[[frequency]] counts waves per second, in hertz (Hz). The [[period]] is the time for one wave:\n\n**period = 1 ÷ frequency**\n\nThe [[oscilloscope]] below shows exactly **1 second** across the screen.' },
        { type: 'bench', prompt: 'Set the frequency so **exactly 3 waves** fit across the 1-second screen.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.002, speed: 1 }, testSeconds: 4,
            scope: { traces: [{ node: 'tl', label: 'signal' }], vmin: -11, vmax: 11, window: 1 }, parts: [
              wave(8, 1, { label: 'Frequency', prop: 'freq', min: 1, max: 6, step: 1, fmt: 'hz' }),
              wire('W1', 'tl', 'tr'), res('R', 'tr', 'br', 1000), wire('W', 'br', 'bl'),
            ] },
          goal: (s, parts, info) => parts[0].wave.freq === 3 && info.t > 1,
          hint: '3 waves in 1 second.', explain: '3 waves per second is 3 Hz. Each wave takes 1 ÷ 3 ≈ 0.33 s.' },
        { type: 'numeric', q: 'Most of the world\'s mains power is 50 Hz. What is its period in milliseconds?', answer: 20, tol: 0.01, unit: 'ms',
          hint: '1 ÷ 50 seconds.', explain: '1 ÷ 50 = 0.02 s = 20 ms.' },
        { type: 'numeric', q: 'Saudi mains is 60 Hz. What is its period in milliseconds (to one decimal)?', answer: 16.7, tol: 0.01, unit: 'ms',
          hint: '1 ÷ 60 seconds.', explain: '1 ÷ 60 ≈ 0.0167 s = 16.7 ms.' },
      ],
    },
    {
      id: 'a6-3', title: 'How big is the wave?', icon: '📐',
      steps: [
        { type: 'learn', title: 'Amplitude',
          body: '[[amplitude]] is the distance from the middle to the peak. [[peak-to-peak]] is the full height, bottom to top: twice the amplitude.' },
        { type: 'bench', prompt: 'Set the amplitude so the wave is **12 V peak-to-peak**.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.002, speed: 1 }, testSeconds: 4,
            scope: { traces: [{ node: 'tl', label: 'signal' }], vmin: -11, vmax: 11, window: 1 }, parts: [
              wave(2, 2, { label: 'Amplitude', prop: 'amp', min: 1, max: 10, step: 1, fmt: 'v' }),
              wire('W1', 'tl', 'tr'), res('R', 'tr', 'br', 1000), wire('W', 'br', 'bl'),
            ] },
          goal: (s, parts, info) => parts[0].wave.amp === 6 && info.t > 0.5,
          hint: 'Peak-to-peak = 2 × amplitude.', explain: 'An amplitude of 6 V swings from −6 V to +6 V: 12 V peak-to-peak.' },
        { type: 'numeric', q: 'A sine wave swings between −12 V and +12 V. Peak-to-peak voltage?', answer: 24, tol: 0.01, unit: 'V',
          hint: 'Bottom to top.', explain: '12 − (−12) = 24 V.' },
      ],
    },
    {
      id: 'a6-4', title: 'From voltage to numbers', icon: '🔢',
      steps: [
        { type: 'learn', title: 'The ADC',
          body: 'Microcontrollers like Arduino read sensors with an [[ADC]]. It chops the voltage range into steps and gives back a number.\n\nA **10-bit** ADC has 2¹⁰ = **1024** steps. On a 5 V Arduino, 0 V reads **0** and 5 V reads **1023**.' },
        { type: 'numeric', q: 'A 10-bit ADC on 5 V reads 512. About what voltage is that?', answer: 2.5, tol: 0.02, unit: 'V',
          hint: '512 is about half of 1024.', explain: '512 ÷ 1024 × 5 ≈ 2.5 V.' },
        { type: 'numeric', q: 'How many millivolts is one step of a 10-bit ADC on 5 V?', answer: 4.9, tol: 0.03, unit: 'mV',
          hint: '5 V ÷ 1024 steps.', explain: '5 ÷ 1024 ≈ 0.0049 V = 4.9 mV. Smaller changes can\'t be seen.' },
        { type: 'mcq', q: 'An 8-bit ADC has how many steps?', choices: ['8', '256', '1024'], answer: 1,
          hint: '2 to the power of 8.', explain: '2⁸ = 256 steps, so it\'s coarser than 10-bit.' },
      ],
    },
    {
      id: 'a6-5', title: 'Filters', icon: '🧹',
      steps: [
        { type: 'learn', title: 'Keep the slow, drop the fast',
          body: 'A resistor feeding a capacitor makes a **low-pass** [[filter]]. Slow signals get through. Fast ones get smoothed away, because the capacitor can\'t charge and discharge in time.\n\nUsed to clean noise off sensor readings.' },
        { type: 'bench', prompt: 'Raise the frequency until the filter\'s output (blue) is **less than a third** as tall as the input.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.001, speed: 1 }, testSeconds: 4,
            scope: { traces: [{ node: 'tl', label: 'in' }, { node: 'tr', label: 'out' }], vmin: -9, vmax: 9, window: 1 }, parts: [
              wave(8, 1, { label: 'Frequency', prop: 'freq', min: 1, max: 12, step: 1, fmt: 'hz' }),
              res('R', 'tl', 'tr', 1000), { id: 'C', kind: 'capacitor', a: 'tr', b: 'br', c: 1e-4, vmax: 8 }, wire('W', 'br', 'bl'),
            ] },
          goal: (s, parts, info) => info.t > 1.1 && peak(info.history, 2) < 8 / 3,
          hint: 'Faster waves get squashed more.', explain: 'At higher frequencies the capacitor never has time to fill, so the output stays small. Your speakers\' crossovers work like this.' },
        { type: 'mcq', q: 'A temperature sensor\'s reading jitters quickly up and down. What helps?',
          choices: ['A low-pass filter', 'A bigger battery', 'A faster ADC'], answer: 0,
          hint: 'The real temperature changes slowly.', explain: 'A low-pass filter removes the fast jitter and keeps the slow real change.' },
      ],
    },
    {
      id: 'a6-6', title: 'Checkpoint: signals', icon: '🏁',
      steps: [
        { type: 'learn', title: 'Reading signals',
          body: 'Frequency, period, amplitude, ADC steps and filters. That\'s how engineers describe any signal.' },
        { type: 'bench', prompt: 'Make a **4 Hz** wave with an amplitude of **5 V**.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.002, speed: 1 }, testSeconds: 4,
            scope: { traces: [{ node: 'tl', label: 'signal' }], vmin: -11, vmax: 11, window: 1 }, parts: [
              { id: 'AC', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'sine', amp: 2, freq: 1 }, label: 'signal',
                choices: [1, 2, 4, 8], prop: 'freq', fmt: 'hz', slider: { label: 'Amplitude', prop: 'amp', min: 1, max: 10, step: 1, fmt: 'v' } },
              wire('W1', 'tl', 'tr'), res('R', 'tr', 'br', 1000), wire('W', 'br', 'bl'),
            ] },
          goal: (s, parts, info) => parts[0].wave.freq === 4 && parts[0].wave.amp === 5 && info.t > 0.5,
          hint: 'Pick 4 Hz on the chips and slide amplitude to 5 V.', explain: 'Four waves per second, each peaking at 5 V.' },
        { type: 'numeric', q: 'A wave has a period of 0.5 s. What is its frequency?', answer: 2, tol: 0.01, unit: 'Hz',
          hint: 'frequency = 1 ÷ period', explain: '1 ÷ 0.5 = 2 Hz.' },
        { type: 'mcq', q: 'An Arduino\'s ADC reads 1023 from a sensor. What does that mean?',
          choices: ['The sensor is at (or above) 5 V', 'The sensor is at 0 V', 'The sensor is broken'], answer: 0,
          hint: '1023 is the top of a 10-bit range.', explain: '1023 is the maximum reading, meaning 5 V or more.' },
      ],
    },
  ],
};
