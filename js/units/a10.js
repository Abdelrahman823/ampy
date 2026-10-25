// A10 · Silicon: atoms, semiconductors, doping, the PN junction, the MOSFET
// inside, and how chips are made. Mostly drawn diagrams and questions.

export const glossary = {
  electron: 'A tiny negatively charged particle. Moving electrons are what electric current is made of.',
  semiconductor: 'A material like silicon that conducts a little: more than an insulator, less than a metal. We can control how much.',
  doping: 'Adding a tiny amount of another element to silicon to give it extra electrons (N-type) or extra holes (P-type).',
  hole: 'A missing electron in a crystal. It behaves like a positive charge that can move.',
  'PN junction': 'The boundary where P-type and N-type silicon meet. It\'s the heart of every diode and transistor.',
  wafer: 'A thin, polished disc of pure silicon on which hundreds of chips are made at once.',
  photolithography: 'Printing chip patterns with light shone through a mask, like a tiny photo stencil.',
};

const atom = `<svg viewBox="0 0 320 130" role="img" aria-label="An atom: nucleus with electrons in shells">
  <circle cx="70" cy="65" r="34" class="f-line"/><circle cx="70" cy="65" r="56" class="f-line"/>
  <circle cx="70" cy="65" r="14" class="f-hot"/><text x="70" y="70" text-anchor="middle" fill="#fff">+</text>
  <circle cx="104" cy="65" r="6" class="f-cool"/><circle cx="36" cy="65" r="6" class="f-cool"/>
  <circle cx="126" cy="65" r="6" class="f-cool"/><circle cx="70" cy="9" r="6" class="f-cool"/><circle cx="14" cy="65" r="6" class="f-cool"/><circle cx="70" cy="121" r="6" class="f-cool"/>
  <text x="150" y="40">nucleus (+) in the middle</text><text x="150" y="65">electrons (−) in shells</text>
  <text x="150" y="90" class="f-muted">outer electrons can wander</text><text x="150" y="108" class="f-muted">in metals → current</text>
</svg>`;

const lattice = (center, extra) => `<svg viewBox="0 0 320 150" role="img" aria-label="Silicon crystal grid">
  ${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => {
    const x = 50 + c * 70, y = 30 + r * 45;
    const isCenter = r === 1 && c === 1;
    const label = isCenter ? center : 'Si';
    return `${c < 3 ? `<line x1="${x}" y1="${y}" x2="${x + 70}" y2="${y}" class="f-line"/>` : ''}${r < 2 ? `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 45}" class="f-line"/>` : ''}
      <circle cx="${x}" cy="${y}" r="15" class="${isCenter && center !== 'Si' ? 'f-hot' : 'f-fill'}"/><text x="${x}" y="${y + 4}" text-anchor="middle" ${isCenter && center !== 'Si' ? 'fill="#fff"' : ''}>${label}</text>`;
  }).join('')).join('')}
  ${extra ?? ''}
</svg>`;

