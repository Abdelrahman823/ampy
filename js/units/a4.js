// A4 · Diodes: one-way valves, forward voltage, protection, zeners, rectifiers.
import { N, N3, bat, wire, res, lamp, vm, am, near } from './kit.js';

export const glossary = {
  diode: 'A one-way valve for current. It conducts from anode to cathode (the way the triangle points) and blocks the other way.',
  'forward voltage': 'The voltage a diode needs before it conducts: about 0.7 V for a silicon diode, about 2 V for a red LED.',
  'zener diode': 'A diode designed to conduct backwards at an exact voltage, used to hold a voltage steady.',
  AC: 'Alternating current: the voltage swings positive and negative over and over, like the wall socket.',
  DC: 'Direct current: the voltage stays one polarity, like a battery.',
  rectifier: 'A circuit that turns AC into DC using diodes.',
  ripple: 'The leftover wobble on a DC voltage made from AC.',
};

const ac = (amp = 10, freq = 2, extra = {}) => ({ id: 'AC', kind: 'battery', a: 'tl', b: 'bl', v: 0, rInt: 0.01, wave: { type: 'sine', amp, freq }, label: `${amp} V AC`, ...extra });
const minMax = (hist, idx) => {
  let lo = Infinity, hi = -Infinity;
  for (const h of hist) { lo = Math.min(lo, h[idx]); hi = Math.max(hi, h[idx]); }
  return [lo, hi];
};
const NS = { ...N, mm: [160, 110] };

