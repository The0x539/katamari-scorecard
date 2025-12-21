import type { KingTextDigest } from "./game-data/king-text.ts";
import type { MissionInfoDigest } from "./game-data/mission-info.ts";
import type { ThingDigest } from "./game-data/thing.ts";

import rawLocalization from "./game-data/locale.json" with { type: "json" };
import rawMissions from "./game-data/missions.json" with { type: "json" };
import rawThings from "./game-data/things.json" with { type: "json" };

import { swap } from "./util.ts";
swap(rawMissions, 3, 4);

export type ThingData = ThingDigest & {
  id: string;
  idx: number;
};

const localization: KingTextDigest = rawLocalization;
export const missions: MissionInfoDigest[] = rawMissions;
export const things: Record<string, ThingData> = Object.fromEntries(
  Object.entries(rawThings).map(([id, thing], idx) => {
    return [id, { id, idx, ...thing }];
  }),
);

export function localize(key: string): string;
export function localize(category: string, id: number): string;

export function localize(category: string, id?: number): string {
  if (id !== undefined) {
    const key = category + "_" + id.toString().padStart(3, "0");
    return localize(key);
  }

  const key = category;
  return localization[key]?.[1];
}

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
