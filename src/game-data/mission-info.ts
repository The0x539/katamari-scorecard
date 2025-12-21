import { BinaryReader } from "../decode.ts";

export class MissionInfo {
  missionID: number;
  stageID: number;
  areaID: string;
  areaNum: number;
  startStage: number;
  startDiameter: number;
  clearDiameter: string;
  maxDiameter: number;
  gameTime: number;
  clearType: string;
  item: number;
  clearCheck: number;
  startMessage: string;
  finishMessage: string;
  underMessage: string[];
  monoSolo: string;
  monoGroup: string;
  areaChangeMsgs: string[];
  nextAreaMsgs: string[];
  arrive: string;
  arriveNew: string;
  meteor: number;
  rating_diameter: number[];
  areaChange: number[];
  propSceneName: string[];
  selKadai: string;
  selKadaiPre: string;
  result: string[];
  propCatchA: string[];
  propCatchB: string[];
  focusDistance: number[];
  aperture: number[];
  focalLength: number[];
  cameraFov: number[];
  cameraFar: number[];
  cameraNear: number[];
  ambientOcclusion: boolean[];
  ambientIntensity: number[];
  ambientRadius: number[];
  combineName: string;
  warpPos: number[];

  constructor(r: BinaryReader) {
    const s = () => r.paddedString(); // "string"
    const n = () => +s(); // "number"
    const v = () => r.array(r.u32(), r.f32); // "vector"

    this.missionID = n();
    this.stageID = n();
    this.areaID = s();
    this.areaNum = n();
    this.startStage = n();
    this.startDiameter = n();
    this.clearDiameter = s();
    this.maxDiameter = n();
    this.gameTime = n();
    this.clearType = s();
    this.item = n();
    this.clearCheck = n();
    this.startMessage = s();
    this.finishMessage = s();
    this.underMessage = r.array(5, s);
    this.monoSolo = s();
    this.monoGroup = s();
    this.areaChangeMsgs = r.array(4, s);
    this.nextAreaMsgs = r.array(4, s);
    this.arrive = s();
    this.arriveNew = s();
    this.meteor = n();
    this.rating_diameter = v();
    this.areaChange = v();
    this.propSceneName = r.array(r.u32(), s);
    this.selKadai = s();
    this.selKadaiPre = s();
    this.result = r.array(r.u32(), s);
    this.propCatchA = r.array(r.u32(), s);
    this.propCatchB = r.array(r.u32(), s);
    this.focusDistance = v();
    this.aperture = v();
    this.focalLength = v();
    this.cameraFov = v();
    this.cameraFar = v();
    this.cameraNear = v();
    this.ambientOcclusion = r.array(r.u32(), r.bool);
    r.align(4);
    this.ambientIntensity = v();
    this.ambientRadius = v();
    this.combineName = s();
    this.warpPos = v();
  }

  static makeDigest(data: MissionInfo[]): MissionInfoDigest[] {
    return data.map((m) => ({
      time: m.gameTime,
      meteor: m.meteor,
    }));
  }
}

export type MissionInfoDigest = {
  time: number;
  meteor: number;
};
