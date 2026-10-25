// Track A · Electronics. Each unit lives in js/units/<id>.js and exports
// `default` (the unit) plus an optional `glossary`. Extra depth lives in
// js/units/<id>-more.js, which exports `lessons` (inserted before the unit's
// checkpoint, so existing progress stays valid) and an optional `glossary`.
import * as a1 from './units/a1.js';
import * as a1m from './units/a1-more.js';
import * as a2 from './units/a2.js';
import * as a2m from './units/a2-more.js';
import * as a3 from './units/a3.js';
import * as a3m from './units/a3-more.js';
import * as a4 from './units/a4.js';
import * as a4m from './units/a4-more.js';
import * as a5 from './units/a5.js';
import * as a5m from './units/a5-more.js';
import * as a6 from './units/a6.js';
import * as a6m from './units/a6-more.js';
import * as a7 from './units/a7.js';
import * as a7m from './units/a7-more.js';
import * as a8 from './units/a8.js';
import * as a8m from './units/a8-more.js';
import * as a9 from './units/a9.js';
import * as a9m from './units/a9-more.js';
import * as a10 from './units/a10.js';
import * as a10m from './units/a10-more.js';
import * as a11 from './units/a11.js';
import * as a11m from './units/a11-more.js';
import * as a12 from './units/a12.js';
import * as a12m from './units/a12-more.js';
import * as a13 from './units/a13.js';
import * as a13m from './units/a13-more.js';
import * as a14 from './units/a14.js';
import * as a14m from './units/a14-more.js';

const MODULES = [[a1, a1m], [a2, a2m], [a3, a3m], [a4, a4m], [a5, a5m], [a6, a6m], [a7, a7m], [a8, a8m], [a9, a9m], [a10, a10m], [a11, a11m], [a12, a12m], [a13, a13m], [a14, a14m]];

export const TRACK = { id: 'A', title: 'Electronics' };
export const UNITS = MODULES.map(([m, more]) => {
  const unit = m.default;
  const extra = more.lessons ?? [];
  if (extra.length) {
    const last = unit.lessons[unit.lessons.length - 1];
    const at = /checkpoint/i.test(last.title) ? unit.lessons.length - 1 : unit.lessons.length;
    unit.lessons.splice(at, 0, ...extra);
  }
  return unit;
});
export const GLOSSARY = Object.assign({}, ...MODULES.flatMap(([m, more]) => [m.glossary ?? {}, more.glossary ?? {}]));

// Every step gets a stable key ("lessonId#index") for review tracking.
for (const unit of UNITS) {
  for (const lesson of unit.lessons) {
    lesson.steps.forEach((step, i) => { step.key = `${lesson.id}#${i}`; });
  }
}

export const LESSONS = UNITS.flatMap((unit) => unit.lessons.map((lesson) => ({ ...lesson, unit })));
