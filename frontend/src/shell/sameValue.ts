// Backend answers arrive as fresh objects even when nothing changed; storing one as-is re-renders every subscriber
// and defeats memoised rows. These keep the stored value whenever the answer is equal to it.

export function sameValue(a: unknown, b: unknown): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b)
}

/** next, with each item equal to the previous item of the same key replaced by that previous object. */
export function keepUnchanged<T>(prev: readonly T[], next: T[], keyOf: (item: T) => string): T[] {
  const old = new Map(prev.map((item) => [keyOf(item), item]))
  const kept = next.map((item) => {
    const was = old.get(keyOf(item))
    return was !== undefined && sameValue(was, item) ? was : item
  })
  return kept.length === prev.length && kept.every((item, i) => item === prev[i])
    ? (prev as T[])
    : kept
}
