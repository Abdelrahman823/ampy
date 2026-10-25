// A5 deep practice: concepts, drills and bench challenges, inserted before the checkpoint.
import { N, bat, wire, lamp, am } from './kit.js';
import { drill, mcq, num, powVI, powIR } from './drill.js';

export const glossary = {
  '7805': 'A classic linear regulator chip that outputs 5 V. It needs at least about 7 V in.',
  'buck converter': 'A switching regulator that steps voltage **down** efficiently (often 90%+).',
  'boost converter': 'A switching regulator that steps voltage **up**, like 3.7 V from one Li-ion cell to 5 V for USB.',
  'C-rate': 'Charge or discharge current relative to capacity. 1C on a 2000 mAh battery is 2 A.',
};

const kwh = (w, h) => num(`A ${w} W device runs for ${h} hours. Energy in kWh?`, (w * h) / 1000, 'kWh', 'W × h ÷ 1000', `${w} × ${h} ÷ 1000 = ${(w * h) / 1000} kWh.`);
const cost = (w, h, price) => num(`A ${w} W device runs ${h} hours. If 1 kWh costs ${price} SAR, what does that cost in SAR?`, ((w * h) / 1000) * price, 'SAR', 'kWh first, then × price.', `${(w * h) / 1000} kWh × ${price} = ${+(((w * h) / 1000) * price).toFixed(3)} SAR.`);
const life = (mah, ma) => num(`A ${mah} mAh battery powers a ${ma} mA load. About how many hours?`, mah / ma, 'h', 'mAh ÷ mA', `${mah} ÷ ${ma} = ${+(mah / ma).toFixed(2)} h.`);
const wh = (v, ah) => num(`A ${v} V, ${ah} Ah battery stores how many Wh?`, v * ah, 'Wh', 'Wh = V × Ah', `${v} × ${ah} = ${+(v * ah).toFixed(2)} Wh.`);
const eff = (pin, pout) => num(`${pin} W in, ${pout} W out. Efficiency in %?`, (pout / pin) * 100, '%', 'out ÷ in × 100', `${pout} ÷ ${pin} × 100 = ${+((pout / pin) * 100).toFixed(1)}%.`);

