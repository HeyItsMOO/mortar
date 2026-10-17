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

/** next, with each field equal to the same field of prev kept as prev's value, so a selector of an unchanged field
 * keeps returning the same object. */
export function keepFields<T extends object>(prev: T, next: T): T {
  const out = { ...next }
  for (const k of Object.keys(next) as (keyof T)[]) {
    if (sameValue(prev[k], next[k])) {
      out[k] = prev[k]
    }
  }
  return out
}
