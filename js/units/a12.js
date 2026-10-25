// A12 · Computers: an 8-bit computer you step through, edit and program.

export const glossary = {
  CPU: 'Central Processing Unit: the part that fetches instructions from memory and carries them out.',
  RAM: 'Memory the CPU can read and write. Each address holds one byte.',
  register: 'A tiny, super-fast memory slot inside the CPU, like A and B here.',
  'program counter': 'The register that holds the address of the next instruction (PC).',
  ALU: 'Arithmetic Logic Unit: the adder/subtractor inside the CPU, built from logic gates like your half adder.',
  instruction: 'One command for the CPU, such as LDA (load A) or ADD. Stored in memory as a byte.',
  'fetch-execute cycle': 'What every CPU does forever: fetch the next instruction, work out what it means, then do it.',
  carry: 'A flag set when an addition overflows 255 (doesn\'t fit in 8 bits).',
};

const data = (n) => ({ data: n });
const pad = (cells) => [...cells, ...Array(16 - cells.length).fill(null)].map((c) => c ?? data(0));
const withData = (prog, d14, d15) => { const r = pad(prog); r[14] = data(d14); r[15] = data(d15); return r; };
const outs = (s, list) => s.outs.length === list.length && s.outs.every((v, i) => v === list[i]);

export default {
  id: 'a12',
  title: 'Computers',
  subtitle: 'Inside an 8-bit computer',
  lessons: [
    {
      id: 'a12-1', title: 'What\'s in a computer?', icon: '🖥️',
      steps: [
        { type: 'learn', title: 'Four main parts',
          body: '• **Memory ([[RAM]])**: holds the program and the data\n• **[[CPU]]**: fetches and runs instructions\n• **[[ALU]]**: does the maths, built from adders like yours\n• **Clock**: ticks to keep it all in step\n\nYou\'ve built every one of these pieces already: gates, adders, flip-flops and counters.' },
        { type: 'mcq', q: 'What does the ALU do?', choices: ['Stores the program', 'Does arithmetic and logic', 'Ticks the clock'], answer: 1,
          hint: 'Arithmetic Logic Unit.', explain: 'It adds, subtracts and compares, using gates like your half adder.' },
        { type: 'mcq', q: 'Which part keeps track of the next instruction to run?', choices: ['The program counter', 'The display', 'The ALU'], answer: 0,
          hint: 'It counts through the program.', explain: 'The [[program counter]] holds the address of the next instruction.' },
      ],
    },
    {
      id: 'a12-2', title: 'Run a program', icon: '▶️',
      steps: [
        { type: 'learn', title: 'Instructions are just bytes',
          body: 'Each [[instruction]] is a byte in memory. The top 4 bits say **what** to do, the bottom 4 say **where**.\n\n**LDA 14** means "load A from address 14". **ADD 15** adds the number at 15. **OUT** shows A. **HLT** stops.' },
        { type: 'cpu', prompt: 'This program adds two numbers. Press **Step** to run one instruction at a time until it halts. Read the log as you go.',
          machine: { ram: withData([{ op: 'LDA', arg: 14 }, { op: 'ADD', arg: 15 }, { op: 'OUT' }, { op: 'HLT' }], 28, 14) },
          goal: (s) => s.halted && s.out === 42,
          hint: 'Keep pressing Step (or Run).', explain: '28 + 14 = 42, computed by fetching four instructions from memory, one after another.' },
        { type: 'mcq', q: 'In "LDA 14", what is 14?', choices: ['The number to load', 'The memory address to load from', 'The step number'], answer: 1,
          hint: 'Look at the log.', explain: 'It\'s an address. The CPU loads whatever number is stored at address 14.' },
      ],
    },
    {
      id: 'a12-3', title: 'Fetch, decode, execute', icon: '🔁',
      steps: [
        { type: 'learn', title: 'The heartbeat',
          body: 'Every CPU runs the [[fetch-execute cycle]] forever:\n\n1. **Fetch** the byte at PC\n2. **Decode**: what instruction is it?\n3. **Execute** it\n4. PC moves on, so repeat\n\nYour phone does this billions of times a second.' },
        { type: 'cpu', prompt: 'Change the **data at address 15** so the program outputs **50**. (It computes RAM[14] + RAM[15], and 14 holds 30.)',
          machine: { ram: withData([{ op: 'LDA', arg: 14 }, { op: 'ADD', arg: 15 }, { op: 'OUT' }, { op: 'HLT' }], 30, 0), editable: [15] },
          goal: (s) => s.halted && s.out === 50, solution: [{ addr: 15, data: 20 }],
          hint: '30 + ? = 50', explain: 'Data and program live in the same memory. Change the data and the same program gives a new answer.' },
        { type: 'mcq', q: 'After the CPU fetches an instruction, what happens to the program counter?', choices: ['It goes up by one, to the next address', 'It resets to 0', 'It doubles'], answer: 0,
          hint: 'Watch PC as you step.', explain: 'It moves to the next address, unless a jump instruction changes it.' },
      ],
    },
    {
      id: 'a12-4', title: 'Write your first program', icon: '✍️',
      steps: [
        { type: 'learn', title: 'Your turn',
          body: 'Instructions you can use:\n\n**LDI n**: put the number n (0–15) straight into A\n**OUT**: show A\n**HLT**: stop\n\nPick an instruction in each row from the drop-downs.' },
        { type: 'cpu', prompt: 'Write a 3-instruction program that shows **7** on the display and stops. Then press **Run**.',
          machine: { ram: pad([{ op: 'NOP' }, { op: 'NOP' }, { op: 'NOP' }]), editable: [0, 1, 2], ops: ['NOP', 'LDI', 'OUT', 'HLT'] },
          goal: (s) => s.halted && s.out === 7,
          solution: [{ addr: 0, op: 'LDI', arg: 7 }, { addr: 1, op: 'OUT' }, { addr: 2, op: 'HLT' }],
          hint: 'LDI 7, then OUT, then HLT.', explain: 'You just programmed a computer at the lowest level, in machine code.' },
        { type: 'mcq', q: 'What happens if you forget HLT at the end?', choices: ['The CPU keeps fetching whatever bytes come next', 'It stops anyway', 'It deletes the program'], answer: 0,
          hint: 'The CPU doesn\'t know where your program ends.', explain: 'It runs into the following memory and treats whatever is there as instructions.' },
      ],
    },
    {
      id: 'a12-5', title: 'Loops and jumps', icon: '🔂',
      steps: [
        { type: 'learn', title: 'Making decisions',
          body: '**JMP n** jumps to address n. **JZ n** jumps only if the last result was **zero**. **SUB n** subtracts.\n\nWith those, a program can loop and decide when to stop, just like a countdown.' },
        { type: 'cpu', prompt: 'This countdown should show **3, 2, 1, 0** and stop, but it\'s stuck in a loop. Fix the **JMP** at address 4, then run it.',
          machine: { ram: withData([{ op: 'LDI', arg: 3 }, { op: 'OUT' }, { op: 'JZ', arg: 6 }, { op: 'SUB', arg: 15 }, { op: 'JMP', arg: 0 }, { op: 'NOP' }, { op: 'HLT' }], 0, 1), editable: [4] },
          goal: (s) => s.halted && outs(s, [3, 2, 1, 0]), solution: [{ addr: 4, arg: 1 }],
          hint: 'Jumping to 0 reloads 3 every time. Jump back to the OUT instead.', explain: 'JMP 1 loops back to OUT without reloading 3. When A hits 0, JZ jumps to HLT. That\'s a loop with an exit.' },
        { type: 'mcq', q: 'Why did the original program never stop?', choices: ['It jumped back to LDI 3, resetting the count every time', 'HLT was broken', 'The clock stopped'], answer: 0,
          hint: 'What\'s at address 0?', explain: 'Every loop restarted at LDI 3, so A never reached 0.' },
      ],
    },
    {
      id: 'a12-6', title: 'Limits of 8 bits', icon: '🧮',
      steps: [
        { type: 'learn', title: 'Overflow and carry',
          body: '8 bits hold 0–255. Add past 255 and it wraps around, setting the [[carry]] flag.\n\n200 + 100 = 300, but in 8 bits that\'s **44** with carry = 1. Bigger computers use 32 or 64 bits.' },
        { type: 'cpu', prompt: 'Set the data at 15 so 200 + RAM[15] **overflows** and sets the carry flag. Run it and watch the **C** flag.',
          machine: { ram: withData([{ op: 'LDA', arg: 14 }, { op: 'ADD', arg: 15 }, { op: 'OUT' }, { op: 'HLT' }], 200, 10), editable: [15] },
          goal: (s) => s.halted && s.carry, solution: [{ addr: 15, data: 100 }],
          hint: 'You need a total above 255.', explain: 'The sum didn\'t fit in 8 bits, so it wrapped and the carry flag lit. A wider adder would keep that extra bit.' },
        { type: 'numeric', q: 'In 8 bits, what does 250 + 10 wrap around to?', answer: 4, tol: 0.001, unit: '',
          hint: '260 − 256', explain: '260 − 256 = 4, with carry = 1.' },
      ],
    },
    {
      id: 'a12-7', title: 'Checkpoint: program it', icon: '🏁',
      steps: [
        { type: 'learn', title: 'Final challenge', body: 'Use LDA, ADD, OUT and HLT to add two numbers stored in memory.' },
        { type: 'cpu', prompt: 'Address 14 holds 9 and address 15 holds 6. Write a program that shows their **sum** and halts.',
          machine: { ram: withData([{ op: 'NOP' }, { op: 'NOP' }, { op: 'NOP' }, { op: 'NOP' }], 9, 6), editable: [0, 1, 2, 3], ops: ['NOP', 'LDA', 'ADD', 'OUT', 'HLT'] },
          goal: (s) => s.halted && s.out === 15,
          solution: [{ addr: 0, op: 'LDA', arg: 14 }, { addr: 1, op: 'ADD', arg: 15 }, { addr: 2, op: 'OUT' }, { addr: 3, op: 'HLT' }],
          hint: 'LDA 14, ADD 15, OUT, HLT.', explain: '9 + 6 = 15. From switches and lamps to a programmable computer: you understand every layer now.' },
        { type: 'mcq', q: 'A CPU\'s clock runs at 3 GHz. Roughly how many ticks is that per second?', choices: ['3 thousand', '3 million', '3 billion'], answer: 2,
          hint: 'Giga = billion.', explain: '3 billion ticks every second.' },
      ],
    },
  ],
};
