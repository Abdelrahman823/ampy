// A tiny 8-bit computer in the style of the classic breadboard "SAP" design:
// 16 bytes of RAM, registers A and B, an ALU with carry/zero flags, a program
// counter and an output register. Each byte is either an instruction
// (op + 4-bit address/value) or plain data.
//
// machine = { ram: [{op,arg}|{data}], editable?: [addr], ops?: [names], goal-side only }

export const OPS = {
  NOP: { code: 0x0, arg: false, help: 'do nothing' },
  LDA: { code: 0x1, arg: 'addr', help: 'A ← RAM[addr]' },
  ADD: { code: 0x2, arg: 'addr', help: 'A ← A + RAM[addr]' },
  SUB: { code: 0x3, arg: 'addr', help: 'A ← A − RAM[addr]' },
  STA: { code: 0x4, arg: 'addr', help: 'RAM[addr] ← A' },
  LDI: { code: 0x5, arg: 'value', help: 'A ← value (0–15)' },
  JMP: { code: 0x6, arg: 'addr', help: 'jump to addr' },
  JC: { code: 0x7, arg: 'addr', help: 'jump if carry' },
  JZ: { code: 0x8, arg: 'addr', help: 'jump if zero' },
  OUT: { code: 0xe, arg: false, help: 'show A on the display' },
  HLT: { code: 0xf, arg: false, help: 'stop the clock' },
};
const BY_CODE = Object.fromEntries(Object.entries(OPS).map(([k, v]) => [v.code, k]));

export function encode(cell) {
  if (cell.data !== undefined) return cell.data & 0xff;
  return ((OPS[cell.op].code << 4) | ((cell.arg ?? 0) & 0xf)) & 0xff;
}

export function createCpu(machine) {
  const ram = new Array(16).fill(0);
  machine.ram.forEach((c, i) => { ram[i] = encode(c); });
  return { ram, a: 0, b: 0, pc: 0, out: null, carry: false, zero: false, halted: false, steps: 0, log: '', outs: [] };
}

/** Run one whole instruction (fetch, decode, execute). */
export function stepCpu(s) {
  if (s.halted) return s;
  const addr = s.pc;
  const ir = s.ram[addr];
  const op = BY_CODE[ir >> 4] ?? 'NOP';
  const arg = ir & 0xf;
  s.pc = (s.pc + 1) & 0xf;
  let did = '';
  const alu = (sub) => {
    s.b = s.ram[arg];
    const raw = sub ? s.a + ((~s.b) & 0xff) + 1 : s.a + s.b;
    s.carry = raw > 0xff;
    s.a = raw & 0xff;
    s.zero = s.a === 0;
  };
  switch (op) {
    case 'LDA': s.a = s.ram[arg]; did = `A ← RAM[${arg}] = ${s.a}`; break;
    case 'ADD': alu(false); did = `B ← RAM[${arg}] = ${s.b}; A ← A + B = ${s.a}`; break;
    case 'SUB': alu(true); did = `B ← RAM[${arg}] = ${s.b}; A ← A − B = ${s.a}`; break;
    case 'STA': s.ram[arg] = s.a; did = `RAM[${arg}] ← A = ${s.a}`; break;
    case 'LDI': s.a = arg; did = `A ← ${arg}`; break;
    case 'JMP': s.pc = arg; did = `PC ← ${arg}`; break;
    case 'JC': if (s.carry) s.pc = arg; did = s.carry ? `carry is set, PC ← ${arg}` : 'no carry, keep going'; break;
    case 'JZ': if (s.zero) s.pc = arg; did = s.zero ? `A is zero, PC ← ${arg}` : 'A is not zero, keep going'; break;
    case 'OUT': s.out = s.a; s.outs.push(s.a); did = `display ← A = ${s.a}`; break;
    case 'HLT': s.halted = true; s.pc = addr; did = 'clock stopped'; break;
    default: did = 'nothing';
  }
  s.steps += 1;
  s.log = `Fetch RAM[${addr}] → ${op}${OPS[op].arg ? ` ${arg}` : ''}. Execute: ${did}.`;
  return s;
}

export function runCpu(machine, maxSteps = 500) {
  const s = createCpu(machine);
  while (!s.halted && s.steps < maxSteps) stepCpu(s);
  return s;
}

