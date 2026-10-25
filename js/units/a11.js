// A11 · Logic: binary, gates, truth tables, adders, memory, counters.

export const glossary = {
  bit: 'A single binary digit: 0 or 1. Eight bits make a byte.',
  binary: 'Counting with only 0 and 1. Each place is worth double the one to its right: 8, 4, 2, 1.',
  'logic gate': 'A tiny circuit (made of transistors) that takes 1s and 0s in and gives a 1 or 0 out by a fixed rule.',
  'truth table': 'A table listing a gate\'s output for every possible combination of inputs.',
  'half adder': 'Two gates (XOR and AND) that add two bits, giving a sum bit and a carry bit.',
  latch: 'A circuit that remembers one bit, built by feeding gates\' outputs back into each other.',
  'flip-flop': 'A memory cell that only updates its stored bit on a clock tick.',
  'clock signal': 'A steady on-off pulse that keeps a digital circuit in step. Each tick moves things forward.',
};

const table = (api, fn) => api.table().every((r) => r.out.Y === (fn(r.in) ? 1 : 0));
const twoIn = (type, choices) => ({
  inputs: [{ id: 'A', at: [70, 70] }, { id: 'B', at: [70, 150] }],
  gates: [{ id: 'G', type, in: ['A', 'B'], at: [180, 110], choices, label: 'Gate' }],
  outputs: [{ id: 'Y', from: 'G', at: [280, 110], label: 'Y' }],
});

