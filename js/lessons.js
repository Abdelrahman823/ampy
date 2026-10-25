// Track A · Electronics. Each unit lives in js/units/<id>.js and exports
// `default` (the unit) plus an optional `glossary`.
import * as a1 from './units/a1.js';
import * as a2 from './units/a2.js';
import * as a3 from './units/a3.js';
import * as a4 from './units/a4.js';
import * as a5 from './units/a5.js';
import * as a6 from './units/a6.js';
import * as a7 from './units/a7.js';
import * as a8 from './units/a8.js';
import * as a9 from './units/a9.js';
import * as a10 from './units/a10.js';
import * as a11 from './units/a11.js';
import * as a12 from './units/a12.js';
import * as a13 from './units/a13.js';
import * as a14 from './units/a14.js';

const MODULES = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14];

export const TRACK = { id: 'A', title: 'Electronics' };
export const UNITS = MODULES.map((m) => m.default);
export const GLOSSARY = Object.assign({}, ...MODULES.map((m) => m.glossary ?? {}));

// Every step gets a stable key ("lessonId#index") for review tracking.
for (const unit of UNITS) {
  for (const lesson of unit.lessons) {
    lesson.steps.forEach((step, i) => { step.key = `${lesson.id}#${i}`; });
  }
}

export const LESSONS = UNITS.flatMap((unit) => unit.lessons.map((lesson) => ({ ...lesson, unit })));
