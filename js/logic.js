// Logic lab: digital gates, flip-flops and a clock button.
// lab = { inputs:[{id,label,at,value?}], clock?:{id,at,label?},
//         gates:[{id,type,in:[ids],at,choices?}],
//         ffs:[{id,type:'D'|'T',in:id,clk:id,at}],
//         outputs:[{id,from,label,at}], displays?:[{label,bits:[msb..lsb],at}] }

const NS = 'http://www.w3.org/2000/svg';

export const GATES = {
  AND: (a) => a.every(Boolean),
  OR: (a) => a.some(Boolean),
  NOT: (a) => !a[0],
  BUF: (a) => !!a[0],
  NAND: (a) => !a.every(Boolean),
  NOR: (a) => !a.some(Boolean),
  XOR: (a) => a.filter(Boolean).length % 2 === 1,
  XNOR: (a) => a.filter(Boolean).length % 2 === 0,
};

/** Settle combinational logic, firing flip-flops on rising clock edges. */
export function settle(lab, sig, ffq, prevClk) {
  for (let pass = 0; pass < 50; pass++) {
    let changed = false;
    for (const f of lab.ffs ?? []) {
      if (sig[f.id] !== ffq[f.id]) { sig[f.id] = ffq[f.id]; changed = true; }
    }
    for (const g of lab.gates ?? []) {
      const v = GATES[g.type](g.in.map((x) => !!sig[x]));
      if (sig[g.id] !== v) { sig[g.id] = v; changed = true; }
    }
    for (const f of lab.ffs ?? []) {
      const clk = !!sig[f.clk];
      if (clk && !prevClk[f.id]) { // rising edge
        ffq[f.id] = f.type === 'T' ? (sig[f.in] ? !ffq[f.id] : ffq[f.id]) : !!sig[f.in];
        changed = true;
      }
      prevClk[f.id] = clk;
    }
    if (!changed) break;
  }
  for (const o of lab.outputs ?? []) sig[o.id] = !!sig[o.from];
  return sig;
}

/** Fresh logic state from a lab spec. */
export function createLogic(lab) {
  const st = { lab: structuredClone(lab), sig: {}, ffq: {}, clk: {}, pulses: 0 };
  for (const i of st.lab.inputs ?? []) st.sig[i.id] = !!i.value;
  if (st.lab.clock) st.sig[st.lab.clock.id] = false;
  for (const f of st.lab.ffs ?? []) st.ffq[f.id] = !!f.value;
  // settle once without firing, then remember each flip-flop's clock level
  for (const f of st.lab.ffs ?? []) st.clk[f.id] = true;
  settle(st.lab, st.sig, st.ffq, st.clk);
  for (const f of st.lab.ffs ?? []) st.clk[f.id] = !!st.sig[f.clk];
  return st;
}

export function toggleInput(st, id) {
  st.sig[id] = !st.sig[id];
  settle(st.lab, st.sig, st.ffq, st.clk);
}

export function pulseClock(st) {
  const id = st.lab.clock.id;
  st.sig[id] = true; settle(st.lab, st.sig, st.ffq, st.clk);
  st.sig[id] = false; settle(st.lab, st.sig, st.ffq, st.clk);
  st.pulses += 1;
}

export function setGate(st, id, type) {
  st.lab.gates.find((g) => g.id === id).type = type;
  settle(st.lab, st.sig, st.ffq, st.clk);
}

/** Truth table of the combinational outputs for every input combination. */
export function truthTable(st) {
  const ins = st.lab.inputs.map((i) => i.id);
  const rows = [];
  for (let m = 0; m < 1 << ins.length; m++) {
    const sig = { ...st.sig };
    ins.forEach((id, k) => { sig[id] = !!(m & (1 << (ins.length - 1 - k))); });
    settle(st.lab, sig, { ...st.ffq }, { ...st.clk });
    rows.push({ in: Object.fromEntries(ins.map((id) => [id, sig[id] ? 1 : 0])), out: Object.fromEntries(st.lab.outputs.map((o) => [o.id, sig[o.id] ? 1 : 0])) });
  }
  return rows;
}

export function displayValue(st, bits) {
  return bits.reduce((n, b) => n * 2 + (st.sig[b] ? 1 : 0), 0);
}

// ---------- drawing ----------
function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

