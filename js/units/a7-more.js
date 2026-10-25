// A7 extra depth: high-pass filters, resonance, the grid, home wiring safety.
import { N, wire, res, lamp } from './kit.js';

export const glossary = {
  'high-pass filter': 'A capacitor followed by a resistor to ground. It blocks slow signals and passes fast ones.',
  resonance: 'The frequency where an inductor and capacitor cancel each other out, letting the most current flow.',
  'three-phase': 'Power delivered on three wires whose waves are a third of a cycle apart. It\'s smoother and is used by factories and the grid.',
  earth: 'The safety wire connected to the ground. If a fault makes a metal case live, current flows to earth and trips the breaker.',
  RCD: 'Residual-current device: a safety switch that cuts power in milliseconds if current leaks somewhere it shouldn\'t, like through a person.',
};

const peak = (hist, k) => hist.reduce((m, h) => Math.max(m, Math.abs(h[k])), 0);

export const lessons = [
  {
    id: 'a7-7', title: 'High-pass filters', icon: '⬆️',
    steps: [
      { type: 'learn', title: 'Keep the fast, drop the slow',
        body: 'Swap the resistor and capacitor of a low-pass filter and you get a [[high-pass filter]]. Slow signals are blocked and fast ones pass.\n\nUsed to remove a steady offset, or the rumble from audio.' },
      { type: 'bench', prompt: 'Raise the frequency until the output (blue) is **more than 75%** as tall as the input.',
        circuit: { nodes: N, ground: 'bl', transient: { dt: 0.001, speed: 1 }, testSeconds: 4,
          scope: { traces: [{ node: 'tl', label: 'in' }, { node: 'tr', label: 'out' }], vmin: -9, vmax: 9, window: 1 }, parts: [
            { id: 'AC', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'sine', amp: 8, freq: 1 },
              slider: { label: 'Frequency', prop: 'freq', min: 1, max: 10, step: 1, fmt: 'hz' } },
            { id: 'C', kind: 'capacitor', a: 'tl', b: 'tr', c: 1e-4, label: '100 µF', vmax: 8 }, res('R', 'tr', 'br', 1000), wire('W', 'br', 'bl'),
          ] },
        goal: (s, parts, info) => info.t > 1.1 && peak(info.history, 2) > 6,
        hint: 'Higher frequencies pass this one.', explain: 'Above a few hertz the capacitor barely resists, so nearly the whole signal gets through.' },
      { type: 'mcq', q: 'Which filter removes slow drift but keeps quick changes?', choices: ['High-pass', 'Low-pass'], answer: 0,
        hint: 'Keeps the high frequencies.', explain: 'High-pass lets fast changes through and blocks slow ones.' },
    ],
  },
  {
    id: 'a7-8', title: 'Resonance', icon: '🔔',
    steps: [
      { type: 'learn', title: 'When coil and capacitor cancel',
        body: 'An inductor blocks fast AC and a capacitor blocks slow AC. At one special frequency their effects **cancel exactly**: [[resonance]].\n\n**f = 1 ÷ (2π √(L × C))**\n\nRadios tune to a station by moving their resonance.' },
      { type: 'bench', prompt: 'A 1 H coil and a 100 µF capacitor feed the lamp. Tune the frequency until the lamp current peaks **above 0.45 A**.',
        circuit: { nodes: { ...N, tm: [160, 40] }, ground: 'bl', transient: { dt: 0.0002, speed: 1 }, testSeconds: 6,
          scope: { traces: [{ part: 'L', field: 'current', label: 'lamp current' }], vmin: -0.6, vmax: 0.6, window: 0.5 }, parts: [
            { id: 'AC', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'sine', amp: 10, freq: 5 },
              slider: { label: 'Frequency', prop: 'freq', min: 2, max: 30, step: 1, fmt: 'hz' } },
            { id: 'IND', kind: 'inductor', a: 'tl', b: 'tm', l: 1 }, { id: 'C', kind: 'capacitor', a: 'tm', b: 'tr', c: 1e-4, label: '100 µF', vmax: 10 },
            lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
          ] },
        goal: (s, parts, info) => info.t > 1 && peak(info.history, 1) > 0.45,
        hint: 'f = 1 ÷ (2π × √(1 × 0.0001)) ≈ 16 Hz.', explain: 'At about 16 Hz the coil and capacitor cancel, so only the lamp limits the current. Away from it, the current collapses.' },
      { type: 'numeric', q: 'L = 1 H and C = 100 µF. Resonant frequency in Hz (nearest whole number)?', answer: 16, tol: 0.03, unit: 'Hz',
        hint: '1 ÷ (2π × 0.01)', explain: '√(0.0001) = 0.01, so 1 ÷ 0.0628 ≈ 15.9 Hz.' },
    ],
  },
  {
    id: 'a7-9', title: 'The power grid', icon: '🗼',
    steps: [
      { type: 'learn', title: 'From power station to plug',
        body: 'Power stations make [[three-phase]] AC. Transformers step it up to hundreds of thousands of volts for long lines, then down in stages to 230 V for homes.\n\nThe grid must balance supply and demand every second, or the frequency drifts away from 60 Hz.' },
      { type: 'mcq', q: 'Why does the grid use three phases instead of one?', choices: ['Power flows more smoothly and needs less copper for the same power', 'It looks nicer', 'For three different countries'], answer: 0,
        hint: 'Three overlapping waves.', explain: 'The phases overlap, so power never drops to zero, and big motors run smoothly.' },
      { type: 'mcq', q: 'If everyone switches on air conditioners at once and supply can\'t keep up, the grid frequency…', choices: ['Drops a little', 'Rises', 'Stays exactly 60 Hz'], answer: 0,
        hint: 'Generators slow under heavy load.', explain: 'It dips slightly, which tells power stations to produce more.' },
    ],
  },
  {
    id: 'a7-10', title: 'Live, neutral, earth', icon: '🏠',
    steps: [
      { type: 'learn', title: 'Wires in your walls',
        body: '• **Live** carries the 230 V AC. Dangerous.\n• **Neutral** is the return path.\n• **[[earth]]** is a safety wire to the ground, joined to metal cases.\n\nAn [[RCD]] compares live and neutral. If they differ even slightly, current is leaking somewhere (maybe through a person), and it cuts the power in milliseconds.' },
      { type: 'mcq', q: 'A washing machine\'s metal case becomes live due to a fault. What protects you?', choices: ['The earth wire carries the fault current away and trips the breaker', 'The plastic buttons', 'Nothing'], answer: 0,
        hint: 'The safety wire.', explain: 'Earth gives the fault an easy path, which trips the breaker or RCD.' },
      { type: 'mcq', q: 'An RCD trips when…', choices: ['Live and neutral currents don\'t match', 'You use too many lamps', 'It\'s night'], answer: 0,
        hint: 'Residual current.', explain: 'A mismatch means current is escaping, possibly through someone, so it cuts the power instantly.' },
    ],
  },
];
