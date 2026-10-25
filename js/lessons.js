// Track A · Electronics. Each unit lives in js/units/<id>.js and exports
// `default` (the unit) plus an optional `glossary`.
import * as a1 from './units/a1.js';
import * as a2 from './units/a2.js';
import * as a3 from './units/a3.js';

const MODULES = [a1, a2, a3];

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
