# Ampy — learn real electronics (MVP spec)

Original learning app inspired by the *idea* of Ohmie (bite-size, game-like
electronics lessons with circuits that respond). Own name, mascot and lesson text.

## Goal
Personal learning / portfolio project. One complete unit, playable on a phone.

## v1 scope
- **Unit 1 — First Spark**: 6 lessons (closed loop, switches, Ohm's law,
  series/parallel, LEDs need a resistor, find the fault).
- **Live circuit bench**: a real DC solver (nodal analysis), not canned
  animations. Tap gaps, switches and broken wires; pick resistor values; lamps
  glow by power, LEDs burn out above their max current, shorts are detected.
- Question types: `learn` (text card), `bench` (goal reached on the live
  circuit), `mcq`, `numeric` (with tolerance). Every question has a hint and an
  explanation.
- **Progress**: XP (+10 per first-try correct, +5 retry, +20 lesson complete),
  daily streak with one streak freeze, **Daily Charge** (5 review questions,
  +15 XP once a day). Saved in localStorage.
- PWA: installable, works offline.

## Out of scope (later)
Quiz-battle bot, accounts/sync, leaderboard, AI tutor, more units.

## Stack
Vanilla HTML/CSS/JS (ES modules), no build step. `node --test` for the solver.

## Done when
- `node --test` passes.
- All 6 lessons + Daily Charge playable end to end in a mobile viewport,
  verified in a real browser.
