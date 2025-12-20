export const missionNames = [
  0,
  6, // Make a Star 1
  7, // Make a Star 2
  11, // Make a Star 4 (yes these are out of order)
  9, // Make a Star 3
  12, // Make a Star 5
  13, // Make a Star 6
  14, // Make a Star 7
  15, // Make a Star 8
  16, // Make a Star 9
  17, // Make the Moon

  18, // Make Cancer
  19, // Make Cygnus
  0,
  20, // Make Corona Borealis (out of order)
  21, // Make Pisces
  22, // Make Virgo
  23, // Make Ursa Major
  27, // Make Gemini
  28, // Make Taurus
  0,
  29, // Make the North Star
  30, // Eternal 1
  31, // Eternal 2
  32, // Eternal 3
];

export const constellationMaxima = [
  null,
  null, // Make a Star 1
  null, // Make a Star 2
  null, // Make a Star 4 (yes these are out of order)
  null, // Make a Star 3
  null, // Make a Star 5
  null, // Make a Star 6
  null, // Make a Star 7
  null, // Make a Star 8
  null, // Make a Star 9
  null, // Make the Moon

  133, // Make Cancer
  70, // Make Cygnus
  null,
  107, // Make Corona Borealis (out of order)
  174, // Make Pisces
  199, // Make Virgo
  null, // Make Ursa Major
  108, // Make Gemini
  null, // Make Taurus
];

export const symbols = [
  null,
  null, // 1
  null, // 2
  null, // 3
  null, // 4
  null, // 5
  null, // 6
  null, // 7
  null, // 8
  null, // 9
  "🌕", // Make the Moon

  "♋", // Make Cancer
  "🦢", // Make Cygnus
  "0",
  "👑", // Make Corona Borealis (out of order)
  "♓", // Make Pisces
  "♍", // Make Virgo
  "🐻", // Make Ursa Major
  "♊", // Make Gemini
  "♉", // Make Taurus
  "0",
  "🧭", // Make the North Star
];

export class CowbearData {
  constructor(
    readonly monoID: string,
    readonly resultName: number,
    readonly resultSize: number,
  ) {}
}

export const cowbearData = new Map([
  [856, new CowbearData("MILKPACK01_C", 10, 110)],
  [486, new CowbearData("COW01_D", 11, 111)],
  [1358, new CowbearData("COWKANBAN_D", 12, 111)],
  [958, new CowbearData("PILON10_D", 13, 112)],
  [487, new CowbearData("COW02_E", 14, 112)],
  [488, new CowbearData("COW03_E", 15, 112)],
  [646, new CowbearData("ZIHANKI03_E", 16, 112)],
  [731, new CowbearData("MANANIMAL03_D", 17, 112)],
  [882, new CowbearData("PARASOL03_E", 18, 112)],
  [489, new CowbearData("COW04_E", 19, 113)],
  [490, new CowbearData("COW05_F", 20, 114)],

  [1242, new CowbearData("TEDDYBEAR01_C", 1, 110)],
  [468, new CowbearData("BEAR01_B", 21, 110)],
  [469, new CowbearData("BEAR02_C", 3, 111)],
  [470, new CowbearData("BEAR03_D", 7, 112)],
  [471, new CowbearData("BEAR04_E", 8, 113)],
  [472, new CowbearData("BEAR05_F", 9, 114)],
  [730, new CowbearData("MANANIMAL02_D", 6, 112)],
  [1002, new CowbearData("STATUE09_E", 5, 111)],
  [877, new CowbearData("WOODYBEAR_C", 2, 110)],
  [1115, new CowbearData("MOUNTSIGN02_D", 4, 111)],
]);
