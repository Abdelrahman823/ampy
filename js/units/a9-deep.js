// A9 deep practice: concepts, drills and bench challenges, inserted before the checkpoint.
import { wire, res, vm, near } from './kit.js';
import { drill, mcq, num, nonInvGain, nonInvOut, invOut, rfFor, clipOut } from './drill.js';

export const glossary = {
  'open-loop gain': 'An op-amp\'s gain with no feedback at all, often 100 000 or more.',
  'slew rate': 'The fastest an op-amp\'s output can change, in volts per microsecond.',
  'virtual ground': 'A mid-supply reference (often half the supply voltage) that lets a single-supply op-amp swing both up and down.',
  'active filter': 'A filter built with an op-amp plus resistors and capacitors. It can amplify as well as filter.',
  integrator: 'An op-amp with a capacitor as feedback. Its output ramps at a rate set by the input voltage.',
  'instrumentation amplifier': 'A precise difference amplifier (often three op-amps) for tiny sensor signals like heartbeats or strain gauges.',
};

const NC = { vs: [40, 90], gs: [40, 200], pp: [110, 90], nr: [100, 150], rb: [100, 200], o: [220, 100], ol: [290, 100], lg: [290, 200] };
const NN = { vin: [40, 80], gnd: [40, 200], pnode: [100, 80], nn: [110, 140], fo: [250, 140], o: [250, 90], ng: [110, 200], vo: [300, 90], vg: [300, 200] };
const NI = { vin: [40, 90], gnd: [40, 200], nn: [110, 90], ft: [110, 40], ot: [250, 40], o: [250, 100], pg: [130, 200], vo: [300, 100], vg: [300, 200] };
const NS = { v1: [40, 70], g1: [40, 200], v2: [90, 130], g2: [90, 200], nn: [140, 70], n2: [140, 130], ft: [140, 30], ot: [270, 30], o: [270, 100], pg: [150, 200], vo: [320, 100], vg: [320, 200] };

const nonInvBench = (vin, rf, prompt, goalV, hint, explain) => ({
  type: 'bench', prompt,
  circuit: { nodes: NN, view: '0 0 360 220', ground: 'gnd', parts: [
    { id: 'VIN', kind: 'battery', a: 'vin', b: 'gnd', v: vin, rInt: 0.001 }, wire('W1', 'vin', 'pnode'),
    { id: 'U', kind: 'opamp', pins: { p: 'pnode', n: 'nn', out: 'o' }, at: [170, 90], flip: true },
    rf, wire('W2', 'fo', 'o'), res('RG', 'nn', 'ng', 1000, { label: 'Rg 1 kΩ' }), wire('W3', 'ng', 'gnd'),
    wire('W4', 'o', 'vo'), vm('V', 'vo', 'vg', { labelSide: -1 }), wire('W5', 'vg', 'ng'),
  ] },
  goal: (s) => near(s.parts.V.voltage, goalV, 0.08), hint, explain,
});

