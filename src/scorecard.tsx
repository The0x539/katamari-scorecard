import {
  computed,
  effect,
  signal,
  useComputed,
  useSignal,
} from "@preact/signals";
import { CSSTransition } from "preact-transitioning";
import { Show } from "@preact/signals/utils";

import { localize, things } from "./data.ts";
import { MissionEntry } from "./mission-entry.tsx";
import { SaveFile } from "./save-file.ts";
import { king } from "./assets.ts";
import { swap } from "./util.ts";
import { Radio, Select } from "./controls.tsx";

import type { ThingData } from "./data.ts";
import type { JSX, TargetedInputEvent } from "preact";
import type { ReadonlySignal, Signal } from "@preact/signals";

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
        <button type="button" onClick={() => fileState.refreshBuffer()}>
          Reload
        </button>
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

function localizeSize(s: string): string {
  const sizeID = parseInt(s, 36) - 1;
  return localize("UI_NIC", sizeID);
}

const collection = (() => {
  const thingList = Object.values(things);

  const gather = (
    f: (t: ThingData) => string,
  ): [string[], Map<string, ThingData[]>] => {
    const list = new Set(thingList.map(f).filter((x) => x)).keys().toArray();
    list.sort();

    const groups = new Map<string, ThingData[]>();
    for (const g of list) groups.set(g, []);
    for (const t of thingList) groups.get(f(t))?.push(t);

    return [list, groups];
  };

  const [categories, byCategory] = gather((t) => t.cat);
  const [sizes, bySize] = gather((t) => t.s);

  return {
    all: thingList,
    categories,
    byCategory,
    sizes,
    bySize,
  };
})();

type Mode = "all" | "category" | "size";
type CollectionFilterState = {
  mode: Signal<Mode>;
  category: Signal<string>;
  size: Signal<string>;
};

function Collection(): JSX.Element {
  const filterState = createThingFilterState();

  const currentList = useComputed(() => {
    switch (filterState.mode.value) {
      case "all":
        return collection.all;
      case "category":
        return collection.byCategory.get(filterState.category.value) ?? [];
      case "size":
        return collection.bySize.get(filterState.size.value) ?? [];
    }
  });

  return (
    <>
      <CollectionFilters state={filterState} />
      <ol class="things">
        {currentList.value.map(Thing)}
      </ol>
    </>
  );
}

function createThingFilterState() {
  const mode = useSignal<Mode>("all");
  const category = useSignal("");
  const size = useSignal("");

  return { mode, category, size };
}

function CollectionFilters(
  props: { state: CollectionFilterState },
): JSX.Element {
  const { state } = props;

  return (
    <>
      <Radio
        name="mode"
        bind={state.mode}
        defaultChoice="filter-all"
        choices={{
          "filter-all": { value: "all", label: "Everything" },
          "filter-category": { value: "category", label: "Category" },
          "filter-size": { value: "size", label: "Size" },
        }}
      />

      {state.mode.value === "category" && (
        <Select bind={state.category}>
          {collection.categories.map((cat) => (
            <option key={cat} value={cat}>{localize(cat)}</option>
          ))}
        </Select>
      )}
      {state.mode.value === "size" && (
        <Select bind={state.size}>
          {collection.sizes.map((s) => (
            <option key={s} value={s}>{localizeSize(s)}</option>
          ))}
        </Select>
      )}
    </>
  );
}

function Thing(thing: ThingData): JSX.Element {
  const name = localize(thing.name);
  const id = thing.id;
  const emoji = fileState.save.value?.game.swMonoCatch[thing.idx] ? "✔️" : "❌";

  return <li key={id} data-id={id}>{emoji} {name}</li>;
}
