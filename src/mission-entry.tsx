import type { ComponentChildren, JSX } from "preact";
import { cowbearData, localize, missions } from "./data.ts";
import type { SaveMission } from "./save-file.ts";

export function MissionEntry(
  i: number,
  mission: SaveMission,
): JSX.Element | null {
  const nameID = missions[i]?.name;
  if (!nameID) return null;

  const name = localize("UI_ERT", nameID);

  let size = (mission.clearSize % 10) + "mm";
  if (mission.clearSize > 10) {
    const cm = Math.floor(mission.clearSize / 10) % 100;
    size = cm + "cm " + size;
  }
  if (mission.clearSize > 1000) {
    const m = Math.floor(mission.clearSize / 1000);
    size = m + "m " + size;
  }

  let time = "";
  try {
    const seconds = Math.round(mission.clearTime / 30);
    // const milliseconds = Math.round(mission.clearTime * 1000 / 30) % 1000;
    time = Temporal.Duration.from({ seconds })
      .round({ largestUnit: "minutes", smallestUnit: "seconds" })
      .toLocaleString();
  } catch { /**/ }

  const pairs: Record<string, ComponentChildren> = {
    "Diameter": size,
    "Clear time": time,
    "Clear count": mission.clearCount,
    "Present": mission.swPresent ? "🎁" : "🔎",
    "Objects": mission.clearCatchCount,
  };

  if (mission.catchRanking[0]) {
    pairs["Ranking"] = localize("OT_STR", mission.catchRanking[0]);
  }

  if (mission.nameA) {
    const data = cowbearData.get(mission.nameA);
    if (data) {
      const name = localize("OT_CON", data?.resultName);
      const size = localize("UI_SYS", data?.resultSize);
      pairs["Constellation object"] = `${name} (${size})`;
    }
  }

  if (mission.catchCountB > 1) {
    let count = mission.catchCountB.toString();

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
