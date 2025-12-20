import { render } from "preact";
import { computed, effect, signal } from "@preact/signals";
import type { JSX } from "preact";
import { Mission, SaveFile } from "./save-file.ts";

import Strings from "./strings.json" with { type: "json" };
import { missionNames } from "./data.ts";

const STRINGS = Strings as Record<string, string[]>;

const theFile = signal<File | null>(null);

const buffer = signal(new ArrayBuffer());
effect(() => {
  theFile.value?.arrayBuffer().then((b) => buffer.value = b);
});

const saveFile = computed(() => {
  if (buffer.value.byteLength === 0) return null;
  return new SaveFile(buffer.value);
});

function MissionEntry(i: number, mission: Mission): JSX.Element {
  let size = (mission.clearSize % 10) + "mm";
  if (mission.clearSize > 10) {
    const cm = Math.floor(mission.clearSize / 10) % 100;
    size = cm + "cm " + size;
  }
  if (mission.clearSize > 1000) {
    const m = Math.floor(mission.clearSize / 1000);
    size = m + "m " + size;
  }

  const name = STRINGS[missionNames[i]]?.[1];
  if (name) {
    return <li>{name}: {size}</li>;
  } else {
    return <li>[Mission #{i}]: {size}</li>;
  }
}

function Scorecard(): JSX.Element | null {
  const file = saveFile.value;
  if (!file) return null;
  return (
    <>
      <ol>
        {file.missions.map((m, i) => MissionEntry(i, m))}
      </ol>
      <pre>{JSON.stringify(saveFile.value, null, "\t")}</pre>
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
