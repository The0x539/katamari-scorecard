import type { ComponentChildren, JSX } from "preact";
import { cowbearData, localize, missions } from "../data.ts";
import type { SaveMission } from "../save-file.ts";

function formatSize(size: number, concise: boolean = false): string {
  if (size === 0) return "0";

  if (concise) {
    if (size >= 1000) {
      return (size / 1000) + "m";
    } else if (size >= 10) {
      return (size / 10) + "cm";
    } else {
      return size + "mm";
    }
  }

  const units = {
    mm: size % 10,
    cm: Math.floor(size / 10) % 100,
    m: Math.floor(size / 1000),
  };

  const parts = [];
  if (units.m > 0) parts.push(units.m + "m");
  if (units.cm > 0 || units.m > 0) parts.push(units.cm + "cm");
  if (units.mm > 0) parts.push(units.mm + "mm");
  return parts.join(" ");
}

function formatTime(seconds: number): string {
  seconds = Math.floor(seconds);
  // const milliseconds = Math.round(seconds * 1000) % 1000;
  return Temporal.Duration.from({ seconds })
    .round({ largestUnit: "minutes", smallestUnit: "seconds" })
    .toLocaleString(undefined, {
      style: "digital",
      hours: "short",
      hoursDisplay: "auto",
      minutes: "numeric",
    });
}

const icons: Record<number, string> = {
  [1]: "📏",
  [2]: "📏",
  [3]: "📏",
  [4]: "📏",
  [5]: "📏",
  [6]: "📏",
  [7]: "📏",
  [8]: "📏",
  [9]: "📏",
  [10]: "📏",
  [11]: "🦀",
  [12]: "🦢",
  [14]: "👑",
  [15]: "🐟",
  [16]: "💃",
  [17]: "🐻",
  [18]: "🧑‍🤝‍🧑",
  [19]: "🐄",
  [21]: "📏",
};

