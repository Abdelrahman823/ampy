// A8 deep practice: concepts, drills and bench challenges, inserted before the checkpoint.
import { bat, wire, res, lamp, am, sw } from './kit.js';
import { drill, mcq, num, icFromIb, rbFor, minIb, pwm } from './drill.js';

export const glossary = {
  optocoupler: 'An LED and a light sensor sealed in one chip. A signal crosses as light, so the two circuits share no wires.',
  'dynamic braking': 'Stopping a motor quickly by shorting its terminals together, so its own generated current resists the spin.',
};

const NP = { tl: [40, 40], tm: [140, 40], tr: [250, 40], c: [250, 100], sb: [140, 140], ab: [175, 140], b: [205, 140], e: [250, 200], bl: [40, 200] };
const NG = { tl: [40, 40], tr: [250, 40], d: [250, 100], g: [200, 140], gt: [150, 140], gb: [150, 200], s: [250, 200], bl: [40, 200] };
const NH = { tl: [40, 40], t1: [130, 40], tr: [250, 40], ml: [130, 110], mr: [250, 110], b1: [130, 180], br: [250, 180], bl: [40, 180] };

const vcePower = (vce, ic) => num(`A transistor has ${vce} V across it (Vce) while passing ${ic} A. Heat in watts?`, vce * ic, 'W', 'P = Vce × Ic', `${vce} × ${ic} = ${+(vce * ic).toFixed(3)} W.`);

