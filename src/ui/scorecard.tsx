import {
  computed,
  effect,
  signal,
  useComputed,
  useSignal,
} from "@preact/signals";
import { CSSTransition } from "preact-transitioning";
import { Show } from "@preact/signals/utils";

import { MissionEntry } from "./mission-entry.tsx";
import { SaveFile } from "../save-file.ts";
import { king } from "../assets.ts";
import { swap } from "../util.ts";
import { Radio } from "./controls.tsx";
import { Collection } from "./collection.tsx";

import type { JSX, TargetedInputEvent } from "preact";
import type { ReadonlySignal } from "@preact/signals";

class FileState {
  private readonly source = signal<File | null>(null);
  private readonly buffer = signal(new ArrayBuffer());

  readonly save: ReadonlySignal<SaveFile | null> = computed(() => {
    const buf = this.buffer.value;
    if (buf.byteLength === 0) return null;

    const save = new SaveFile(buf);
    swap(save.missions, 3, 4); // bruh
    return save;
  });

  constructor() {
    effect(() => void this.refreshBuffer());
    setInterval(() => this.refreshBuffer(), 15000);
  }

  setSource(file: File | null | undefined): void {
    if (file) this.source.value = file;
  }

  async refreshBuffer(): Promise<void> {
    const source = this.source.value;
    if (!source) return;
    this.buffer.value = await source.arrayBuffer();
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

export function Scorecard(): JSX.Element {
  const link =
    "https://www.pcgamingwiki.com/wiki/Katamari_Damacy_Reroll#Save_game_data_location";

  const hasFile = useComputed(() => fileState.save.value !== null);

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
      <Show when={hasFile}>
        <Body />
      </Show>
    </>
  );
}

type Tab = "missions" | "collection";

function Body(): JSX.Element {
  const currentTab = useSignal<Tab>("missions");

  const pages: Record<Tab, JSX.Element> = {
    missions: (
      <ol class="missions">
        {fileState.save.value?.missions.map((m, i) => MissionEntry(i, m))}
      </ol>
    ),
    collection: <Collection />,
  };

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
