// XP, streaks, daily quests. Pure functions over a plain state object, plus
// load/save helpers that tolerate blocked storage.

const KEY = 'ampy.v1';
export const XP = { firstTry: 10, retry: 5, lessonBonus: 20, charge: 15 };
export const QUESTS = [
  { id: 'lesson', text: 'Finish a lesson', done: (d) => d.lessons >= 1 },
  { id: 'xp', text: 'Earn 30 XP', done: (d) => d.xp >= 30 },
  { id: 'charge', text: 'Complete the Daily Charge', done: (d) => d.charge },
];

export function dayKey(date = new Date()) {
  const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

export function fresh() {
  return {
    xp: 0,
    completed: {}, // lessonId -> { best: accuracy 0..1 }
    streak: { count: 0, last: null, freezes: 1 },
    today: { day: null, xp: 0, lessons: 0, charge: false },
  };
}

/** Roll "today" over when the date changes; also shows a broken streak. */
export function rollover(state, now = new Date()) {
  const day = dayKey(now);
  if (state.today.day !== day) state.today = { day, xp: 0, lessons: 0, charge: false };
  const { last } = state.streak;
  if (last && daysBetween(last, day) > 1) {
    const missed = daysBetween(last, day) - 1;
    if (missed <= state.streak.freezes) {
      state.streak.freezes -= missed;
      const yesterday = new Date(`${day}T12:00:00`);
      yesterday.setDate(yesterday.getDate() - 1);
      state.streak.last = dayKey(yesterday);
      state.streak.usedFreeze = true;
    } else {
      state.streak.count = 0;
    }
  }
  return state;
}

/** Record activity today: extends the streak at most once a day. */
function touchStreak(state, now) {
  const day = dayKey(now);
  const s = state.streak;
  if (s.last === day) return;
  s.count = s.last && daysBetween(s.last, day) === 1 ? s.count + 1 : 1;
  s.last = day;
  if (s.count % 7 === 0 && s.freezes < 2) s.freezes += 1;
}

export function addXp(state, amount) {
  state.xp += amount;
  state.today.xp += amount;
}

export function completeLesson(state, lessonId, accuracy, now = new Date()) {
  rollover(state, now);
  addXp(state, XP.lessonBonus);
  state.today.lessons += 1;
  const prev = state.completed[lessonId]?.best ?? 0;
  state.completed[lessonId] = { best: Math.max(prev, accuracy) };
  touchStreak(state, now);
}

export function completeCharge(state, now = new Date()) {
  rollover(state, now);
  if (state.today.charge) return false;
  state.today.charge = true;
  addXp(state, XP.charge);
  touchStreak(state, now);
  return true;
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return rollover({ ...fresh(), ...JSON.parse(raw) });
  } catch { /* storage blocked or corrupt: start fresh */ }
  return rollover(fresh());
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}
