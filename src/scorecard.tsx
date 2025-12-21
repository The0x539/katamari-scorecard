import { computed, effect, signal } from "@preact/signals";

import { MissionEntry } from "./mission-entry.tsx";
import { SaveFile } from "./save-file.ts";
import { king } from "./assets.ts";
import { swap } from "./util.ts";

import type { JSX, TargetedInputEvent } from "preact";

export const theFile = signal<File | null>(null);

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

export function Scorecard(): JSX.Element | null {
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
