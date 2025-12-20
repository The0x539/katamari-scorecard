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
