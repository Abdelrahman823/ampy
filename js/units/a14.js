// A14 · Measuring for real: multimeters, breadboards, colour codes,
// datasheets, safety, and a first real build.
import { N2, bat, wire, res, lamp, am } from './kit.js';

export const glossary = {
  multimeter: 'A handheld meter that measures volts, amps and ohms. Each needs a different mode and connection.',
  breadboard: 'A board with spring clips under rows of holes, so you can build circuits without soldering.',
  'colour code': 'Coloured bands on a resistor that tell you its value.',
  datasheet: 'The manufacturer\'s document listing a part\'s limits, pins and behaviour. Always check it.',
  soldering: 'Joining parts with melted metal (solder) using a hot iron, for permanent circuits.',
};

const breadboard = `<svg viewBox="0 0 320 162" role="img" aria-label="Breadboard: rows of five connected holes, centre gap, power rails">
  <rect x="10" y="10" width="300" height="130" rx="8" class="f-fill"/>
  <line x1="20" y1="22" x2="300" y2="22" stroke="var(--bad)" stroke-width="2"/><line x1="20" y1="128" x2="300" y2="128" stroke="var(--trace2)" stroke-width="2"/>
  <text x="304" y="26" class="f-muted">+</text><text x="304" y="132" class="f-muted">−</text>
  ${Array.from({ length: 12 }, (_, c) => [0, 1].map((half) => {
    const x = 40 + c * 22, y0 = half ? 82 : 36;
    const strip = c === 3 ? `<rect x="${x - 6}" y="${y0 - 6}" width="12" height="44" rx="4" fill="var(--copper)"/>` : '';
    return strip +
      [0, 1, 2, 3, 4].map((k) => `<rect x="${x - 3}" y="${y0 + k * 8 - 3}" width="6" height="6" fill="var(--wire)"/>`).join('');
  }).join('')).join('')}
  <rect x="20" y="72" width="280" height="6" fill="var(--surface-2)"/><text x="160" y="156" text-anchor="middle" class="f-muted">each highlighted strip of 5 holes is connected</text>
</svg>`;

const bands = (cols) => `<svg viewBox="0 0 320 70" role="img" aria-label="Resistor with colour bands">
  <line x1="10" y1="35" x2="310" y2="35" class="f-line"/><rect x="90" y="18" width="140" height="34" rx="14" fill="#e8d3a8" stroke="var(--wire)" stroke-width="2"/>
  ${cols.map((c, i) => `<rect x="${110 + i * 26}" y="18" width="12" height="34" fill="${c}"/>`).join('')}
  <rect x="200" y="18" width="10" height="34" fill="#c9a227"/>
</svg>`;
const C = { black: '#111', brown: '#7b4a1e', red: '#d32f2f', orange: '#f57c00', yellow: '#fbc02d', green: '#388e3c', blue: '#1976d2', violet: '#7b1fa2', grey: '#888', white: '#f5f5f5' };

