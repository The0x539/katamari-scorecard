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
    const digest = Object.fromEntries(
      data.map((kt) => [kt.textID, kt.textData]),
    );

    const replace = (key: string, oldVal: string, newVal: string) => {
      if (digest[key][1] !== oldVal) {
        throw new Error(`${key} = ${digest[key][1]} (expected ${oldVal})`);
      }
      digest[key][1] = newVal;
    };

    replace("OT_CTG_012", "Stationary", "Stationery");
    // it's MY tool and I get to make the rules
    replace("UI_ERT_029", "Make the North Star", "Make Polaris");

    return digest;
  }
}

export type KingTextDigest = Record<string, string[]>;
