import { BinaryReader } from "../decode.ts";

export class KingText {
  textID: string;
  audioFilename: string;
  speaker: string;
  textData: string[];

  constructor(r: BinaryReader) {
    this.textID = r.paddedString();
    this.audioFilename = r.paddedString();
    this.speaker = r.paddedString();
    this.textData = r.array(r.u32(), r.paddedString);
  }

  static makeDigest(data: KingText[]): KingTextDigest {
    return Object.fromEntries(data.map((kt) => [kt.textID, kt.textData]));
  }
}

export type KingTextDigest = Record<string, string[]>;
