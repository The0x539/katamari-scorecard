import { render } from "preact";
import { computed, effect, signal } from "@preact/signals";
import { ComponentChildren, JSX, TargetedInputEvent } from "preact";

import { SaveFile, SaveMission } from "./save-file.ts";
import { swap } from "./util.ts";
import { king } from "./assets.ts";
import { cowbearData, localize, missions } from "./data.ts";

import "./screen.css";

declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}

const theFile = signal<File | null>(null);

const buffer = signal(new ArrayBuffer());
effect(() => {
  theFile.value?.arrayBuffer().then((b: ArrayBuffer) => buffer.value = b);
});

const saveFile = computed(() => {
  if (buffer.value.byteLength === 0) return null;
  const save = new SaveFile(buffer.value);
  swap(save.missions, 3, 4); // bruh
  return save;
});

function MissionEntry(i: number, mission: SaveMission): JSX.Element | null {
  const nameID = missions[i]?.name;
  if (!nameID) return null;

  // it's MY tool and I get to make the rules
  const name = localize("UI_ERT", nameID)!.replace("the North Star", "Polaris");

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

function Scorecard(): JSX.Element | null {
  const file = saveFile.value;

  const link =
    "https://www.pcgamingwiki.com/wiki/Katamari_Damacy_Reroll#Save_game_data_location";

  const body = file && (
    <>
      <h1>Missions</h1>
      <ol class="missions">
        {file.missions.map((m, i) => MissionEntry(i, m))}
      </ol>

      <button type="button" onClick={() => console.dir(file)}>
        Dump full decoded save file to console
      </button>
    </>
  );

  const updateFile = (e: TargetedInputEvent<HTMLInputElement>) => {
    theFile.value = e.currentTarget.files![0];
  };

  return (
    <>
      <input type="file" onInput={updateFile} />
      <p>
        Or drag+drop <a target="_blank" href={link}>your save file</a>
      </p>
      <KingOfAllCosmos />
      {body}
    </>
  );
}

function KingOfAllCosmos(): JSX.Element {
  return (
    <king-of-all-cosmos>
      <img class="face" src={king.face.png} />
      <picture class="bg">
        <source srcset={king.bg.color.jxl} type="image/jxl" />
        <source srcset={king.bg.color.webp} type="image/webp" />
        <img src={king.bg.color.png} />
      </picture>
    </king-of-all-cosmos>
  );
}

document.addEventListener("DOMContentLoaded", () => {
  render(<Scorecard />, document.body);
});

document.addEventListener("dragover", (e) => {
  if (!e.dataTransfer) return;

  const list = e.dataTransfer.items;
  for (let i = 0; i < list.length; i++) {
    if (list[i].kind === "file") {
      e.dataTransfer.dropEffect = "copy";
      e.preventDefault();
      break;
    }
  }
});

document.addEventListener("drop", (e) => {
  const list = e.dataTransfer?.items ?? [];

  for (let i = 0; i < list.length; i++) {
    const file = list[i].getAsFile();
    if (file) {
      e.preventDefault();
      theFile.value = file;
      break;
    }
  }
});
