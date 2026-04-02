import type {
  KingTextDataDigest,
  KingTextDigest,
} from "./game-data/king-text.ts";
import type { MissionInfoDigest } from "./game-data/mission-info.ts";
import type { ThingDigest } from "./game-data/thing.ts";

import { swap } from "./util.ts";

const jsonURLs = {
  locale: new URL("./game-data/locale.json", import.meta.url),
  dialogue: new URL("./game-data/dialogue.json", import.meta.url),
  things: new URL("./game-data/things.json", import.meta.url),
  missions: new URL("./game-data/missions.json", import.meta.url),
};

async function loadJSON<T = never>(url: URL): Promise<T> {
  const response = await fetch(url);
  const body = await response.json();
  return body;
}

export let missions: MissionInfoDigest[];
export let localization: KingTextDigest;
export let dialogue: KingTextDataDigest;
export let things: Record<string, ThingData>;

export const dataReady = Promise.allSettled([
  loadJSON(jsonURLs.locale).then((l) => localization = l),
  loadJSON(jsonURLs.dialogue).then((d) => dialogue = d),
  loadJSON(jsonURLs.things).then((t) => (hydrateThings(t), things = t)),
  loadJSON<MissionInfoDigest[]>(jsonURLs.missions)
    .then((m) => (swap(m, 3, 4), missions = m)),
]);

export type ThingData = ThingDigest & {
  id: string;
  idx: number;
};

function hydrateThings(
  things: Record<string, ThingData>,
): Record<string, ThingData> {
  let idx = 0;
  for (const id in things) {
    things[id].id = id;
    things[id].idx = idx++;
  }
  return things;
}

export function localize(key: string): string;
export function localize(category: string, id: number): string;

export function localize(category: string, id?: number): string {
  if (id !== undefined) {
    let width = 3;
    if (category === "OT_OBJ" || category === "OT_CMM") {
      width = 4;
    }
    const key = category + "_" + id.toString().padStart(width, "0");
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
    readonly idx: number,
  ) {}
}

export const cowbearData = new Map([
  [856, new CowbearData("MILKPACK01_C", 10, 110, 0)],
  [486, new CowbearData("COW01_D", 11, 111, 1)],
  [1358, new CowbearData("COWKANBAN_D", 12, 111, 2)],
  [958, new CowbearData("PILON10_D", 13, 112, 3)],
  [646, new CowbearData("ZIHANKI03_E", 16, 112, 4)],
  [487, new CowbearData("COW02_E", 14, 112, 5)],
  [488, new CowbearData("COW03_E", 15, 112, 6)],
  [731, new CowbearData("MANANIMAL03_D", 17, 112, 7)],
  [882, new CowbearData("PARASOL03_E", 18, 112, 8)],
  [489, new CowbearData("COW04_E", 19, 113, 9)],
  [490, new CowbearData("COW05_F", 20, 114, 10)],

  [1242, new CowbearData("TEDDYBEAR01_C", 1, 110, 0)],
  [468, new CowbearData("BEAR01_B", 21, 110, 1)],
  [877, new CowbearData("WOODYBEAR_C", 2, 110, 2)],
  [469, new CowbearData("BEAR02_C", 3, 111, 3)],
  [1115, new CowbearData("MOUNTSIGN02_D", 4, 111, 4)],
  [1002, new CowbearData("STATUE09_E", 5, 111, 5)],
  [730, new CowbearData("MANANIMAL02_D", 6, 112, 6)],
  [470, new CowbearData("BEAR03_D", 7, 112, 7)],
  [471, new CowbearData("BEAR04_E", 8, 113, 8)],
  [472, new CowbearData("BEAR05_F", 9, 114, 9)],
]);