export function MissionEntry(
  i: number,
  mission: SaveMission,
): JSX.Element | null {
  const nameID = missions[i]?.name;
  if (!nameID) return null;

  const name = localize("UI_ERT", nameID);

  const obj = missions[i].objective;

  const pairs: Record<string, ComponentChildren> = {
    "Clear count": mission.clearCount,
    "Objects": mission.clearCatchCount,
  };

  if (missions[i].item >= 0) {
    const icon = mission.swPresent ? "🎁" : "🔎";
    let name = localize("OT_PRE", missions[i].item + 2);
    if (missions[i].item == 12) {
      name = localize("OT_OBJ", 22);
    }
    pairs["Present"] = `${icon} ${name}`;
  }

  if (mission.catchRanking[0]) {
    pairs["Ranking"] = localize("OT_STR", mission.catchRanking[0]);
  }

  if (obj !== "N") {
    pairs["Diameter"] = formatSize(mission.clearSize);
  }

  if (obj === "A") {
    pairs["Clear time"] = formatTime(mission.clearTime / 30) + " / " +
      formatTime(missions[i].time * 60);
  } else if (obj === "E") {
    pairs["Clear time"] = formatTime(mission.clearTime / 30);
  }

  if (mission.nameA) {
    delete pairs["Super Clear"];

    const data = cowbearData.get(mission.nameA);
    if (data) {
      const name = localize("OT_CON", data?.resultName);
      const size = localize("UI_SYS", data?.resultSize);
      pairs["Constellation object"] = `${name} (${size})`;
    }
  }

  if (mission.catchRankCategory.some((n) => n !== 0)) {
    // TODO: take catchRankName into account
    // (represents tied placement, shows up ingame as e.g. 1st, 2nd, 2nd)
    pairs["Categories"] = (
      <ol>
        {mission.catchRankCategory.map((n) => (
          <li key={n}>{localize("OT_CTG", n)}</li>
        ))}
      </ol>
    );
  }

  if (mission.fallenStarCount) {
    pairs["Meteor"] = localize("OT_STR", mission.fallenStarName);
  } else if (missions[i].meteor > 0) {
    pairs["Shooting Star time"] = formatTime(missions[i].meteor * 60);
  }

  return (
    <li>
      <h2>{name}</h2>
      {obj === "N" &&
        SizeMeter(mission.clearSize, i)}
      {obj === "B" &&
        ConstellationMeter(mission.catchCountB, i)}
      {obj === "E" &&
        PolarisMeter(mission.clearSize, i)}
      {obj === "N" &&
        TimeMeter(mission.clearTime / 30, i)}
      <dl>
        {Object.entries(pairs).map(([k, v]) => (
          <div role="presentation">
            <dt data-label={k}>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </li>
  );
}

export function SizeMeter(
  size: number,
  id: number,
): JSX.Element {
  const ranks = missions[id].rank.map((n) => n * 10);
  const limit = missions[id].max! * 10;

  return (
    <figure
      class="bar objective-n"
      style={{ "--max": limit }}
    >
      <data class="label" value={size}>{icons[id]} {formatSize(size)}</data>
      <div role="presentation" class="bar-container">
        <meter
          max={limit}
          low={ranks[1]}
          high={ranks[3]}
          optimum={limit}
          value={size}
        />
        {ranks.map((n) => (
          <figcaption key={n} class="marker" style={{ "--pos": n }}>
            <data value={n}>{formatSize(n, true)}</data>
          </figcaption>
        ))}
      </div>
    </figure>
  );
}

export function ConstellationMeter(
  count: number,
  id: number,
): JSX.Element {
  const ranks = missions[id].rank;
  const max = missions[id].max!;
  return (
    <figure class="bar objective-b" style={{ "--max": max }}>
      <data class="label" value={count}>
        {icons[id]} {count} / {max} ({Math.round(count / max * 100)}%)
      </data>
      <div role="presentation" class="bar-container">
        <meter
          optimum={max}
          max={max}
          low={ranks[1]}
          high={ranks[3]}
          value={count}
        />
        {ranks.map((n) => (
          <figcaption key={n} class="marker" style={{ "--pos": n }}>
            <data>{n}</data>
          </figcaption>
        ))}
      </div>
    </figure>
  );
}

export function TimeMeter(clear: number, id: number): JSX.Element {
  const max = missions[id].time * 60;
  const fast = missions[id].meteor * 60;
  return (
    <figure class="bar time">
      <span role="presentation" class="label">
        ⏱️ <Duration time={clear} /> / <Duration time={max} />
      </span>
      <div role="presentation" class="bar-container" style={{ "--max": max }}>
        <meter optimum={0} high={fast} max={max} value={clear} />
        <figcaption class="marker" style={{ "--pos": fast }}>
          <Duration time={fast} />
        </figcaption>
      </div>
    </figure>
  );
}

export function PolarisMeter(size: number, id: number): JSX.Element {
  const min = 5000,
    target = 10000,
    max = 15000;
  const ranks = missions[id].rank;

  const marks = [];
  for (const n of ranks) {
    marks.push(target - n);
  }
  for (const n of ranks.toReversed()) {
    const m = target + n;
    if (target < m && m < max) {
      marks.push(m);
    }
  }

  return (
    <figure class="bar objective-e">
      <data data-foo={id} class="label" value={size}>
        {icons[id]} {formatSize(size)}
      </data>
      <div
        role="presentation"
        class="bar-container"
        style={{ "--min": min, "--max": max }}
      >
        <meter
          min={min}
          low={9500}
          optimum={target}
          high={10500}
          max={max}
          value={size}
        />
        {marks.map((n) => (
          <figcaption key={n} class="marker" style={{ "--pos": n }}>
            <data value={n}>{formatSize(n, true)}</data>
          </figcaption>
        ))}
      </div>
    </figure>
  );
}

export function Duration(
  props: { time: number; class?: string },
): JSX.Element {
  return (
    <time datetime={props.time + "s"} class={props.class}>
      {formatTime(props.time)}
    </time>
  );
}
