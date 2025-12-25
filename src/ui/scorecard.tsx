import { computed, effect, signal, useSignal } from "@preact/signals";
import { CSSTransition } from "preact-transitioning";
import { Show } from "@preact/signals/utils";

import { MissionEntry } from "./mission-entry.tsx";
import { SaveFile } from "../save-file.ts";
import { king } from "../assets.ts";
import { swap } from "../util.ts";
import { Radio } from "./controls.tsx";
import { Collection } from "./collection.tsx";
import { Album } from "./album.tsx";

import type { JSX, TargetedInputEvent } from "preact";

class FileState {
  private readonly source = signal<File | null>(null);
  readonly save = signal<SaveFile | null>(null);

  setSource(file: File | null | undefined): void {
    if (file) this.source.value = file;
  }

  constructor() {
    // Whenever the picked file (the read method's only subscription) changes,
    // unconditionally reload the data from file.
    effect(() => void this.read().then((save) => this.save.value = save));

    // Attempt to automatically refresh the file,
    // but try to check whether it actually changed first.
    setInterval(async () => {
      // https://www.w3.org/TR/FileAPI/#file-section
      // From testing, real world browsers seem to snapshot the modification timestamp, but not the contents.
      // This makes automatic reloading at least *possible*, but we need to load the data and compare it.
      // Fortunately, there's a timestamp within the data,
      const newSave = await this.read();
      if (!newSave) return; // there's no new save to load

      const oldTime = this.save.value?.timestamp();
      const newTime = newSave.timestamp();

      // Skip refresh iff both saves contain the same valid timestamp
      if (oldTime != null && newTime != null && oldTime.equals(newTime)) return;

      this.save.value = newSave;
    }, 10000);
  }

  private async read(): Promise<SaveFile | null> {
    const source = this.source.value;
    if (!source) return null;

    const buf = await source.arrayBuffer();
    if (buf.byteLength === 0) return null;

    const save = new SaveFile(buf);
    swap(save.missions, 3, 4); // TODO: just have an array of which missions to show, and in which order
    return save;
  }
}

export const fileState = new FileState();

const updateFile = (
  input: HTMLInputElement | TargetedInputEvent<HTMLInputElement> | null,
) => {
  if (input === null) return;
  if (!(input instanceof HTMLInputElement)) input = input.currentTarget;

  fileState.setSource(input.files?.[0]);
};

const hasFile = computed(() => fileState.save.value !== null);

export function Scorecard(): JSX.Element {
  const link =
    "https://www.pcgamingwiki.com/wiki/Katamari_Damacy_Reroll#Save_game_data_location";

  return (
    <>
      <h1>Katamari Scorecard</h1>
      <input
        type="file"
        onInput={updateFile}
        ref={updateFile}
      />
      <p>
        Or drag+drop <a target="_blank" href={link}>your save file</a>
      </p>
      <Show when={hasFile}>
        <button type="button" onClick={() => console.dir(fileState.save.value)}>
          Dump full decoded save file to console
        </button>
      </Show>
      <KingOfAllCosmos />
      {hasFile.value && <Body />}
    </>
  );
}

type Tab = "missions" | "collection" | "photos";

function Body(): JSX.Element {
  const currentTab = useSignal<Tab>("missions");

  const pages: Record<Tab, JSX.Element> = {
    missions: (
      <ol class="missions">
        {fileState.save.value?.missions.map((m, i) => MissionEntry(i, m))}
      </ol>
    ),
    collection: <Collection />,
    photos: <Album />,
  };

  // Theoretically, it would probably be ideal to only
  // re-render the parts for which the data has changed,
  // but all the data comes from reading the same file,
  // so that would require splitting the object into a *bunch* of computed signals.
  // This is probably fine.

  return (
    <>
      <nav>
        <Radio
          name="view"
          defaultChoice="view-missions"
          bind={currentTab}
          choices={{
            "view-missions": { value: "missions", label: "Missions" },
            "view-collection": { value: "collection", label: "Collection" },
            "view-photos": { value: "photos", label: "Album" },
          }}
        />
      </nav>

      {Object.entries(pages).map(([tab, elem]) => (
        <CSSTransition
          in={currentTab.value === tab}
          duration={750}
          classNames="anim"
        >
          <main class={tab}>{elem}</main>
        </CSSTransition>
      ))}
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
