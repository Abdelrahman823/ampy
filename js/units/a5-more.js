// A5 extra depth: battery chemistry, parallel packs, wire heating, solar charging.
import { N, bat, wire, res, lamp } from './kit.js';

export const glossary = {
  'Li-ion': 'Lithium-ion: the rechargeable chemistry in phones and laptops. About 3.7 V per cell, very energy-dense.',
  'wire gauge': 'How thick a wire is. Thicker wire has less resistance and can carry more current without heating up.',
};

export const lessons = [
  {
    id: 'a5-8', title: 'Battery chemistry', icon: '⚗️',
    steps: [
      { type: 'learn', title: 'Different recipes',
        body: 'Each battery chemistry gives its own voltage per cell:\n\n• Alkaline AA: **1.5 V** (not rechargeable)\n• NiMH AA: **1.2 V** (rechargeable)\n• [[Li-ion]]: **3.7 V** (phones, laptops, drones)\n• Lead-acid car battery: **12 V** (six 2 V cells)' },
      { type: 'numeric', q: 'A drone battery has 3 Li-ion cells in series. Voltage?', answer: 11.1, tol: 0.01, unit: 'V',
        hint: '3 × 3.7', explain: '3 × 3.7 = 11.1 V. That\'s what "3S" means on drone batteries.' },
      { type: 'mcq', q: 'Which chemistry would you choose for a small, light, rechargeable project?', choices: ['Li-ion', 'Lead-acid', 'Alkaline'], answer: 0,
        hint: 'Phones use it.', explain: 'Li-ion stores the most energy for its weight, and it\'s rechargeable.' },
      { type: 'mcq', q: 'How many 2 V cells are inside a 12 V car battery?', choices: ['2', '6', '12'], answer: 1,
        hint: '12 ÷ 2', explain: 'Six 2 V cells in series.' },
    ],
  },
  {
    id: 'a5-9', title: 'Batteries in parallel', icon: '🔋',
    steps: [
      { type: 'learn', title: 'More capacity, same voltage',
        body: 'Batteries in **series** add **voltage**. Identical batteries in **parallel** keep the same voltage but add **capacity** (mAh), so they last longer.\n\nOnly parallel batteries that are the same type and the same charge.' },
      { type: 'numeric', q: 'Two 2000 mAh, 3.7 V cells in parallel. Total capacity in mAh?', answer: 4000, tol: 0.001, unit: 'mAh',
        hint: 'Parallel adds capacity.', explain: '2000 + 2000 = 4000 mAh, still at 3.7 V.' },
      { type: 'numeric', q: 'And their voltage?', answer: 3.7, tol: 0.01, unit: 'V',
        hint: 'Parallel keeps the voltage.', explain: 'Still 3.7 V.' },
      { type: 'mcq', q: 'A power bank says "2S2P". What does that mean?', choices: ['2 in series, and 2 of those groups in parallel', '2 sockets, 2 plugs', '2 seconds per pulse'], answer: 0,
        hint: 'S and P.', explain: '2 cells in series for double voltage, doubled up in parallel for double capacity.' },
    ],
  },
  {
    id: 'a5-10', title: 'Wires get hot', icon: '🌡️',
    steps: [
      { type: 'learn', title: 'Wire resistance',
        body: 'Even wires have a little resistance, so big currents heat them: **P = I² × R**.\n\nThicker wire (a bigger [[wire gauge]]) has less resistance. That\'s why an oven\'s cable is much thicker than a phone charger\'s.' },
      { type: 'bench', prompt: 'A 12 V heater draws about 5 A. Pick the **thinnest** wire that won\'t overheat (rated 2 W).',
        circuit: { nodes: N, ground: 'bl', parts: [
          bat(12), res('WIRE', 'tl', 'tr', 0.01, { choices: [0.5, 0.05, 0.01], label: 'Wire', maxW: 2, show: 'p' }),
          lamp('H', 'tr', 'br', { r: 2.4, ratedW: 60, label: 'heater' }), wire('W', 'br', 'bl'),
        ] },
        goal: (s, parts) => { const w = parts.find((p) => p.id === 'WIRE'); return w.r === 0.05 && !w.burnt; },
        hint: 'Thin = 0.5 Ω, medium = 0.05 Ω, thick = 0.01 Ω.', explain: 'The medium wire wastes about 1.2 W, which is fine. The thin one would make about 8 W of heat and melt its insulation.' },
      { type: 'numeric', q: '10 A flows through a wire with 0.05 Ω resistance. Heat in watts?', answer: 5, tol: 0.01, unit: 'W',
        hint: 'P = I² × R', explain: '100 × 0.05 = 5 W.' },
    ],
  },
  {
    id: 'a5-11', title: 'Solar charging', icon: '🔆',
    steps: [
      { type: 'learn', title: 'Energy in, energy out',
        body: 'A solar panel\'s rating is its power in full sun. Multiply by hours of good sun to get energy:\n\n**Wh = W × hours**\n\nCharging always loses some energy as heat, often 10–20%.' },
      { type: 'numeric', q: 'A 10 W panel gets 5 hours of strong sun. Energy collected in Wh?', answer: 50, tol: 0.01, unit: 'Wh',
        hint: '10 × 5', explain: '50 Wh.' },
      { type: 'numeric', q: 'A 20 Wh power bank charges from a 5 W panel. Ignoring losses, how many hours?', answer: 4, tol: 0.01, unit: 'h',
        hint: '20 ÷ 5', explain: '4 hours of full sun, a bit more in real life because of losses.' },
      { type: 'mcq', q: 'Why does a solar garden light include a rechargeable battery?', choices: ['To store daytime energy for the night', 'To make the panel brighter', 'It doesn\'t need one'], answer: 0,
        hint: 'When does it shine?', explain: 'The panel charges the battery by day and the battery runs the LED at night.' },
    ],
  },
];
