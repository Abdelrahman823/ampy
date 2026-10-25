// A13 extra depth: communication and computing pioneers.

export const glossary = {
  algorithm: 'A step-by-step recipe for solving a problem. The word comes from the name of Al-Khwarizmi.',
  'frequency hopping': 'Jumping a radio signal between many frequencies in a set pattern so it\'s hard to jam. Wi-Fi and Bluetooth use related ideas.',
};

export const lessons = [
  {
    id: 'a13-6', title: 'Sending messages', icon: '📡',
    steps: [
      { type: 'learn', title: 'Wires, then waves',
        body: '• **1830s–40s**: the electric telegraph and Morse code send messages down wires\n• **1876**: Alexander Graham Bell patents the telephone\n• **1890s**: Guglielmo Marconi sends radio messages through the air\n• **1942**: actress-inventor **Hedy Lamarr** and George Antheil patent [[frequency hopping]], an idea behind today\'s wireless tech' },
      { type: 'mcq', q: 'What did Morse code turn messages into?', choices: ['Short and long pulses of current', 'Pictures', 'Radio music'], answer: 0,
        hint: 'Dots and dashes.', explain: 'Dots and dashes: short and long pulses of current.' },
      { type: 'mcq', q: 'Hedy Lamarr\'s frequency-hopping idea is related to which modern technology?', choices: ['Wi-Fi and Bluetooth', 'Light bulbs', 'Batteries'], answer: 0,
        hint: 'Wireless.', explain: 'Spread-spectrum ideas like hers underpin wireless standards.' },
    ],
  },
  {
    id: 'a13-7', title: 'Thinking machines', icon: '🧠',
    steps: [
      { type: 'learn', title: 'The ideas behind computers',
        body: '• **~820**: **Al-Khwarizmi** in Baghdad writes on algebra. "Algorithm" comes from his name.\n• **1843**: **Ada Lovelace** writes what\'s considered the first computer program\n• **1936**: **Alan Turing** describes a universal computing machine\n• **1937**: **Claude Shannon** shows that Boolean logic (AND, OR, NOT) can be built from switches, exactly what you did in the Logic unit' },
      { type: 'mcq', q: 'The word "algorithm" comes from the name of…', choices: ['Al-Khwarizmi', 'Alan Turing', 'Ada Lovelace'], answer: 0,
        hint: 'A scholar from 9th-century Baghdad.', explain: 'Al-Khwarizmi. His name, in Latin, became "algorithm".' },
      { type: 'mcq', q: 'Claude Shannon\'s 1937 idea connected logic to…', choices: ['Switching circuits', 'Batteries', 'Radio'], answer: 0,
        hint: 'AND = series, OR = parallel.', explain: 'He showed switches can compute logic, which is the foundation of every digital circuit.' },
    ],
  },
];