const pn = `<svg viewBox="0 0 320 130" role="img" aria-label="PN junction with depletion zone">
  <rect x="20" y="20" width="130" height="80" class="f-fill"/><rect x="170" y="20" width="130" height="80" class="f-fill"/>
  <rect x="135" y="20" width="50" height="80" fill="none" stroke-dasharray="4 3" class="f-line"/>
  ${[[40, 40], [70, 70], [100, 45], [55, 88], [115, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="var(--trace2)" stroke-width="2.5"/>`).join('')}
  ${[[205, 45], [235, 75], [270, 40], [220, 90], [285, 85]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" class="f-hot"/>`).join('')}
  <text x="70" y="118" text-anchor="middle">P: holes ○</text><text x="240" y="118" text-anchor="middle">N: electrons ●</text>
  <text x="160" y="14" text-anchor="middle" class="f-muted">depletion zone</text>
</svg>`;

const mosfet = `<svg viewBox="0 0 320 150" role="img" aria-label="Cross-section of a MOSFET">
  <rect x="20" y="70" width="280" height="70" class="f-fill"/><text x="160" y="133" text-anchor="middle">P-type silicon</text>
  <rect x="40" y="70" width="70" height="30" class="f-hot"/><text x="75" y="90" text-anchor="middle" fill="#fff">N</text>
  <rect x="210" y="70" width="70" height="30" class="f-hot"/><text x="245" y="90" text-anchor="middle" fill="#fff">N</text>
  <rect x="100" y="58" width="120" height="10" fill="var(--surface-2)" stroke="var(--wire)"/><rect x="100" y="38" width="120" height="20" class="f-cool"/>
  <text x="160" y="52" text-anchor="middle" fill="#fff">gate (metal)</text><text x="160" y="32" text-anchor="middle" class="f-muted">thin glass (oxide) underneath</text>
  <line x1="110" y1="74" x2="210" y2="74" stroke="var(--copper)" stroke-width="4" stroke-dasharray="6 4"/>
  <text x="75" y="64" text-anchor="middle">source</text><text x="245" y="64" text-anchor="middle">drain</text>
  <text x="160" y="114" text-anchor="middle" class="f-muted">channel appears when gate is +</text>
</svg>`;

const fab = `<svg viewBox="0 0 320 120" role="img" aria-label="Chip-making steps">
  ${['1 coat', '2 expose', '3 etch', '4 repeat'].map((t, i) => `<rect x="${10 + i * 78}" y="30" width="66" height="50" rx="8" class="f-fill"/><text x="${43 + i * 78}" y="60" text-anchor="middle">${t}</text>${i < 3 ? `<path d="M${78 + i * 78},55 h8" class="f-line"/>` : ''}`).join('')}
  <text x="160" y="105" text-anchor="middle" class="f-muted">light through a mask prints each layer, about 50 times</text>
</svg>`;

export default {
  id: 'a10',
  title: 'Silicon',
  subtitle: 'What\'s really inside a chip',
  lessons: [
    {
      id: 'a10-1', title: 'Atoms and electrons', icon: '⚛️',
      steps: [
        { type: 'learn', title: 'Where current comes from', figure: atom,
          body: 'Everything is made of atoms. Each has a positive nucleus and negative [[electron]]s around it.\n\nIn **metals** like copper, the outer electrons are loose and drift from atom to atom. Push them with a voltage and you get current.' },
        { type: 'mcq', q: 'What actually moves in a copper wire when current flows?', choices: ['Protons', 'Electrons', 'Whole atoms'], answer: 1,
          hint: 'The loose outer ones.', explain: 'Electrons. The nuclei stay put.' },
        { type: 'mcq', q: 'Why is rubber a good insulator?', choices: ['Its electrons are tightly held and can\'t wander', 'It\'s soft', 'It has no atoms'], answer: 0,
          hint: 'Compare with copper.', explain: 'Its electrons are locked in place, so no current can flow.' },
      ],
    },
    {
      id: 'a10-2', title: 'Semiconductors', icon: '💎',
      steps: [
        { type: 'learn', title: 'Silicon\'s secret', figure: lattice('Si'),
          body: 'Silicon atoms lock into a neat crystal. Each one shares its 4 outer electrons with its neighbours, so pure silicon barely conducts.\n\nThat\'s a [[semiconductor]]: somewhere between a conductor and an insulator, and we can **control** where.' },
        { type: 'mcq', q: 'Pure silicon is…', choices: ['A great conductor', 'A poor conductor until we change it', 'A perfect insulator forever'], answer: 1,
          hint: 'The electrons are all busy holding the crystal together.', explain: 'Barely conducting at first. Doping changes that.' },
        { type: 'mcq', q: 'Why is silicon used for chips?', choices: ['Its conductivity can be precisely controlled, and it comes from sand', 'It\'s magnetic', 'It glows'], answer: 0,
          hint: 'Two good reasons.', explain: 'We can tune it precisely, and it\'s made from sand, one of the most common materials on Earth.' },
      ],
    },
    {
      id: 'a10-3', title: 'Doping: N and P', icon: '🧪',
      steps: [
        { type: 'learn', title: 'Adding impurities on purpose', figure: lattice('P', '<text x="160" y="146" text-anchor="middle" class="f-muted">phosphorus brings 1 spare electron → N-type</text>'),
          body: '[[doping]] swaps a few silicon atoms for others:\n\n• **Phosphorus** brings one spare electron → **N-type** (extra Negative)\n• **Boron** is one electron short, leaving a [[hole]] → **P-type** (acts Positive)\n\nEven one atom in a million changes everything.' },
        { type: 'mcq', q: 'Silicon doped with phosphorus has extra…', choices: ['Electrons (N-type)', 'Holes (P-type)', 'Protons'], answer: 0,
          hint: 'Phosphorus has 5 outer electrons, silicon 4.', explain: 'One spare electron each: N-type.' },
        { type: 'mcq', q: 'What is a "hole"?', choices: ['A gap in the chip', 'A missing electron that acts like a moving positive charge', 'A broken wire'], answer: 1,
          hint: 'Boron is one electron short.', explain: 'A missing electron. Neighbouring electrons hop into it, so the hole seems to move.' },
      ],
    },
    {
      id: 'a10-4', title: 'The PN junction', icon: '🤝',
      steps: [
        { type: 'learn', title: 'Where P meets N', figure: pn,
          body: 'Put P-type next to N-type and electrons near the border fill the holes, leaving an empty **depletion zone** that blocks current.\n\nPush forward with more than **0.7 V** and the zone collapses, so current flows. Push backwards and it gets wider. That\'s a diode!' },
        { type: 'mcq', q: 'Why does a silicon diode need about 0.7 V to conduct?', choices: ['To push through the depletion zone at the PN junction', 'To heat it up', 'To charge it like a capacitor'], answer: 0,
          hint: 'Something has to be overcome.', explain: 'That\'s the energy needed to collapse the depletion zone. It\'s the 0.7 V "toll" from the Diodes unit.' },
        { type: 'mcq', q: 'A [[PN junction]] in reverse…', choices: ['Conducts more', 'Widens its depletion zone and blocks current', 'Turns into a resistor'], answer: 1,
          hint: 'Diodes block backwards.', explain: 'The zone widens and current stops, which is exactly how a diode blocks.' },
      ],
    },
    {
      id: 'a10-5', title: 'Inside a MOSFET', icon: '🔬',
      steps: [
        { type: 'learn', title: 'A switch made of silicon', figure: mosfet,
          body: 'A MOSFET has two N regions in P-type silicon, with a metal **gate** above, separated by a thin layer of glass.\n\nA positive gate pulls electrons up into a thin **channel** that joins source and drain. Current flows. Remove the voltage and the channel vanishes.' },
        { type: 'mcq', q: 'Why does a MOSFET\'s gate draw almost no current?', choices: ['A thin glass layer insulates it from the silicon', 'It\'s made of plastic', 'It\'s always off'], answer: 0,
          hint: 'Look at the diagram.', explain: 'The oxide layer is an insulator, so the gate works purely by its electric field.' },
        { type: 'mcq', q: 'A modern phone chip has about how many transistors?', choices: ['About a thousand', 'About a million', 'Over ten billion'], answer: 2,
          hint: 'Unimaginably many.', explain: 'Over ten billion, each one a tiny MOSFET.' },
      ],
    },
    {
      id: 'a10-6', title: 'How chips are made', icon: '🏭',
      steps: [
        { type: 'learn', title: 'Printing with light', figure: fab,
          body: 'Chips are made on a [[wafer]] of ultra-pure silicon. [[photolithography]] coats it, shines light through a mask to print a pattern, and etches it away. This repeats dozens of times, layer on layer.\n\nFeatures are now just a few **nanometres** wide, smaller than a virus.' },
        { type: 'mcq', q: 'Why are chip factories ("fabs") so clean?', choices: ['A speck of dust is huge compared to the circuit lines', 'For workers\' comfort', 'To keep it cool'], answer: 0,
          hint: 'Think about scale.', explain: 'A dust particle could cover thousands of transistors and ruin the chip.' },
        { type: 'mcq', q: 'Moore\'s law noticed that the number of transistors on a chip…', choices: ['Doubles about every two years', 'Stays the same', 'Halves every year'], answer: 0,
          hint: 'Chips keep getting more powerful.', explain: 'It roughly doubled every two years for decades. That\'s why your phone outclasses old supercomputers.' },
      ],
    },
  ],
};