export const lessons = [
  {
    id: 'a5-12', title: 'Challenge: fuse a motor', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Bench challenge', body: 'A **12 V motor** draws about **1 A**. Pick a fuse that lets it run but still protects the wiring.' },
      { type: 'bench', prompt: 'Pick the fuse that lets the motor run normally and would still blow on a fault.',
        circuit: { nodes: N, ground: 'bl', parts: [
          bat(12, { rInt: 0.05 }), { id: 'F', kind: 'fuse', a: 'tl', b: 'tm', labelSide: -1, rating: 20, choices: [0.5, 2, 20], prop: 'rating', label: 'Fuse' },
          am('A', 'tm', 'tr'), { id: 'M', kind: 'motor', a: 'tr', b: 'br', r: 12, ratedW: 12 }, wire('W', 'br', 'bl'),
        ] },
        goal: (s, parts) => parts.find((p) => p.id === 'F').rating === 2 && s.parts.M.on,
        hint: 'Just above 1 A.', explain: '2 A gives headroom for the motor\'s start-up surge but still blows long before the wires overheat.' },
      mcq('Motors draw a big surge for a moment when they start. How does that affect fuse choice?', ['Pick a fuse with some headroom (or a slow-blow fuse)', 'Pick a fuse exactly at the running current', 'Skip the fuse'], 0, 'Don\'t blow on every start.', 'A little headroom, or a slow-blow type, avoids nuisance blowing at start-up.'),
    ],
  },
  {
    id: 'a5-13', title: 'Challenge: pick the pack', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Match the voltage', body: 'This lamp is rated **9 V**. Choose a battery pack that runs it at full brightness without overdriving it.' },
      { type: 'bench', prompt: 'Pick the pack voltage for **full, but not excessive**, brightness.',
        circuit: { nodes: N, ground: 'bl', parts: [
          bat(3, { choices: [3, 4.5, 6, 9, 12], prop: 'v', label: 'Pack', fmt: 'v' }), wire('W1', 'tl', 'tr'), lamp('L', 'tr', 'br'), wire('W', 'br', 'bl'),
        ] },
        goal: (s, parts) => parts[0].v === 9 && s.parts.L.brightness > 0.95,
        hint: 'Match the rating.', explain: '9 V matches its rating. 12 V would make it brilliant but cut its life short.' },
      num('How many 1.5 V cells make that 9 V pack?', 6, 'cells', '9 ÷ 1.5', '6 cells.', 0.0001),
    ],
  },
  {
    id: 'a5-14', title: 'The 7805 regulator', icon: '🔲',
    steps: [
      { type: 'learn', title: 'A 5 V regulator chip',
        body: 'The [[7805]] is a 3-pin chip: input, ground, output. Feed it 7–25 V and out comes a steady **5 V**.\n\nIt needs about **2 V of headroom** (dropout), and it burns the extra voltage as heat: P = (Vin − 5) × I.' },
      num('A 7805 gets 12 V in and supplies 0.5 A. Heat in watts?', 3.5, 'W', '(12 − 5) × 0.5', '7 × 0.5 = 3.5 W: it needs a heatsink.'),
      mcq('Can a 7805 make 5 V from a 6 V battery?', ['Not reliably: it needs about 7 V in', 'Yes, easily'], 0, 'Dropout ≈ 2 V.', 'With only 1 V of headroom it drops out. A low-dropout (LDO) regulator would work.'),
      num('Efficiency of a 7805 going from 9 V to 5 V (output power ÷ input power, ignoring its tiny own current)?', 55.6, '%', '5 ÷ 9 × 100', 'About 56%. The rest becomes heat.'),
    ],
  },
  {
    id: 'a5-15', title: 'Buck and boost', icon: '🔀',
    steps: [
      { type: 'learn', title: 'Switching converters',
        body: 'A [[buck converter]] steps voltage down and a [[boost converter]] steps it up. Both switch thousands of times a second with an inductor and a capacitor, so they waste very little.\n\nYour power bank boosts 3.7 V up to 5 V for USB.' },
      mcq('A power bank has one 3.7 V Li-ion cell but gives 5 V USB. It uses a…', ['Boost converter', 'Buck converter', 'Zener'], 0, 'Up!', 'A boost converter raises 3.7 V to 5 V.'),
      num('A buck converter supplies 5 V at 2 A with 90% efficiency. Input power in W?', 11.1, 'W', 'Pin = Pout ÷ 0.9', '10 ÷ 0.9 ≈ 11.1 W.'),
      mcq('Why are switching converters more efficient than a 7805?', ['They switch fully on and off instead of burning the extra voltage', 'They\'re bigger', 'They use AC'], 0, 'Like PWM.', 'A fully-on or fully-off switch wastes almost nothing.'),
    ],
  },
  {
    id: 'a5-16', title: 'Charging batteries', icon: '🔌',
    steps: [
      { type: 'learn', title: 'C-rate',
        body: 'Charge current is often given as a [[C-rate]]. For a 2000 mAh cell:\n\n• **1C** = 2 A (about 1 hour)\n• **0.5C** = 1 A (about 2 hours)\n\nLi-ion cells must never be charged above 4.2 V each. Always use a proper charger chip.' },
      num('A 3000 mAh battery charged at 0.5C. Charge current in A?', 1.5, 'A', '0.5 × 3 A', '1.5 A.'),
      num('Roughly how many hours does charging at 0.5C take?', 2, 'h', '1 ÷ 0.5', 'About 2 hours (a bit more in practice).'),
      mcq('What\'s the maximum safe charge voltage per Li-ion cell?', ['4.2 V', '12 V', '1.5 V'], 0, 'Slightly above its 3.7 V nominal.', '4.2 V. Above that it can overheat or catch fire.'),
    ],
  },
  drill('a5-17', 'Practice: energy and bills', '🧮', '**kWh = W × hours ÷ 1000.** Examples use a made-up price per kWh.', [
    kwh(1500, 2), kwh(60, 50), cost(2000, 3, 0.18), cost(100, 10, 0.18),
  ]),
  drill('a5-18', 'Practice: battery life', '🧮', '**Hours = mAh ÷ mA.** Energy: **Wh = V × Ah**.', [
    life(2000, 100), life(500, 20), life(3000, 250), wh(3.7, 3), wh(12, 7),
  ]),
  drill('a5-19', 'Practice: power and efficiency', '🧮', 'Efficiency = out ÷ in × 100.', [
    eff(20, 18), eff(10, 6), powVI(12, 3), powIR(2, 0.1), eff(65, 52),
  ]),
  {
    id: 'a5-20', title: 'Review: safe power', icon: '🧠',
    steps: [
      { type: 'learn', title: 'Power sense', body: 'Batteries, fuses, regulators and safety in four questions.' },
      mcq('A project runs off 4 AA cells in series. Voltage?', ['6 V', '1.5 V', '4 V'], 0, '4 × 1.5', '6 V.'),
      mcq('A thin wire gets hot carrying a big current. Best fix?', ['Use thicker wire', 'Add another battery', 'Use a bigger fuse'], 0, 'Lower resistance.', 'Thicker wire has lower resistance, so less heat.'),
      mcq('Which converter would make 3.3 V from 12 V most efficiently?', ['A buck converter', 'A 7805', 'A resistor'], 0, 'Switching, step down.', 'A buck converter: efficient and steps down.'),
      mcq('Your charger and phone get warm while charging. Why?', ['No conversion is 100% efficient; the losses become heat', 'Electricity is hot', 'It\'s broken'], 0, 'Efficiency.', 'The lost few percent turns into heat.'),
    ],
  },
];
