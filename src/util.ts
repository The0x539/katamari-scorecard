export function range(stop: number): Generator<number>;
export function range(start: number, stop: number): Generator<number>;
export function range(
  start: number,
  stop: number,
  step: number,
): Generator<number>;

export function* range(
  start: number,
  stop?: number,
  step?: number,
): Generator<number> {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }
  step ??= 1;
  for (let i = start; i < stop; i += step) {
    yield i;
  }
}

export function swap<T>(arr: T[], i: number, j: number): void {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

export function map_push<K, V>(map: Map<K, V[]>, key: K, value: V) {
  if (map.has(key)) {
    map.get(key)!.push(value);
  } else {
    map.set(key, [value]);
  }
}
