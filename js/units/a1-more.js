// A1 extra depth: lessons inserted before the unit's checkpoint.
import { N, wire, res, lamp, am, sw } from './kit.js';

export const glossary = {
  conductor: 'A material that lets current flow easily, like copper or aluminium.',
  insulator: 'A material that blocks current, like rubber, plastic, glass or dry wood.',
  'momentary switch': 'A push-button that only stays closed while you press it, like a doorbell.',
};

const NB = { ...N, ml: [50, 110] };

export const lessons = [
  {
    id: 'a1-7', title: 'Conductors and insulators', icon: '🧵',
    steps: [
      { type: 'learn', title: 'What lets current through?',
        body: 'Metals like copper are [[conductor]]s: their electrons move easily. Rubber, plastic and glass are [[insulator]]s.\n\nWires are copper on the inside and plastic on the outside: conductor for the current, insulator for your fingers.' },
      { type: 'bench', prompt: 'Bridge the gap with a material that lets the lamp light. Rubber ≈ 1 GΩ, dry wood ≈ 100 MΩ, copper ≈ 0.01 Ω.',
        circuit: { nodes: N, ground: 'bl', parts: [
          { id: 'B', kind: 'battery', a: 'tl', b: 'bl', v: 9, rInt: 0.2 },
          res('M', 'tl', 'tr', 1e9, { choices: [1e9, 1e8, 0.01], label: 'Material' }), lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
        ] },
        goal: (s) => s.parts.L.on,
        hint: 'Pick the one with almost no resistance.', explain: 'Copper\'s tiny resistance lets the full current through. Rubber lets through less than a billionth of an amp.' },
      { type: 'mcq', q: 'Why are electricians\' screwdrivers covered in thick plastic?', choices: ['Plastic is an insulator that protects their hands', 'It makes them lighter', 'Plastic conducts better'], answer: 0,
        hint: 'Conductor or insulator?', explain: 'The plastic insulates, so current can\'t reach their hand.' },
      { type: 'mcq', q: 'Which of these is a conductor?', choices: ['Glass', 'Aluminium foil', 'A rubber band'], answer: 1,
        hint: 'Metals conduct.', explain: 'Aluminium is a metal, so it conducts.' },
    ],
  },
  {
    id: 'a1-8', title: 'Batteries in series', icon: '🔋',
    steps: [
      { type: 'learn', title: 'Stacking the push',
        body: 'Batteries stacked **+ to −** add their voltages: two 4.5 V batteries make 9 V.\n\nTurn one around and they push against each other and cancel out.' },
      { type: 'bench', prompt: 'One battery is in backwards, so the lamp is dark. **Tap it** to turn it around.',
        circuit: { nodes: NB, ground: 'bl', parts: [
          { id: 'B1', kind: 'battery', a: 'tl', b: 'ml', v: 4.5, rInt: 0.05 },
          { id: 'B2', kind: 'battery', a: 'bl', b: 'ml', v: 4.5, rInt: 0.05, tap: 'flip', label: 'battery 2' },
          wire('W1', 'tl', 'tr'), lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
        ] },
        goal: (s) => s.parts.L.brightness > 0.9,
        hint: 'The bottom battery.', explain: 'Now both point the same way: 4.5 + 4.5 = 9 V, and the lamp is at full brightness.' },
      { type: 'numeric', q: 'A torch holds three 1.5 V cells in series. Total voltage?', answer: 4.5, tol: 0.01, unit: 'V',
        hint: 'Add them.', explain: '1.5 × 3 = 4.5 V.' },
    ],
  },
  {
    id: 'a1-9', title: 'Push-buttons', icon: '🔔',
    steps: [
      { type: 'learn', title: 'Press to connect',
        body: 'A [[momentary switch]] only closes while you press it. Let go and the spring opens it again.\n\nDoorbells, keyboards and game controllers are full of them.' },
      { type: 'bench', prompt: '**Press the button** to ring the doorbell buzzer.',
        circuit: { nodes: N, ground: 'bl', parts: [
          { id: 'B', kind: 'battery', a: 'tl', b: 'bl', v: 9, rInt: 0.2 },
          { id: 'P', kind: 'pushbutton', a: 'tl', b: 'tr', tap: 'toggle', label: '' },
          { id: 'Z', kind: 'buzzer', a: 'tr', b: 'br', label: 'buzzer' }, wire('W', 'br', 'bl'),
        ] },
        goal: (s) => s.parts.Z.on,
        hint: 'Tap the button on the top wire.', explain: 'Pressing closes the loop and the buzzer sounds. On a real button, letting go would stop it.' },
      { type: 'mcq', q: 'Which job needs a **momentary** switch rather than an on/off switch?', choices: ['A room light', 'A doorbell', 'A fridge'], answer: 1,
        hint: 'It should only work while pressed.', explain: 'A doorbell should only ring while someone presses it.' },
    ],
  },
  {
    id: 'a1-10', title: 'Same current everywhere', icon: '🟰',
    steps: [
      { type: 'learn', title: 'Series current',
        body: 'In a single loop, the [[current]] is the **same at every point**. Charge isn\'t used up. It flows all the way round.\n\nWhat gets "used" is energy, not current.' },
      { type: 'bench', prompt: 'Two different lamps and two ammeters in one loop. **Close the switch** and compare the meters.',
        circuit: { nodes: N, ground: 'bl', parts: [
          { id: 'B', kind: 'battery', a: 'tl', b: 'bl', v: 9, rInt: 0.001 },
          sw('S', 'tl', 'tm'), am('A1', 'tm', 'tr'), lamp('L1', 'tr', 'br', { r: 10 }), am('A2', 'br', 'bm'), lamp('L2', 'bm', 'bl', { r: 20 }),
        ] },
        goal: (s) => s.parts.A1.current > 0.25,
        hint: 'Top-left switch.', explain: 'Both meters read the same, even though the lamps are different. Same loop, same current.' },
      { type: 'numeric', q: 'In that loop: 9 V across 10 Ω + 20 Ω. What current does ammeter 2 read?', answer: 0.3, tol: 0.02, unit: 'A',
        hint: 'Total R, then I = V ÷ R. It\'s the same everywhere.', explain: '9 ÷ 30 = 0.3 A at both meters.' },
      { type: 'mcq', q: 'Does a lamp "use up" current?', choices: ['Yes, less comes out than goes in', 'No, the same current comes out; it uses energy'], answer: 1,
        hint: 'Compare the two meters.', explain: 'Current in = current out. The lamp turns electrical energy into light and heat.' },
    ],
  },
  {
    id: 'a1-11', title: 'Too much, too little', icon: '🎚️',
    steps: [
      { type: 'learn', title: 'Rated voltage',
        body: 'Every lamp is made for a certain voltage. Too little and it\'s dim. Too much and it\'s extra bright for a while, then burns out early.\n\nThis lamp is rated **9 V**.' },
      { type: 'bench', prompt: 'Set the supply so this 9 V lamp runs at **full brightness**, without going over its rating.',
        circuit: { nodes: N, ground: 'bl', parts: [
          { id: 'B', kind: 'battery', a: 'tl', b: 'bl', v: 3, rInt: 0.001, slider: { label: 'Supply', prop: 'v', min: 0, max: 12, step: 1, fmt: 'v' } },
          wire('W1', 'tl', 'tr'), lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
        ] },
        goal: (s, parts) => s.parts.L.brightness > 0.95 && parts[0].v <= 9,
        hint: 'Match the rating exactly.', explain: '9 V gives exactly its rated 4.5 W. 12 V would give 8 W, making it brilliant but short-lived.' },
      { type: 'numeric', q: 'An 18 Ω lamp on 6 V. What current flows?', answer: 0.333, tol: 0.02, unit: 'A',
        hint: 'I = V ÷ R', explain: '6 ÷ 18 ≈ 0.33 A, so it\'s dimmer than at 9 V (0.5 A).' },
    ],
  },
  {
    id: 'a1-12', title: 'Open, closed or short?', icon: '🧭',
    steps: [
      { type: 'learn', title: 'Three states',
        body: '• **Closed circuit**: a full loop through the load. It works.\n• **Open circuit**: a break somewhere. Nothing flows.\n• **Short circuit**: a path that skips the load. Huge current, nothing works, things get hot.' },
      { type: 'mcq', q: 'A switch is off and the lamp is dark. That\'s…', choices: ['An open circuit', 'A short circuit', 'A closed circuit'], answer: 0,
        hint: 'There\'s a break.', explain: 'Open: the switch is a deliberate break.' },
      { type: 'mcq', q: 'A wire accidentally touches both battery terminals. That\'s…', choices: ['An open circuit', 'A short circuit'], answer: 1,
        hint: 'It skips everything.', explain: 'A short circuit. Disconnect it quickly, because the wire and battery heat up.' },
      { type: 'mcq', q: 'Which is the safest state to leave a circuit in when you walk away?', choices: ['Open (switched off)', 'Short', 'Closed with the lamp on'], answer: 0,
        hint: 'No current at all.', explain: 'Open. Nothing flows, nothing heats up.' },
    ],
  },
];
