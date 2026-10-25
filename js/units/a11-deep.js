// A11 deep practice: lab builds and drills, inserted before the checkpoint.
import { drill, mcq, binToDec, decToBin, hexToDec, wrap8 } from './drill.js';

export const glossary = {
  'shift register': 'A chain of flip-flops where each clock tick moves every bit one place along. Used to send data one bit at a time.',
  parity: 'Whether a group of bits has an odd or even number of 1s. Used to spot transmission errors.',
};

const table = (api, fn, out = 'Y') => api.table().every((r) => r.out[out] === (fn(r.in) ? 1 : 0));
const two = (choices, start) => ({
  inputs: [{ id: 'A', at: [70, 70] }, { id: 'B', at: [70, 150] }],
  gates: [{ id: 'G', type: start, in: ['A', 'B'], at: [180, 110], choices, label: 'Gate' }],
  outputs: [{ id: 'Y', from: 'G', at: [280, 110], label: 'Y' }],
});

export const lessons = [
  {
    id: 'a11-14', title: 'NOT from a NAND', icon: '🧱',
    steps: [
      { type: 'learn', title: 'Everything from NANDs', body: 'Tie both inputs of a NAND together: if A = 1 the output is 0, and if A = 0 it\'s 1. That\'s a NOT gate!' },
      { type: 'logic', prompt: 'Both gate inputs are wired to A. Pick the gate type so **Y = NOT A**.',
        lab: { inputs: [{ id: 'A', at: [70, 110] }], gates: [{ id: 'G', type: 'AND', in: ['A', 'A'], at: [180, 110], choices: ['AND', 'NAND', 'OR'], label: 'Gate' }], outputs: [{ id: 'Y', from: 'G', at: [280, 110], label: 'Y' }] },
        goal: (sig, st, api) => table(api, (i) => !i.A), hint: 'NOT-AND.', explain: 'NAND(A, A) = NOT A. The first brick in "everything from NANDs".' },
      mcq('NAND(1, 1) =', ['0', '1'], 0, 'AND then NOT.', 'AND gives 1, NOT makes it 0.'),
    ],
  },
  {
    id: 'a11-15', title: 'OR from NANDs', icon: '🧱',
    steps: [
      { type: 'learn', title: 'De Morgan to the rescue', body: 'Invert A and B (with NANDs acting as NOTs), then NAND them: by De Morgan that\'s **A OR B**.' },
      { type: 'logic', prompt: 'The first two NANDs invert A and B. Pick the last gate so **Y = A OR B**.',
        lab: {
          inputs: [{ id: 'A', at: [60, 60] }, { id: 'B', at: [60, 160] }],
          gates: [
            { id: 'NA', type: 'NAND', in: ['A', 'A'], at: [140, 60] }, { id: 'NB', type: 'NAND', in: ['B', 'B'], at: [140, 160] },
            { id: 'G', type: 'AND', in: ['NA', 'NB'], at: [235, 110], choices: ['AND', 'NAND', 'NOR'], label: 'Gate' },
          ],
          outputs: [{ id: 'Y', from: 'G', at: [300, 110], label: 'Y' }],
        },
        goal: (sig, st, api) => table(api, (i) => i.A || i.B), hint: 'NOT(NOT A AND NOT B).', explain: 'NAND of the inverted inputs = A OR B. Three NANDs, one OR.' },
      mcq('How many NAND gates did this OR take?', ['3', '1', '5'], 0, 'Count them.', 'Three.'),
    ],
  },
  {
    id: 'a11-16', title: 'Majority vote', icon: '🗳️',
    steps: [
      { type: 'learn', title: 'Two out of three', body: 'Spacecraft run three computers and go with the **majority**. The output is 1 if **at least two** inputs are 1: (A AND B) OR (B AND C) OR (A AND C).' },
      { type: 'logic', prompt: 'Three AND gates check each pair. Pick the final gate so **Y = 1 when at least two inputs are 1**.',
        lab: {
          inputs: [{ id: 'A', at: [50, 40] }, { id: 'B', at: [50, 110] }, { id: 'C', at: [50, 180] }],
          gates: [
            { id: 'G1', type: 'AND', in: ['A', 'B'], at: [150, 50], mid: [90, 100] },
            { id: 'G2', type: 'AND', in: ['B', 'C'], at: [150, 120], mid: [110, 90] },
            { id: 'G3', type: 'AND', in: ['A', 'C'], at: [150, 190], mid: [125, 100] },
            { id: 'G', type: 'AND', in: ['G1', 'G2', 'G3'], at: [245, 120], choices: ['AND', 'OR', 'XOR'], label: 'Final' },
          ],
          outputs: [{ id: 'Y', from: 'G', at: [300, 120], label: 'Y' }],
        },
        goal: (sig, st, api) => table(api, (i) => i.A + i.B + i.C >= 2), hint: 'Any pair agreeing is enough.', explain: 'OR the three pairs together: any two agreeing wins the vote.' },
      mcq('A = 1, B = 0, C = 1. Majority output?', ['1', '0'], 0, 'Two of three.', '1, because two inputs are 1.'),
    ],
  },
  {
    id: 'a11-17', title: 'Are they equal?', icon: '🟰',
    steps: [
      { type: 'learn', title: 'Equality checker', body: 'XNOR is 1 when its inputs are **the same**. Comparators inside CPUs are built from rows of XNORs.' },
      { type: 'logic', prompt: 'Pick the gate so Y lights when **A and B are equal**.', lab: two(['XOR', 'XNOR', 'AND'], 'XOR'),
        goal: (sig, st, api) => table(api, (i) => i.A === i.B), hint: 'The opposite of "different".', explain: 'XNOR: 1 for 00 and 11.' },
      mcq('To check if two 8-bit numbers are equal, you could…', ['XNOR each bit pair, then AND all eight results', 'Add them', 'Use one OR gate'], 0, 'Every bit must match.', 'All eight XNORs must be 1, so AND them together.'),
    ],
  },
  {
    id: 'a11-18', title: 'Parity: catching errors', icon: '🛡️',
    steps: [
      { type: 'learn', title: 'Odd or even', body: 'Send an extra [[parity]] bit with data so the total number of 1s is even. If one bit flips on the way, the count turns odd and the error is spotted. A chain of XORs computes it.' },
      { type: 'logic', prompt: 'Pick the second gate so **Y = 1 when an odd number of A, B, C are 1**.',
        lab: {
          inputs: [{ id: 'A', at: [60, 50] }, { id: 'B', at: [60, 110] }, { id: 'C', at: [60, 180] }],
          gates: [{ id: 'X1', type: 'XOR', in: ['A', 'B'], at: [150, 80] }, { id: 'G', type: 'AND', in: ['X1', 'C'], at: [240, 130], choices: ['AND', 'OR', 'XOR'], label: 'Gate' }],
          outputs: [{ id: 'Y', from: 'G', at: [300, 130], label: 'Y' }],
        },
        goal: (sig, st, api) => table(api, (i) => (i.A + i.B + i.C) % 2 === 1), hint: 'Chain the same gate.', explain: 'XOR of XOR: 1 for an odd count of 1s. Memory chips and networks use this.' },
      mcq('Data 1011 plus an even-parity bit. What is the parity bit?', ['1', '0'], 0, 'Three 1s: make it even.', '1, making four 1s in total.'),
    ],
  },
  {
    id: 'a11-19', title: 'The shift register', icon: '➡️',
    steps: [
      { type: 'learn', title: 'Bits on a conveyor belt', body: 'Chain two D flip-flops: the first one\'s Q feeds the second one\'s D. Each clock tick moves every bit **one place along**. That\'s a [[shift register]], used to send data one bit at a time down a wire.' },
      { type: 'logic', prompt: 'Make **Q1 = 1 and Q0 = 0**: shift a 1 in, then shift a 0 in behind it.',
        lab: {
          inputs: [{ id: 'D', at: [60, 70] }], clock: { id: 'CLK', at: [60, 170] },
          ffs: [{ id: 'Q0', type: 'D', in: 'D', clk: 'CLK', at: [150, 110], label: 'Q0' }, { id: 'Q1', type: 'D', in: 'Q0', clk: 'CLK', at: [250, 110], label: 'Q1', mid: [200, 120] }],
          outputs: [{ id: 'O1', from: 'Q1', at: [300, 60], label: 'Q1', mid: 285 }],
        },
        goal: (sig) => sig.Q1 && !sig.Q0,
        solution: { seq: ['D', 'clock', 'D', 'clock'] },
        hint: 'D = 1, tick, D = 0, tick.', explain: 'The 1 moved from Q0 to Q1, and a 0 followed it in. Data marching along, one tick at a time.' },
      mcq('A 4-bit shift register starts at 0000. You shift in 1, 1, 0, 1. What does it hold (first bit in is furthest along)?', ['1101', '1011', '0000'], 0, 'The first bit ends at the far end.', '1101: the first bit shifted furthest.'),
    ],
  },
  drill('a11-20', 'Practice: binary to decimal', '🧮', 'Place values: 128 · 64 · 32 · 16 · 8 · 4 · 2 · 1.', [
    binToDec('1010'), binToDec('1111'), binToDec('100000'), binToDec('11001'), binToDec('10000001'),
  ]),
  drill('a11-21', 'Practice: decimal to binary', '🧮', 'Find the biggest power of 2 that fits, subtract, repeat.', [
    decToBin(6), decToBin(12), decToBin(21), decToBin(33), decToBin(100),
  ]),
  drill('a11-22', 'Practice: hexadecimal', '🧮', '0–9, then A=10 … F=15. Two hex digits make a byte.', [
    hexToDec('A'), hexToDec('1F'), hexToDec('80'), hexToDec('FF'), hexToDec('C8'),
  ]),
  {
    id: 'a11-23', title: 'Practice: truth tables', icon: '🧮',
    steps: [
      { type: 'learn', title: 'Gate rules', body: 'AND: all 1 · OR: any 1 · XOR: different · NAND: not all 1 · NOR: none · XNOR: same.' },
      mcq('XOR(1, 1) =', ['0', '1'], 0, 'Same inputs.', '0, because XOR wants them different.'),
      mcq('NOR(0, 0) =', ['1', '0'], 0, 'NOT-OR.', 'OR gives 0, then NOT gives 1.'),
      mcq('AND(1, 0, 1) =', ['0', '1'], 0, 'All must be 1.', '0, because one input is 0.'),
      mcq('OR(0, 0, 1) =', ['1', '0'], 0, 'Any 1.', '1.'),
      mcq('NAND(0, 1) =', ['1', '0'], 0, 'Not all 1.', '1.'),
    ],
  },
  drill('a11-24', 'Practice: 8-bit overflow', '🧮', '8 bits hold 0–255. Past 255, subtract 256 and set the carry.', [
    wrap8(200, 100), wrap8(255, 1), wrap8(128, 128), wrap8(100, 50),
  ]),
];
