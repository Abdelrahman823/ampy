// Live circuit bench: draws a circuit as SVG, lets the learner tap parts,
// pick values and drag sliders, re-solves on every change and reports the
// result. Benches with `transient` run in time and can show an oscilloscope.
import { solve, fmtAmps, fmtOhms, fmtVolts, fmtFarads } from './sim.js';

const NS = 'http://www.w3.org/2000/svg';
const HALF = 18; // half-length of a drawn two-terminal symbol along its wire
const TRACE_COLORS = ['var(--flow)', 'var(--trace2)', 'var(--trace3)'];

function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

const leads = (g, inner) => {
  el('line', { x1: -HALF, y1: 0, x2: -inner, y2: 0, class: 'wire' }, g);
  el('line', { x1: inner, y1: 0, x2: HALF, y2: 0, class: 'wire' }, g);
};

function symbol(g, p, r) {
  switch (p.kind) {
    case 'battery':
      if (p.wave) { // AC source: circle with a wave
        leads(g, 14);
        el('circle', { r: 14, class: 'meter' }, g);
        el('path', { d: 'M-8,0 q4,-9 8,0 t8,0', class: 'wire thin' }, g);
        break;
      }
      leads(g, 4);
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
      el('polyline', { points: '-18,0 -12,0 -9,-7 -3,7 3,-7 9,7 12,0 18,0', class: `wire resistor ${p.burnt ? 'scorched' : ''}` }, g);
      if (p.slider) el('path', { d: 'M-12,10 L12,-12 m-6,0 h6 v6', class: 'wire thin' }, g);
      break;
    case 'switch': case 'pushbutton': {
      leads(g, 12);
      el('circle', { cx: -12, cy: 0, r: 2.5, class: 'pin' }, g);
      el('circle', { cx: 12, cy: 0, r: 2.5, class: 'pin' }, g);
      if (p.kind === 'pushbutton') {
        const y = p.closed ? -3 : -10;
        el('line', { x1: -13, y1: y, x2: 13, y2: y, class: 'lever' }, g);
        el('line', { x1: 0, y1: y, x2: 0, y2: y - 8, class: 'lever' }, g);
      } else {
        el('line', p.closed ? { x1: -12, y1: 0, x2: 12, y2: 0, class: 'lever' } : { x1: -12, y1: 0, x2: 9, y2: -12, class: 'lever' }, g);
      }
      break;
    }
    case 'led': case 'diode': case 'zener': {
      const on = p.kind === 'led' && r?.on && !p.burnt;
      leads(g, 8);
      if (on) el('circle', { r: 10 + 14 * r.brightness, class: 'glow led-glow', style: `opacity:${0.3 + 0.6 * r.brightness}` }, g);
      el('polygon', { points: '-8,-9 -8,9 8,0', class: `diode ${on ? 'lit' : ''} ${p.burnt ? 'burnt' : ''} ${p.kind !== 'led' ? 'solid' : ''}` }, g);
      el('path', { d: p.kind === 'zener' ? 'M4,-12 L8,-9 L8,9 L12,12' : 'M8,-9 L8,9', class: 'plate thin-plate' }, g);
      if (p.kind === 'led') el('path', { d: 'M0,-12 l5,-7 m-3,0 h3 v3 M6,-10 l5,-7 m-3,0 h3 v3', class: 'arrows' }, g);
      break;
    }
    case 'ammeter': case 'voltmeter':
      leads(g, 13);
      el('circle', { r: 13, class: 'meter' }, g);
      break;
    case 'fuse':
      leads(g, 12);
      el('rect', { x: -12, y: -6, width: 24, height: 12, rx: 3, class: `fuse ${p.burnt ? 'blown' : ''}` }, g);
      el('path', { d: p.burnt ? 'M-12,0 h8 M4,0 h8' : 'M-12,0 h24', class: 'wire thin' }, g);
      break;
    case 'motor': {
      leads(g, 13);
      el('circle', { r: 13, class: 'meter' }, g);
      const spin = r?.on ? `animation-duration:${Math.max(0.15, 1.2 - r.brightness)}s` : 'animation:none';
      el('path', { d: 'M0,-9 L0,9 M-9,0 L9,0', class: `rotor ${r?.on ? 'spin' : ''}`, style: spin }, g);
      break;
    }
    case 'buzzer':
      leads(g, 12);
      el('rect', { x: -12, y: -9, width: 24, height: 18, rx: 9, class: `meter ${r?.on ? 'buzzing' : ''}` }, g);
      if (r?.on) el('path', { d: 'M-6,-14 q6,-6 12,0 M-10,-19 q10,-9 20,0', class: 'arrows' }, g);
      break;
    case 'capacitor': {
      leads(g, 4);
      el('line', { x1: -4, y1: -12, x2: -4, y2: 12, class: 'plate' }, g);
      el('line', { x1: 4, y1: -12, x2: 4, y2: 12, class: 'plate' }, g);
      const fill = Math.max(0, Math.min(1, Math.abs(r?.voltage ?? 0) / (p.vmax ?? 10)));
      if (fill > 0.01) el('rect', { x: -3, y: -11, width: 6, height: 22, class: 'charge', style: `opacity:${fill}` }, g);
      break;
    }
    case 'inductor':
      el('path', { d: 'M-18,0 h4 a4,4 0 0 1 8,0 a4,4 0 0 1 8,0 a4,4 0 0 1 8,0 a4,4 0 0 1 8,0 h4', class: 'wire' }, g);
      break;
    case 'wire':
      if (p.broken && !p.hidden) {
        leads(g, 7);
        el('circle', { cx: -7, cy: 0, r: 2.5, class: 'pin broken' }, g);
        el('circle', { cx: 7, cy: 0, r: 2.5, class: 'pin broken' }, g);
      } else {
        el('line', { x1: -HALF, y1: 0, x2: HALF, y2: 0, class: 'wire' }, g);
      }
      break;
  }
}

