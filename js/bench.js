// Live circuit bench: draws a circuit as SVG, lets the learner tap/choose
// parts, re-solves on every change and reports the result.
import { solve, fmtAmps, fmtOhms } from './sim.js';

const NS = 'http://www.w3.org/2000/svg';
const HALF = 18; // half-length of a drawn symbol along its wire

function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

function symbol(g, p, r) {
  switch (p.kind) {
    case 'battery':
      el('line', { x1: -HALF, y1: 0, x2: -4, y2: 0, class: 'wire' }, g);
      el('line', { x1: 4, y1: 0, x2: HALF, y2: 0, class: 'wire' }, g);
      el('line', { x1: -4, y1: -14, x2: -4, y2: 14, class: 'plate' }, g);
      el('line', { x1: 4, y1: -7, x2: 4, y2: 7, class: 'plate thick' }, g);
      break;
    case 'lamp': {
      const b = r?.brightness ?? 0;
      if (b > 0.02) el('circle', { r: 14 + 16 * b, class: 'glow', style: `opacity:${0.25 + 0.6 * b}` }, g);
      el('circle', { r: 13, class: `bulb ${p.burnt ? 'burnt' : ''} ${b > 0.05 ? 'lit' : ''}` }, g);
      el('path', { d: p.burnt ? 'M-9,-9 L-2,-1 M9,9 L2,1 M-9,9 L9,-9' : 'M-9,-9 L9,9 M-9,9 L9,-9', class: 'filament' }, g);
      break;
    }
    case 'resistor':
      el('polyline', { points: '-18,0 -12,0 -9,-7 -3,7 3,-7 9,7 12,0 18,0', class: 'wire resistor' }, g);
      break;
    case 'switch': {
      el('line', { x1: -HALF, y1: 0, x2: -12, y2: 0, class: 'wire' }, g);
      el('line', { x1: 12, y1: 0, x2: HALF, y2: 0, class: 'wire' }, g);
      el('circle', { cx: -12, cy: 0, r: 2.5, class: 'pin' }, g);
      el('circle', { cx: 12, cy: 0, r: 2.5, class: 'pin' }, g);
      el('line', p.closed ? { x1: -12, y1: 0, x2: 12, y2: 0, class: 'lever' } : { x1: -12, y1: 0, x2: 9, y2: -12, class: 'lever' }, g);
      break;
    }
    case 'led': {
      const on = r?.on && !p.burnt;
      el('line', { x1: -HALF, y1: 0, x2: -8, y2: 0, class: 'wire' }, g);
      el('line', { x1: 8, y1: 0, x2: HALF, y2: 0, class: 'wire' }, g);
      if (on) el('circle', { r: 10 + 14 * r.brightness, class: 'glow led-glow', style: `opacity:${0.3 + 0.6 * r.brightness}` }, g);
      el('polygon', { points: '-8,-9 -8,9 8,0', class: `diode ${on ? 'lit' : ''} ${p.burnt ? 'burnt' : ''}` }, g);
      el('line', { x1: 8, y1: -9, x2: 8, y2: 9, class: 'plate' }, g);
      el('path', { d: 'M0,-12 l5,-7 m-3,0 h3 v3 M6,-10 l5,-7 m-3,0 h3 v3', class: 'arrows' }, g);
      break;
    }
    case 'ammeter':
      el('line', { x1: -HALF, y1: 0, x2: -13, y2: 0, class: 'wire' }, g);
      el('line', { x1: 13, y1: 0, x2: HALF, y2: 0, class: 'wire' }, g);
      el('circle', { r: 13, class: 'meter' }, g);
      break;
    case 'wire':
      if (p.broken && !p.hidden) {
        el('line', { x1: -HALF, y1: 0, x2: -7, y2: 0, class: 'wire' }, g);
        el('line', { x1: 7, y1: 0, x2: HALF, y2: 0, class: 'wire' }, g);
        el('circle', { cx: -7, cy: 0, r: 2.5, class: 'pin broken' }, g);
        el('circle', { cx: 7, cy: 0, r: 2.5, class: 'pin broken' }, g);
      } else {
        el('line', { x1: -HALF, y1: 0, x2: HALF, y2: 0, class: 'wire' }, g);
      }
      break;
  }
}

