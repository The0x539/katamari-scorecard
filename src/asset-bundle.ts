import { BinaryReader } from "./decode.ts";
import { range } from "./util.ts";

export class AssetHeader {
  metadataSize: number;
  fileSize: number;
  version: number;
  dataOffset: number;

  constructor(r: BinaryReader) {
    r.littleEndian = false;
    this.metadataSize = r.u32();
    this.fileSize = r.u32();
    this.version = r.u32();
    this.dataOffset = r.u32();
  }
}

export class Asset {
  header: AssetHeader;
  bigEndian: boolean;
  unityVersion: string = "";
  targetPlatform: number = 0;
  enableTypeTree: boolean = false;
  types: SerializedType[] = [];
  typeMap: Map<number, SerializedType> = new Map();
  enableBigID: boolean = false;
  objectInfos: ObjectInfo[] = [];

  constructor(readonly buf: ArrayBuffer) {
    const r = new BinaryReader(buf);

    const h = this.header = new AssetHeader(r);

    if (h.version >= 9) {
      this.bigEndian = r.bool32(); // looks to be little-endian for this game
    } else {
      r.seek(h.fileSize - h.metadataSize);
      this.bigEndian = r.bool();
    }

    if (h.version >= 22) {
      h.metadataSize = r.u32();
      h.fileSize = r.u64();
      h.dataOffset = r.u64();
      r.skip(8);
    }
    r.littleEndian = !this.bigEndian;

    if (h.version >= 7) this.unityVersion = r.string();
    if (h.version >= 8) this.targetPlatform = r.i32();
    if (h.version >= 13) this.enableTypeTree = r.bool();

    this.types = r.array(
      r.i32(),
      (r) => new SerializedType(r, h.version, this.enableTypeTree),
    );
    for (const ty of this.types) this.typeMap.set(ty.classID, ty);

    if (h.version >= 7 && h.version < 14) this.enableBigID = r.i32() != 0;

    this.objectInfos = r.array(r.u32(), (r) => new ObjectInfo(r, this));
  }
}

export class SerializedType {
  classID: number;
  isStrippedType: boolean = false;
  scriptTypeIndex: number | null = null;
  scriptID: Uint8Array = new Uint8Array();
  oldTypeHash: Uint8Array = new Uint8Array();

  typeTree: {
    tree: TypeTree;
    deps: number[];
  } | null = null;

  constructor(
    r: BinaryReader,
    version: number,
    enableTypeTree: boolean,
  ) {
    this.classID = r.i32();

    if (version >= 16) this.isStrippedType = r.bool();
    if (version >= 17) this.scriptTypeIndex = r.i16();

    if (version >= 13) {
      const a = version < 16 && this.classID < 0;
      const b = version >= 16 && this.classID === 114;
      if (a || b) {
        this.scriptID = r.bytes(16);
      }
      this.oldTypeHash = r.bytes(16);
    }

    if (enableTypeTree) {
      if (!(version >= 12 || version === 10)) {
        throw new Error(`Unsupported asset version: ${version}`);
      }

      this.typeTree = { tree: new TypeTree(r, version), deps: [] };

      if (version >= 21) {
        this.typeTree.deps = r.array(r.i32(), r.i32);
      }
    }
  }
}

export class TypeTree {
  nodes: TypeTreeNode[];
  stringBuffer = new ArrayBuffer(0);

  constructor(r: BinaryReader, version: number) {
    const nodeCount = r.i32();
    const stringBufferSize = r.i32();

    this.nodes = [];

    for (const _ of range(nodeCount)) {
      const node = new TypeTreeNode(r, version);
      this.nodes.push(node);
    }

    const stringBuffer = r.bytes(stringBufferSize);
    function readString(offset: number): string {
      if (offset >= 0) {
        const end = stringBuffer.indexOf(0, offset);
        const bytes = stringBuffer.slice(offset, end);
        return new TextDecoder().decode(bytes);
      } else {
        return "todo";
      }
    }

    for (const node of this.nodes) {
      node.type = readString(node.typeStrOffset);
      node.name = readString(node.nameStrOffset);
    }
  }
}

export class TypeTreeNode {
  version: number;
  level: number;
  typeFlag: number;
  typeStrOffset: number;
  nameStrOffset: number;
  size: number;
  index: number;
  metaFlag: number;
  type: string;
  name: string;
  refTypeHash: bigint | null = null;

  constructor(r: BinaryReader, version: number) {
    this.version = r.u16();
    this.level = r.u8();
    this.typeFlag = r.u8();
    this.typeStrOffset = r.u32();
    this.nameStrOffset = r.u32();
    this.size = r.i32();
    this.index = r.i32();
    this.metaFlag = r.i32();
    this.type = "";
    this.name = "";

    if (version >= 19) this.refTypeHash = r.big_u64();
  }
}

export class ObjectInfo {
  pathID: bigint;
  bytesStart: number;
  bytesSize: number;
  typeID: number;
  classID: number;
  serializedType: SerializedType;
  isDestroyed: number | null = null;
  stripped: number | null = null;

  version: number; // not stored in the serialization, just here for convenience

  constructor(r: BinaryReader, asset: Asset) {
    const version = this.version = asset.header.version;

    if (asset.enableBigID) {
      this.pathID = r.big_i64();
    } else if (version < 14) {
      this.pathID = BigInt(r.i32());
    } else {
      r.align(4);
      this.pathID = r.big_i64();
    }

    this.bytesStart = version >= 22 ? r.u64() : r.u32();
    this.bytesStart += asset.header.dataOffset;
    this.bytesSize = r.u32();
    this.typeID = r.i32();

    if (version < 16) {
      this.classID = r.u16();
      this.serializedType = asset.typeMap.get(this.typeID)!;
    } else {
      this.classID = asset.types[this.typeID].classID;
      this.serializedType = asset.types[this.typeID];
    }

    if (version < 11) this.isDestroyed = r.u16();

    if (version >= 11 && version < 17) {
      const scriptTypeIndex = r.u16();
      if (this.serializedType) {
        this.serializedType.scriptTypeIndex = scriptTypeIndex;
      }
    }

    if (version === 15 || version === 16) this.stripped = r.u8();
  }

  getReader<T extends ArrayBufferLike>(buf: T): BinaryReader<T> {
    const start = this.bytesStart;
    const end = start + this.bytesSize;
    const chunk = buf.slice(start, end) as T;
    console.assert(chunk.constructor === buf.constructor);
    return new BinaryReader(chunk);
  }
}