// Three-terminal parts: drawn at p.at, pins in local coordinates.
const PIN_LAYOUT = {
  npn: { c: [8, -22, 'v'], b: [-20, 0, 'h'], e: [8, 22, 'v'] },
  nmos: { d: [8, -22, 'v'], g: [-20, 0, 'h'], s: [8, 22, 'v'] },
  opamp: { n: [-32, -10, 'h'], p: [-32, 10, 'h'], out: [36, 0, 'h'] },
};

function multiSymbol(g, p, r) {
  if (p.kind === 'npn' || p.kind === 'nmos') {
    el('circle', { r: 17, class: `meter ${r?.on ? 'active' : ''}` }, g);
    if (p.kind === 'npn') {
      el('line', { x1: -6, y1: -10, x2: -6, y2: 10, class: 'plate' }, g);
      el('line', { x1: -20, y1: 0, x2: -6, y2: 0, class: 'wire' }, g);
      el('path', { d: 'M-6,-4 L8,-13 V-22 M-6,4 L8,13 V22', class: 'wire' }, g);
      el('path', { d: 'M8,13 l-7,-1 l3,-5 z', class: 'arrowhead' }, g);
    } else {
      el('line', { x1: -9, y1: -9, x2: -9, y2: 9, class: 'plate' }, g);
      el('line', { x1: -20, y1: 0, x2: -9, y2: 0, class: 'wire' }, g);
      el('line', { x1: -4, y1: -10, x2: -4, y2: 10, class: `plate ${r?.on ? 'channel-on' : 'dashed'}` }, g);
      el('path', { d: 'M-4,-7 H8 V-22 M-4,7 H8 V22', class: 'wire' }, g);
    }
  } else if (p.kind === 'opamp') {
    el('polygon', { points: '-20,-22 -20,22 24,0', class: 'meter' }, g);
    el('path', { d: 'M-32,-10 H-20 M-32,10 H-20 M24,0 H36', class: 'wire' }, g);
    el('text', { x: -15, y: -6, class: 'lbl pm' }, g).textContent = '−';
    el('text', { x: -15, y: 14, class: 'lbl pm' }, g).textContent = '+';
  }
}

