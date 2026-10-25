// A12 deep practice: programs to edit and write, concepts, drills.
import { mcq, num } from './drill.js';
import { encode } from '../cpu.js';

export const glossary = {
  'machine code': 'The raw bytes a CPU runs, like 01010111. Assembly language writes the same thing as words, like LDI 7.',
  cache: 'Small, very fast memory inside the CPU that keeps copies of recently used data.',
  'memory hierarchy': 'Registers (fastest, tiny) → cache → RAM → storage (slowest, huge).',
};

const data = (n) => ({ data: n });
const ram = (cells) => Array.from({ length: 16 }, (_, i) => cells[i] ?? data(0));
const outs = (s, list) => s.outs.length === list.length && s.outs.every((v, i) => v === list[i]);
const enc = (op, arg) => num(`What byte (in decimal) encodes **${op}${arg !== undefined ? ` ${arg}` : ''}**? (Codes: LDA=1, ADD=2, SUB=3, STA=4, LDI=5, JMP=6, OUT=14, HLT=15. Byte = code × 16 + operand.)`,
  encode({ op, arg }), '', 'Top 4 bits = code, bottom 4 bits = operand.', `${op} → code × 16 + ${arg ?? 0} = ${encode({ op, arg })}.`, 0.0001);

export const lessons = [
  {
    id: 'a12-11', title: 'Challenge: countdown from 5', icon: '🚀',
    steps: [
      { type: 'learn', title: 'Change one instruction', body: 'This program counts down from 3. Change the instruction at **address 0** so it counts **5, 4, 3, 2, 1, 0**.' },
      { type: 'cpu', prompt: 'Edit address 0 so the countdown starts at **5**, then run it.',
        machine: { ram: ram([{ op: 'LDI', arg: 3 }, { op: 'OUT' }, { op: 'JZ', arg: 6 }, { op: 'SUB', arg: 15 }, { op: 'JMP', arg: 1 }, { op: 'NOP' }, { op: 'HLT' }, ...Array(8).fill(null), data(1)]), editable: [0], ops: ['LDI'] },
        goal: (s) => s.halted && outs(s, [5, 4, 3, 2, 1, 0]), solution: [{ addr: 0, arg: 5 }],
        hint: 'LDI 5.', explain: 'One number changed and the whole behaviour follows. That\'s the power of stored programs.' },
      mcq('How many times does OUT run in that countdown?', ['6', '5', '1'], 0, '5, 4, 3, 2, 1, 0.', 'Six times, including 0.'),
    ],
  },
  {
    id: 'a12-12', title: 'Write: subtract', icon: '✍️',
    steps: [
      { type: 'learn', title: 'Your program', body: 'Address 14 holds **20** and address 15 holds **7**. Write a program that shows **20 − 7**.' },
      { type: 'cpu', prompt: 'Write it in addresses 0–3, then run.',
        machine: { ram: ram([{ op: 'NOP' }, { op: 'NOP' }, { op: 'NOP' }, { op: 'NOP' }, ...Array(10).fill(null), data(20), data(7)]), editable: [0, 1, 2, 3], ops: ['NOP', 'LDA', 'SUB', 'OUT', 'HLT'] },
        goal: (s) => s.halted && s.out === 13,
        solution: [{ addr: 0, op: 'LDA', arg: 14 }, { addr: 1, op: 'SUB', arg: 15 }, { addr: 2, op: 'OUT' }, { addr: 3, op: 'HLT' }],
        hint: 'LDA 14, SUB 15, OUT, HLT.', explain: '20 − 7 = 13.' },
      mcq('If you swapped to LDA 15, SUB 14, what would the 8-bit result be?', ['243 (7 − 20 wraps around)', '13', '−13'], 0, 'No negative numbers in 8 bits.', '7 − 20 = −13, which wraps to 256 − 13 = 243.'),
    ],
  },
  {
    id: 'a12-13', title: 'Challenge: count to 8', icon: '🔢',
    steps: [
      { type: 'learn', title: 'A loop with a limit', body: 'This program counts up 1, 2, 3… and stops when it reaches the limit stored at **address 14** (now 5). Make it count to **8**.' },
      { type: 'cpu', prompt: 'Change the limit at address 14 so it counts **1 to 8**.',
        machine: { ram: ram([{ op: 'LDA', arg: 13 }, { op: 'ADD', arg: 15 }, { op: 'STA', arg: 13 }, { op: 'OUT' }, { op: 'SUB', arg: 14 }, { op: 'JZ', arg: 7 }, { op: 'JMP', arg: 0 }, { op: 'HLT' }, ...Array(5).fill(null), data(0), data(5), data(1)]), editable: [14] },
        goal: (s) => s.halted && outs(s, [1, 2, 3, 4, 5, 6, 7, 8]), solution: [{ addr: 14, data: 8 }],
        hint: 'Address 14 is the limit.', explain: 'Data controls the loop. The same program counts to anything up to 255.' },
      mcq('Why does the program SUB the limit and then JZ?', ['Subtracting the limit gives 0 exactly when the count equals it', 'To make the count smaller', 'SUB displays the number'], 0, 'Zero means equal.', 'If count − limit = 0, they\'re equal, so it\'s time to stop.'),
    ],
  },
  {
    id: 'a12-14', title: 'Bug hunt', icon: '🐞',
    steps: [
      { type: 'learn', title: 'Find the wrong instruction', body: 'This program should show **7 + 3 = 10**, but it shows 4. One instruction is wrong.' },
      { type: 'cpu', prompt: 'Fix the instruction at **address 1**, then run.',
        machine: { ram: ram([{ op: 'LDA', arg: 14 }, { op: 'SUB', arg: 15 }, { op: 'OUT' }, { op: 'HLT' }, ...Array(10).fill(null), data(7), data(3)]), editable: [1], ops: ['ADD', 'SUB'] },
        goal: (s) => s.halted && s.out === 10, solution: [{ addr: 1, op: 'ADD' }],
        hint: 'It should add, not subtract.', explain: 'ADD 15: 7 + 3 = 10. Most bugs are one small wrong detail.' },
      mcq('A good way to find bugs in a short program is to…', ['Step through it one instruction at a time, watching the registers', 'Run it faster', 'Delete it'], 0, 'Watch it work.', 'Stepping shows exactly where things go wrong.'),
    ],
  },
  {
    id: 'a12-15', title: 'Write: double it', icon: '✖️',
    steps: [
      { type: 'learn', title: 'Doubling', body: 'Address 15 holds **21**. Write a program that shows **twice** that number. Hint: adding a number to itself doubles it.' },
      { type: 'cpu', prompt: 'Write it in addresses 0–3, then run.',
        machine: { ram: ram([{ op: 'NOP' }, { op: 'NOP' }, { op: 'NOP' }, { op: 'NOP' }, ...Array(11).fill(null), data(21)]), editable: [0, 1, 2, 3], ops: ['NOP', 'LDA', 'ADD', 'OUT', 'HLT'] },
        goal: (s) => s.halted && s.out === 42,
        solution: [{ addr: 0, op: 'LDA', arg: 15 }, { addr: 1, op: 'ADD', arg: 15 }, { addr: 2, op: 'OUT' }, { addr: 3, op: 'HLT' }],
        hint: 'LDA 15, ADD 15, OUT, HLT.', explain: '21 + 21 = 42.' },
      mcq('In binary, doubling a number is the same as…', ['Shifting all its bits one place left', 'Flipping all its bits', 'Adding 2'], 0, '0101 → 1010', 'Shifting left by one place doubles it, which is why CPUs multiply by 2 so fast.'),
    ],
  },
  {
    id: 'a12-16', title: 'The memory hierarchy', icon: '🏔️',
    steps: [
      { type: 'learn', title: 'Fast and small, slow and big',
        body: 'The [[memory hierarchy]]:\n\n• **Registers**: a handful, inside the CPU, instant\n• **[[cache]]**: a few MB, nanoseconds\n• **RAM**: gigabytes, a bit slower\n• **Storage** (SSD): terabytes, much slower, but keeps data when off' },
      mcq('Which keeps your files when the power is off?', ['SSD storage', 'RAM', 'Registers'], 0, 'Non-volatile.', 'Storage. RAM and registers forget everything without power.'),
      mcq('Why have a cache at all?', ['RAM is too slow to feed the CPU every instruction', 'It\'s cheaper than RAM', 'It stores files'], 0, 'Speed gap.', 'The cache keeps the data the CPU needs right now close at hand.'),
    ],
  },
  {
    id: 'a12-17', title: 'Machine code and assembly', icon: '📜',
    steps: [
      { type: 'learn', title: 'Words for bytes',
        body: 'The CPU only sees bytes like **00011110**: that\'s [[machine code]]. Humans write **assembly** instead (LDA 14), and an assembler turns it into bytes.\n\nHigher-level languages like Python are translated down to machine code in the end.' },
      enc('LDA', 14),
      mcq('Who reads machine code directly?', ['The CPU', 'Programmers, mostly', 'The keyboard'], 0, 'Bytes only.', 'The CPU. People use assembly or higher-level languages.'),
    ],
  },
  {
    id: 'a12-18', title: 'Clock speed', icon: '⏲️',
    steps: [
      { type: 'learn', title: 'Ticks per second',
        body: 'Each clock tick moves the CPU one small step. Our toy CPU needs about **5 ticks** per instruction. A **3 GHz** CPU ticks 3 billion times a second, and modern chips even finish several instructions per tick.' },
      num('A CPU at 1 MHz needs 5 ticks per instruction. Instructions per second?', 1000000 / 5, 'per s', '1 000 000 ÷ 5', '200 000 instructions per second.'),
      num('A 2 GHz CPU completes 4 instructions per tick. Billions of instructions per second?', 8, 'billion/s', '2 × 4', '8 billion every second.'),
    ],
  },
  {
    id: 'a12-19', title: 'Practice: encoding instructions', icon: '🧮',
    steps: [
      { type: 'learn', title: 'Hand assembly', body: 'Byte = **code × 16 + operand**. LDA=1 · ADD=2 · SUB=3 · STA=4 · LDI=5 · JMP=6 · OUT=14 · HLT=15.' },
      enc('LDI', 7), enc('OUT'), enc('HLT'), enc('JMP', 3), enc('ADD', 15),
    ],
  },
  {
    id: 'a12-20', title: 'Review: inside the CPU', icon: '🧠',
    steps: [
      { type: 'learn', title: 'CPU sense', body: 'Mixed questions on the Computers unit.' },
      mcq('Which register holds the address of the next instruction?', ['The program counter', 'A', 'OUT'], 0, 'PC.', 'The program counter.'),
      mcq('What does JZ need to decide whether to jump?', ['The zero flag', 'The display', 'The clock speed'], 0, 'Flags.', 'The zero flag from the last ALU result.'),
      mcq('Where do instructions and data live in this computer?', ['In the same RAM', 'Data in RAM, instructions in the ALU', 'Instructions on the display'], 0, 'One memory.', 'The same RAM, a design known as a stored-program computer.'),
      mcq('Which part is built from adders like yours?', ['The ALU', 'The display', 'The clock'], 0, 'Arithmetic.', 'The ALU.'),
    ],
  },
];
