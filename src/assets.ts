import kingbgColorPng from "./assets/king-bg-color.png";
import kingbgColorWebp from "./assets/king-bg-color.webp";
import kingbgColorJxl from "./assets/king-bg-color.jxl";
import kingFacePng from "./assets/king-face.png";

export const king = {
  bg: {
    color: {
      png: kingbgColorPng,
      webp: kingbgColorWebp,
      jxl: kingbgColorJxl,
    },
  },
  face: { png: kingFacePng },
};

function urlSequence(
  count: number,
  constellation: string,
  animal: string,
): URL[] {
  const arr = [];
  for (let i = 1; i <= count; i++) {
    const id = i.toString().padStart(2, "0");
    arr.push(
      new URL(
        `./assets/constellation/${constellation}/${animal}-${id}.png?url`,
        import.meta.url,
      ),
    );
  }
  return arr;
}

export const bears = urlSequence(10, "ursa-major", "bear"),
  cows = urlSequence(11, "taurus", "cow");

export const constellations: Map<number, URL> = (() => {
  const map = new Map();
  for (const id of [11, 12, 14, 15, 16, 21]) {
    map.set(
      id,
      new URL(`./assets/constellation/m${id}.png?url`, import.meta.url),
    );
  }
  return map;
})();