export default {
  id: 'a11',
  title: 'Logic',
  subtitle: 'Gates, adders and memory',
  lessons: [
    {
      id: 'a11-1', title: 'Counting in binary', icon: '🔢',
      steps: [
        { type: 'learn', title: 'Only 0 and 1',
          body: 'Computers store everything as [[bit]]s: 0 or 1. In [[binary]] each place is worth double the next:\n\n**8 · 4 · 2 · 1**\n\nSo **1011** = 8 + 0 + 2 + 1 = **11**.' },
        { type: 'logic', prompt: 'Flip the switches to show **9** in binary.',
          lab: {
            inputs: [{ id: 'B3', label: '8', at: [110, 40] }, { id: 'B2', label: '4', at: [110, 85] }, { id: 'B1', label: '2', at: [110, 130] }, { id: 'B0', label: '1', at: [110, 175] }],
            outputs: [], displays: [{ label: 'decimal', bits: ['B3', 'B2', 'B1', 'B0'], at: [240, 105] }],
          },
          goal: (sig, st, api) => api.value(['B3', 'B2', 'B1', 'B0']) === 9,
          hint: '9 = 8 + 1.', explain: '1001 = 8 + 1 = 9.' },
        { type: 'numeric', q: 'What is binary **10110** in decimal?', answer: 22, tol: 0.001, unit: '',
          hint: 'Places: 16 · 8 · 4 · 2 · 1.', explain: '16 + 4 + 2 = 22.' },
        { type: 'numeric', q: 'What\'s the biggest number 8 bits can hold?', answer: 255, tol: 0.001, unit: '',
          hint: '11111111.', explain: '128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255.' },
      ],
    },
    {
      id: 'a11-2', title: 'AND, OR, NOT', icon: '🚦',
      steps: [
        { type: 'learn', title: 'Logic gates',
          body: 'A [[logic gate]] follows one rule:\n\n• **AND**: 1 only if **all** inputs are 1\n• **OR**: 1 if **any** input is 1\n• **NOT**: flips 1 ↔ 0\n\nRemember series switches (AND) and parallel switches (OR)? Same idea.' },
        { type: 'logic', prompt: 'Make the AND gate\'s output **1**.', lab: twoIn('AND'),
          goal: (sig) => sig.Y, hint: 'AND needs every input on.', explain: 'Both inputs at 1, so AND gives 1.' },
        { type: 'logic', prompt: 'A burglar alarm should ring if door A **or** door B opens. Pick the gate, then test it.',
          lab: twoIn('AND', ['AND', 'OR']),
          goal: (sig, st, api) => table(api, (i) => i.A || i.B), hint: 'Either one is enough.', explain: 'OR: any open door sets it off.' },
        { type: 'mcq', q: 'A NOT gate gets a 1. What does it output?', choices: ['0', '1'], answer: 0, hint: 'It flips.', explain: 'NOT turns 1 into 0.' },
      ],
    },
    {
      id: 'a11-3', title: 'XOR and NAND', icon: '🔀',
      steps: [
        { type: 'learn', title: 'More gates',
          body: '• **XOR**: 1 if the inputs are **different**\n• **NAND**: NOT-AND, 0 only if all inputs are 1\n• **NOR**: NOT-OR\n\nEvery [[truth table]] lists the output for every input combination.' },
        { type: 'logic', prompt: 'A hallway light has a switch at each end. Flipping **either** switch should toggle the light. Pick the gate.',
          lab: twoIn('AND', ['AND', 'OR', 'XOR', 'NAND']),
          goal: (sig, st, api) => table(api, (i) => i.A !== i.B), hint: 'Light on when the switches disagree.', explain: 'XOR: flip either switch and the inputs change from same to different, or back.' },
        { type: 'mcq', q: 'Why is NAND called a "universal" gate?', choices: ['You can build every other gate from NANDs', 'It works everywhere', 'It\'s the fastest'], answer: 0,
          hint: 'Chip makers love it.', explain: 'Any logic circuit, even a whole computer, can be built from NAND gates alone.' },
      ],
    },
    {
      id: 'a11-4', title: 'Combining gates', icon: '🧩',
      steps: [
        { type: 'learn', title: 'Bigger rules from small ones',
          body: 'Chain gates to make any rule you like. Example: "the fan runs if it\'s hot **and** someone\'s home, **or** if the override is on."\n\n**Y = (A AND B) OR C**' },
        { type: 'logic', prompt: 'Pick both gates so **Y = (A AND B) OR C**.',
          lab: {
            inputs: [{ id: 'A', at: [60, 50] }, { id: 'B', at: [60, 100] }, { id: 'C', at: [60, 175] }],
            gates: [
              { id: 'G1', type: 'OR', in: ['A', 'B'], at: [150, 75], choices: ['AND', 'OR'], label: 'G1' },
              { id: 'G2', type: 'AND', in: ['G1', 'C'], at: [245, 125], choices: ['AND', 'OR'], label: 'G2', mid: [192, 140] },
            ],
            outputs: [{ id: 'Y', from: 'G2', at: [300, 125], label: 'Y' }],
          },
          goal: (sig, st, api) => table(api, (i) => (i.A && i.B) || i.C),
          hint: 'The first gate combines A and B. The second combines that with C.', explain: 'G1 = AND, G2 = OR. You just built a rule from two gates.' },
        { type: 'mcq', q: 'With Y = (A AND B) OR C, which inputs give Y = 1?', choices: ['A=1, B=0, C=0', 'A=0, B=0, C=1', 'A=0, B=1, C=0'], answer: 1,
          hint: 'C alone is enough.', explain: 'C = 1 makes the OR true no matter what A and B are.' },
      ],
    },
    {
      id: 'a11-5', title: 'Adding with gates', icon: '➕',
      steps: [
        { type: 'learn', title: 'The half adder',
          body: 'In binary: 0+0 = 0, 0+1 = 1, 1+1 = **10** (that\'s 2: a 0 with a carry of 1).\n\nA [[half adder]] makes the **sum** bit with one gate and the **carry** bit with another. Chain enough of these and you have a calculator.' },
        { type: 'logic', prompt: 'Pick the gates so SUM and CARRY add A + B correctly.',
          lab: {
            inputs: [{ id: 'A', at: [60, 70] }, { id: 'B', at: [60, 150] }],
            gates: [
              { id: 'S', type: 'OR', in: ['A', 'B'], at: [185, 60], choices: ['AND', 'OR', 'XOR'], label: 'Sum gate', mid: [100, 140] },
              { id: 'C', type: 'OR', in: ['A', 'B'], at: [185, 165], choices: ['AND', 'OR', 'XOR'], label: 'Carry gate', mid: [120, 100] },
            ],
            outputs: [{ id: 'SUM', from: 'S', at: [285, 60], label: 'SUM' }, { id: 'CARRY', from: 'C', at: [285, 165], label: 'CARRY' }],
          },
          goal: (sig, st, api) => api.table().every((r) => r.out.SUM === (r.in.A ^ r.in.B) && r.out.CARRY === (r.in.A & r.in.B)),
          hint: 'SUM is 1 when exactly one input is 1. CARRY only for 1 + 1.', explain: 'SUM = XOR, CARRY = AND. Every computer\'s arithmetic starts here.' },
        { type: 'numeric', q: 'In binary, what is 1 + 1? (Write the binary answer.)', answer: 10, tol: 0.001, unit: '',
          hint: 'Two in binary.', explain: '1 + 1 = 2 = binary 10: sum 0, carry 1.' },
      ],
    },
    {
      id: 'a11-6', title: 'Memory', icon: '🧠',
      steps: [
        { type: 'learn', title: 'Circuits that remember',
          body: 'Feed two NOR gates\' outputs back into each other and you get a [[latch]]. **S**et turns it on, **R**eset turns it off, and when you let go it **remembers**.\n\nThat feedback loop is the basis of all computer memory.' },
        { type: 'logic', prompt: 'Make the latch **remember a 1**: press **S** (on), then release it (off). Q should stay lit.',
          lab: {
            inputs: [{ id: 'R', at: [60, 52] }, { id: 'S', at: [60, 168] }],
            gates: [
              { id: 'QN', type: 'NOR', in: ['Q', 'S'], at: [170, 160], mid: [[[214, 60], [214, 112], [130, 112], [130, 152]]] },
              { id: 'Q', type: 'NOR', in: ['R', 'QN'], at: [170, 60], mid: [undefined, [[226, 160], [226, 124], [118, 124], [118, 68]]] },
            ],
            outputs: [{ id: 'OUT', from: 'Q', at: [285, 60], label: 'Q' }],
          },
          goal: (sig) => sig.OUT && !sig.S && !sig.R,
          solution: { seq: ['S', 'S'] },
          hint: 'Flip S on, then off again.', explain: 'S is off again, but Q stayed 1. The circuit remembers. Press R to make it forget.' },
        { type: 'learn', title: 'Clocked memory',
          body: 'A [[flip-flop]] only looks at its input **D** on a tick of the [[clock signal]]. Between ticks, D can do anything and the stored bit doesn\'t change.\n\nThat\'s how a computer keeps everything in step.' },
        { type: 'logic', prompt: 'Store a **1**: set D to 1, tick the clock, then set D back to 0. Q should keep the 1.',
          lab: {
            inputs: [{ id: 'D', at: [70, 70] }], clock: { id: 'CLK', at: [70, 160] },
            ffs: [{ id: 'Q', type: 'D', in: 'D', clk: 'CLK', at: [190, 110], label: 'flip-flop' }],
            outputs: [{ id: 'OUT', from: 'Q', at: [285, 102], label: 'Q' }],
          },
          goal: (sig) => sig.OUT && !sig.D,
          solution: { seq: ['D', 'clock', 'D'] },
          hint: 'D on → clock → D off.', explain: 'The flip-flop grabbed D only at the tick, so it ignored D changing afterwards.' },
      ],
    },
    {
      id: 'a11-7', title: 'Counting with flip-flops', icon: '⏲️',
      steps: [
        { type: 'learn', title: 'A counter',
          body: 'A **T** flip-flop flips its output on every tick. Chain three, each one clocked by the one before, and they count in binary: 000, 001, 010, 011…\n\nThe "count" display reads Q2 Q1 Q0 as a number.' },
        { type: 'logic', prompt: 'Tick the clock until the counter shows **5**.',
          lab: {
            inputs: [{ id: 'T', at: [62, 30], value: true }], clock: { id: 'CLK', at: [40, 185] },
            gates: [{ id: 'N0', type: 'NOT', in: ['Q0'], at: [175, 165] }, { id: 'N1', type: 'NOT', in: ['Q1'], at: [255, 165] }],
            ffs: [
              { id: 'Q0', type: 'T', in: 'T', clk: 'CLK', at: [130, 100], mid: [82, 95] },
              { id: 'Q1', type: 'T', in: 'T', clk: 'N0', at: [210, 100], mid: [170, 182] },
              { id: 'Q2', type: 'T', in: 'T', clk: 'N1', at: [290, 100], mid: [250, 262] },
            ],
            outputs: [], displays: [{ label: 'count', bits: ['Q2', 'Q1', 'Q0'], at: [50, 105] }],
            maxPulses: 9,
          },
          goal: (sig, st, api) => api.value(['Q2', 'Q1', 'Q0']) === 5,
          hint: 'Count the ticks.', explain: 'Five ticks: 101 = 4 + 1 = 5. Digital clocks and timers count exactly like this.' },
        { type: 'mcq', q: 'A 3-bit counter is at 7 (111). What does the next tick give?', choices: ['8', '0', '6'], answer: 1,
          hint: 'It only has 3 bits.', explain: 'It rolls over to 000. That\'s called overflow.' },
      ],
    },
    {
      id: 'a11-8', title: 'Checkpoint: logic', icon: '🏁',
      steps: [
        { type: 'learn', title: 'Logic check', body: 'Binary, gates, combinations, adders and memory. That\'s everything a computer is built from.' },
        { type: 'logic', prompt: 'A plant waters itself if the soil is dry (A = 1) **and it\'s not raining** (B = 0). Pick the gate so Y matches.',
          lab: {
            inputs: [{ id: 'A', at: [60, 60] }, { id: 'B', at: [60, 160] }],
            gates: [{ id: 'N', type: 'NOT', in: ['B'], at: [140, 160] }, { id: 'G', type: 'OR', in: ['A', 'N'], at: [225, 110], choices: ['AND', 'OR', 'XOR'], label: 'Gate' }],
            outputs: [{ id: 'Y', from: 'G', at: [295, 110], label: 'Y' }],
          },
          goal: (sig, st, api) => table(api, (i) => i.A && !i.B),
          hint: 'Both conditions must be true.', explain: 'A AND (NOT B). The NOT turns "raining" into "not raining".' },
        { type: 'numeric', q: 'What is decimal 13 in binary?', answer: 1101, tol: 0.0001, unit: '',
          hint: '8 + 4 + 1.', explain: '8 + 4 + 0 + 1 → 1101.' },
        { type: 'mcq', q: 'Which part lets a computer remember a bit between clock ticks?', choices: ['A flip-flop', 'An XOR gate', 'A resistor'], answer: 0,
          hint: 'Clocked memory.', explain: 'A flip-flop stores a bit and only updates on the clock tick.' },
      ],
    },
  ],
};
