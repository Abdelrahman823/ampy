// A10 deep practice: concepts and reviews, inserted at the end of the unit.
import { mcq, num } from './drill.js';

export const glossary = {
  nanometre: 'One billionth of a metre (0.000 000 001 m). Modern transistor features are a few nanometres across.',
  heatsink: 'A finned metal block that pulls heat away from a hot chip into the air.',
};

export const lessons = [
  {
    id: 'a10-9', title: 'Conductors to insulators', icon: '📶',
    steps: [
      { type: 'learn', title: 'A spectrum',
        body: 'Materials sit on a scale:\n\n**Conductors** (copper, silver, aluminium): loose electrons everywhere\n**Semiconductors** (silicon, germanium): a few, and we can control how many\n**Insulators** (glass, rubber, plastic): electrons locked tight\n\nHeat a semiconductor and it conducts **better**. Heat a metal and it conducts slightly **worse**.' },
      mcq('Which is the best conductor?', ['Silver', 'Silicon', 'Glass'], 0, 'A metal.', 'Silver, slightly better than copper. Copper is used because it\'s far cheaper.'),
      mcq('Heating pure silicon makes it conduct…', ['Better', 'Worse', 'The same'], 0, 'Heat frees electrons.', 'Better: heat frees more electrons. That\'s exactly how a thermistor works.'),
      mcq('Why aren\'t chips made of copper?', ['Copper always conducts; we can\'t switch it on and off like silicon', 'Copper is too rare', 'Copper is invisible'], 0, 'Control.', 'A switch needs a material whose conduction can be controlled.'),
    ],
  },
  {
    id: 'a10-10', title: 'Electron flow vs current', icon: '↔️',
    steps: [
      { type: 'learn', title: 'Two directions',
        body: 'Long before electrons were discovered, scientists guessed that current flows from **+ to −**. That\'s **conventional current**, and all the arrows in Ampy use it.\n\nElectrons actually drift the other way, from − to +. Both descriptions give the same answers in circuits.' },
      mcq('Which way do electrons actually move in a wire outside the battery?', ['From − to +', 'From + to −', 'They don\'t move'], 0, 'Electrons are negative.', 'From − to +, opposite to conventional current.'),
      mcq('Does using conventional current give wrong answers?', ['No, the maths works out the same', 'Yes, always'], 0, 'It\'s just a convention.', 'No. It\'s a consistent convention, and every engineer uses it.'),
    ],
  },
  {
    id: 'a10-11', title: 'How small is small?', icon: '🔬',
    steps: [
      { type: 'learn', title: 'The nanometre scale',
        body: 'A human hair is about **80 000 [[nanometre]]s** wide. A modern transistor\'s smallest features are just a few nanometres, smaller than many viruses.\n\nThat\'s how tens of billions of transistors fit on a chip the size of a fingernail.' },
      num('A hair is 80 000 nm wide. How many 5 nm features would fit across it?', 80000 / 5, 'features', '80 000 ÷ 5', '16 000 of them, side by side across one hair.'),
      num('How many nanometres are in 1 millimetre?', 1000000, 'nm', '1 mm = 1000 µm, 1 µm = 1000 nm.', '1 000 000 nm.', 0.0001),
    ],
  },
  {
    id: 'a10-12', title: 'Keeping chips cool', icon: '❄️',
    steps: [
      { type: 'learn', title: 'Heat is the enemy',
        body: 'Every switching transistor wastes a tiny bit of energy. Billions of them add up to watts of heat. Too hot, and a chip slows itself down (throttles) or fails.\n\nCooling uses [[heatsink]]s, fans, heat pipes and thermal paste between the chip and the heatsink.' },
      mcq('Why does a phone slow down when it gets very hot?', ['The chip throttles itself to make less heat', 'The battery is bigger', 'The screen gets dim'], 0, 'Self-protection.', 'It lowers its speed to cut heat and protect itself.'),
      mcq('What is thermal paste for?', ['Filling tiny air gaps between chip and heatsink so heat flows better', 'Gluing the chip down', 'Insulating the chip'], 0, 'Air is a poor conductor of heat.', 'It fills microscopic gaps, because air traps heat.'),
    ],
  },
  {
    id: 'a10-13', title: 'Review: making a diode', icon: '🧠',
    steps: [
      { type: 'learn', title: 'Put it in order', body: 'From sand to a working diode.' },
      mcq('What is chip-grade silicon made from?', ['Purified sand (silicon dioxide)', 'Copper ore', 'Plastic'], 0, 'Very common.', 'Sand, purified to 99.9999999% silicon.'),
      mcq('To make N-type silicon, you add…', ['Phosphorus', 'Boron', 'Copper'], 0, 'An extra electron.', 'Phosphorus, which brings a spare electron.'),
      mcq('A diode is made by joining…', ['P-type and N-type silicon', 'Two N-type pieces', 'Copper and glass'], 0, 'PN junction.', 'P-type and N-type, forming a PN junction.'),
    ],
  },
  {
    id: 'a10-14', title: 'Review: inside the chip', icon: '🧠',
    steps: [
      { type: 'learn', title: 'Silicon sense', body: 'Mixed questions on the Silicon unit.' },
      mcq('In a MOSFET, what makes the channel appear?', ['A voltage on the gate', 'Light', 'Heat'], 0, 'Field effect.', 'A gate voltage pulls charges into a channel.'),
      mcq('Which colour LED has the biggest band gap?', ['Blue', 'Red', 'Infrared'], 0, 'Highest energy light.', 'Blue: the highest-energy photons of the three.'),
      mcq('Why are chips tested on the wafer before packaging?', ['To avoid paying to package bad chips', 'Testing is impossible later', 'For fun'], 0, 'Money.', 'Packaging costs money, so only good chips get it.'),
    ],
  },
];
