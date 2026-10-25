import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLogic, toggleInput, pulseClock, truthTable, displayValue } from '../js/logic.js';
import { runCpu, createCpu, stepCpu } from '../js/cpu.js';

test('XOR gate truth table', () => {
  const st = createLogic({
    inputs: [{ id: 'A', at: [0, 0] }, { id: 'B', at: [0, 0] }],
    gates: [{ id: 'G', type: 'XOR', in: ['A', 'B'], at: [0, 0] }],
    outputs: [{ id: 'Y', from: 'G', at: [0, 0] }],
  });
  assert.deepEqual(truthTable(st).map((r) => r.out.Y), [0, 1, 1, 0]);
});

test('half adder adds two bits', () => {
  const st = createLogic({
    inputs: [{ id: 'A', at: [0, 0] }, { id: 'B', at: [0, 0] }],
    gates: [{ id: 'S', type: 'XOR', in: ['A', 'B'], at: [0, 0] }, { id: 'C', type: 'AND', in: ['A', 'B'], at: [0, 0] }],
    outputs: [{ id: 'SUM', from: 'S', at: [0, 0] }, { id: 'CARRY', from: 'C', at: [0, 0] }],
  });
  toggleInput(st, 'A'); toggleInput(st, 'B');
  assert.equal(displayValue(st, ['CARRY', 'SUM']), 2);
});

test('SR latch from NOR gates remembers', () => {
  const st = createLogic({
    inputs: [{ id: 'S', at: [0, 0] }, { id: 'R', at: [0, 0] }],
    gates: [{ id: 'Q', type: 'NOR', in: ['R', 'QN'], at: [0, 0] }, { id: 'QN', type: 'NOR', in: ['S', 'Q'], at: [0, 0] }],
    outputs: [{ id: 'OUT', from: 'Q', at: [0, 0] }],
  });
  toggleInput(st, 'S'); toggleInput(st, 'S'); // set, release
  assert.equal(st.sig.OUT, true);
  toggleInput(st, 'R'); toggleInput(st, 'R'); // reset, release
  assert.equal(st.sig.OUT, false);
});

test('D flip-flop captures on the clock edge only', () => {
  const st = createLogic({
    inputs: [{ id: 'D', at: [0, 0] }], clock: { id: 'CLK', at: [0, 0] },
    ffs: [{ id: 'Q', type: 'D', in: 'D', clk: 'CLK', at: [0, 0] }],
    outputs: [{ id: 'OUT', from: 'Q', at: [0, 0] }],
  });
  toggleInput(st, 'D');
  assert.equal(st.sig.OUT, false);
  pulseClock(st);
  assert.equal(st.sig.OUT, true);
});

test('ripple counter counts clock pulses', () => {
  const st = createLogic({
    inputs: [{ id: 'ONE', at: [0, 0], value: true }], clock: { id: 'CLK', at: [0, 0] },
    gates: [{ id: 'N0', type: 'NOT', in: ['Q0'], at: [0, 0] }, { id: 'N1', type: 'NOT', in: ['Q1'], at: [0, 0] }],
    ffs: [
      { id: 'Q0', type: 'T', in: 'ONE', clk: 'CLK', at: [0, 0] },
      { id: 'Q1', type: 'T', in: 'ONE', clk: 'N0', at: [0, 0] },
      { id: 'Q2', type: 'T', in: 'ONE', clk: 'N1', at: [0, 0] },
    ],
    outputs: [],
  });
  for (let k = 1; k <= 9; k++) {
    pulseClock(st);
    assert.equal(displayValue(st, ['Q2', 'Q1', 'Q0']), k % 8);
  }
});

test('CPU adds two numbers from RAM', () => {
  const s = runCpu({ ram: [{ op: 'LDA', arg: 14 }, { op: 'ADD', arg: 15 }, { op: 'OUT' }, { op: 'HLT' },
    ...Array(10).fill({ data: 0 }), { data: 28 }, { data: 14 }] });
  assert.equal(s.out, 42);
  assert.equal(s.halted, true);
});

test('CPU subtract sets zero flag and JZ jumps', () => {
  const s = runCpu({ ram: [{ op: 'LDI', arg: 3 }, { op: 'SUB', arg: 15 }, { op: 'OUT' }, { op: 'JZ', arg: 5 }, { op: 'JMP', arg: 1 }, { op: 'HLT' },
    ...Array(9).fill({ data: 0 }), { data: 1 }] });
  assert.deepEqual(s.outs, [2, 1, 0]);
});

test('CPU step log explains fetch and execute', () => {
  const s = createCpu({ ram: [{ op: 'LDI', arg: 7 }, { op: 'HLT' }] });
  stepCpu(s);
  assert.match(s.log, /Fetch RAM\[0\] → LDI 7\. Execute: A ← 7/);
});