function label(p, r) {
  if (p.show === 'v' && r) return fmtVolts(r.voltage);
  if (p.show === 'i' && r) return fmtAmps(r.current);
  if (p.show === 'p' && r) return `${+(r.power ?? r.current * r.current * p.r).toPrecision(2)} W`;
  if (p.kind === 'battery') return p.wave ? (p.label ?? 'AC') : fmtVolts(p.v ?? 9).replace('.00', '');
  if (p.kind === 'resistor') return p.burnt ? 'overheated' : (p.label && !p.choices && !p.slider ? p.label : fmtOhms(p.r));
  if (p.kind === 'ammeter') return r ? fmtAmps(r.current) : '';
  if (p.kind === 'voltmeter') return r ? fmtVolts(r.voltage) : '';
  if (p.kind === 'capacitor') return p.label && !p.choices ? p.label : fmtFarads(p.c);
  if (p.kind === 'fuse') return p.burnt ? 'blown' : `${p.rating ?? 1} A fuse`;
  if (p.kind === 'zener') return p.label ?? `${p.vz} V zener`;
  if (p.kind === 'led') {
    if (p.burnt) return 'burnt out';
    return r?.on ? fmtAmps(r.current) : 'off';
  }
  if (p.kind === 'lamp' && p.burnt) return 'blown';
  return p.label ?? '';
}

function readProbe(sim, trc) {
  if (trc.node) return sim.v[trc.node];
  const r = sim.parts[trc.part];
  return r?.[trc.field ?? 'voltage'] ?? 0;
}

/**
 * Mount a bench.
 * @param {HTMLElement} host
 * @param {object} spec  { nodes, parts, ground, view?, transient?, scope?, texts? }
 * @param {(sim, parts, info) => void} onChange
 */
