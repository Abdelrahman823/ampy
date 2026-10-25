// A10 extra depth: how LEDs make light, and how a chip is packaged.

export const glossary = {
  'band gap': 'The energy step an electron falls across inside a semiconductor. In an LED, a bigger gap means bluer light.',
  photon: 'A tiny packet of light energy.',
  package: 'The plastic or ceramic body around a silicon chip, with pins or pads to connect it to a circuit board.',
};

const led = `<svg viewBox="0 0 320 120" role="img" aria-label="Electron falling across the band gap and emitting a photon">
  <rect x="30" y="20" width="110" height="24" class="f-fill"/><text x="85" y="37" text-anchor="middle">high energy</text>
  <rect x="30" y="80" width="110" height="24" class="f-fill"/><text x="85" y="97" text-anchor="middle">low energy</text>
  <circle cx="160" cy="32" r="7" class="f-hot"/><path d="M160,42 V78" class="f-line"/><path d="M155,72 l5,8 l5,-8" class="f-line"/>
  <path d="M175,60 q10,-10 20,0 t20,0 t20,0" fill="none" stroke="var(--trace2)" stroke-width="3"/><text x="250" y="64">light</text>
  <text x="160" y="116" text-anchor="middle" class="f-muted">bigger drop → bluer light</text>
</svg>`;

export const lessons = [
  {
    id: 'a10-7', title: 'How LEDs make light', icon: '💡',
    steps: [
      { type: 'learn', title: 'Falling electrons', figure: led,
        body: 'In an LED, electrons cross the PN junction and fall across the [[band gap]], from high energy to low. The energy they lose comes out as a [[photon]] of light.\n\nA bigger gap means more energy per photon, so bluer light, and that\'s why blue LEDs need about 3 V while red ones need about 2 V.' },
      { type: 'mcq', q: 'Why does a blue LED need more voltage than a red one?', choices: ['Its band gap is bigger, so each photon carries more energy', 'Blue is a darker colour', 'It\'s made of glass'], answer: 0,
        hint: 'Energy per photon.', explain: 'Blue light carries more energy per photon, which needs a bigger gap and so more voltage.' },
      { type: 'mcq', q: 'Why are LEDs so much more efficient than filament bulbs?', choices: ['They make light directly instead of heating a wire until it glows', 'They\'re smaller', 'They use AC'], answer: 0,
        hint: 'What does a filament do?', explain: 'A filament wastes most of its power as heat. An LED turns electron energy straight into light.' },
    ],
  },
  {
    id: 'a10-8', title: 'From wafer to chip', icon: '📦',
    steps: [
      { type: 'learn', title: 'Dicing and packaging',
        body: 'A finished wafer holds hundreds of identical chips. Each one is tested, the wafer is sawn apart ("diced"), and every good chip is sealed in a [[package]] with tiny gold wires to its pins.\n\nBig through-hole packages (DIP) fit breadboards. Tiny surface-mount ones fill phones.' },
      { type: 'mcq', q: 'Which package fits straight into a breadboard?', choices: ['DIP (two rows of legs)', 'A tiny surface-mount chip', 'A bare silicon die'], answer: 0,
        hint: 'Legs that go through holes.', explain: 'DIP chips have legs spaced to fit breadboard holes, which is perfect for learning.' },
      { type: 'mcq', q: 'Why are chips tested **before** packaging?', choices: ['Packaging is expensive, so you only package chips that work', 'Testing is faster after', 'They can\'t be tested later'], answer: 0,
        hint: 'Don\'t waste money.', explain: 'Bad chips are marked and skipped, which saves the cost of packaging them.' },
    ],
  },
];
