import { Asset } from "./asset-bundle.ts";
import { MonoBehaviour } from "./unity-asset/mono-behaviour.ts";
import { BinaryReader } from "./decode.ts";
import { range } from "./util.ts";
import * as fs from "@std/fs";

const steamDir = [
  "C:/Program Files (x86)/Steam/",
  "/mnt/c/Program Files (x86)/Steam/",
].find((p) => fs.existsSync(p));

if (!steamDir) {
  console.log("could not locate Steam installation");
  Deno.exit(1);
}

const assetPath = steamDir +
  "steamapps/common/Katamari Damacy REROLL/katamari_Data/resources.assets";

const f = Deno.readFileSync(assetPath).buffer;

const asset = new Asset(f);

for (const o of asset.objectInfos) {
  if (o.classID === MonoBehaviour.typeID) {
    const mb = new MonoBehaviour(o.getReader(asset.buf), o);
    if (mb.name === "king_text") {
      const r = new BinaryReader(mb.payload);

      const dump: Record<string, string[]> = {};

      for (const _ of range(r.u32())) {
        const textID = r.paddedString();
        r.paddedString(); // audioFilename
        r.paddedString(); // speaker
        const textData = r.array(r.u32(), r.paddedString);
        dump[textID] = textData;
      }

      console.log(JSON.stringify(dump));

      break;
    }
  }
}
