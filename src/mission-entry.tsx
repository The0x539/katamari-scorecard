import type { ComponentChildren, JSX } from "preact";
import { cowbearData, localize, missions } from "./data.ts";
import type { SaveMission } from "./save-file.ts";

function formatSize(size: number): string {
  if (size === 0) return "0";
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
  try {
    seconds = Math.floor(seconds);
    // const milliseconds = Math.round(seconds * 1000) % 1000;
    return Temporal.Duration.from({ seconds })
      .round({ largestUnit: "minutes", smallestUnit: "seconds" })
      .toLocaleString();
  } catch {
    return "";
  }
}

export function MissionEntry(
  i: number,
  mission: SaveMission,
): JSX.Element | null {
  const nameID = missions[i]?.name;
  if (!nameID) return null;

  const name = localize("UI_ERT", nameID);

  const pairs: Record<string, ComponentChildren> = {
    "Diameter": formatSize(mission.clearSize),
    "Clear time": formatTime(mission.clearTime / 30),
    "Clear count": mission.clearCount,
    "Present": mission.swPresent ? "🎁" : "🔎",
    "Objects": mission.clearCatchCount,
  };

  if (mission.rating < 5) {
    pairs["Super Clear"] = formatSize(missions[i].super * 10);
    pairs["Rating"] = mission.rating;
  }

  if (mission.catchRanking[0]) {
    pairs["Ranking"] = localize("OT_STR", mission.catchRanking[0]);
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

  if (mission.catchCountB > 1) {
    let count = mission.catchCountB.toString();

    // dumb hack but this whole building process is due for a reorganization
    if (pairs["Super Clear"]) {
      pairs["Super Clear"] = missions[i].super;
    }

    const max = missions[i].max;
    if (max) {
      const pct = Math.floor(+count / max * 100);
      count = `${count} / ${max} (${pct}%)`;
    }

    pairs["Constellation objects"] = count;
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
  } else {
    pairs["Shooting Star time"] = formatTime(missions[i].meteor * 60);
  }

  return (
    <li>
      <h2>{name}</h2>
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