function label(p, r) {
  if (p.kind === 'battery') return `${p.v ?? 9} V`;
  if (p.kind === 'resistor') return fmtOhms(p.r);
  if (p.kind === 'ammeter') return r ? fmtAmps(r.current) : '';
  if (p.kind === 'led') {
    if (p.burnt) return 'burnt out';
    return r?.on ? fmtAmps(r.current) : 'off';
  }
  if (p.kind === 'lamp' && p.burnt) return 'blown';
  return p.label ?? '';
}

/**
 * Mount a bench.
 * @param {HTMLElement} host
 * @param {object} spec  { nodes, parts, ground, view? }
 * @param {(sim, parts) => void} onChange
 */
export function mountBench(host, spec, onChange, { readOnly = false } = {}) {
  const initial = structuredClone(spec.parts);
  let parts = structuredClone(spec.parts);
  const wrap = document.createElement('div');
  wrap.className = 'bench';
  const svg = el('svg', { viewBox: spec.view ?? '0 0 320 220', class: 'bench-svg', role: 'img' });
  const statusEl = document.createElement('div');
  statusEl.className = 'bench-status';
  statusEl.setAttribute('aria-live', 'polite');
  const controls = document.createElement('div');
  controls.className = 'bench-controls';
  wrap.append(svg, statusEl, controls);
  host.appendChild(wrap);

  let toast = '';
  let toastTimer;

  function act(p) {
    if (readOnly) return;
    const t = p.tap;
    if (t === 'toggle') p.closed = !p.closed;
    else if (t === 'repair' && p.broken) p.broken = false;
    else if (t === 'cut') p.broken = !p.broken;
    else if (t === 'flip') [p.a, p.b] = [p.b, p.a];
    else if (t === 'replace' && p.burnt) p.burnt = false;
    else if (t === 'probe') {
      if (p.broken) p.broken = false;
      else { flash(p.kind === 'lamp' ? 'This lamp is fine.' : 'This wire is fine.'); return; }
    } else return;
    navigator.vibrate?.(8);
    render();
  }

  function flash(msg) {
    toast = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast = ''; render(); }, 1400);
    render();
  }

  function render() {
    let sim = solve({ parts, ground: spec.ground });
    // LEDs over their limit burn out for good (until reset)
    let burnt = false;
    for (const p of parts) {
      if (p.kind === 'led' && sim.parts[p.id].overload && !p.burnt) { p.burnt = true; burnt = true; }
    }
    if (burnt) sim = solve({ parts, ground: spec.ground });

    svg.replaceChildren();
    const flowLayer = el('g', { class: 'flow-layer' });
    const partLayer = el('g');
    const hitLayer = el('g');
    svg.append(partLayer, flowLayer, hitLayer);

    for (const p of parts) {
      const r = sim.parts[p.id];
      const [x1, y1] = spec.nodes[p.a];
      const [x2, y2] = spec.nodes[p.b];
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len;

      // leads from the nodes to the symbol
      if (len > HALF * 2) {
        el('line', { x1, y1, x2: mx - ux * HALF, y2: my - uy * HALF, class: 'wire' }, partLayer);
        el('line', { x1: mx + ux * HALF, y1: my + uy * HALF, x2, y2, class: 'wire' }, partLayer);
      }
      const g = el('g', { transform: `translate(${mx} ${my}) rotate(${ang})`, class: `part part-${p.kind}` }, partLayer);
      symbol(g, p, r);

      // moving charge: conventional current, + to -
      const amps = Math.abs(r.current);
      if (amps > 1e-4 && p.kind !== 'battery') {
        // wires carry dashes end to end; other parts only on their leads
        const segs = p.kind === 'wire' || len <= HALF * 2
          ? [[x1, y1, x2, y2]]
          : [[x1, y1, mx - ux * HALF, my - uy * HALF], [mx + ux * HALF, my + uy * HALF, x2, y2]];
        const speed = Math.max(0.25, Math.min(3, 0.6 / Math.sqrt(amps)));
        for (const [ax, ay, bx, by] of segs) {
          const d = r.current > 0 ? `M${ax},${ay} L${bx},${by}` : `M${bx},${by} L${ax},${ay}`;
          el('path', { d, class: 'flow', style: `animation-duration:${speed}s` }, flowLayer);
        }
      }

      const text = label(p, r);
      if (text) {
        const nx = -uy, ny = ux; // perpendicular
        const off = p.kind === 'battery' ? 22 : p.kind === 'lamp' || p.kind === 'ammeter' ? 20 : 16;
        const side = p.labelSide ?? 1;
        const dx = nx * side, dy = ny * side;
        // anchor the text away from the wire so it never covers the symbol
        const anchor = dx < -0.5 ? 'end' : dx > 0.5 ? 'start' : 'middle';
        el('text', { x: mx + dx * off, y: my + dy * (off + 4) + 4, class: `lbl lbl-${p.kind}`, 'text-anchor': anchor }, partLayer).textContent = text;
      }
      if (p.kind === 'ammeter') {
        el('text', { x: mx, y: my + 5, class: 'lbl meter-a', 'text-anchor': 'middle' }, partLayer).textContent = 'A';
      }
      if (p.kind === 'battery') {
        el('text', { x: mx - ux * 9 + uy * 13, y: my - uy * 9 - ux * 13 + 5, class: 'lbl plus', 'text-anchor': 'middle' }, partLayer).textContent = '+';
      }

      if (p.tap && !readOnly) {
        const hit = el('g', { class: 'hit', tabindex: 0, role: 'button', 'aria-label': `${p.tap} ${p.label ?? p.kind}` }, hitLayer);
        el('circle', { cx: mx, cy: my, r: 22, class: `hit-ring ${needsTap(p) ? 'pulse' : ''}` }, hit);
        hit.addEventListener('click', () => act(p));
        hit.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(p); } });
      }
    }
    for (const [name, [x, y]] of Object.entries(spec.nodes)) {
      if (spec.hideDots?.includes(name)) continue;
      el('circle', { cx: x, cy: y, r: 2.2, class: 'dot' }, partLayer);
    }

    const msgs = [];
    if (sim.short) msgs.push('⚠️ Short circuit! The battery is pushing current with almost nothing in the way.');
    if (parts.some((p) => p.kind === 'led' && p.burnt)) msgs.push('💥 The LED burnt out: too much current.');
    if (toast) msgs.push(toast);
    statusEl.textContent = msgs.join(' ');
    statusEl.classList.toggle('warn', sim.short || parts.some((p) => p.burnt && p.kind === 'led'));

    renderControls();
    onChange?.(sim, parts);
  }

  function needsTap(p) {
    return (p.tap === 'repair' && p.broken) || (p.tap === 'replace' && p.burnt) || p.tap === 'toggle' || p.tap === 'flip' || p.tap === 'cut';
  }

  function renderControls() {
    controls.replaceChildren();
    if (readOnly) return;
    for (const p of parts) {
      if (!p.choices) continue;
      const row = document.createElement('div');
      row.className = 'chip-row';
      row.setAttribute('role', 'radiogroup');
      row.setAttribute('aria-label', p.label ?? 'resistor value');
      const name = document.createElement('span');
      name.className = 'chip-label';
      name.textContent = `${p.label ?? 'Resistor'}:`;
      row.append(name);
      for (const val of p.choices) {
        const b = document.createElement('button');
        b.className = 'chip';
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(p.r === val));
        b.textContent = fmtOhms(val);
        b.addEventListener('click', () => { p.r = val; render(); });
        row.append(b);
      }
      controls.append(row);
    }
    if (parts.some((p, i) => p.burnt && !initial[i].burnt)) {
      const reset = document.createElement('button');
      reset.className = 'btn small ghost';
      reset.type = 'button';
      reset.textContent = '↺ Reset bench';
      reset.addEventListener('click', () => { parts = structuredClone(initial); render(); });
      controls.append(reset);
    }
  }

  render();
  return { destroy: () => wrap.remove() };
}
