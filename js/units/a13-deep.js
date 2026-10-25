// A13 deep: more history lessons, appended to the unit.
import { mcq } from './drill.js';

export const glossary = {
  'fibre optics': 'Thin glass strands that carry data as pulses of light, which is the backbone of the internet.',
  compiler: 'A program that translates human-readable code into machine code.',
};

export const lessons = [
  {
    id: 'a13-8', title: 'The internet', icon: '🌐',
    steps: [
      { type: 'learn', title: 'Computers talking',
        body: '• **1969**: ARPANET links its first computers in the USA, the ancestor of the internet\n• **1970s–80s**: [[fibre optics]] start carrying data as light through glass\n• **1989–91**: Tim Berners-Lee creates the World Wide Web\n\nToday undersea fibre cables carry most international internet traffic.' },
      mcq('How does fibre optic cable carry data?', ['As pulses of light in glass', 'As sound waves', 'As water pressure'], 0, 'Fibre optics.', 'Light pulses through very pure glass.'),
      mcq('The World Wide Web and the internet are…', ['Different: the web runs on top of the internet', 'Exactly the same thing'], 0, 'One is a network, one is a service.', 'The internet is the network. The web is one service that uses it.'),
    ],
  },
  {
    id: 'a13-9', title: 'Phones in pockets', icon: '📱',
    steps: [
      { type: 'learn', title: 'From brick to smartphone',
        body: '• **1973**: Martin Cooper of Motorola makes the first handheld mobile phone call\n• **1990s**: digital mobile networks and text messages spread\n• **2007** onwards: touchscreen smartphones put a computer, camera and internet in every pocket\n\nA modern phone holds billions of transistors.' },
      mcq('Roughly when was the first handheld mobile phone call?', ['1973', '1923', '2007'], 0, 'Martin Cooper.', '1973.'),
      mcq('What made smartphones possible?', ['Tiny, powerful, low-power chips plus good batteries', 'Bigger antennas', 'Vacuum tubes'], 0, 'Moore\'s law.', 'Decades of shrinking transistors and better batteries.'),
    ],
  },
  {
    id: 'a13-10', title: 'Electronics in space', icon: '🛰️',
    steps: [
      { type: 'learn', title: 'Reaching the Moon',
        body: 'The **Apollo Guidance Computer** (1960s) was one of the first computers built from integrated circuits. It helped land astronauts on the Moon in 1969, with far less computing power than a modern calculator.\n\nToday satellites provide GPS, weather data and communications.' },
      mcq('The Apollo Guidance Computer was notable for using…', ['Early integrated circuits', 'Vacuum tubes only', 'Smartphones'], 0, 'New technology then.', 'Early ICs, which helped push the chip industry forward.'),
      mcq('Which everyday service depends on satellites?', ['GPS navigation', 'A light switch', 'A battery'], 0, 'Your map app.', 'GPS satellites broadcast precise timing signals that your phone uses.'),
    ],
  },
  {
    id: 'a13-11', title: 'Pioneers of computing', icon: '👩‍💻',
    steps: [
      { type: 'learn', title: 'People who changed computing',
        body: '• **Grace Hopper** built one of the first [[compiler]]s (1952), so people could program in words instead of raw numbers\n• **Katherine Johnson** calculated spaceflight trajectories for NASA, checking the early electronic computers\' results by hand\n• Engineers and scientists from every part of the world built the technology we use today' },
      mcq('What does a compiler do?', ['Translates code people write into machine code', 'Cools the CPU', 'Stores files'], 0, 'Translation.', 'It turns human-friendly code into the bytes the CPU runs.'),
      mcq('Katherine Johnson is known for…', ['Calculating spaceflight trajectories for NASA', 'Inventing the battery', 'Building the first radio'], 0, 'Space maths.', 'Her trajectory calculations were trusted for crewed missions.'),
    ],
  },
  {
    id: 'a13-12', title: 'Review: timeline', icon: '🧠',
    steps: [
      { type: 'learn', title: 'Put history in order', body: 'Which came first?' },
      mcq('Which came first?', ['Volta\'s battery', 'The transistor', 'The internet'], 0, '1800.', 'Volta\'s battery (1800).'),
      mcq('Which came first?', ['Faraday\'s induction', 'The microprocessor', 'Smartphones'], 0, '1831.', 'Faraday (1831).'),
      mcq('Which came last?', ['Smartphones', 'The transistor', 'The integrated circuit'], 0, '2000s.', 'Smartphones, in the 2000s.'),
      mcq('Al-Khwarizmi lived about…', ['1200 years ago', '100 years ago', '20 years ago'], 0, 'Around 820 CE.', 'About 1200 years ago in Baghdad.'),
    ],
  },
];
