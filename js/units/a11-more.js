// A11 extra depth: De Morgan, multiplexer, full adder, hex, real logic chips.

export const glossary = {
  "De Morgan's law": 'NOT (A AND B) = (NOT A) OR (NOT B), and NOT (A OR B) = (NOT A) AND (NOT B). Swap the gate, flip everything.',
  multiplexer: 'A digital selector: a control input S chooses which of several inputs reaches the output.',
  'full adder': 'Adds three bits (A, B and a carry in), giving a sum and a carry out. Chain them to add whole numbers.',
  hexadecimal: 'Base 16: digits 0–9 then A–F (10–15). One hex digit = exactly 4 bits.',
};

const table = (api, fn, out = 'Y') => api.table().every((r) => r.out[out] === (fn(r.in) ? 1 : 0));

export const lessons = [
  {
    id: 'a11-9', title: 'De Morgan\'s trick', icon: '🪄',
    steps: [
      { type: 'learn', title: 'Flip it all',
        body: '[[De Morgan\'s law]]:\n\n**NOT (A AND B) = (NOT A) OR (NOT B)**\n\nInvert the inputs, swap AND ↔ OR, and you get the inverted output. Chip designers use this to build everything from NAND gates.' },
      { type: 'logic', prompt: 'Both inputs are inverted first. Pick the gate so the whole circuit acts like **NAND** (0 only when A and B are both 1).',
        lab: {
          inputs: [{ id: 'A', at: [60, 60] }, { id: 'B', at: [60, 160] }],
          gates: [
            { id: 'NA', type: 'NOT', in: ['A'], at: [130, 60] }, { id: 'NB', type: 'NOT', in: ['B'], at: [130, 160] },
            { id: 'G', type: 'AND', in: ['NA', 'NB'], at: [225, 110], choices: ['AND', 'OR'], label: 'Gate' },
          ],
          outputs: [{ id: 'Y', from: 'G', at: [295, 110], label: 'Y' }],
        },
        goal: (sig, st, api) => table(api, (i) => !(i.A && i.B)),
        hint: 'Swap AND for…', explain: '(NOT A) OR (NOT B) gives exactly the NAND truth table. De Morgan in action.' },
      { type: 'mcq', q: 'By De Morgan, NOT (A OR B) equals…', choices: ['(NOT A) AND (NOT B)', '(NOT A) OR (NOT B)', 'A AND B'], answer: 0,
        hint: 'Swap the gate, invert the inputs.', explain: 'OR becomes AND, and both inputs are inverted.' },
    ],
  },
  {
    id: 'a11-10', title: 'The multiplexer', icon: '🔀',
    steps: [
      { type: 'learn', title: 'A digital selector switch',
        body: 'A [[multiplexer]] picks one of its inputs: when **S = 0** the output follows **A**, when **S = 1** it follows **B**.\n\nInside: Y = (A AND NOT S) OR (B AND S). CPUs use them to route data everywhere.' },
      { type: 'logic', prompt: 'Pick the final gate so **Y = A when S = 0, and Y = B when S = 1**.',
        lab: {
          inputs: [{ id: 'A', at: [60, 40] }, { id: 'S', at: [60, 110] }, { id: 'B', at: [60, 180] }],
          gates: [
            { id: 'NS', type: 'NOT', in: ['S'], at: [120, 85] },
            { id: 'G1', type: 'AND', in: ['A', 'NS'], at: [190, 60], mid: [140, 150] },
            { id: 'G2', type: 'AND', in: ['S', 'B'], at: [190, 160], mid: [100, 140] },
            { id: 'G3', type: 'AND', in: ['G1', 'G2'], at: [265, 110], choices: ['AND', 'OR', 'XOR'], label: 'Final' },
          ],
          outputs: [{ id: 'Y', from: 'G3', at: [305, 110], label: 'Y' }],
        },
        goal: (sig, st, api) => table(api, (i) => (i.S ? i.B : i.A)),
        hint: 'Only one AND gate is ever active. Combine them with…', explain: 'OR. Exactly one AND passes its input, and the OR lets it out.' },
      { type: 'mcq', q: 'A multiplexer with S = 1 is showing input…', choices: ['A', 'B'], answer: 1,
        hint: 'S picks.', explain: 'S = 1 selects B.' },
    ],
  },
  {
    id: 'a11-11', title: 'The full adder', icon: '➕',
    steps: [
      { type: 'learn', title: 'Adding with a carry',
        body: 'A half adder can\'t accept a carry from the column before. A [[full adder]] adds **three** bits, A + B + carry-in, giving a sum and a carry-out.\n\nChain 8 of them and you can add two bytes: the heart of the ALU.' },
      { type: 'logic', prompt: 'Finish the full adder: pick the **Sum** gate and the **Carry** gate. (C is the carry coming in; Co is the carry going out.)',
        lab: {
          inputs: [{ id: 'A', at: [45, 40] }, { id: 'B', at: [45, 100] }, { id: 'CIN', label: 'C', at: [45, 175] }],
          gates: [
            { id: 'X1', type: 'XOR', in: ['A', 'B'], at: [120, 70] },
            { id: 'A1', type: 'AND', in: ['A', 'B'], at: [120, 130], mid: [78, 90] },
            { id: 'S', type: 'AND', in: ['X1', 'CIN'], at: [210, 60], choices: ['XOR', 'AND', 'OR'], label: 'Sum', mid: [160, 150] },
            { id: 'A2', type: 'AND', in: ['X1', 'CIN'], at: [210, 160], mid: [170, 110] },
            { id: 'CO', type: 'AND', in: ['A1', 'A2'], at: [275, 140], choices: ['XOR', 'AND', 'OR'], label: 'Carry', mid: [240, 245] },
          ],
          outputs: [{ id: 'SUM', from: 'S', at: [295, 60], label: 'S' }, { id: 'COUT', from: 'CO', at: [295, 190], label: 'Co', mid: 300 }],
        },
        goal: (sig, st, api) => api.table().every((r) => {
          const t = r.in.A + r.in.B + r.in.CIN;
          return r.out.SUM === t % 2 && r.out.COUT === (t >= 2 ? 1 : 0);
        }),
        hint: 'The sum is odd/even (XOR). The carry happens if either AND fires (OR).', explain: 'Sum = XOR, carry = OR of the two ANDs. 1 + 1 + 1 = 11 in binary: sum 1, carry 1.' },
      { type: 'numeric', q: 'A full adder gets A = 1, B = 1, Cin = 1. What is the 2-bit result in binary?', answer: 11, tol: 0.001, unit: '',
        hint: '1 + 1 + 1 = 3.', explain: '3 = binary 11: sum 1, carry 1.' },
    ],
  },
  {
    id: 'a11-12', title: 'Hexadecimal', icon: '🔣',
    steps: [
      { type: 'learn', title: 'Binary shorthand',
        body: 'Long binary numbers are hard to read. [[hexadecimal]] uses 16 digits: **0–9 and A–F** (A = 10 … F = 15).\n\nEach hex digit is exactly 4 bits: **1111 = F**, **1010 = A**. So a byte is two hex digits, like **2A** = 0010 1010 = 42.' },
      { type: 'numeric', q: 'What is hex **F** in decimal?', answer: 15, tol: 0.001, unit: '', hint: 'A = 10 … F = 15.', explain: 'F = 15 = 1111.' },
      { type: 'numeric', q: 'What is hex **2A** in decimal?', answer: 42, tol: 0.001, unit: '', hint: '2 × 16 + 10.', explain: '32 + 10 = 42.' },
      { type: 'mcq', q: 'How many bits does one hex digit stand for?', choices: ['2', '4', '8'], answer: 1,
        hint: '16 = 2⁴.', explain: '4 bits, so two hex digits make a byte.' },
    ],
  },
  {
    id: 'a11-13', title: 'Logic in real chips', icon: '🧩',
    steps: [
      { type: 'learn', title: 'The 74-series',
        body: 'You can buy gates in little chips: a **74HC08** has four AND gates, a **74HC00** four NAND gates, a **74HC86** four XORs.\n\nEach needs power (+5 V and 0 V) on two pins, and unused inputs must be tied high or low, never left floating.' },
      { type: 'mcq', q: 'Why must unused gate inputs be tied to 0 V or +5 V?', choices: ['Floating inputs pick up noise and can flicker or waste power', 'To make the chip faster', 'They don\'t need to be'], answer: 0,
        hint: 'Remember the pull-down resistor.', explain: 'A floating input picks up random charge. Tying it keeps the chip calm and predictable.' },
      { type: 'mcq', q: 'A 74HC00 contains four of which gate?', choices: ['NAND', 'AND', 'XOR'], answer: 0,
        hint: 'The universal one.', explain: 'Four NAND gates, enough to build almost anything.' },
    ],
  },
];
