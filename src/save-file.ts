import { BinaryReader } from "./decode.ts";

export class SaveFile {
  moonMaxSize: number;
  kataMaxSize: number;

  /** Individual mission progress. */
  missions: SaveMission[];

  /** Overall game progress. */
  game: Game;

  /** Vibration, per player. */
  isVibration: [boolean, boolean];
  /** Stereo audio. */
  isStereo: boolean;
  /** Music volume. */
  bgmVolume: number;
  /** SFX volume. */
  seVolume: number;
  /** Control scheme, per player. 1 is "simple controls"; 2 is "motion controls". */
  moveType: [number, number];
  /** The save date, represented as YYYY/MM/DD. */
  saveYmd: string;
  /** The save time, represented as HH:MM. */
  saveTime: string;

  /** The same thing! This was the very first thing We ever rolled up! */
  sw1stMakikomi: number;
  /** The same thing! This was the very first thing We ever collided with! */
  sw1stKuzure: number;
  /**
   * Nice roll-up! So aristocratic! We are dazzled!
   * Anything that scampers, let's just roll it up *before* it runs off.
   */
  sw1stMv_mono_success: number;
  /**
   * Noooo, too late! What are you doing!
   * If anything scampers, roll it up *before* it runs off.
   */
  sw1stMv_mono_failure: number;
  /** The same spot! We took Our first break ever on this *very* spot! */
  sw1stRest: number;
  /** The same place! We took Our first swim ever in this *very* place! */
  sw1stWater: number;
  /** O-kay. Time to learn about taking photos. */
  sw1stPhoto: number;

  constructor(buf: ArrayBuffer) {
    const r = new BinaryReader(buf);

    this.moonMaxSize = r.i32();
    this.kataMaxSize = r.i32();
    this.missions = r.array(44, (r) => new SaveMission(r));
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

  timestamp(): Temporal.PlainDateTime | null {
    try {
      // assumes well-formed data (i.e. from the game, rather than garbage)
      const [year, month, day] = this.saveYmd.split("/").map(Number);
      const [hour, minute] = this.saveTime.split(":").map(Number);
      return new Temporal.PlainDateTime(year, month, day, hour, minute);
    } catch {
      return null;
    }
  }
}

export class SaveMission {
  /** Constellation object count (e.g. crabs, swans, crowns) */
  catchCountB: number;
  /** Number of times played */
  clearCount: number;
  /** Seemingly unused, but synced with `gNk_ConstellationMonoLocCount` in the game code. */
  constellationDenominator: number;
  /**
   * The ID of the randomly-generated "star name" associated with the 1st item category.
   * Seen ingame in "View Constellations".
   * Only the first element of this array is ever accessed in the game code.
   * Localized under OT_STR_###.
   */
  catchRanking: [number, number, number];
  /** Number of objects rolled up */
  clearCatchCount: number;
  /** Katamari diameter in millimeters on mission completion */
  clearSize: number;
  /** Time (in frames at 30 FPS) taken to reach goal size */
  clearTime: number;
  /** Time (in frames at 30 FPS) taken to reach goal size on a run fast enough to get the meteor. */
  fallenStarTime: number;
  /**
   * IDs of most-collected categories of items.
   * Localized under OT_CTG_###.
   */
  catchRankCategory: [number, number, number];
  /**
   * Rankings of the elements of catchRankCategory.
   * Usually [0, 1, 2], but may be e.g. [0, 1, 1] if two categories are tied for 2nd.
   * Localized under UI_SYS_###, where the numbers start at 077.
   */
  catchRankName: [number, number, number];
  /**
   * Whether the meteor has been unlocked for this mission.
   * Despite the name, this does not get incremented past 1.
   */
  fallenStarCount: number;
  /**
   * Similar to `catchRanking`, but for the meteor. Seen ingame in "Meteor Control".
   * Localized under OT_STR_###.
   */
  fallenStarName: number;
  /** Unused. */
  fallenStarType: number;
  /**
   * ID of the single constellation object (bear or cow) collected.
   * Meaning of the number, other than as an index into cowbearData, is unknown.
   */
  nameA: number;
  /**
   * Determines the size of the star/constellation shown in various menus.
   * More of an enum than a measurement.
   * Handled a little differently for Luna, Ursa Major, Taurus, and Polaris.
   * Doesn't seem to correspond to any *text* ingame.
   */
  rating: number;
  /** Unused. */
  shine: number;
  /** Unused. Likely originally intended to correspond to `nameA`. */
  sizeA: number;
  /** Whether eternal mode is unlocked for this mission. */
  swAppear: number;
  /** Unused. */
  swClear: number;
  /** Whether this mission's present has been collected. */
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
    this.sizeA = r.i32();
    this.swAppear = r.i32();
    this.swClear = r.i32();
    this.swPresent = r.i32();
  }
}

