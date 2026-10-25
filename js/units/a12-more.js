// A12 extra depth: storing results, multiplying with a loop, flags.

export const glossary = {
  STA: 'Store A: copies the A register into a memory address, so a result is saved.',
  flag: 'A one-bit note the ALU leaves after each sum, such as zero (Z) or carry (C). Jump instructions read them.',
};

const data = (n) => ({ data: n });
const ram = (cells) => Array.from({ length: 16 }, (_, i) => cells[i] ?? data(0));

export const lessons = [
  {
    id: 'a12-8', title: 'Saving results', icon: '💾',
    steps: [
      { type: 'learn', title: 'STA: store A',
        body: 'Registers are tiny and get overwritten. To keep a result, the CPU writes it back to memory with [[STA]]: "store A at address n".\n\nWatch address 15 as this program runs.' },
      { type: 'cpu', prompt: 'This program computes 5 + 3 and **stores** the answer at address 15. Run it and watch address 15 change.',
        machine: { ram: ram([{ op: 'LDI', arg: 5 }, { op: 'ADD', arg: 14 }, { op: 'STA', arg: 15 }, { op: 'OUT' }, { op: 'HLT' }, ...Array(9).fill(null), data(3)]) },
        goal: (s) => s.halted && s.ram[15] === 8,
        hint: 'Press Run.', explain: 'RAM[15] now holds 8 (00001000). The result survives even after A is reused.' },
      { type: 'mcq', q: 'After STA 15, where is the result?', choices: ['Only in A', 'In A and in memory address 15', 'Only on the display'], answer: 1,
        hint: 'Store copies, it doesn\'t move.', explain: 'STA copies A into memory, so the value is in both places.' },
    ],
  },
  {
    id: 'a12-9', title: 'Multiplying with a loop', icon: '✖️',
    steps: [
      { type: 'learn', title: 'No multiply instruction? Loop!',
        body: 'This tiny CPU can only add and subtract. To multiply, it adds **again and again**: 4 × 3 = 4 + 4 + 4.\n\nThe program keeps a running total at address 13, the number to add at 14, and a countdown at 15.' },
      { type: 'cpu', prompt: 'It\'s set up for 4 × 3. Change the data at **address 14** so it computes **5 × 3 = 15**, then run it.',
        machine: { ram: ram([
          { op: 'LDA', arg: 13 }, { op: 'ADD', arg: 14 }, { op: 'STA', arg: 13 }, { op: 'LDA', arg: 15 }, { op: 'SUB', arg: 12 }, { op: 'STA', arg: 15 },
          { op: 'JZ', arg: 8 }, { op: 'JMP', arg: 0 }, { op: 'LDA', arg: 13 }, { op: 'OUT' }, { op: 'HLT' }, data(0), data(1), data(0), data(4), data(3),
        ]), editable: [14] },
        goal: (s) => s.halted && s.out === 15, solution: [{ addr: 14, data: 5 }],
        hint: 'Address 14 is the number being added.', explain: '5 + 5 + 5 = 15, using 3 trips round the loop. Real CPUs have multiply circuits, but early ones did exactly this.' },
      { type: 'mcq', q: 'How could you make it compute 5 × 4 instead?', choices: ['Change the countdown at address 15 to 4', 'Change address 12 to 4', 'Delete HLT'], answer: 0,
        hint: 'The countdown sets how many times it adds.', explain: 'The countdown decides how many additions happen.' },
    ],
  },
  {
    id: 'a12-10', title: 'Flags and decisions', icon: '🚩',
    steps: [
      { type: 'learn', title: 'How a CPU decides',
        body: 'After each ADD or SUB the ALU sets [[flag]]s:\n\n• **Z (zero)**: the result was 0\n• **C (carry)**: the result overflowed\n\n**JZ** and **JC** jump only if their flag is set. Every "if" in every program comes down to this.' },
      { type: 'mcq', q: 'A = 7. The program runs SUB with RAM holding 7. Which flag is set?', choices: ['Z, because the result is 0', 'Neither', 'Only C'], answer: 0,
        hint: '7 − 7', explain: 'The result is 0, so Z is set and JZ would jump. (This CPU also sets carry when subtracting without a borrow.)' },
      { type: 'mcq', q: 'In a countdown loop, which instruction decides when to stop?', choices: ['JZ', 'OUT', 'LDI'], answer: 0,
        hint: 'Stop when it reaches zero.', explain: 'JZ jumps out of the loop when the count hits zero.' },
    ],
  },
];