export const lessons = [
  {
    id: 'a9-11', title: 'Challenge: set the alarm level', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Comparator threshold', body: 'The comparator\'s **−** input sets the trip point. Pick a **6 V** reference, then raise the sensor past it to test the alarm.' },
      { type: 'bench', prompt: 'Pick a **6 V** reference, then raise the sensor until the LED (alarm) turns on.',
        circuit: { nodes: NC, ground: 'gs', parts: [
          { id: 'VS', kind: 'battery', a: 'vs', b: 'gs', v: 1, rInt: 0.001, slider: { label: 'Sensor voltage', prop: 'v', min: 0, max: 9, step: 0.5, fmt: 'v' } },
          wire('W1', 'vs', 'pp'), { id: 'VR', kind: 'battery', a: 'nr', b: 'rb', v: 3, rInt: 0.001, choices: [3, 4.5, 6], prop: 'v', fmt: 'v', label: 'Reference', labelSide: -1 },
          { id: 'U', kind: 'opamp', pins: { p: 'pp', n: 'nr', out: 'o' }, at: [170, 100], flip: true, vpos: 9, vneg: 0 },
          res('R', 'o', 'ol', 330), { id: 'D', kind: 'led', a: 'ol', b: 'lg' }, wire('W2', 'gs', 'rb'), wire('W3', 'rb', 'lg'),
        ] },
        goal: (s, parts) => parts.find((p) => p.id === 'VR').v === 6 && s.parts.D.on,
        hint: 'Reference chip first, then the slider above 6 V.', explain: 'The alarm now trips only above 6 V. Swap the reference to move the trip point.' },
      mcq('To make the alarm trip at a **lower** sensor voltage, you would…', ['Lower the reference', 'Raise the reference', 'Add a bigger LED'], 0, 'It compares against the reference.', 'Lower the reference and it trips sooner.'),
    ],
  },
  {
    id: 'a9-12', title: 'Challenge: gain of 11', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Design the gain', body: '0.5 V in, and you need **5.5 V** out: a gain of 11. Rg is 1 kΩ.' },
      nonInvBench(0.5, res('RF', 'nn', 'fo', 5000, { choices: [5000, 10000, 11000], label: 'Rf' }), 'Pick **Rf** for an output of **5.5 V**.', 5.5,
        'Gain = 1 + Rf ÷ Rg = 11.', '1 + 10k ÷ 1k = 11. The 11 kΩ choice was the trap: that gives 12.'),
      rfFor(11, 1000),
    ],
  },
  {
    id: 'a9-13', title: 'Challenge: gain of −2.5', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Inverting design', body: '1 V in, and you need **−2.5 V** out. Rin is 2 kΩ.' },
      { type: 'bench', prompt: 'Pick **Rf** for an output of **−2.5 V**.',
        circuit: { nodes: NI, view: '0 0 360 220', ground: 'gnd', parts: [
          { id: 'VIN', kind: 'battery', a: 'vin', b: 'gnd', v: 1, rInt: 0.001 }, res('RIN', 'vin', 'nn', 2000, { label: 'Rin 2 kΩ' }),
          wire('W1', 'nn', 'ft'), res('RF', 'ft', 'ot', 2000, { choices: [2000, 5000, 10000], label: 'Rf' }), wire('W2', 'ot', 'o'),
          { id: 'U', kind: 'opamp', pins: { n: 'nn', p: 'pg', out: 'o' }, at: [170, 100] },
          wire('W3', 'o', 'vo'), vm('V', 'vo', 'vg', { labelSide: -1 }), wire('W4', 'vg', 'pg'), wire('W5', 'pg', 'gnd'),
        ] },
        goal: (s) => near(s.parts.V.voltage, -2.5, 0.05),
        hint: 'Rf ÷ Rin = 2.5', explain: '−(5k ÷ 2k) × 1 V = −2.5 V.' },
      invOut(1, 5000, 2000),
    ],
  },
  {
    id: 'a9-14', title: 'Challenge: weighted mixer', icon: '🎯',
    steps: [
      { type: 'learn', title: 'Mixing with different volumes', body: 'A mixer can give each input its own "volume" by changing its resistor. Rf = 2 kΩ, input 1 is 1 V through 1 kΩ, and input 2 is 2 V. Make the output **−4 V**.' },
      { type: 'bench', prompt: 'Pick **R2** so the mixer outputs **−4 V**.',
        circuit: { nodes: NS, view: '0 0 360 220', ground: 'g1', parts: [
          { id: 'B1', kind: 'battery', a: 'v1', b: 'g1', v: 1, rInt: 0.001 }, { id: 'B2', kind: 'battery', a: 'v2', b: 'g2', v: 2, rInt: 0.001 },
          res('R1', 'v1', 'nn', 1000), res('R2', 'v2', 'n2', 500, { choices: [500, 1000, 2000], label: 'R2' }), wire('W1', 'n2', 'nn'), wire('W2', 'nn', 'ft'),
          res('RF', 'ft', 'ot', 2000, { label: 'Rf 2 kΩ' }), wire('W3', 'ot', 'o'),
          { id: 'U', kind: 'opamp', pins: { n: 'nn', p: 'pg', out: 'o' }, at: [190, 100] },
          wire('W4', 'o', 'vo'), vm('V', 'vo', 'vg'), wire('W5', 'vg', 'pg'), wire('W6', 'pg', 'g2'), wire('W7', 'g2', 'g1'),
        ] },
        goal: (s) => near(s.parts.V.voltage, -4, 0.06),
        hint: '−2k × (1/1k + 2/R2) = −4.', explain: 'With R2 = 2 kΩ: −2k × (1/1k + 2/2k) = −4 V. Input 2 now has half the "volume" of input 1.' },
      num('Same mixer, R2 = 1 kΩ. What output would the maths ask for?', -2000 * (1 / 1000 + 2 / 1000), 'V', '−2k × (1/1k + 2/1k)', '−6 V: still inside the ±9 V rails.'),
    ],
  },
  {
    id: 'a9-15', title: 'Open-loop gain', icon: '♾️',
    steps: [
      { type: 'learn', title: 'Why feedback matters',
        body: 'With no feedback, an op-amp multiplies the input difference by its [[open-loop gain]], often **100 000**. Even 0.1 mV becomes 10 V!\n\nThat\'s too much to control and it varies between chips. Negative feedback trades that huge gain for an exact, stable one.' },
      num('Open-loop gain 100 000, input difference 0.05 mV. What output would that ask for?', 100000 * 0.00005, 'V', '100 000 × 0.00005 V', '5 V, from a tiny 0.05 mV difference.'),
      mcq('Why don\'t designers rely on the open-loop gain directly?', ['It\'s enormous and changes from chip to chip and with temperature', 'It\'s too small', 'It only works on AC'], 0, 'Unpredictable.', 'Feedback makes the gain depend only on resistor values, which are precise and stable.'),
    ],
  },
  {
    id: 'a9-16', title: 'Real op-amp limits', icon: '⚠️',
    steps: [
      { type: 'learn', title: 'Not quite ideal',
        body: 'Real op-amps have limits:\n\n• **[[slew rate]]**: the output can only change so fast\n• **Bandwidth**: gain falls at high frequencies\n• **Output swing**: many can\'t reach the rails exactly. **Rail-to-rail** types can\n• **Output current**: usually only about 20 mA' },
      num('An op-amp slews at 0.5 V/µs. How many µs to swing 10 V?', 10 / 0.5, 'µs', 'Volts ÷ (V/µs)', '10 ÷ 0.5 = 20 µs.'),
      mcq('A non-rail-to-rail op-amp on a 0–5 V supply outputs a "high" of…', ['A bit below 5 V, maybe 3.5–4 V', 'Exactly 5 V', '9 V'], 0, 'Not rail-to-rail.', 'It can\'t quite reach the top rail. Check the datasheet!'),
      mcq('Can an op-amp output drive a 1 A motor directly?', ['No, add a transistor or driver', 'Yes'], 0, 'About 20 mA max.', 'No. Its output current is tiny. Use a transistor or a driver.'),
    ],
  },
  {
    id: 'a9-17', title: 'Single-supply tricks', icon: '🔋',
    steps: [
      { type: 'learn', title: 'Virtual ground',
        body: 'Battery projects often have only one supply, say 0 V and 9 V. To amplify audio that swings up **and** down, bias everything around a [[virtual ground]] at half the supply (4.5 V), made with a divider and a buffer.\n\nThe signal then swings around 4.5 V instead of 0 V.' },
      num('A single 9 V supply. Where should the virtual ground sit?', 4.5, 'V', 'Half way.', '4.5 V gives equal room to swing up and down.'),
      mcq('An audio signal swings ±1 V around a 4.5 V virtual ground. Its range is…', ['3.5 V to 5.5 V', '−1 V to +1 V', '0 V to 9 V'], 0, '4.5 ± 1', '3.5 V to 5.5 V, comfortably between the rails.'),
    ],
  },
  {
    id: 'a9-18', title: 'Active filters', icon: '🎚️',
    steps: [
      { type: 'learn', title: 'Filters with gain',
        body: 'Combine an op-amp with resistors and capacitors and you get an [[active filter]]. It can **boost** the frequencies it keeps, have sharper cutoffs than simple RC filters, and doesn\'t sag under load.\n\nUsed in audio equalisers, sensor clean-up and anti-aliasing before ADCs.' },
      mcq('An advantage of an active filter over a plain RC filter:', ['It can amplify and isn\'t affected by the load', 'It needs no power', 'It blocks all frequencies'], 0, 'Op-amp benefits.', 'Gain plus a strong output that doesn\'t sag.'),
      mcq('Before an ADC samples a signal, you often add a low-pass filter to…', ['Remove frequencies too fast for the ADC to capture correctly', 'Add noise', 'Make it digital'], 0, 'Anti-aliasing.', 'Frequencies faster than the sampling can handle would show up as false, wrong signals.'),
    ],
  },
  {
    id: 'a9-19', title: 'Integrators and ramps', icon: '📈',
    steps: [
      { type: 'learn', title: 'A capacitor in the feedback',
        body: 'Replace Rf with a capacitor and you get an [[integrator]]. A steady input makes the output **ramp** at a steady rate, because the capacitor charges with a constant current.\n\nUsed in function generators (triangle waves), timers and motor control.' },
      mcq('A steady positive input into an inverting integrator makes the output…', ['Ramp steadily downwards', 'Stay at 0 V', 'Jump to a fixed value instantly'], 0, 'Inverting, and the capacitor keeps charging.', 'It ramps down at a steady rate (until it hits a rail).'),
      mcq('A square wave into an integrator comes out as…', ['A triangle wave', 'A sine wave', 'A flat line'], 0, 'Ramp up, ramp down.', 'Each half of the square makes a ramp: up, down, up, down. A triangle.'),
    ],
  },
  {
    id: 'a9-20', title: 'Instrumentation amplifiers', icon: '🩺',
    steps: [
      { type: 'learn', title: 'Measuring tiny differences',
        body: 'A heartbeat on the skin is about **1 mV**, buried under much larger noise picked up by the body. An [[instrumentation amplifier]] amplifies only the **difference** between two electrodes, with a high, precise gain, and ignores the shared noise.\n\nECG machines, scales and pressure sensors all use them.' },
      num('An ECG signal of 1 mV goes through an in-amp with gain 1000. Output in volts?', 0.001 * 1000, 'V', '0.001 × 1000', '1 V, now big enough for an ADC.'),
      mcq('Why can an in-amp ignore noise picked up by the whole body?', ['The noise is the same on both electrodes, and it only amplifies the difference', 'It filters all AC', 'It uses a fuse'], 0, 'Difference amplifier.', 'Shared (common-mode) noise cancels out.'),
    ],
  },
  drill('a9-21', 'Practice: non-inverting gain', '🧮', '**Gain = 1 + Rf ÷ Rg**', [
    nonInvGain(9000, 1000), nonInvGain(4700, 1000), nonInvGain(10000, 10000), nonInvOut(0.2, 9000, 1000), nonInvOut(1.5, 2000, 1000),
  ]),
  drill('a9-22', 'Practice: inverting amplifiers', '🧮', '**Vout = −(Rf ÷ Rin) × Vin**', [
    invOut(1, 10000, 1000), invOut(0.5, 4700, 1000), invOut(-2, 2000, 1000), invOut(3, 1000, 3000),
  ]),
  drill('a9-23', 'Practice: designing gain', '🧮', 'For non-inverting: **Rf = (gain − 1) × Rg**.', [
    rfFor(5, 1000), rfFor(2, 10000), rfFor(101, 100), rfFor(23, 1000),
  ]),
  drill('a9-24', 'Practice: will it clip?', '🧮', 'The output can\'t pass the rails.', [
    clipOut(0.5, 10, 9), clipOut(1, 20, 12), clipOut(0.1, 50, 9), clipOut(2, 3, 5),
  ]),
  {
    id: 'a9-25', title: 'Review: which op-amp circuit?', icon: '🧠',
    steps: [
      { type: 'learn', title: 'Pick the circuit', body: 'Match each job to the right op-amp circuit.' },
      mcq('Turn "is it hotter than 40 °C?" into on/off:', ['Comparator', 'Voltage follower', 'Integrator'], 0, 'Yes or no.', 'A comparator.'),
      mcq('Boost a 10 mV signal to 1 V without flipping it:', ['Non-inverting amplifier (gain 100)', 'Inverting amplifier', 'Comparator'], 0, 'Same polarity, gain 100.', 'Non-inverting, with Rf = 99 × Rg.'),
      mcq('Copy a weak divider\'s voltage to drive a load:', ['Voltage follower', 'Summing amplifier', 'Comparator'], 0, 'Gain 1, strong output.', 'A voltage follower (buffer).'),
      mcq('Mix three microphones into one output:', ['Summing amplifier', 'Integrator', 'Comparator'], 0, 'Add them.', 'A summing amplifier.'),
    ],
  },
  {
    id: 'a9-26', title: 'Review: op-amp rules', icon: '🧠',
    steps: [
      { type: 'learn', title: 'The golden rules', body: 'With negative feedback: **(1)** the inputs draw no current, **(2)** the output does whatever it takes to make + and − equal.' },
      mcq('In a working non-inverting amp with 2 V on +, the − input sits at…', ['2 V', '0 V', '9 V'], 0, 'Rule 2.', '2 V, because feedback makes the inputs equal.'),
      mcq('In an inverting amp with + grounded, the − input sits at about…', ['0 V (a "virtual ground")', '9 V', 'Vin'], 0, 'Rule 2 again.', 'About 0 V, even though it isn\'t wired to ground.'),
      mcq('How much current flows into an ideal op-amp input?', ['Essentially none', 'All of it', 'Half'], 0, 'Rule 1.', 'Essentially none. That\'s why they don\'t load the signal.'),
    ],
  },
];
