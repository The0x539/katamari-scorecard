import { BinaryReader } from "../decode.ts";

export class Thing {
  monoID: string;
  textID1: string;
  textID2: string;
  categoryID: string;
  size: string;
  spotID: string;
  rare: boolean;
  unitID: string;
  animName: string[];
  ignoreHole: boolean;
  sizeID: string;
  niceSetting: number[];
  attachPatch: boolean;

  constructor(r: BinaryReader) {
    this.monoID = r.paddedString();
    this.textID1 = r.paddedString();
    this.textID2 = r.paddedString();
    this.categoryID = r.paddedString();
    this.size = r.paddedString();
    this.spotID = r.paddedString();
    this.rare = r.bool32();
    this.unitID = r.paddedString();
    this.animName = r.array(r.u32(), r.paddedString);
    this.ignoreHole = r.bool32();
    this.sizeID = r.paddedString();
    this.niceSetting = r.array(r.u32(), r.f32);
    this.attachPatch = r.bool32();
  }

  static makeDigest(data: Thing[]): Record<string, ThingDigest> {
    return Object.fromEntries(data.map((t) => [t.monoID, {
      name: t.textID1,
      desc: t.textID2,
      size: t.size,
      spot: t.spotID,
      rare: t.rare,
      cat: t.categoryID,
      s: t.sizeID,
    }]));
  }
}

export type ThingDigest = {
  name: string;
  desc: string;
  size: string;
  spot: string;
  rare: boolean;
  /** Category ID */
  cat: string;
  /** Size category ID */
  s: string;
};
