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
  f: (id: string) => URL,
): URL[] {
  const arr = [];
  for (let i = 1; i <= count; i++) {
    const id = i.toString().padStart(2, "0");
    arr.push(f(id));
  }
  return arr;
}

export const bears = urlSequence(10, (id) =>
    new URL(
      `./assets/constellation/ursa-major/bear-${id}.png?url`,
      import.meta.url,
    )),
  cows = urlSequence(11, (id) =>
    new URL(
      `./assets/constellation/taurus/cow-${id}.png?url`,
      import.meta.url,
    )),
  presents = urlSequence(
    16,
    (id) => new URL(`./assets/present/p${id}.png?url`, import.meta.url),
  );

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
