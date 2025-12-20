import { BinaryReader } from "./decode.ts";

export class SaveFile {
  moonMaxSize: number;
  kataMaxSize: number;

  missions: Mission[];

  game: Game;

  isVibration: [boolean, boolean];
  isStereo: boolean;
  bgmVolume: number;
  seVolume: number;
  moveType: [number, number];
  saveYmd: string;
  saveTime: string;

  sw1stMakikomi: number;
  sw1stKuzure: number;
  sw1stMv_mono_success: number;
  sw1stMv_mono_failure: number;
  sw1stRest: number;
  sw1stWater: number;
  sw1stPhoto: number;

  constructor(buf: ArrayBufferLike) {
    const r = new BinaryReader(buf);

    this.moonMaxSize = r.i32();
    this.kataMaxSize = r.i32();
    this.missions = r.array(44, (r) => new Mission(r));
    this.game = new Game(r);
    this.isVibration = r.pair(r.bool);
    this.isStereo = r.bool();
    this.bgmVolume = r.f32();
    this.seVolume = r.f32();
    this.moveType = r.pair(r.i32);
    this.saveYmd = r.string(10);
    this.saveTime = r.string(5);

    this.sw1stMakikomi = r.i32();
    this.sw1stKuzure = r.i32();
    this.sw1stMv_mono_success = r.i32();
    this.sw1stMv_mono_failure = r.i32();
    this.sw1stRest = r.i32();
    this.sw1stWater = r.i32();
    this.sw1stPhoto = r.i32();
  }
}

export class Mission {
  catchCountB: number;
  clearCount: number;
  constellationDenominator: number;
  catchRanking: [number, number, number];
  clearCatchCount: number;
  clearSize: number;
  clearTime: number;
  fallenStarTime: number;
  catchRankCategory: [number, number, number];
  catchRankName: [number, number, number];
  fallenStarCount: number;
  fallenStarName: number;
  fallenStarType: number;
  nameA: number;
  rating: number;
  shine: number;
  size: number;
  swAppear: number;
  swClear: number;
  swPresent: number;

  constructor(r: BinaryReader) {
    this.catchCountB = r.i32();
    this.clearCount = r.i32();
    this.constellationDenominator = r.i32();
    this.catchRanking = r.triple(r.i32);
    this.clearCatchCount = r.i32();
    this.clearSize = r.i32();
    this.clearTime = r.i32();
    this.fallenStarTime = r.i32();
    this.catchRankCategory = r.triple(r.i32);
    this.catchRankName = r.triple(r.i32);
    this.fallenStarCount = r.i32();
    this.fallenStarName = r.i32();
    this.fallenStarType = r.i32();
    this.nameA = r.i32();
    this.rating = r.i32();
    this.shine = r.i32();
    this.size = r.i32();
    this.swAppear = r.i32();
    this.swClear = r.i32();
    this.swPresent = r.i32();
  }
}

export class Game {
  lastAccessStarNo: number;
  endingMovieNo: number;
  starDustCount: number;
  catchPersonCount: number;
  endingCount: number;
  kataMaxSize: number;
  moonMaxSize: number;
  equipItem: number;
  getAllItem: number;
  itemList: number[];

  swAllClear: number;
  swAppearNewConstellation: number;
  swAppearNewPresent: number;
  swAppearNewPrince: number;
  swItem: number[];
  swMonoCatch: number[];
  swMovie: number[];
  swNameMonoCatch: number[];
  swVisitToMemory: number;

  firstOujiStar: number;
  explainedEternal: number;

  newPhoto: Photo[];
  newPhotoSize: number[];
  newPhotoDate: Uint8Array[];

  memoryPhoto: Photo[];
  memoryPhotoSize: number[];
  memoryPhotoDate: Uint8Array[];

  oujiArray: number[];
  canLoadSaveData: number;
  trialVersion: number;

  constructor(r: BinaryReader) {
    this.lastAccessStarNo = r.i32();
    this.endingMovieNo = r.i32();
    this.starDustCount = r.i32();
    this.catchPersonCount = r.i32();
    this.endingCount = r.i32();
    this.kataMaxSize = r.i32();
    this.moonMaxSize = r.i32();
    this.equipItem = r.i32();
    this.getAllItem = r.i32();
    this.itemList = r.array(32, r.i32);

    this.swAllClear = r.i32();
    this.swAppearNewConstellation = r.i32();
    this.swAppearNewPresent = r.i32();
    this.swAppearNewPrince = r.i32();
    this.swItem = r.array(32, r.i32);
    this.swMonoCatch = r.array(2048, r.i32);
    this.swMovie = r.array(64, r.i32);
    this.swNameMonoCatch = r.array(256, r.i32);
    this.swVisitToMemory = r.i32();

    this.firstOujiStar = r.i32();
    this.explainedEternal = r.i32();

    this.newPhoto = r.array(3, (r) => new Photo(r));
    this.newPhotoSize = r.array(3, r.i32);
    this.newPhotoDate = r.array(3, (r) => r.bytes(6));

    this.memoryPhoto = r.array(12, (r) => new Photo(r));
    this.memoryPhotoSize = r.array(12, r.i32);
    this.memoryPhotoDate = r.array(12, (r) => r.bytes(6));

    this.oujiArray = r.array(24, r.i32);
    this.canLoadSaveData = r.i32();
    this.trialVersion = r.i32();
  }
}

export class Photo {
  data: Uint8Array;

  constructor(r: BinaryReader) {
    this.data = r.bytes(1024 * 512);
  }

  toJSON(): string {
    return `"<Photo>"`;
  }
}