const SHAPES = {
  AND: { d: 'M-18,-14 H0 A14,14 0 0 1 0,14 H-18 Z', out: 14 },
  NAND: { d: 'M-18,-14 H0 A14,14 0 0 1 0,14 H-18 Z', out: 20, bubble: 17 },
  OR: { d: 'M-20,-14 Q-10,0 -20,14 Q6,14 18,0 Q6,-14 -20,-14 Z', out: 18 },
  NOR: { d: 'M-20,-14 Q-10,0 -20,14 Q6,14 18,0 Q6,-14 -20,-14 Z', out: 24, bubble: 21 },
  XOR: { d: 'M-18,-14 Q-8,0 -18,14 Q8,14 18,0 Q8,-14 -18,-14 Z M-24,-14 Q-14,0 -24,14', out: 18 },
  XNOR: { d: 'M-18,-14 Q-8,0 -18,14 Q8,14 18,0 Q8,-14 -18,-14 Z M-24,-14 Q-14,0 -24,14', out: 24, bubble: 21 },
  NOT: { d: 'M-14,-12 L-14,12 L10,0 Z', out: 16, bubble: 13 },
  BUF: { d: 'M-14,-12 L-14,12 L10,0 Z', out: 10 },
};

function outPoint(st, id) {
  const lab = st.lab;
  const i = lab.inputs?.find((x) => x.id === id);
  if (i) return [i.at[0] + 16, i.at[1]];
  if (lab.clock?.id === id) return [lab.clock.at[0] + 20, lab.clock.at[1]];
  const g = lab.gates?.find((x) => x.id === id);
  if (g) return [g.at[0] + SHAPES[g.type].out, g.at[1]];
  const f = lab.ffs?.find((x) => x.id === id);
  if (f) return [f.at[0] + 22, f.at[1] - 8];
  throw new Error(`no signal ${id}`);
}

function inPoints(g) {
  const n = g.in.length;
  const x = g.at[0] - (g.type === 'NOT' || g.type === 'BUF' ? 14 : 20);
  if (n === 1) return [[x, g.at[1]]];
  return g.in.map((_, k) => [x, g.at[1] - 8 + (16 * k) / (n - 1)]);
}

function wire(svg, [x1, y1], [x2, y2], on, midX) {
  // midX: x of the vertical jog, or an array of waypoints for feedback loops
  const d = Array.isArray(midX)
    ? `M${x1},${y1} ${midX.map(([x, y]) => `L${x},${y}`).join(' ')} L${x2},${y2}`
    : `M${x1},${y1} H${midX ?? (x1 + x2) / 2} V${y2} H${x2}`;
  el('path', { d, class: `lwire ${on ? 'on' : ''}` }, svg);
}

