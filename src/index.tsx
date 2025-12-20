import { render } from "preact";
import { computed, effect, signal } from "@preact/signals";
import type { ComponentChildren, JSX, TargetedInputEvent } from "preact";
import { Mission, SaveFile } from "./save-file.ts";

import "./screen.css";

import Strings from "./strings.json" with { type: "json" };
import { constellationMaxima, cowbearData, missionNames } from "./data.ts";

function swap<T>(arr: T[], i: number, j: number): void {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

swap(missionNames, 3, 4); // bruh

const STRINGS = Strings as Record<string, string[]>;

function localize(category: string, id: number): string | null {
  if (id == null) return null;
  const key = category + "_" + id.toString().padStart(3, "0");
  return STRINGS[key]?.[1];
}

const theFile = signal<File | null>(null);

const buffer = signal(new ArrayBuffer());
effect(() => {
  theFile.value?.arrayBuffer().then((b) => buffer.value = b);
});

const saveFile = computed(() => {
  if (buffer.value.byteLength === 0) return null;
  const save = new SaveFile(buffer.value);
  swap(save.missions, 3, 4);
  return save;
});

function MissionEntry(i: number, mission: Mission): JSX.Element | null {
  let name = localize("UI_ERT", missionNames[i]);
  if (!name) return null;
  // it's MY tool and I get to make the rules
  name = name.replace("the North Star", "Polaris");

  let size = (mission.clearSize % 10) + "mm";
  if (mission.clearSize > 10) {
    const cm = Math.floor(mission.clearSize / 10) % 100;
    size = cm + "cm " + size;
  }
  if (mission.clearSize > 1000) {
    const m = Math.floor(mission.clearSize / 1000);
    size = m + "m " + size;
  }

  const seconds = Math.round(mission.clearTime / 30);
  // const milliseconds = Math.round(mission.clearTime * 1000 / 30) % 1000;
  const time = Temporal.Duration.from({ seconds })
    .round({ largestUnit: "minutes", smallestUnit: "seconds" })
    .toLocaleString();

  const pairs: Record<string, ComponentChildren> = {
    "Size": size,
    "Time": time,
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

    const max = constellationMaxima[i];
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

  return (
    <li>
      <h2>{name}</h2>
      <dl>
        {Object.entries(pairs).map(([k, v]) => (
          <>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </>
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
        or drag+drop <a target="_blank" href={link}>your save file</a>
      </p>
      {body}
    </>
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
