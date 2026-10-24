# Ampy — learn real electronics

Bite-size electronics lessons with **live circuits you actually solve**: tap gaps,
flip switches, pick resistors, burn out an LED (then fix it). Inspired by the idea
behind the Ohmie iOS app; all content, art and code here are original.

## Run it (PowerShell)
```powershell
npm install
npm run serve        # then open http://127.0.0.1:5173
```
Open it on your phone on the same Wi-Fi by serving on `0.0.0.0` instead, or deploy
the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages). It's a PWA:
"Add to Home Screen" works offline.

## Test
```powershell
npm test             # solver, progress, and "every bench is solvable" (25 tests)
npm run serve        # in a second terminal, then:
npm run e2e          # plays every lesson + Daily Charge in Edge, saves tests/screens/
```

## How it's built
| File | Job |
| --- | --- |
| `js/sim.js` | DC circuit solver (nodal analysis). Batteries have internal resistance, LEDs are piecewise-linear with a max current, shorts are detected. |
| `js/bench.js` | Draws a circuit as SVG, handles taps and resistor chips, re-solves on every change, animates conventional current. |
| `js/lessons.js` | Unit 1 content + glossary. Step types: `learn`, `bench`, `mcq`, `numeric`. |
| `js/progress.js` | XP, daily streak + freezes, daily quests, Daily Charge. localStorage. |
| `js/app.js` | Home path, lesson player, sheets, routing. |

### Add a lesson
Add an object to `UNIT.lessons` in `js/lessons.js`. A bench needs `circuit`
(`nodes`, `parts`, `ground`) and a `goal(sim, parts)` function. `npm test` fails
if any bench starts solved or can't be solved, so you'll know right away.

## Not in v1
Quiz-battle bot, accounts/sync, leaderboard, AI tutor, more units. See `SPEC.md`.
