# Ampy roadmap: full curriculum

**Goal:** someone who finishes Ampy knows at least everything someone who finishes
Ohmie knows, and can prove it by building and debugging real circuits and code.

**Rule:** we match Ohmie's **topic coverage** (topics are general knowledge, nobody
owns them), but every lesson, explanation, diagram and question is **written by us**.
We never copy Ohmie's lesson text, art, mascot or exact puzzles. That keeps Ampy legal
to publish, and it lets us teach some things better.

**Audience:** built for Abdelrahman's sister, not as a public product (for now).
The repo and Pages site are technically public because free GitHub Pages requires it.

Status (2026-10-25): **Track A built and live**: 14 units, 148 lessons (Ohmie's electronics track has ~277), every puzzle machine-tested. Tracks B–F not started.

---

## 1. Coverage target

Ohmie's public chapter list (from ohmie.io, Oct 2026): ~690 lessons across 6 subjects.
Ampy maps every chapter to a unit, then adds what Ohmie doesn't list (✚).

### Track A: Electronics (Ohmie: 13 chapters, ~277 lessons)
| # | Unit | Covers | New engine needed |
|---|---|---|---|
| A1 ✅ | Basics | Charge, loops, switches, Ohm's law, series/parallel, LEDs, faults | — |
| A2 ✅ | Analysis | KVL/KCL, voltage dividers, Thevenin/Norton, superposition, power | Voltmeter probe, node voltage readouts |
| A3 ✅ | Capacitors | Charge/discharge, RC time constant, filters, energy storage | **Time-domain sim** + mini scope |
| A4 ✅ | Diodes | Rectifiers, Zener regulation, protection diodes, LED arrays | Diode curve model |
| A5 ✅ | Power | Batteries, regulators, efficiency, heat, fuses, safety | Power/heat readouts |
| A6 ✅ | Analog | Signals, sensors, potentiometers, oscilloscope reading | Scope + signal generator |
| A7 ✅ | AC | Sine waves, RMS, frequency, inductors, transformers, impedance | AC/phasor sim |
| A8 ✅ | Switches | Transistor as a switch (BJT, MOSFET), relays, H-bridge | Transistor models |
| A9 ✅ | Amplifiers | Transistor amps, op-amp basics, comparators, feedback | Ideal op-amp model |
| A10 ✅ | Silicon | Semiconductors, doping, PN junction, how chips are made | Animations (no sim) |
| A11 ✅ | Logic | Gates, truth tables, flip-flops, counters, adders | **Logic simulator** |
| A12 ✅ | Computers | Build up to an 8-bit CPU: ALU, registers, RAM, clock, program counter | Logic sim + CPU stepper |
| A13 ✅ | History | Volta → transistor → IC → microprocessor (short story lessons) | — |
| ✚ A14 ✅ | Measuring for real | Multimeter use, breadboard layout, reading datasheets, soldering safety | Breadboard view |

### Track B: Programming (Ohmie: Python 5 chapters + C++ for Arduino 4)
| # | Unit | Covers | Engine |
|---|---|---|---|
| B1–B5 | Python: Basics, Data, Structure, Tools, Objects | Variables → loops → functions → files → classes | **Pyodide** (real Python in the browser) |
| B6–B9 | Arduino C++: Arduino, Control, Sensing, Capstone | setup/loop, digital/analog I/O, PWM, sensors, a final project | **avr8js** (simulated Arduino Uno) + virtual LEDs/sensors |

### Track C: Embedded Systems (Ohmie: 5 chapters)
C1 Chips (microcontrollers vs processors) · C2 Boards (Arduino, ESP32, Pi) ·
C3 Signals (PWM, ADC, I2C, SPI, UART) · C4 Devices (sensors, displays, motors) ·
C5 Computers (Linux on a Pi, interrupts, real-time). Engine: avr8js + protocol visualiser.

### Track D: Robotics (Ohmie: 4 chapters)
D1 Hardware (motors, servos, drivers, power) · D2 Arms (joints, kinematics) ·
D3 Control (feedback, PID) · D4 Navigation (sensors, mapping, path finding).
Engine: 2D robot sandbox with a PID tuner.

### Track E: Computer Architecture (Ohmie: 3 chapters)
E1 CPU (pipelines, instruction sets) · E2 GPU (parallel work, shaders) ·
E3 Memory (cache, RAM, storage). Builds on A11–A12.

### Track F: PCB Design (Ohmie: 4 chapters)
F1 Basics · F2 Design (schematics, footprints) · F3 Routing (traces, ground planes) ·
F4 Production (Gerbers, ordering, assembly). Engine: simple schematic → board editor.
Stretch: export to KiCad.

**Size target:** ~700 lessons total (same scale as Ohmie), about 6 steps each.

---

## 2. How Ampy beats Ohmie, not just matches it
1. **Mastery checks.** Each unit ends with a checkpoint you must pass at ≥80%, built
   from new problems, not repeats.
2. **Spaced review.** Daily Charge picks questions you got wrong or haven't seen in
   a while, instead of random ones.
3. **Real-world projects.** Every track has optional "build it for real" projects with
   a parts list (all under ~50 SAR), so knowledge carries over to a real breadboard.
4. **Explain-why questions.** Not just "what's the answer" but "why did this lamp dim?",
   graded with multiple choice so no AI is needed.
5. **Proof of skill.** A final capstone per track and a shareable certificate page.
6. **Free and offline**, plus an Arabic version later (Ohmie: 5 languages).

---

## 3. How we make sure the knowledge actually matches
- A **coverage checklist** (spreadsheet): every Ohmie chapter topic → our lesson IDs.
  No unit ships with an unchecked topic.
- Cross-check each unit against a standard syllabus too (e.g. MIT 6.002 for circuits,
  Arduino's official tutorials for B6–B9), so we're not just following one app.
- Every unit gets the same test we have now: **every bench solvable and not
  pre-solved**, plus correct answers checked by the simulator wherever possible.
- One real learner (you, or a friend) does each unit before it's marked done.

---

## 4. Order and pace (≈1 hour/day)
Content is the slow part. Claude drafts lessons, you review and play them.

| Phase | What | Rough time |
|---|---|---|
| 0 | Content tooling: lessons as JSON files + coverage checklist + "Explore" screen with tracks | 1 week |
| 1 | A2–A5 (DC analysis, capacitors + time sim, diodes, power) | 4–5 weeks |
| 2 | A6–A9 (scope, AC, transistors, op-amps) | 5–6 weeks |
| 3 | A10–A14 (silicon, logic sim, 8-bit CPU, history, real measuring) | 6 weeks |
| 4 | B1–B9 Python + Arduino (Pyodide, avr8js) | 6–8 weeks |
| 5 | C, D, E, F tracks | 10–12 weeks |
| 6 | Arabic version, certificates, polish | ongoing |

Total: roughly 8–9 months of part-time work. Ship each unit as soon as it's done,
so Ampy keeps growing instead of waiting for everything.

**Next concrete step (when we start):** Phase 0, then unit A2 "Analysis".