export default {
  id: 'a14',
  title: 'Real tools',
  subtitle: 'Meters, breadboards and your first build',
  lessons: [
    {
      id: 'a14-1', title: 'Using a multimeter', icon: '🧰',
      steps: [
        { type: 'learn', title: 'One meter, three jobs',
          body: 'A [[multimeter]] measures:\n\n• **Volts**: probes **across** the part\n• **Amps**: break the circuit and put the meter **in** the loop\n• **Ohms**: only on an **unpowered** part\n\nPutting the meter in amps mode across a battery is a short circuit, and it blows the meter\'s fuse.' },
        { type: 'bench', prompt: 'The ammeter reads almost nothing because a jumper wire bypasses it. **Cut the jumper** so all the current goes through the meter.',
          circuit: { nodes: { ...N2, jm: [130, 100], jr: [215, 100] }, view: '0 0 330 220', ground: 'bl', parts: [
            bat(9, { rInt: 0.05 }), wire('W0', 'tl', 'tm'), am('A', 'tm', 'tr', { labelSide: -1, r: 0.1 }),
            wire('J1', 'tm', 'jm'), wire('J', 'jm', 'jr', { tap: 'cut', label: 'jumper' }), wire('J2', 'jr', 'tr'),
            wire('W1', 'tr', 'xr'), lamp('L', 'xr', 'xb'), wire('W2', 'xb', 'bm'), wire('W3', 'bm', 'bl'),
          ] },
          goal: (s) => s.parts.A.current > 0.45,
          hint: 'Current takes the easy path: the jumper.', explain: 'With the jumper cut, the meter is truly in series and reads the lamp\'s 0.5 A. That\'s why you must break the circuit to measure amps.' },
        { type: 'mcq', q: 'Why must you never measure resistance on a powered circuit?', choices: ['The circuit\'s voltage confuses the meter and can damage it', 'It\'s too slow', 'Resistance changes with colour'], answer: 0,
          hint: 'In ohms mode the meter supplies its own small voltage.', explain: 'Ohms mode uses the meter\'s own battery. Outside voltage gives wrong readings or damage.' },
      ],
    },
    {
      id: 'a14-2', title: 'Breadboards', icon: '🟫',
      steps: [
        { type: 'learn', title: 'Build without soldering', figure: breadboard,
          body: 'A [[breadboard]] has spring clips under the holes. Each **short strip of 5 holes** is connected. The long **rails** at the top and bottom carry + and − along the board.\n\nThe gap in the middle separates the two halves, and chips straddle it.' },
        { type: 'mcq', q: 'You plug two leads into the same 5-hole strip. Are they connected?', choices: ['Yes', 'No'], answer: 0,
          hint: 'Look at the highlighted strip.', explain: 'Yes. Everything in one strip is joined by the clip underneath.' },
        { type: 'mcq', q: 'Why do chips sit across the centre gap?', choices: ['So each pin lands on its own separate strip', 'To keep them cool', 'It doesn\'t matter'], answer: 0,
          hint: 'Otherwise opposite pins would be connected.', explain: 'Straddling the gap keeps every pin on a different strip, so pins don\'t short together.' },
      ],
    },
    {
      id: 'a14-3', title: 'Resistor colour codes', icon: '🌈',
      steps: [
        { type: 'learn', title: 'Reading the bands', figure: bands([C.brown, C.black, C.red]),
          body: 'Colours mean digits:\n\n**black 0 · brown 1 · red 2 · orange 3 · yellow 4 · green 5 · blue 6 · violet 7 · grey 8 · white 9**\n\nBand 1 and band 2 are digits. Band 3 is how many **zeros** to add. The gold band is the tolerance.\n\nBrown-black-red = 1, 0, two zeros = **1000 Ω**.' },
        { type: 'numeric', q: 'Yellow, violet, orange. What value, in ohms?', figure: bands([C.yellow, C.violet, C.orange]), answer: 47000, tol: 0.001, unit: 'Ω',
          hint: '4, 7, then 3 zeros.', explain: '47 000 Ω = 47 kΩ.' },
        { type: 'numeric', q: 'Red, red, brown. What value, in ohms?', figure: bands([C.red, C.red, C.brown]), answer: 220, tol: 0.001, unit: 'Ω',
          hint: '2, 2, then 1 zero.', explain: '220 Ω, a very common LED resistor.' },
        { type: 'mcq', q: 'Which bands make 330 Ω?', choices: ['Orange, orange, brown', 'Orange, orange, red', 'Red, red, brown'], answer: 0,
          hint: '3, 3, one zero.', explain: 'Orange (3), orange (3), brown (one zero) = 330 Ω.' },
      ],
    },
    {
      id: 'a14-4', title: 'Reading datasheets', icon: '📄',
      steps: [
        { type: 'learn', title: 'The rulebook for every part',
          body: 'A [[datasheet]] tells you a part\'s limits. For an LED you\'d look for:\n\n• **Forward voltage**, e.g. 2.0 V\n• **Continuous current**, e.g. 20 mA\n• **Absolute maximum**, e.g. 30 mA: never exceed it\n\nDesign for the normal value, never the maximum.' },
        { type: 'mcq', q: 'An LED datasheet says 20 mA continuous, 30 mA absolute maximum. What should you design for?', choices: ['About 20 mA or less', 'Exactly 30 mA', '40 mA for extra brightness'], answer: 0,
          hint: 'Max is a cliff edge, not a target.', explain: 'Around 15–20 mA. Running at the max shortens its life.' },
        { type: 'numeric', q: 'Using that LED (2 V) at 15 mA from 5 V, what resistor do you need?', answer: 200, tol: 0.01, unit: 'Ω',
          hint: '(5 − 2) ÷ 0.015', explain: '3 ÷ 0.015 = 200 Ω. You\'d pick the next standard value, 220 Ω.' },
      ],
    },
    {
      id: 'a14-5', title: 'Build safely', icon: '🦺',
      steps: [
        { type: 'learn', title: 'Good habits',
          body: '• A [[soldering]] iron tip is about **350 °C**. Always put it back in its stand\n• Work with fresh air: don\'t breathe the fumes\n• Wear safety glasses when clipping leads\n• Disconnect power before changing a circuit\n• Batteries only. Never mains.' },
        { type: 'mcq', q: 'You need to move a wire on your breadboard. First you should…', choices: ['Disconnect the power', 'Work faster', 'Use wet hands for grip'], answer: 0,
          hint: 'Avoid accidental shorts.', explain: 'Power off first, so a slip can\'t short anything.' },
        { type: 'mcq', q: 'Why wear glasses when snipping component leads?', choices: ['Cut leads can fly into your eyes', 'To see colours better', 'It\'s not needed'], answer: 0,
          hint: 'Little metal bits.', explain: 'Snipped leads shoot off fast. Glasses protect your eyes.' },
      ],
    },
    {
      id: 'a14-6', title: 'Final build: night-light', icon: '🏆',
      steps: [
        { type: 'learn', title: 'Build it for real',
          body: 'Everything you need, for under about **50 SAR**:\n\n• breadboard + jumper wires\n• 9 V battery + clip\n• LDR, BC547 NPN transistor\n• 1 LED, resistors: 47 kΩ and 330 Ω\n\nIt\'s the circuit from the Switches unit. Cover the LDR and the LED lights.' },
        { type: 'bench', prompt: 'Final check before you build: it\'s dark (the LDR is high). Pick the LED resistor that gives a safe **15–25 mA**.',
          circuit: { nodes: { tl: [40, 40], tm: [140, 40], tr: [250, 40], cm: [250, 82], c: [250, 125], b: [140, 155], e: [250, 200], bm: [140, 200], bl: [40, 200] }, ground: 'bl', parts: [
            bat(9), wire('W1', 'tl', 'tm'), wire('W2', 'tm', 'tr'), res('RL', 'tr', 'cm', 1000, { choices: [100, 330, 1000], label: 'LED resistor' }),
            { id: 'D', kind: 'led', a: 'cm', b: 'c' }, res('R1', 'tm', 'b', 47000, { labelSide: -1 }), res('LDR', 'b', 'bm', 100000, { label: 'LDR (dark)', labelSide: -1 }),
            { id: 'Q', kind: 'npn', pins: { c: 'c', b: 'b', e: 'e' }, at: [242, 155] }, wire('W3', 'e', 'bm'), wire('W4', 'bm', 'bl'),
          ] },
          goal: (s, parts) => s.parts.D.ma >= 15 && s.parts.D.ma <= 25 && !parts.find((p) => p.id === 'D').burnt,
          hint: 'About (9 − 2 − 0.2) ÷ 0.02.', explain: '330 Ω gives about 20 mA. 100 Ω would burn the LED, and 1 kΩ is dim. You\'re ready to build it!' },
        { type: 'mcq', q: 'Your real night-light doesn\'t work. What\'s the best first check?', choices: ['Measure the battery voltage, then follow the loop with the meter', 'Buy new parts', 'Shake it'], answer: 0,
          hint: 'Think like a technician.', explain: 'Check the supply, then measure along the loop to find where it stops. That\'s exactly what you practised in First Spark.' },
      ],
    },
  ],
};
