import { UNIT, GLOSSARY } from './lessons.js';
import { mountBench } from './bench.js';
import * as P from './progress.js';

const app = document.getElementById('app');
let state = P.load();
let cleanup = () => {};

// ---------- helpers ----------
const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Tiny markup: **bold**, [[glossary]], blank-line paragraphs. Content is first-party. */
function md(text = '') {
  return text.split('\n\n').map((para) => `<p>${para
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[\[([^\]]+)\]\]/g, (_, w) => `<button type="button" class="term" data-term="${esc(w)}">${esc(w)}</button>`)
    .replace(/\n/g, '<br>')}</p>`).join('');
}

export function mascot(mood = 'happy', size = 72) {
  const mouth = {
    happy: '<path d="M27 44 q9 8 18 0" class="m-line"/>',
    wow: '<ellipse cx="36" cy="46" rx="5" ry="6" class="m-fill-dark"/>',
    think: '<path d="M29 46 h14" class="m-line"/>',
  }[mood];
  return `<svg class="mascot" width="${size}" height="${size}" viewBox="0 0 72 72" aria-hidden="true">
    <path d="M38 2 L28 18 h8 l-6 12 14 -16 h-8 z" class="m-bolt"/>
    <rect x="10" y="20" width="52" height="46" rx="20" class="m-body"/>
    <rect x="30" y="64" width="12" height="6" rx="2" class="m-foot"/>
    <circle cx="26" cy="38" r="4.5" class="m-fill-dark"/><circle cx="46" cy="38" r="4.5" class="m-fill-dark"/>
    <circle cx="27.5" cy="36.5" r="1.5" fill="#fff"/><circle cx="47.5" cy="36.5" r="1.5" fill="#fff"/>
    ${mouth}
    <text x="36" y="60" text-anchor="middle" class="m-plus">+</text>
  </svg>`;
}

function persist() { P.save(state); }

function openSheet(html, { tone = '', onClose } = {}) {
  const back = h(`<div class="sheet-backdrop"></div>`);
  const sheet = h(`<div class="sheet ${tone}" role="dialog" aria-modal="true">${html}</div>`);
  const close = () => { back.remove(); sheet.remove(); onClose?.(); };
  back.addEventListener('click', close);
  document.body.append(back, sheet);
  sheet.querySelector('[data-close]')?.addEventListener('click', close);
  (sheet.querySelector('[data-close]') ?? sheet.querySelector('button'))?.focus();
  return close;
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('.term');
  if (!t) return;
  const w = t.dataset.term;
  openSheet(`<h3 class="sheet-title">${esc(w)}</h3><p>${esc(GLOSSARY[w] ?? '')}</p><button class="btn" data-close>Got it</button>`);
});

// ---------- home ----------
function lessonStatus(i) {
  const l = UNIT.lessons[i];
  if (state.completed[l.id]) return 'done';
  if (i === 0 || state.completed[UNIT.lessons[i - 1].id]) return 'open';
  return 'locked';
}

function renderHome() {
  P.rollover(state);
  persist();
  const doneCount = UNIT.lessons.filter((l) => state.completed[l.id]).length;
  const quests = P.QUESTS.map((q) => ({ ...q, ok: q.done(state.today) }));
  const greeting = state.streak.usedFreeze
    ? 'A streak freeze saved your streak. Welcome back!'
    : doneCount === 0 ? 'Hi, I\'m Ampy! Let\'s light your first lamp.' : doneCount === UNIT.lessons.length ? 'Unit complete! Keep your streak with the Daily Charge.' : 'Ready for your next spark?';
  delete state.streak.usedFreeze;
  persist();

  const el = h(`<main class="home">
    <header class="topbar">
      <div class="brand">${mascot('happy', 30)}<span>Ampy</span></div>
      <div class="stats">
        <span class="stat" title="Day streak" aria-label="${state.streak.count} day streak">🔥 ${state.streak.count}</span>
        <span class="stat" title="Streak freezes" aria-label="${state.streak.freezes} streak freezes">🧊 ${state.streak.freezes}</span>
        <span class="stat xp" aria-label="${state.xp} XP">⚡ ${state.xp}</span>
      </div>
    </header>
    <section class="hello">${mascot(doneCount === UNIT.lessons.length ? 'wow' : 'happy')}<p class="bubble">${greeting}</p></section>
    <section class="card quests">
      <h2>Today's quests</h2>
      <ul>${quests.map((q) => `<li class="${q.ok ? 'ok' : ''}"><span class="check">${q.ok ? '✓' : ''}</span>${q.text}</li>`).join('')}</ul>
    </section>
    <section class="card charge ${state.today.charge ? 'spent' : ''}">
      <div><h2>⚡ Daily Charge</h2><p>${state.today.charge ? 'Charged for today. Come back tomorrow.' : `5 quick review questions · +${P.XP.charge} XP`}</p></div>
      <button class="btn" ${state.today.charge ? 'disabled' : ''} data-go="#/charge">${state.today.charge ? 'Done' : 'Start'}</button>
    </section>
    <section class="unit">
      <div class="unit-head"><p class="eyebrow">Unit 1 · ${doneCount}/${UNIT.lessons.length} lessons</p><h2>${UNIT.title}</h2><p class="muted">${UNIT.subtitle}</p></div>
      <ol class="path">${UNIT.lessons.map((l, i) => {
        const st = lessonStatus(i);
        return `<li class="node ${st}" style="--i:${i}">
          <button type="button" ${st === 'locked' ? 'disabled' : ''} data-go="#/lesson/${l.id}" aria-label="${esc(l.title)}${st === 'done' ? ' (completed)' : st === 'locked' ? ' (locked)' : ''}">
            <span class="node-icon">${st === 'locked' ? '🔒' : st === 'done' ? '✓' : l.icon}</span>
          </button>
          <span class="node-title">${esc(l.title)}</span>
        </li>`;
      }).join('')}</ol>
    </section>
    <footer class="foot muted">More units coming: capacitors, diodes, transistors, logic.</footer>
  </main>`);
  el.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go && !go.disabled) location.hash = go.dataset.go;
  });
  app.replaceChildren(el);
}