export const lessons = [
  {
    id: 'a8-12', title: 'Challenge: pin-safe switching', icon: '🎯',
    steps: [
      { type: 'learn', title: 'A microcontroller drives an LED strip',
        body: 'A **5 V** pin drives a transistor that switches an LED. The pin can give **at most 20 mA**, but the transistor must be **fully on** (saturated).' },
      { type: 'bench', prompt: 'Pick the base resistor that **saturates** the transistor while keeping the pin current **under 20 mA**.',
        circuit: { nodes: NP, ground: 'bl', parts: [
          bat(5), wire('W1', 'tl', 'tm'), wire('W2', 'tm', 'tr'), res('RL', 'tr', 'c', 150, { label: '150 Ω' }),
          sw('S', 'tm', 'sb', { labelSide: -1, closed: true, label: 'pin' }),
          res('RB', 'sb', 'ab', 100000, { choices: [100, 1000, 100000], label: 'Base resistor' }), am('AB', 'ab', 'b', { labelSide: -1 }),
          { id: 'Q', kind: 'npn', pins: { c: 'c', b: 'b', e: 'e' }, at: [242, 140] }, wire('W3', 'e', 'bl'),
        ] },
        goal: (s) => s.parts.Q.state === 'sat' && s.parts.AB.current < 0.02,
        hint: 'Ib must be over Ic ÷ β ≈ 0.2 mA but under 20 mA.', explain: '1 kΩ gives about 4.3 mA: plenty to saturate and safe for the pin. 100 Ω would pull 43 mA and damage it.' },
      rbFor(5, 4.3),
    ],
  },
  {
    id: 'a8-13', title: 'Challenge: just enough gate', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Logic-level MOSFETs', body: 'This MOSFET turns on above **2 V**. Some microcontrollers only give **3.3 V**. Is that enough?' },
      { type: 'bench', prompt: 'Pick the **lowest** gate voltage from the choices that still switches the lamp on.',
        circuit: { nodes: NG, ground: 'bl', parts: [
          bat(9), wire('W1', 'tl', 'tr'), lamp('L', 'tr', 'd'),
          { id: 'G', kind: 'battery', a: 'gt', b: 'gb', v: 0, rInt: 0.001, choices: [0, 1.5, 3.3, 5], prop: 'v', fmt: 'v', label: 'Gate', labelSide: -1 },
          wire('W2', 'gt', 'g'), { id: 'M', kind: 'nmos', pins: { d: 'd', g: 'g', s: 's' }, at: [242, 140] },
          wire('W3', 's', 'gb'), wire('W4', 'gb', 'bl'),
        ] },
        goal: (s, parts) => s.parts.L.on && parts.find((p) => p.id === 'G').v === 3.3,
        hint: 'It needs more than 2 V.', explain: '3.3 V clears the 2 V threshold, so a 3.3 V microcontroller can drive this "logic-level" MOSFET directly.' },
      mcq('Why check a MOSFET\'s threshold voltage before using it with a 3.3 V board?', ['Some need 5–10 V on the gate to turn fully on', 'They only work on AC', 'Threshold doesn\'t matter'], 0, 'Not all MOSFETs are logic-level.', 'Many power MOSFETs need 10 V. Pick a "logic-level" one for 3.3 V boards.'),
    ],
  },
  {
    id: 'a8-14', title: 'H-bridge braking', icon: '🛑',
    steps: [
      { type: 'learn', title: 'Stop fast, safely',
        body: 'Close **both bottom** switches of an H-bridge and the motor\'s terminals are shorted together. Its spinning makes current that fights the motion, stopping it fast. That\'s [[dynamic braking]].\n\nThe battery isn\'t shorted, because the top switches are open.' },
      { type: 'bench', prompt: 'The motor is running. **Brake it**: stop the motor using both bottom switches, with no short across the battery.',
        circuit: { nodes: NH, ground: 'bl', parts: [
          bat(9, { rInt: 0.05 }), wire('W1', 'tl', 't1'), wire('W2', 't1', 'tr'),
          sw('S1', 't1', 'ml', { closed: true, labelSide: -1 }), sw('S2', 'ml', 'b1', { labelSide: -1 }),
          sw('S3', 'tr', 'mr', { label: 'S3' }), sw('S4', 'mr', 'br', { closed: true, label: 'S4' }),
          { id: 'M', kind: 'motor', a: 'ml', b: 'mr', r: 12, ratedW: 6, labelSide: -1 }, wire('W3', 'br', 'b1'), wire('W4', 'b1', 'bl'),
        ] },
        goal: (s, parts) => ['S2', 'S4'].every((id) => parts.find((p) => p.id === id).closed) && !s.parts.M.on && !s.short,
        hint: 'Open S1, close S2. Keep S4 closed.', explain: 'Both motor terminals now connect to −. No current from the battery, and the motor is braked.' },
      mcq('Why must S1 be opened before S2 closes?', ['S1 + S2 together short the battery', 'The motor would reverse', 'It doesn\'t matter'], 0, 'Same side.', 'Same-side switches together are shoot-through: a dead short.'),
    ],
  },
  {
    id: 'a8-15', title: 'Speed control with PWM', icon: '🏎️',
    steps: [
      { type: 'learn', title: 'Fast switching = smooth speed',
        body: 'Drive a motor\'s MOSFET with PWM. At 50% duty the motor gets half the average voltage and spins slower. The MOSFET is always fully on or fully off, so it stays cool.' },
      pwm(12, 50),
      mcq('Why not slow a motor with a big series resistor instead?', ['The resistor would waste lots of power as heat', 'Resistors can\'t carry current', 'It would reverse it'], 0, 'Efficiency.', 'The resistor would burn the extra power. PWM wastes almost nothing.'),
      mcq('PWM frequency for motors is often above 20 kHz. Why?', ['So the switching whine is above human hearing', 'So it runs on AC', 'To save wire'], 0, 'Listen.', 'Lower frequencies make the motor whine audibly.'),
    ],
  },
  {
    id: 'a8-16', title: 'Why fully on or off?', icon: '🌡️',
    steps: [
      { type: 'learn', title: 'Transistor heat',
        body: 'A transistor\'s heat is **P = Vce × Ic**.\n\n• **Saturated**: Vce ≈ 0.2 V, so little heat\n• **Off**: Ic = 0, so no heat\n• **Half-on**: large V and large I, so lots of heat\n\nThat\'s why switching circuits keep transistors fully on or fully off.' },
      vcePower(0.2, 1),
      vcePower(4.5, 0.5),
      mcq('Which transistor runs hottest?', ['One half-on with 4.5 V across it and 0.5 A through it', 'One fully on with 0.2 V across it and 1 A through it', 'One that\'s off'], 0, 'Compare V × I.', '4.5 × 0.5 = 2.25 W versus 0.2 W. Half-on is the worst.'),
    ],
  },
  {
    id: 'a8-17', title: 'Optocouplers', icon: '🔦',
    steps: [
      { type: 'learn', title: 'Signals across a gap of light',
        body: 'An [[optocoupler]] puts an LED and a phototransistor in one sealed chip. The input lights the LED, and the light switches the output transistor.\n\nThe two sides share **no wires at all**, which keeps microcontrollers safe from noisy or high-voltage circuits.' },
      mcq('What carries the signal across an optocoupler?', ['Light', 'A wire', 'Sound'], 0, '"Opto".', 'Light from the internal LED.'),
      mcq('Why use one between an Arduino and a mains-switching circuit?', ['It isolates them: no shared wire for a fault to travel along', 'It makes the Arduino faster', 'It\'s cheaper than a resistor'], 0, 'Isolation.', 'Electrical isolation keeps dangerous voltages away from the low-voltage side.'),
    ],
  },
  drill('a8-18', 'Practice: transistor gain', '🧮', '**Ic = β × Ib** (when not saturated).', [
    icFromIb(100, 0.5), icFromIb(200, 0.2), icFromIb(50, 2), icFromIb(150, 0.1),
  ]),
  drill('a8-19', 'Practice: base resistors', '🧮', '**Rb = (V_in − 0.7) ÷ Ib**', [
    rbFor(5, 2), rbFor(3.3, 1), rbFor(9, 5), rbFor(5, 10),
  ]),
  drill('a8-20', 'Practice: enough base current?', '🧮', 'To saturate: **Ib ≥ Ic ÷ β**, then add margin.', [
    minIb(0.5, 100), minIb(1, 50), minIb(0.02, 200), minIb(2, 25),
  ]),
  {
    id: 'a8-21', title: 'Review: BJT or MOSFET?', icon: '🧠',
    steps: [
      { type: 'learn', title: 'Choosing a switch', body: 'BJTs need base **current**. MOSFETs need gate **voltage**. Both have their place.' },
      mcq('Battery-powered, switching 5 A:', ['MOSFET', 'Small NPN like a BC547'], 0, 'Big current, tiny gate current.', 'A MOSFET: very low resistance when on and no gate current.'),
      mcq('Cheap, small LED driver from a 5 V pin:', ['Either works, and a small NPN is classic', 'Only a relay'], 0, 'Small loads are easy.', 'A BC547 or 2N2222 with a base resistor is the classic choice.'),
      mcq('Which needs a pull-down resistor on its control input to stay reliably off?', ['MOSFET gate', 'Lamp', 'Fuse'], 0, 'Floating gate.', 'A floating MOSFET gate can turn on by itself.'),
      mcq('A transistor drives a relay coil. What else do you need?', ['A flyback diode across the coil', 'A second battery', 'Nothing'], 0, 'Coils kick back.', 'The flyback diode absorbs the coil\'s spike.'),
    ],
  },
  {
    id: 'a8-22', title: 'Challenge: night-light tuning', icon: '🌙',
    steps: [
      { type: 'learn', title: 'Set the switching point', body: 'Back to the night-light. A **smaller** top resistor makes it switch on while it\'s still a bit bright. Drag it to make the LED come on with the LDR at just **10 kΩ** (dusk).' },
      { type: 'bench', prompt: 'With the LDR at dusk level (10 kΩ), drag the **top resistor** down until the LED switches on.',
        circuit: { nodes: { tl: [40, 40], tm: [140, 40], tr: [250, 40], cm: [250, 82], c: [250, 125], b: [140, 155], e: [250, 200], bm: [140, 200], bl: [40, 200] }, ground: 'bl', parts: [
          bat(9), wire('W1', 'tl', 'tm'), wire('W2', 'tm', 'tr'), res('RL', 'tr', 'cm', 330), { id: 'D', kind: 'led', a: 'cm', b: 'c' },
          res('R1', 'tm', 'b', 150000, { slider: { label: 'Top resistor', min: 10000, max: 150000, step: 10000 }, labelSide: -1 }),
          res('LDR', 'b', 'bm', 10000, { label: 'LDR 10 kΩ', labelSide: -1 }),
          { id: 'Q', kind: 'npn', pins: { c: 'c', b: 'b', e: 'e' }, at: [242, 155] }, wire('W3', 'e', 'bm'), wire('W4', 'bm', 'bl'),
        ] },
        goal: (s) => s.parts.D.ma > 5,
        hint: 'A smaller top resistor gives the base a bigger share.', explain: 'Now the base reaches 0.7 V at dusk. Adjustable night-lights use a trimmer here.' },
      mcq('In a real night-light, what part would you use as the adjustable top resistor?', ['A trimmer potentiometer', 'A fuse', 'A capacitor'], 0, 'Adjustable resistor.', 'A trimmer pot, so the switch-on brightness can be set.'),
    ],
  },
];
