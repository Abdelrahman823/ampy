# Ampy — learn real electronics

Bite-size electronics lessons with **live circuits you actually solve**: tap gaps,
flip switches, drag sliders, watch an oscilloscope, flip logic gates and program an
8-bit computer. Inspired by the idea behind the Ohmie iOS app; all content, art and
code here are original.

**Track A · Electronics**: 14 units, 148 lessons: First Spark · Analysis · Capacitors ·
Diodes · Power · Analog · AC · Switches (transistors) · Amplifiers (op-amps) · Silicon ·
Logic · Computers · History · Real tools.

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
npm test             # solver physics, logic, CPU, progress, and every lesson's puzzles solvable
npm run serve        # in a second terminal, then:
npm run e2e          # plays all 148 lessons + Daily Charge in Edge, saves tests/screens/
# ONLY=a7 npm run e2e   → just one unit
```

## How it's built
| File | Job |
| --- | --- |
| `js/sim.js` | Circuit solver (nodal analysis): resistors, lamps, motors, meters, fuses, diodes/zeners/LEDs, NPN, MOSFET, op-amp, plus capacitors, inductors and AC over time. |
| `js/bench.js` | Draws circuits as SVG; taps, chips, sliders; live oscilloscope for time-based benches. |
| `js/logic.js` | Logic lab: gates, flip-flops, clock, truth tables. |
| `js/cpu.js` | SAP-style 8-bit computer: 16-byte RAM, A/B, ALU flags, PC, OUT. |
| `js/units/*.js` | One file per unit (content + glossary). `js/lessons.js` lists them. |
| `js/progress.js` | XP, daily streak + freezes, daily quests, Daily Charge. localStorage. |
| `js/app.js` | Home path, lesson player, sheets, routing. |

### Add a lesson
Add an object to a unit's `lessons` in `js/units/<id>.js` (new unit: add the file to
`js/lessons.js`). Step types: `learn`, `mcq`, `numeric`, `bench` (`circuit` + `goal`),
`logic` (`lab` + `goal`), `cpu` (`machine` + `goal` + `solution`). `npm test` fails if
any puzzle starts solved, can't be solved, or burns a part the moment it opens.

## Next
Tracks B–F (programming, embedded, robotics, architecture, PCB). See `ROADMAP.md`.
