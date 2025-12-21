import type { ComponentChildren, JSX } from "preact";
import type { Signal } from "@preact/signals";

export function Select(
  props: { bind: Signal<string>; children: ComponentChildren },
): JSX.Element {
  const { bind, children } = props;
  return (
    <select
      onChange={(e) => bind.value = e.currentTarget.value}
      ref={(n) => {
        if (n !== null) bind.value = n.value;
      }}
    >
      {children}
    </select>
  );
}

export function Radio<T extends string | number>(
  props: {
    name: string;
    bind: Signal<T>;
    defaultChoice?: string;
    choices: Record<string, {
      value: T;
      label: string;
    }>;
  },
): JSX.Element[] {
  const { name, bind, choices, defaultChoice } = props;

  return Object.entries(choices).map(([id, { value, label }]) => (
    <div role="presentation">
      <input
        type="radio"
        id={id}
        name={name}
        onClick={() => bind.value = value}
        defaultChecked={id === defaultChoice}
      />
      <label for={id}>{label}</label>
    </div>
  ));
}