export class Game {
  /** Unused. */
  lastAccessStarNo: number;
  /** Unused. */
  endingMovieNo: number;
  /** Amount of stardust added to the night sky. Amount added varies by mission. */
  starDustCount: number;
  /** Unused. */
  catchPersonCount: number;
  /** Unused. */
  endingCount: number;
  /** Unused. (See counterpart in parent structure for the actual value.) */
  kataMaxSize: number;
  /** Unused. (See counterpart in parent structure for the actual value.) */
  moonMaxSize: number;
  /** ID of the cosmetic item equipped on the Prince. */
  equipItem: number;
  /** Has every thing in the game been rolled up? */
  getAllItem: number;
  /** Lookup of which presents have been *newly* collected. */
  itemList: number[];

  /** Has every mission been cleared? */
  swAllClear: number;
  /** Has a new star or constellation been added to the sky? */
  swAppearNewConstellation: number;
  /** Has a new present been collected? */
  swAppearNewPresent: number;
  /** Has a new cousin been unlocked? */
  swAppearNewPrince: number;
  /** Lookup of which presents have been collected. */
  swItem: number[];
  /** The big lookup of which things have been rolled up. */
  swMonoCatch: number[];
  /**
   * Element 48: Has the King's dialogue about completing the sky been shown?
   * The preceding 47 elements are unused.
   */
  swMovie: number[];
  /** An unused not-as-big array; purpose unknown. */
  swNameMonoCatch: number[];
  /** Unused. */
  swVisitToMemory: number;
  /** Has the King explained the Home Planet */
  firstOujiStar: number;
  /** Has the King explained Eternal missions? */
  explainedEternal: number;

  /** The three photos currently stored in the camera, pending being moved to the album. */
  newPhoto: Photo[];
  /** The file size of the JPEG-encoded images stored in `newPhoto`. */
  newPhotoSize: number[];
  /** The timestamps of the photos in `newPhoto`, formatted as YYMMDD. */
  newPhotoDate: string[];

  /** The three photos currently stored in the camera, pending being moved to the album. */
  memoryPhoto: Photo[];
  /** The file size of the JPEG-encoded images stored in `memoryPhoto`. */
  memoryPhotoSize: number[];
  /** The timestamps of the photos in `memoryPhoto`, formatted as YYMMDD. */
  memoryPhotoDate: string[];

  /** Lookup of which cousins have been unlocked for multiplayer mode. */
  oujiArray: number[];
  /** Whether the save file is considered valid and can be loaded. */
  canLoadSaveData: number;
  /** Basically unused: only ever gets set to 0, and is never checked other than to write the save file. */
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
    this.newPhotoDate = r.array(3, (r) => r.string(6));
    this.resizePhotoBuffers(this.newPhoto, this.newPhotoSize);

    this.memoryPhoto = r.array(12, (r) => new Photo(r));
    this.memoryPhotoSize = r.array(12, r.i32);
    this.memoryPhotoDate = r.array(12, (r) => r.string(6));
    this.resizePhotoBuffers(this.memoryPhoto, this.memoryPhotoSize);

    this.oujiArray = r.array(24, r.i32);
    this.canLoadSaveData = r.i32();
    this.trialVersion = r.i32();
  }

  private resizePhotoBuffers(photos: Photo[], sizes: number[]): void {
    if (photos.length !== sizes.length) {
      throw new Error("Array length mismatch when slicing photo buffers");
    }

    sizes.forEach((len, i) => {
      photos[i].data = photos[i].data.subarray(0, len);
    });
  }
}

export class Photo {
  data: Uint8Array<ArrayBuffer>;

  constructor(r: BinaryReader) {
    this.data = r.bytes(1024 * 512);
  }

  toJSON(): string {
    return `"<Photo>"`;
  }
}
