import { Asset } from "./asset-bundle.ts";
import { MonoBehaviour } from "./unity-asset/mono-behaviour.ts";
import { BinaryReader } from "./decode.ts";
import * as fs from "@std/fs";
import { MissionInfo } from "./game-data/mission-info.ts";
import { Thing } from "./game-data/thing.ts";
import { KingText } from "./game-data/king-text.ts";

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

const resourceName = Deno.args[0];

const GameDataType = {
  "king_text": KingText,
  "mission": MissionInfo,
  "mononame": Thing,
}[resourceName];

if (!GameDataType) {
  Deno.exit(0);
}

const resource = asset.objectInfos
  .filter((o) => o.classID === MonoBehaviour.typeID)
  .map((oi) => new MonoBehaviour(oi.getReader(asset.buf), oi))
  .find((mb) => mb.name === resourceName);

if (!resource) {
  console.log(`could not find '${resourceName}' in '${assetPath}'`);
  Deno.exit(1);
}

const r = new BinaryReader(resource.payload);
const data = r.array(r.u32(), (r) => new GameDataType(r));
const digest = GameDataType.makeDigest(data as never[]);
console.log(JSON.stringify(digest));
