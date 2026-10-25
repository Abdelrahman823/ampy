// A13 · History: the people and inventions behind electronics.

export const glossary = {
  'vacuum tube': 'A glass bulb with no air inside that could switch and amplify current. Used in early radios and computers before transistors.',
  'integrated circuit': 'Many transistors and parts made together on one small piece of silicon: a chip.',
  microprocessor: 'A whole CPU on a single chip.',
  induction: 'Making electricity by moving a magnet near a coil (or changing a magnetic field). Generators and transformers use it.',
};

export default {
  id: 'a13',
  title: 'History',
  subtitle: 'From amber sparks to microchips',
  lessons: [
    {
      id: 'a13-1', title: 'First sparks', icon: '📜',
      steps: [
        { type: 'learn', title: 'Curiosity first',
          body: 'Around 600 BCE, Greeks noticed rubbed amber attracts dust. Our word "electron" comes from the Greek for amber.\n\nIn the 1000s, **Ibn al-Haytham** in Cairo insisted on testing ideas with careful experiments, the scientific method behind all of this. In 1206, **Al-Jazari** described ingenious machines with gears, valves and automatic controls.\n\nIn **1800**, Alessandro **Volta** stacked zinc, copper and salty cloth: the first battery.' },
        { type: 'mcq', q: 'What did Volta invent in 1800?', choices: ['The light bulb', 'The first battery', 'The transistor'], answer: 1,
          hint: 'The "voltaic pile".', explain: 'The first battery, which gave the first steady current. The volt is named after him.' },
        { type: 'mcq', q: 'Why is Ibn al-Haytham important to every scientist and engineer?', choices: ['He insisted ideas be tested by experiment', 'He invented the battery', 'He built the first computer'], answer: 0,
          hint: 'How we know things are true.', explain: 'He championed testing ideas with experiments, which is exactly what you\'ve been doing on every bench.' },
      ],
    },
    {
      id: 'a13-2', title: 'Taming the force', icon: '🧲',
      steps: [
        { type: 'learn', title: '1820–1865',
          body: '• **1820, Ørsted**: a current makes a compass needle move, so electricity and magnetism are linked\n• **1827, Ohm**: publishes I = V ÷ R\n• **1831, Faraday**: moving a magnet in a coil makes current: [[induction]], the idea behind every generator and transformer\n• **1860s, Maxwell**: equations uniting electricity, magnetism and light' },
        { type: 'mcq', q: 'Faraday\'s discovery of induction made which of these possible?', choices: ['Generators and transformers', 'Batteries', 'Microchips'], answer: 0,
          hint: 'Magnet + coil = current.', explain: 'Power stations still generate electricity by spinning magnets near coils.' },
        { type: 'mcq', q: 'Who gave his name to the unit of resistance?', choices: ['Volta', 'Ohm', 'Faraday'], answer: 1,
          hint: 'Ω', explain: 'Georg Ohm. 1 Ω = 1 V per amp.' },
      ],
    },
    {
      id: 'a13-3', title: 'The war of the currents', icon: '⚔️',
      steps: [
        { type: 'learn', title: 'AC vs DC, 1880s–1890s',
          body: '**Edison** built DC power systems, but DC couldn\'t easily change voltage, so power stations had to sit close to customers.\n\n**Tesla** and **Westinghouse** pushed AC. With transformers, it could travel far at high voltage and be stepped down safely.\n\nAC lit the 1893 Chicago World\'s Fair, then powered cities from Niagara Falls. AC won.' },
        { type: 'mcq', q: 'What gave AC its big advantage?', choices: ['Transformers could step its voltage up and down', 'It was safer to touch', 'Batteries make AC'], answer: 0,
          hint: 'Think back to the AC unit.', explain: 'Transformers made long-distance, high-voltage transmission possible.' },
        { type: 'mcq', q: 'Is DC still used today?', choices: ['No, never', 'Yes: in every battery, phone and chip, and even some long-distance lines'], answer: 1,
          hint: 'What does your phone run on?', explain: 'All electronics run on DC inside. Modern converters even send DC long distances.' },
      ],
    },
    {
      id: 'a13-4', title: 'Tubes to transistors', icon: '💡',
      steps: [
        { type: 'learn', title: '1904–1947',
          body: 'The first electronic switches were [[vacuum tube]]s: hot, fragile and power-hungry. **ENIAC** (1945) used about 17 000 of them and filled a room.\n\nIn **1947**, **Bardeen, Brattain and Shockley** at Bell Labs built the first **transistor**. It was small, cool and reliable, and it changed the world. They won the 1956 Nobel Prize.' },
        { type: 'mcq', q: 'What replaced vacuum tubes?', choices: ['Transistors', 'Fuses', 'Capacitors'], answer: 0,
          hint: '1947, Bell Labs.', explain: 'Transistors did the same job, far smaller and cooler.' },
        { type: 'mcq', q: 'Why were tube computers unreliable?', choices: ['Thousands of hot tubes meant one burned out often', 'They used AC', 'They had no memory'], answer: 0,
          hint: 'Like light bulbs.', explain: 'With thousands of glowing tubes, failures were constant.' },
      ],
    },
    {
      id: 'a13-5', title: 'The chip age', icon: '🚀',
      steps: [
        { type: 'learn', title: '1958 to today',
          body: '• **1958–59**: Jack **Kilby** and Robert **Noyce** each invent the [[integrated circuit]]: many transistors on one chip\n• **1971**: the Intel 4004, the first commercial [[microprocessor]], with about 2 300 transistors\n• **Today**: chips with tens of billions of transistors, made in nanometre-scale factories\n\nAnd you now understand every layer, from the electron up.' },
        { type: 'mcq', q: 'What was special about the Intel 4004 (1971)?', choices: ['A whole CPU on one chip', 'The first transistor', 'The first battery'], answer: 0,
          hint: 'Micro + processor.', explain: 'It put a complete CPU on a single chip, the first commercial microprocessor.' },
        { type: 'mcq', q: 'Put these in order: transistor, integrated circuit, vacuum tube.', choices: ['Tube → transistor → IC', 'Transistor → tube → IC', 'IC → tube → transistor'], answer: 0,
          hint: '1904, 1947, 1958.', explain: 'Tubes (1904), transistors (1947), then integrated circuits (1958).' },
      ],
    },
  ],
};