// ---------- player ----------
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function chargeSteps() {
  const unlocked = UNIT.lessons.filter((l, i) => lessonStatus(i) !== 'locked');
  const done = UNIT.lessons.filter((l) => state.completed[l.id]);
  const pool = (done.length ? done : unlocked).flatMap((l) => l.steps.filter((s) => s.type === 'mcq' || s.type === 'numeric'));
  return shuffle([...pool]).slice(0, 5);
}

function play(steps, { title, onFinish }) {
  let i = 0, earned = 0, firstTries = 0, questions = 0;
  const root = h(`<main class="player">
    <header class="player-top">
      <button class="icon-btn" type="button" aria-label="Quit" data-quit>✕</button>
      <div class="progress" role="progressbar" aria-label="${esc(title)} progress" aria-valuemin="0" aria-valuemax="${steps.length}"><div class="bar"></div></div>
      <span class="xp-pill" aria-live="polite">⚡ 0</span>
    </header>
    <section class="stage"></section>
    <footer class="actions"></footer>
  </main>`);
  const stage = root.querySelector('.stage');
  const actions = root.querySelector('.actions');
  const bar = root.querySelector('.bar');
  const xpPill = root.querySelector('.xp-pill');
  root.querySelector('[data-quit]').addEventListener('click', () => {
    if (confirm('Quit? Progress in this lesson will be lost.')) location.hash = '#/';
  });
  app.replaceChildren(root);

  let benchHandle;
  cleanup = () => benchHandle?.destroy();

  function award(firstTry) {
    questions += 1;
    if (firstTry) firstTries += 1;
    const amt = firstTry ? P.XP.firstTry : P.XP.retry;
    earned += amt;
    xpPill.textContent = `⚡ ${earned}`;
    xpPill.classList.remove('bump'); void xpPill.offsetWidth; xpPill.classList.add('bump');
    return amt;
  }

  function next() {
    benchHandle?.destroy(); benchHandle = null;
    i += 1;
    if (i >= steps.length) return onFinish({ earned, accuracy: questions ? firstTries / questions : 1 });
    show();
  }

  function success(step, amt) {
    navigator.vibrate?.([10, 40, 10]);
    const praise = shuffle(['Nice!', 'Spot on!', 'You got it!', 'Bright work!', 'Electric!'])[0];
    openSheet(`<div class="sheet-head">${mascot('wow', 44)}<h3 class="sheet-title">${praise} <span class="plus-xp">+${amt} XP</span></h3></div>
      <div class="explain">${md(step.explain)}</div>
      <button class="btn" data-close>Continue</button>`, { tone: 'good', onClose: next });
  }

  function miss(step, onRetry) {
    navigator.vibrate?.(30);
    openSheet(`<div class="sheet-head">${mascot('think', 44)}<h3 class="sheet-title">Not quite</h3></div>
      <p class="explain"><strong>Hint:</strong> ${md(step.hint).replace(/^<p>|<\/p>$/g, '')}</p>
      <button class="btn" data-close>Try again</button>`, { tone: 'bad', onClose: onRetry });
  }

  function show() {
    const step = steps[i];
    bar.style.width = `${(i / steps.length) * 100}%`;
    root.querySelector('.progress').setAttribute('aria-valuenow', i);
    stage.replaceChildren();
    actions.replaceChildren();
    stage.scrollTop = 0;
    let wrong = false, hinted = false;

    const hintBtn = () => {
      const b = h(`<button class="btn ghost" type="button">💡 Hint</button>`);
      b.addEventListener('click', () => {
        hinted = true;
        openSheet(`<div class="sheet-head">${mascot('think', 44)}<h3 class="sheet-title">Hint</h3></div><div class="explain">${md(step.hint)}</div><button class="btn" data-close>OK</button>`);
      });
      return b;
    };

    if (step.type === 'learn') {
      stage.append(h(`<article class="learn">${mascot('happy', 56)}<h2>${esc(step.title)}</h2><div class="body">${md(step.body)}</div></article>`));
      const b = h(`<button class="btn wide" type="button">Continue</button>`);
      b.addEventListener('click', next);
      actions.append(b);
      b.focus();
    }

    if (step.type === 'bench') {
      stage.append(h(`<div class="prompt">${md(step.prompt)}</div>`));
      const host = h(`<div></div>`);
      stage.append(host);
      let solved = false;
      benchHandle = mountBench(host, step.circuit, (sim, parts) => {
        if (solved || !step.goal(sim, parts)) return;
        solved = true;
        setTimeout(() => success(step, award(!hinted)), 650); // let the lamp glow first
      });
      actions.append(hintBtn());
    }

    if (step.type === 'mcq') {
      stage.append(h(`<div class="prompt q">${md(step.q)}</div>`));
      const list = h(`<div class="choices" role="radiogroup"></div>`);
      let picked = null;
      const check = h(`<button class="btn wide" type="button" disabled>Check</button>`);
      step.choices.forEach((c, ci) => {
        const b = h(`<button type="button" class="choice" role="radio" aria-checked="false"><span class="key">${ci + 1}</span>${esc(c)}</button>`);
        b.addEventListener('click', () => {
          picked = ci;
          list.querySelectorAll('.choice').forEach((x, xi) => x.setAttribute('aria-checked', String(xi === ci)));
          check.disabled = false;
        });
        list.append(b);
      });
      stage.append(list);
      check.addEventListener('click', () => {
        if (picked === step.answer) success(step, award(!wrong && !hinted));
        else {
          wrong = true;
          list.children[picked].classList.add('wrong');
          miss(step, () => { list.children[picked].classList.remove('wrong'); });
        }
      });
      actions.append(hintBtn(), check);
    }

    if (step.type === 'numeric') {
      stage.append(h(`<div class="prompt q">${md(step.q)}</div>`));
      const form = h(`<form class="numeric"><input type="text" inputmode="decimal" autocomplete="off" aria-label="Your answer" placeholder="?"><span class="unit-label">${esc(step.unit)}</span></form>`);
      const input = form.querySelector('input');
      const check = h(`<button class="btn wide" type="button" disabled>Check</button>`);
      input.addEventListener('input', () => { check.disabled = !input.value.trim(); });
      const submit = () => {
        const v = parseFloat(input.value.replace(',', '.'));
        if (Number.isFinite(v) && Math.abs(v - step.answer) <= step.tol * Math.abs(step.answer)) success(step, award(!wrong && !hinted));
        else { wrong = true; input.classList.add('wrong'); miss(step, () => { input.classList.remove('wrong'); input.select(); }); }
      };
      form.addEventListener('submit', (e) => { e.preventDefault(); if (!check.disabled) submit(); });
      check.addEventListener('click', submit);
      stage.append(form);
      actions.append(hintBtn(), check);
      input.focus();
    }
  }

  show();
}