export default {
  id: 'a4',
  title: 'Diodes',
  subtitle: 'One-way valves, zeners and rectifiers',
  lessons: [
    {
      id: 'a4-1', title: 'A one-way valve', icon: '➡️',
      steps: [
        { type: 'learn', title: 'Current goes one way',
          body: 'A [[diode]] lets current through in one direction only, the way its triangle points. The bar is the **cathode**: current leaves through it.\n\nYou\'ve already met one kind: the [[LED]].' },
        { type: 'bench', prompt: 'The diode is blocking the lamp. **Tap the diode** to turn it around.',
          circuit: { nodes: N, ground: 'bl', parts: [
            bat(9), { id: 'D', kind: 'diode', a: 'tr', b: 'tl', tap: 'flip', label: 'diode' }, lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
          ] },
          goal: (s) => s.parts.L.on,
          hint: 'The triangle should point away from the + end.',
          explain: 'Pointing with the current, the diode conducts. Backwards, it\'s like an open switch.' },
        { type: 'mcq', q: 'In a diode symbol, which way can current flow?',
          choices: ['The way the triangle points', 'Into the bar from both sides', 'Either way'], answer: 0,
          hint: 'The triangle is an arrow.', explain: 'The triangle is an arrow showing the allowed direction.' },
      ],
    },
    {
      id: 'a4-2', title: 'The 0.7 V toll', icon: '🎫',
      steps: [
        { type: 'learn', title: 'Forward voltage',
          body: 'A diode doesn\'t conduct the moment you push it forward. It needs its [[forward voltage]] first:\n\n• silicon diode: about **0.7 V**\n• red LED: about **2 V**\n\nAfter that, it passes current and keeps roughly that voltage across itself.' },
        { type: 'bench', prompt: 'Slowly raise the supply until the ammeter shows **more than 5 mA**. Watch when current starts.',
          circuit: { nodes: N, ground: 'bl', parts: [
            bat(0, { slider: { label: 'Supply', prop: 'v', min: 0, max: 3, step: 0.1, fmt: 'v' } }),
            res('R', 'tl', 'tm', 100), am('A', 'tm', 'tr'), { id: 'D', kind: 'diode', a: 'tr', b: 'br', label: 'diode' }, wire('W', 'br', 'bl'),
          ] },
          goal: (s) => s.parts.A.current > 0.005,
          hint: 'Nothing happens below about 0.7 V.',
          explain: 'Below 0.7 V: nothing. Above it, current rises quickly. The diode "costs" about 0.7 V to pass.' },
        { type: 'numeric', q: '5 V supply, a silicon diode and a 430 Ω resistor in series. How much current flows, in mA?',
          answer: 10, tol: 0.03, unit: 'mA', hint: 'Subtract the diode\'s 0.7 V first, then I = V ÷ R.',
          explain: '(5 − 0.7) ÷ 430 = 0.01 A = 10 mA.' },
      ],
    },
    {
      id: 'a4-3', title: 'Backwards-battery protection', icon: '🛡️',
      steps: [
        { type: 'learn', title: 'A cheap bodyguard',
          body: 'Put a battery in backwards and many circuits are damaged. A single diode in series blocks the wrong-way current, so nothing gets hurt.' },
        { type: 'bench', prompt: 'Someone put the battery in backwards, but the diode protected the motor. **Tap the battery** to fix it.',
          circuit: { nodes: N, ground: 'bl', parts: [
            { id: 'B', kind: 'battery', a: 'bl', b: 'tl', v: 6, rInt: 0.05, tap: 'flip', label: 'battery' },
            { id: 'D', kind: 'diode', a: 'tl', b: 'tr', label: 'protection' }, { id: 'M', kind: 'motor', a: 'tr', b: 'br', r: 12, ratedW: 2 },
            wire('W', 'br', 'bl'),
          ] },
          goal: (s) => s.parts.M.on,
          hint: 'Tap the battery on the left.',
          explain: 'Backwards, the diode blocked everything. The right way round, the motor spins and the diode only costs 0.7 V.' },
        { type: 'mcq', q: 'What\'s the downside of a protection diode?',
          choices: ['It wastes about 0.7 V', 'It makes the battery last forever', 'It doubles the current'], answer: 0,
          hint: 'Remember the toll.', explain: 'It always drops about 0.7 V, which is a small price for safety.' },
      ],
    },
    {
      id: 'a4-4', title: 'Zener: hold that voltage', icon: '📌',
      steps: [
        { type: 'learn', title: 'Breaking down on purpose',
          body: 'A [[zener diode]] is wired **backwards** on purpose. Below its zener voltage it blocks. Above it, it conducts just enough to hold the voltage at that level.\n\nThat makes a simple voltage regulator.' },
        { type: 'bench', prompt: 'A 5.1 V zener guards the output. Turn the supply **up to 12 V or more** and check the voltmeter.',
          circuit: { nodes: N3, ground: 'bl', parts: [
            bat(7, { slider: { label: 'Supply', prop: 'v', min: 6, max: 15, step: 1, fmt: 'v' } }),
            res('R', 'tl', 'tr', 220), wire('W0', 'tr', 'mr'), { id: 'Z', kind: 'zener', a: 'br', b: 'mr', vz: 5.1, labelSide: -1 },
            wire('W', 'br', 'bl'), wire('V1', 'mr', 'vt'), wire('V2', 'br', 'vb'), vm('V', 'vt', 'vb'),
          ] },
          goal: (s, parts) => parts.find((p) => p.id === 'B').v >= 12 && near(s.parts.V.voltage, 5.1, 0.2),
          hint: 'The slider is under the circuit.',
          explain: 'The supply changed, but the output stayed at about 5.1 V. The extra voltage is dropped across the resistor instead.' },
        { type: 'numeric', q: '9 V supply, 220 Ω resistor, 5.1 V zener. How much current flows through the resistor, in mA?',
          answer: 17.7, tol: 0.03, unit: 'mA', hint: 'The resistor has 9 − 5.1 V across it.', explain: '3.9 ÷ 220 ≈ 0.0177 A = 17.7 mA.' },
      ],
    },
    {
      id: 'a4-5', title: 'AC to DC', icon: '〰️',
      steps: [
        { type: 'learn', title: 'Taming the wiggle',
          body: '[[AC]] swings positive, then negative, over and over. Electronics usually need [[DC]].\n\nA diode only passes one half of each swing. That\'s a half-wave [[rectifier]].' },
        { type: 'bench', prompt: 'The diode is backwards, so the output shows the **bottom** halves. **Flip it** so the output keeps only the **top** halves.',
          circuit: { nodes: N, ground: 'bl', transient: { dt: 0.004, speed: 1 }, testSeconds: 8,
            scope: { traces: [{ node: 'tl', label: 'AC in' }, { node: 'tr', label: 'output' }], vmin: -11, vmax: 11, window: 2 }, parts: [
              ac(10, 2), { id: 'D', kind: 'diode', a: 'tr', b: 'tl', tap: 'flip', label: 'diode' },
              res('R', 'tr', 'br', 1000), wire('W', 'br', 'bl'),
            ] },
          goal: (s, parts, info) => {
            if (info.history.length < 200) return false;
            const [lo, hi] = minMax(info.history, 2);
            return lo > -0.3 && hi > 8;
          },
          hint: 'Tap the diode, then watch the scope for a couple of seconds.',
          explain: 'Now only the positive halves come through. It\'s DC (never negative), but very bumpy.' },
        { type: 'mcq', q: 'A **bridge rectifier** uses four diodes. What does it do better than one diode?',
          choices: ['It flips the negative halves up instead of throwing them away', 'It makes AC faster', 'It stores energy'], answer: 0,
          hint: 'One diode wastes half the wave.', explain: 'A bridge steers both halves the same way, so no half is wasted.' },
      ],
    },
    {
      id: 'a4-6', title: 'Smooth it out', icon: '🌊',
      steps: [
        { type: 'learn', title: 'Capacitor to the rescue',
          body: 'Put a capacitor across the output. It fills up on each peak and feeds the load in the gaps. What\'s left is a small wobble called [[ripple]].\n\nBigger capacitor, smaller ripple.' },
        { type: 'bench', prompt: '**Close the switch** to add a smoothing capacitor, then pick a value big enough that the output **never drops below 7 V**.',
          circuit: { nodes: NS, ground: 'bl', transient: { dt: 0.004, speed: 1 }, testSeconds: 10,
            scope: { traces: [{ node: 'tl', label: 'AC in' }, { node: 'tr', label: 'output' }], vmin: -11, vmax: 11, window: 2 }, parts: [
              ac(10, 2), { id: 'D', kind: 'diode', a: 'tl', b: 'tm' }, wire('W1', 'tm', 'tr'),
              { id: 'S', kind: 'switch', a: 'tm', b: 'mm', tap: 'toggle', label: 'S' },
              { id: 'C', kind: 'capacitor', a: 'mm', b: 'bm', c: 1e-4, choices: [1e-4, 1e-3, 1e-2], prop: 'c', label: 'Capacitor', vmax: 10 },
              res('R', 'tr', 'br', 1000, { labelSide: -1 }), wire('W2', 'br', 'bm'), wire('W3', 'bm', 'bl'),
            ] },
          goal: (s, parts, info) => {
            if (!parts.find((p) => p.id === 'S').closed || info.t < 2.2) return false;
            return minMax(info.history, 2)[0] > 7;
          },
          hint: 'The ripple shrinks as the capacitor gets bigger. Try the biggest.',
          explain: 'The 10 mF capacitor keeps the output high between peaks. Phone chargers use the same idea, plus a regulator.' },
        { type: 'mcq', q: 'The output still wobbles a little. What\'s that wobble called?',
          choices: ['Ripple', 'Static', 'Feedback'], answer: 0, hint: 'Like small waves on water.',
          explain: 'Ripple. A regulator after the capacitor can clean it up completely.' },
      ],
    },
    {
      id: 'a4-7', title: 'Checkpoint: diodes', icon: '🏁',
      steps: [
        { type: 'learn', title: 'Four jobs, one part',
          body: 'Diodes **light** (LEDs), **protect** (reverse batteries), **regulate** (zeners) and **rectify** (AC to DC).' },
        { type: 'bench', prompt: 'Light **both** LEDs. One of them is in backwards.',
          circuit: { nodes: { ...N, m1: [160, 110], m2: [270, 110] }, ground: 'bl', parts: [
            bat(9), wire('W0', 'tl', 'tm'), res('R1', 'tm', 'm1', 330), { id: 'D1', kind: 'led', a: 'm1', b: 'bm' },
            wire('W2', 'tm', 'tr'), res('R2', 'tr', 'm2', 330, { labelSide: -1 }), { id: 'D2', kind: 'led', a: 'br', b: 'm2', tap: 'flip', label: 'LED 2' },
            wire('W3', 'br', 'bm'), wire('W4', 'bm', 'bl'),
          ] },
          goal: (s) => s.parts.D1.on && s.parts.D2.on,
          hint: 'Only the right LED can be flipped.', explain: 'Both point along the current now. Notice each LED has its **own** resistor. Sharing one resistor between parallel LEDs makes them fight over the current.' },
        { type: 'numeric', q: 'A 3 V supply, a red LED (2 V) and a 50 Ω resistor. Current in mA?',
          answer: 20, tol: 0.03, unit: 'mA', hint: '(3 − 2) ÷ 50', explain: '1 ÷ 50 = 0.02 A = 20 mA.' },
        { type: 'mcq', q: 'Which part would you use to keep a voltage steady at 3.3 V?',
          choices: ['A 3.3 V zener diode', 'A bigger LED', 'A fuse'], answer: 0, hint: 'Breaks down at an exact voltage.',
          explain: 'A 3.3 V zener (with a resistor) holds the voltage there.' },
        { type: 'mcq', q: 'Why does a phone charger need a rectifier?',
          choices: ['The wall gives AC but the phone needs DC', 'To make it louder', 'To slow down charging'], answer: 0,
          hint: 'Which kind of current does the wall give?', explain: 'Wall power is AC. Batteries and chips need DC.' },
      ],
    },
  ],
};