const bin = (n, w = 8) => n.toString(2).padStart(w, '0');

function describe(byte) {
  const op = BY_CODE[byte >> 4];
  return op ? `${op}${OPS[op].arg ? ` ${byte & 0xf}` : ''}` : '';
}

export function mountCpu(host, machine, onChange) {
  let m = structuredClone(machine);
  let s = createCpu(m);
  let timer = 0;
  const wrap = document.createElement('div');
  wrap.className = 'bench cpu';
  host.append(wrap);

  function stop() { clearInterval(timer); timer = 0; }

  function render() {
    const editable = new Set(m.editable ?? []);
    const opNames = m.ops ?? Object.keys(OPS);
    wrap.innerHTML = `
      <div class="cpu-top">
        <div class="cpu-display" aria-label="output display"><small>OUT</small><b>${s.out ?? '—'}</b></div>
        <div class="cpu-regs">
          <span>PC <b>${s.pc}</b></span><span>A <b>${s.a}</b></span><span>B <b>${s.b}</b></span>
          <span class="${s.carry ? 'flag on' : 'flag'}">C</span><span class="${s.zero ? 'flag on' : 'flag'}">Z</span>
          <span class="${s.halted ? 'flag on' : 'flag'}">HALT</span>
        </div>
      </div>
      <div class="bench-buttons">
        <button type="button" class="btn small" data-act="step" ${s.halted ? 'disabled' : ''}>Step ▸</button>
        <button type="button" class="btn small" data-act="run" ${s.halted ? 'disabled' : ''}>${timer ? 'Pause ❚❚' : 'Run ▸▸'}</button>
        <button type="button" class="btn small ghost" data-act="reset">↺ Reset</button>
      </div>
      <p class="cpu-log" aria-live="polite">${s.log || 'Press Step to run one instruction.'}</p>
      <table class="ram"><thead><tr><th>addr</th><th>bits</th><th>meaning</th></tr></thead><tbody>
      ${s.ram.map((byte, i) => {
        const cell = m.ram[i] ?? { data: 0 };
        const meaning = editable.has(i)
          ? (cell.data !== undefined
            ? `<input class="ram-data" type="number" min="0" max="255" value="${byte}" data-addr="${i}" aria-label="data at ${i}">`
            : `<select data-addr="${i}" data-part="op" aria-label="instruction at ${i}">${opNames.map((o) => `<option ${o === cell.op ? 'selected' : ''}>${o}</option>`).join('')}</select>
               ${OPS[cell.op].arg ? `<select data-addr="${i}" data-part="arg" aria-label="operand at ${i}">${Array.from({ length: 16 }, (_, k) => `<option ${k === cell.arg ? 'selected' : ''}>${k}</option>`).join('')}</select>` : ''}`)
          : (cell.data !== undefined ? `data ${byte}` : describe(byte));
        return `<tr class="${i === s.pc && !s.halted ? 'pc' : ''} ${editable.has(i) ? 'edit' : ''}"><td>${i}</td><td class="mono">${bin(byte)}</td><td>${meaning}</td></tr>`;
      }).join('')}
      </tbody></table>`;
    onChange?.(s, m);
  }

  wrap.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'step') { stepCpu(s); render(); }
    if (act === 'run') {
      if (timer) stop();
      else timer = setInterval(() => { stepCpu(s); if (s.halted || s.steps > 300) stop(); render(); }, 350);
      render();
    }
    if (act === 'reset') { stop(); s = createCpu(m); render(); }
  });
  wrap.addEventListener('change', (e) => {
    const t = e.target;
    const addr = +t.dataset.addr;
    if (Number.isNaN(addr)) return;
    const cell = m.ram[addr];
    if (t.classList.contains('ram-data')) cell.data = Math.max(0, Math.min(255, +t.value || 0));
    else if (t.dataset.part === 'op') { cell.op = t.value; if (OPS[cell.op].arg && cell.arg === undefined) cell.arg = 0; }
    else cell.arg = +t.value;
    stop();
    s = createCpu(m);
    render();
  });

  render();
  return { destroy: () => { stop(); wrap.remove(); } };
}
