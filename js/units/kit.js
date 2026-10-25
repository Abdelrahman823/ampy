// Shared bench layouts and part helpers for unit files.

// Loop: battery on the left, load on the right.
export const N = {
  tl: [50, 40], tm: [160, 40], tr: [270, 40],
  bl: [50, 180], bm: [160, 180], br: [270, 180],
};

// Wider loop with a second branch on the right.
export const N2 = {
  tl: [40, 40], tm: [130, 40], tr: [215, 40], xr: [300, 40],
  bl: [40, 180], bm: [130, 180], xb: [300, 180],
};

// Ladder: two parts stacked on the right with a meter column beside them.
export const N3 = {
  tl: [50, 30], tr: [170, 30], mr: [170, 110], br: [170, 190], bl: [50, 190],
  vt: [270, 110], vb: [270, 190], vtt: [270, 30],
};

export const bat = (v = 9, extra = {}) => ({ id: 'B', kind: 'battery', a: 'tl', b: 'bl', v, rInt: 0.001, ...extra });
export const wire = (id, a, b, extra = {}) => ({ id, kind: 'wire', a, b, ...extra });
export const res = (id, a, b, r, extra = {}) => ({ id, kind: 'resistor', a, b, r, ...extra });
export const lamp = (id, a, b, extra = {}) => ({ id, kind: 'lamp', a, b, r: 18, ...extra });
export const vm = (id, a, b, extra = {}) => ({ id, kind: 'voltmeter', a, b, ...extra });
export const am = (id, a, b, extra = {}) => ({ id, kind: 'ammeter', a, b, ...extra });
export const sw = (id, a, b, extra = {}) => ({ id, kind: 'switch', a, b, tap: 'toggle', label: id, ...extra });

export const near = (x, target, tol) => Math.abs(x - target) <= tol;
