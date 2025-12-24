import { useComputed, useSignal } from "@preact/signals";

import { dataReady, localize, things } from "../data.ts";
import { Radio, Select } from "./controls.tsx";
import { fileState } from "./scorecard.tsx";

import type { ThingData } from "../data.ts";
import type { JSX } from "preact";
import type { Signal } from "@preact/signals";

function localizeSize(s: string): string {
  const sizeID = parseInt(s, 36) - 1;
  return localize("UI_NIC", sizeID);
}

function collateCollection() {
  const thingList = Object.values(things);

  const gather = (
    f: (t: ThingData) => string,
  ): [string[], Map<string, ThingData[]>] => {
    const set = new Set(thingList.map(f).filter((x) => x));
    const list = [...set.keys()];
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
}

let collection: ReturnType<typeof collateCollection>;
dataReady.then(() => collection = collateCollection());

type Mode = "all" | "category" | "size";
type CollectionFilterState = {
  mode: Signal<Mode>;
  category: Signal<string>;
  size: Signal<string>;
};

export function Collection(): JSX.Element {
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
  const mode = useSignal<Mode>("category");
  const category = useSignal(collection.categories[0]);
  const size = useSignal(collection.sizes[0]);

  return { mode, category, size };
}

function CollectionFilters(
  props: { state: CollectionFilterState },
): JSX.Element {
  const { state } = props;

  const caught = fileState.save.value!.game.swMonoCatch;

  const radioItem = (
    key: string,
    name: string,
    groups: Map<string, ThingData[]>,
  ) => {
    const group = groups.get(key)!;
    const collected = group.filter((t) => caught[t.idx]).length;
    const total = group.length;

    const obj = {
      value: key,
      label: `${name}: ${collected} / ${total}`,
      css: collected === total ? "complete" : undefined,
    };
    return [key, obj];
  };

  const optionItem = (
    key: string,
    name: string,
    groups: Map<string, ThingData[]>,
  ) => {
    const group = groups.get(key)!;
    const collected = group.filter((t) => caught[t.idx]).length;
    const total = group.length;

    return (
      <option
        key={key}
        value={key}
        class={collected === total ? "complete" : undefined}
      >
        {name}: {collected} / {total}
      </option>
    );
  };

  const categoryLabel = (cat: string) =>
    optionItem(cat, localize(cat), collection.byCategory);

  const sizeLabel = (s: string) =>
    radioItem(s, localizeSize(s), collection.bySize);

  return (
    <>
      <div role="radiogroup">
        <Radio
          name="mode"
          bind={state.mode}
          defaultChoice="filter-category"
          choices={{
            "filter-all": { value: "all", label: "Everything" },
            "filter-category": { value: "category", label: "Category" },
            "filter-size": { value: "size", label: "Size" },
          }}
        />
      </div>

      {state.mode.value === "category" && (
        <Select bind={state.category}>
          {collection.categories.map(categoryLabel)}
        </Select>
      )}
      {state.mode.value === "size" && (
        <div role="radiogroup">
          <Radio
            name="category"
            bind={state.size}
            defaultChoice={collection.sizes[0]}
            choices={Object.fromEntries(
              collection.sizes.map(sizeLabel),
            )}
          />
        </div>
      )}
    </>
  );
}

function Thing(thing: ThingData): JSX.Element {
  const name = localize(thing.name);
  const id = thing.id;

  const got = !!fileState.save.value?.game.swMonoCatch[thing.idx];

  return (
    <li key={id} data-id={id}>
      <h2>{name}</h2>
      {got && <span class="marker">✓</span>}
      <dl>
        {thing.cat && (
          <>
            <dt>Category</dt>
            <dd>{localize(thing.cat)}</dd>
          </>
        )}
        {thing.spot && (
          <>
            <dt>Location</dt>
            <dd title={thing.spot}>{localize(thing.spot)}</dd>
          </>
        )}
        {thing.size && (
          <>
            <dt>Size to roll up</dt>
            <dd class="size">{thing.size}</dd>
          </>
        )}
      </dl>
      {localize(thing.desc) && <p>{localize(thing.desc)}</p>}
    </li>
  );
}
