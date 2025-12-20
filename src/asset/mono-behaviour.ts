import { ObjectInfo } from "../asset-bundle.ts";
import { BinaryReader } from "../decode.ts";
import { range } from "../util.ts";
import { AssetBase, AssetType, PPtr } from "./index.ts";

export class MonoBehaviour extends AssetBase {
  static readonly typeID = AssetType.MonoBehaviour;
  readonly typeID = AssetType.MonoBehaviour;

  gameObject: PPtr;
  enabled: boolean;
  script: PPtr;
  name: string;

  constructor(r: BinaryReader, info: ObjectInfo) {
    super();

    this.gameObject = new PPtr(r, info.version);
    this.enabled = r.bool32();
    this.script = new PPtr(r, info.version);
    this.name = r.paddedString();

    if (!this.name.includes("king")) return;

    const m: Record<string, string[]> = {};

    for (const _ of range(r.u32())) {
      const textID = r.paddedString();
      const _audioFilename = r.paddedString();
      const _speaker = r.paddedString();
      const textData = r.array(r.u32(), r.paddedString);
      m[textID] = textData;
    }

    console.log(JSON.stringify(m));
  }
}