function finishScreen({ title, lines, mood = 'wow' }) {
  bar100();
  const el = h(`<main class="finish">
    ${mascot(mood, 120)}
    <h1>${esc(title)}</h1>
    <ul class="finish-stats">${lines.map(([k, v]) => `<li><span>${v}</span><small>${k}</small></li>`).join('')}</ul>
    <button class="btn wide" type="button">Continue</button>
  </main>`);
  el.querySelector('button').addEventListener('click', () => { location.hash = '#/'; });
  app.replaceChildren(el);
  el.querySelector('button').focus();
}
function bar100() { const b = document.querySelector('.bar'); if (b) b.style.width = '100%'; }

function startLesson(id) {
  const idx = UNIT.lessons.findIndex((l) => l.id === id);
  if (idx < 0 || lessonStatus(idx) === 'locked') { location.hash = '#/'; return; }
  const lesson = UNIT.lessons[idx];
  play(lesson.steps, {
    title: lesson.title,
    onFinish: ({ earned, accuracy }) => {
      const before = state.streak.count;
      P.addXp(state, earned);
      P.completeLesson(state, lesson.id, accuracy);
      persist();
      finishScreen({
        title: 'Lesson complete!',
        lines: [['XP earned', `+${earned + P.XP.lessonBonus}`], ['First-try accuracy', `${Math.round(accuracy * 100)}%`], [state.streak.count > before ? 'Streak extended!' : 'Day streak', `🔥 ${state.streak.count}`]],
      });
    },
  });
}

function startCharge() {
  if (state.today.charge) { location.hash = '#/'; return; }
  play(chargeSteps(), {
    title: 'Daily Charge',
    onFinish: ({ earned }) => {
      P.addXp(state, earned);
      P.completeCharge(state);
      persist();
      finishScreen({ title: 'Fully charged!', lines: [['XP earned', `+${earned + P.XP.charge}`], ['Day streak', `🔥 ${state.streak.count}`]] });
    },
  });
}

// ---------- router ----------
function route() {
  cleanup(); cleanup = () => {};
  document.querySelectorAll('.sheet, .sheet-backdrop').forEach((n) => n.remove());
  const hash = location.hash || '#/';
  const m = hash.match(/^#\/lesson\/(\w+)/);
  if (m) startLesson(m[1]);
  else if (hash === '#/charge') startCharge();
  else renderHome();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
