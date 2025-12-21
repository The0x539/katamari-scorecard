import {
  computed,
  effect,
  signal,
  useComputed,
  useSignal,
} from "@preact/signals";
import { Show } from "@preact/signals/utils";
import { useRef } from "preact/hooks";

import { localize, things } from "./data.ts";
import { MissionEntry } from "./mission-entry.tsx";
import { SaveFile } from "./save-file.ts";
import { king } from "./assets.ts";
import { map_push, swap } from "./util.ts";

import type { ThingData } from "./data.ts";
import type { JSX } from "preact";

export const theFile = signal<File | null>(null);

const buffer = signal(new ArrayBuffer());

const reloadFile = async () => {
  if (!theFile.value) return;
  buffer.value = await theFile.value.arrayBuffer();
};

effect(() => void reloadFile());

const saveFile = computed(() => {
  if (buffer.value.byteLength === 0) return null;
  const save = new SaveFile(buffer.value);
  swap(save.missions, 3, 4); // bruh
  return save;
});

type Tab = "missions" | "things";
const currentTab = signal<Tab>("missions");

export function Scorecard(): JSX.Element {
  const file = saveFile.value;
  const hasFile = useComputed(() => saveFile.value !== null);

  const link =
    "https://www.pcgamingwiki.com/wiki/Katamari_Damacy_Reroll#Save_game_data_location";

  let body = null;

  if (file) {
    switch (currentTab.value) {
      case "missions": {
        body = (
          <ol class="missions">
            {file.missions.map((m, i) => MissionEntry(i, m))}
          </ol>
        );
        break;
      }
      case "things": {
        body = <Things />;
      }
    }
  }

  const theInput = useRef<HTMLInputElement | null>(null);

  const updateFile = () => {
    theFile.value = theInput.current?.files?.[0] ?? null;
  };

  return (
    <>
      <h1>Katamari Scorecard</h1>
      <input type="file" ref={theInput} onInput={updateFile} />
      <p>
        Or drag+drop <a target="_blank" href={link}>your save file</a>
      </p>
      <Show when={hasFile}>
        <button type="button" onClick={reloadFile}>Reload</button>
      </Show>
      <KingOfAllCosmos />
      {file && <Tabs />}
      {body}
      {file && (
        <button type="button" onClick={() => console.dir(file)}>
          Dump full decoded save file to console
        </button>
      )}
    </>
  );
}

function Tabs(): JSX.Element {
  return (
    <nav>
      <button type="button" onClick={() => currentTab.value = "missions"}>
        Missions
      </button>
      <button type="button" onClick={() => currentTab.value = "things"}>
        Things
      </button>
    </nav>
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

function localizeSize(s: string): string {
  const sizeID = parseInt(s, 36) - 1;
  return localize("UI_NIC", sizeID);
}

const byCategory = new Map<string, ThingData[]>();
const bySize = new Map<string, ThingData[]>();

for (const thing of Object.values(things)) {
  map_push(byCategory, thing.cat, thing);
  map_push(bySize, thing.s, thing);
}

const sizes = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function Things(): JSX.Element {
  const file = saveFile.value!;

  const currentMode = useSignal<"category" | "size">("category");
  const currentSelection = useSignal<string>(
    Object.values(things)[1].cat,
  );

  const visible = currentMode.value === "category"
    ? (t: ThingData) => t.cat === currentSelection.value
    : (t: ThingData) => t.s === currentSelection.value;

  return (
    <>
      <nav>
        <p>By category:</p>
        {byCategory.keys().filter((c) => c).map((cat) => (
          <button
            type="button"
            onClick={() => {
              currentMode.value = "category";
              currentSelection.value = cat;
            }}
          >
            {localize(cat)}
          </button>
        )).toArray()}
        <p>By size:</p>
        {sizes.map((size) => (
          <button
            type="button"
            onClick={() => {
              currentMode.value = "size";
              currentSelection.value = size;
            }}
          >
            {localizeSize(size)}
          </button>
        ))}
      </nav>

      <ol class="things">
        {Object.values(things).map((thing) => {
          if (!visible(thing)) return null;

          const name = localize(thing.name);
          const id = thing.id;
          const emoji = file.game.swMonoCatch[thing.idx] ? "✔️" : "❌";

          return <li key={id} data-id={id}>{emoji} {name}</li>;
        })}
      </ol>
    </>
  );
}