export function mountBench(host, spec, onChange, { readOnly = false } = {}) {
  const initial = structuredClone(spec.parts);
  let parts = structuredClone(spec.parts);
  const wrap = document.createElement('div');
  wrap.className = 'bench';
  const svg = el('svg', { viewBox: spec.view ?? '0 0 320 220', class: 'bench-svg', role: 'img', 'aria-label': 'circuit' });
  const scopeEl = spec.scope ? document.createElement('div') : null;
  const statusEl = document.createElement('div');
  statusEl.className = 'bench-status';
  statusEl.setAttribute('aria-live', 'polite');
  const controls = document.createElement('div');
  controls.className = 'bench-controls';
  wrap.append(svg);
  if (scopeEl) { scopeEl.className = 'scope'; wrap.append(scopeEl); }
  wrap.append(statusEl, controls);
  host.appendChild(wrap);

  let toast = '';
  let toastTimer;
  let hitDirty = true;
  const partLayer = el('g');
  const flowLayer = el('g', { class: 'flow-layer' });
  const hitLayer = el('g');
  svg.append(partLayer, flowLayer, hitLayer);
  let raf = 0;
  const tr = spec.transient;
  let simT = 0, mem = { v: {}, i: {} }, simState;
  let history = [];
  let last;
  const resetTime = () => { simT = 0; mem = { v: {}, i: {} }; history = []; simState = undefined; last = undefined; };

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
    hitDirty = true;
    if (!tr) render();
  }

  function flash(msg) {
    toast = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast = ''; if (!tr) render(); }, 1400);
    if (!tr) render();
  }

  function step() {
    // DC: one solve. Transient: advance `speed` sim-seconds per real second.
    if (!tr) return solve({ parts, ground: spec.ground });
    const now = performance.now();
    const realDt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    let todo = realDt * tr.speed;
    let s;
    let n = 0;
    while (todo > 1e-12 && n < 400) {
      const dt = Math.min(tr.dt, todo);
      simT += dt; todo -= dt; n++;
      s = solve({ parts, ground: spec.ground }, { dt, t: simT, mem, state: simState });
      mem = s.mem; simState = s.state;
      if (spec.scope) history.push([simT, ...spec.scope.traces.map((x) => readProbe(s, x))]);
    }
    if (spec.scope) {
      const cut = simT - spec.scope.window;
      let k = 0;
      while (k < history.length && history[k][0] < cut) k++;
      if (k) history = history.slice(k);
      if (history.length > 1200) history = history.filter((_, i) => i % 2 === 0);
    }
    return s ?? solve({ parts, ground: spec.ground }, { dt: tr.dt, t: simT, mem, state: simState });
  }

  function render() {
    let sim = step();
    let burnt = false;
    for (const p of parts) {
      if (sim.parts[p.id]?.overload && !p.burnt) { p.burnt = true; burnt = true; }
    }
    if (burnt) hitDirty = true;
    if (burnt && !tr) sim = solve({ parts, ground: spec.ground });

    // visuals are redrawn every render; tap targets only when they change,
    // so a tap is never lost to an element replaced mid-press
    partLayer.replaceChildren();
    flowLayer.replaceChildren();
    const buildHits = hitDirty;
    if (buildHits) { hitLayer.replaceChildren(); hitDirty = false; }

    for (const p of parts) {
      const r = sim.parts[p.id];
      if (p.pins) { drawMulti(p, r, partLayer); continue; }
      const [x1, y1] = spec.nodes[p.a];
      const [x2, y2] = spec.nodes[p.b];
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len;

      if (len > HALF * 2) {
        el('line', { x1, y1, x2: mx - ux * HALF, y2: my - uy * HALF, class: 'wire' }, partLayer);
        el('line', { x1: mx + ux * HALF, y1: my + uy * HALF, x2, y2, class: 'wire' }, partLayer);
      }
      const g = el('g', { transform: `translate(${mx} ${my}) rotate(${ang})`, class: `part part-${p.kind}` }, partLayer);
      symbol(g, p, r);

      // moving charge: conventional current, + to -
      const amps = Math.abs(r.current ?? 0);
      if (amps > 1e-4 && p.kind !== 'battery' && !tr) {
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
        const nx = -uy, ny = ux;
        const off = p.kind === 'battery' ? 22 : ['lamp', 'ammeter', 'voltmeter', 'motor'].includes(p.kind) ? 20 : 16;
        const side = p.labelSide ?? 1;
        const dx = nx * side, dy = ny * side;
        const anchor = dx < -0.5 ? 'end' : dx > 0.5 ? 'start' : 'middle';
        el('text', { x: mx + dx * off, y: my + dy * (off + 4) + 4, class: `lbl lbl-${p.kind}`, 'text-anchor': anchor }, partLayer).textContent = text;
      }
      const glyph = { ammeter: 'A', voltmeter: 'V', motor: 'M' }[p.kind];
      if (glyph) el('text', { x: mx, y: my + 5, class: 'lbl meter-a', 'text-anchor': 'middle' }, partLayer).textContent = glyph;
      if (p.kind === 'battery' && !p.wave) {
        el('text', { x: mx - ux * 9 + uy * 13, y: my - uy * 9 - ux * 13 + 5, class: 'lbl plus', 'text-anchor': 'middle' }, partLayer).textContent = '+';
      }

      if (p.tap && !readOnly && buildHits) {
        const hit = el('g', { class: 'hit', tabindex: 0, role: 'button', 'aria-label': `${p.tap} ${p.label ?? p.kind}` }, hitLayer);
        el('circle', { cx: mx, cy: my, r: 22, class: `hit-ring ${needsTap(p) ? 'pulse' : ''}` }, hit);
        hit.addEventListener('click', () => act(p));
        hit.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(p); } });
      }
    }
    const used = new Set(parts.flatMap((p) => (p.pins ? Object.values(p.pins) : [p.a, p.b])));
    for (const [name, [x, y]] of Object.entries(spec.nodes)) {
      if (!used.has(name) || spec.hideDots?.includes(name)) continue;
      el('circle', { cx: x, cy: y, r: 2.2, class: 'dot' }, partLayer);
    }
    for (const t of spec.texts ?? []) {
      el('text', { x: t[0], y: t[1], class: 'lbl note', 'text-anchor': t[3] ?? 'middle' }, partLayer).textContent = t[2];
    }

    if (scopeEl) drawScope();

    const msgs = [];
    if (sim.short) msgs.push('⚠️ Short circuit! The battery is pushing current with almost nothing in the way.');
    if (parts.some((p) => p.kind === 'led' && p.burnt)) msgs.push('💥 The LED burnt out: too much current.');
    if (parts.some((p) => p.kind === 'fuse' && p.burnt)) msgs.push('🔥 The fuse blew and cut the circuit. That\'s its job.');
    if (parts.some((p) => p.kind === 'resistor' && p.burnt)) msgs.push('🔥 The resistor overheated: too much power for its size.');
    if (toast) msgs.push(toast);
    const text = msgs.join(' ');
    if (statusEl.textContent !== text) statusEl.textContent = text;
    statusEl.classList.toggle('warn', sim.short || parts.some((p) => p.burnt && !initial.find((q) => q.id === p.id)?.burnt));

    if (burnt) renderControls();
    onChange?.(sim, parts, { t: simT, history });
  }

  function drawMulti(p, r, layer) {
    const [ax, ay] = p.at;
    const g = el('g', { transform: `translate(${ax} ${ay})`, class: `part part-${p.kind}` }, layer);
    for (const [pin, node] of Object.entries(p.pins)) {
      const [px, py, dir] = PIN_LAYOUT[p.kind][pin];
      const sx = ax + px, sy = ay + py;
      const [nx, ny] = spec.nodes[node];
      const d = dir === 'v' ? `M${sx},${sy} V${ny} H${nx}` : `M${sx},${sy} H${nx} V${ny}`;
      el('path', { d, class: 'wire' }, layer);
    }
    layer.append(g);
    multiSymbol(g, p, r);
    const text = p.label ?? (p.kind === 'opamp' ? '' : r?.on ? 'ON' : 'OFF');
    if (text) el('text', { x: ax + (p.labelDx ?? 22), y: ay + 4, class: `lbl lbl-${p.kind}` }, layer).textContent = text;
  }

  function drawScope() {
    const sc = spec.scope;
    const W = 320, H = 110, pad = 6;
    const { vmin, vmax, window: win } = sc;
    const s = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'scope-svg', role: 'img', 'aria-label': 'oscilloscope' });
    for (let i = 1; i < 4; i++) el('line', { x1: 0, y1: (H / 4) * i, x2: W, y2: (H / 4) * i, class: 'grid' }, s);
    for (let i = 1; i < 8; i++) el('line', { x1: (W / 8) * i, y1: 0, x2: (W / 8) * i, y2: H, class: 'grid' }, s);
    const yOf = (v) => pad + (1 - (v - vmin) / (vmax - vmin)) * (H - 2 * pad);
    if (vmin < 0 && vmax > 0) el('line', { x1: 0, y1: yOf(0), x2: W, y2: yOf(0), class: 'grid zero' }, s);
    const t0 = simT - win;
    sc.traces.forEach((trc, ti) => {
      const pts = history.map((h) => `${(((h[0] - t0) / win) * W).toFixed(1)},${yOf(Math.max(vmin, Math.min(vmax, h[ti + 1]))).toFixed(1)}`);
      if (pts.length > 1) el('polyline', { points: pts.join(' '), class: 'trace', style: `stroke:${trc.color ?? TRACE_COLORS[ti]}` }, s);
    });
    const legend = sc.traces.map((trc, ti) => {
      const v = history.length ? history[history.length - 1][ti + 1] : 0;
      const unit = trc.field === 'current' ? fmtAmps(v) : fmtVolts(v);
      return `<span><i style="background:${trc.color ?? TRACE_COLORS[ti]}"></i>${trc.label}: <b>${unit}</b></span>`;
    }).join('');
    scopeEl.replaceChildren(s);
    const lg = document.createElement('div');
    lg.className = 'scope-legend';
    lg.innerHTML = `${legend}<span class="muted">t = ${simT < 1 ? `${Math.round(simT * 1000)} ms` : `${simT.toFixed(1)} s`}</span>`;
    scopeEl.append(lg);
  }

  function needsTap(p) {
    return (p.tap === 'repair' && p.broken) || (p.tap === 'replace' && p.burnt) || ['toggle', 'flip', 'cut'].includes(p.tap);
  }

  function fmtValue(p, prop, fmt, v) {
    if (fmt === 'v' || prop === 'v') return fmtVolts(v).replace('.00', '');
    if (prop === 'c') return fmtFarads(v);
    if (prop === 'freq' || fmt === 'hz') return `${v} Hz`;
    if (fmt === 'pct') return `${Math.round(v)}%`;
    if (prop === 'rating') return `${v} A`;
    return fmtOhms(v);
  }

  const getProp = (p, prop) => (prop === 'freq' ? p.wave.freq : prop === 'amp' ? p.wave.amp : p[prop]);
  function setProp(p, prop, v) {
    if (prop === 'freq') p.wave.freq = v;
    else if (prop === 'amp') p.wave.amp = v;
    else p[prop] = v;
    if (tr && ['c', 'freq', 'l'].includes(prop)) resetTime();
  }

  function renderControls() {
    controls.replaceChildren();
    if (readOnly) return;
    for (const p of parts) {
      if (p.choices) {
        const prop = p.prop ?? 'r';
        const row = document.createElement('div');
        row.className = 'chip-row';
        row.setAttribute('role', 'radiogroup');
        row.setAttribute('aria-label', p.label ?? prop);
        const name = document.createElement('span');
        name.className = 'chip-label';
        name.textContent = `${p.label ?? 'Resistor'}:`;
        row.append(name);
        for (const val of p.choices) {
          const b = document.createElement('button');
          b.className = 'chip';
          b.type = 'button';
          b.setAttribute('role', 'radio');
          b.setAttribute('aria-checked', String(getProp(p, prop) === val));
          b.textContent = fmtValue(p, prop, p.fmt, val);
          b.addEventListener('click', () => {
            setProp(p, prop, val);
            row.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-checked', String(c === b)));
            if (!tr) render();
          });
          row.append(b);
        }
        controls.append(row);
      }
      if (p.slider) {
        const sl = p.slider;
        const prop = sl.prop ?? 'r';
        const row = document.createElement('label');
        row.className = 'slider-row';
        const name = document.createElement('span');
        name.className = 'chip-label';
        const val = document.createElement('b');
        const input = document.createElement('input');
        input.type = 'range';
        input.min = sl.min; input.max = sl.max; input.step = sl.step ?? 1;
        input.value = getProp(p, prop);
        input.setAttribute('aria-label', sl.label);
        const show = () => { name.textContent = `${sl.label}: `; val.textContent = fmtValue(p, prop, sl.fmt, +input.value); };
        show();
        input.addEventListener('input', () => { setProp(p, prop, +input.value); show(); if (!tr) render(); });
        row.append(name, val, input);
        controls.append(row);
      }
    }
    const extra = document.createElement('div');
    extra.className = 'bench-buttons';
    if (parts.some((p) => p.burnt && !initial.find((q) => q.id === p.id)?.burnt)) {
      const reset = document.createElement('button');
      reset.className = 'btn small ghost';
      reset.type = 'button';
      reset.textContent = '↺ Reset bench';
      reset.addEventListener('click', () => { parts = structuredClone(initial); resetTime(); hitDirty = true; renderControls(); if (!tr) render(); });
      extra.append(reset);
    }
    if (tr) {
      const restart = document.createElement('button');
      restart.className = 'btn small ghost';
      restart.type = 'button';
      restart.textContent = '⟲ Restart time';
      restart.addEventListener('click', resetTime);
      extra.append(restart);
    }
    if (extra.children.length) controls.append(extra);
  }

  renderControls();
  if (tr) {
    const loop = () => { render(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
  } else {
    render();
  }
  return { destroy: () => { cancelAnimationFrame(raf); clearTimeout(toastTimer); wrap.remove(); } };
}