export function mountLogic(host, lab, onChange) {
  const st = createLogic(lab);
  const wrap = document.createElement('div');
  wrap.className = 'bench logic';
  const svg = el('svg', { viewBox: lab.view ?? '0 0 320 220', class: 'bench-svg', role: 'img', 'aria-label': 'logic circuit' });
  const controls = document.createElement('div');
  controls.className = 'bench-controls';
  wrap.append(svg, controls);
  host.append(wrap);

  function render() {
    svg.replaceChildren();
    const L = st.lab;
    // wires first
    for (const g of L.gates ?? []) {
      inPoints(g).forEach((p, k) => wire(svg, outPoint(st, g.in[k]), p, st.sig[g.in[k]], g.mid?.[k]));
    }
    for (const f of L.ffs ?? []) {
      wire(svg, outPoint(st, f.in), [f.at[0] - 22, f.at[1] - 8], st.sig[f.in], f.mid?.[0]);
      wire(svg, outPoint(st, f.clk), [f.at[0] - 22, f.at[1] + 8], st.sig[f.clk], f.mid?.[1]);
    }
    for (const o of L.outputs ?? []) wire(svg, outPoint(st, o.from), [o.at[0] - 10, o.at[1]], st.sig[o.id], o.mid);

    for (const i of L.inputs ?? []) {
      const on = st.sig[i.id];
      const g = el('g', { class: 'hit', tabindex: 0, role: 'switch', 'aria-checked': String(!!on), 'aria-label': `input ${i.label ?? i.id}` }, svg);
      el('rect', { x: i.at[0] - 16, y: i.at[1] - 11, width: 32, height: 22, rx: 11, class: `toggle ${on ? 'on' : ''}` }, g);
      el('circle', { cx: i.at[0] + (on ? 5 : -5), cy: i.at[1], r: 8, class: 'knob' }, g);
      el('text', { x: i.at[0] - 22, y: i.at[1] + 4, class: 'lbl', 'text-anchor': 'end' }, svg).textContent = `${i.label ?? i.id}=${on ? 1 : 0}`;
      const flip = () => { toggleInput(st, i.id); render(); };
      g.addEventListener('click', flip);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    }
    if (L.clock) {
      const c = L.clock;
      const g = el('g', { class: 'hit', tabindex: 0, role: 'button', 'aria-label': 'clock pulse' }, svg);
      el('rect', { x: c.at[0] - 20, y: c.at[1] - 13, width: 40, height: 26, rx: 6, class: `clock ${st.sig[c.id] ? 'on' : ''}` }, g);
      el('path', { d: `M${c.at[0] - 12},${c.at[1] + 5} h6 v-10 h8 v10 h6`, class: 'lwire on' }, g);
      el('text', { x: c.at[0], y: c.at[1] + 26, class: 'lbl', 'text-anchor': 'middle' }, svg).textContent = c.label ?? 'clock';
      const tick = () => { pulseClock(st); render(); };
      g.addEventListener('click', tick);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tick(); } });
    }
    for (const gt of L.gates ?? []) {
      const sh = SHAPES[gt.type];
      const g = el('g', { transform: `translate(${gt.at[0]} ${gt.at[1]})` }, svg);
      el('path', { d: sh.d, class: `gate ${st.sig[gt.id] ? 'on' : ''} ${gt.choices ? 'pickable' : ''}` }, g);
      if (sh.bubble) el('circle', { cx: sh.bubble, cy: 0, r: 3.5, class: 'gate' }, g);
      el('text', { x: 0, y: 26, class: 'lbl gate-name', 'text-anchor': 'middle' }, g).textContent = gt.choices ? `${gt.label ?? gt.id}: ${gt.type}` : gt.type;
    }
    for (const f of L.ffs ?? []) {
      const g = el('g', { transform: `translate(${f.at[0]} ${f.at[1]})` }, svg);
      el('rect', { x: -22, y: -18, width: 44, height: 36, rx: 4, class: `gate ${st.sig[f.id] ? 'on' : ''}` }, g);
      el('text', { x: -18, y: -4, class: 'lbl tiny' }, g).textContent = f.type;
      el('path', { d: 'M-22,3 l6,5 l-6,5', class: 'lwire' }, g);
      el('text', { x: 18, y: -4, class: 'lbl tiny', 'text-anchor': 'end' }, g).textContent = 'Q';
      el('text', { x: 0, y: 32, class: 'lbl', 'text-anchor': 'middle' }, g).textContent = f.label ?? f.id;
    }
    for (const o of L.outputs ?? []) {
      const on = st.sig[o.id];
      if (on) el('circle', { cx: o.at[0], cy: o.at[1], r: 16, class: 'glow led-glow' }, svg);
      el('circle', { cx: o.at[0], cy: o.at[1], r: 9, class: `lamp-out ${on ? 'on' : ''}` }, svg);
      el('text', { x: o.at[0], y: o.at[1] + 24, class: 'lbl', 'text-anchor': 'middle' }, svg).textContent = `${o.label ?? o.id}=${on ? 1 : 0}`;
    }
    for (const d of L.displays ?? []) {
      const v = displayValue(st, d.bits);
      el('rect', { x: d.at[0] - 30, y: d.at[1] - 18, width: 60, height: 36, rx: 6, class: 'seg' }, svg);
      el('text', { x: d.at[0], y: d.at[1] + 9, class: 'seg-num', 'text-anchor': 'middle' }, svg).textContent = String(v);
      el('text', { x: d.at[0], y: d.at[1] + 32, class: 'lbl', 'text-anchor': 'middle' }, svg).textContent = d.label ?? 'decimal';
    }
    onChange?.(st.sig, st, { table: () => truthTable(st), value: (bits) => displayValue(st, bits) });
  }

  function renderControls() {
    controls.replaceChildren();
    for (const gt of st.lab.gates ?? []) {
      if (!gt.choices) continue;
      const row = document.createElement('div');
      row.className = 'chip-row';
      row.setAttribute('role', 'radiogroup');
      row.setAttribute('aria-label', gt.label ?? gt.id);
      const name = document.createElement('span');
      name.className = 'chip-label';
      name.textContent = `${gt.label ?? gt.id}:`;
      row.append(name);
      for (const t of gt.choices) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(gt.type === t));
        b.textContent = t;
        b.addEventListener('click', () => {
          setGate(st, gt.id, t);
          row.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-checked', String(c === b)));
          render();
        });
        row.append(b);
      }
      controls.append(row);
    }
  }

  renderControls();
  render();
  return { destroy: () => wrap.remove() };
}
