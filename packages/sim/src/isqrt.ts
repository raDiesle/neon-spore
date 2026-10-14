/**
 * **The whole-number square root**, the one this package has.
 *
 * A length is a square root — a pull's, a ball's speed, a chord across a
 * port — and **`Math.sqrt` and `Math.hypot` are not available here**:
 * neither is required to be correctly rounded, `packages/sim` rounds what it
 * computes into stored integers, and a last-bit difference between V8 on
 * Android and JavaScriptCore on iOS lands on either side of a boundary and
 * desyncs two phones in a way that reproduces on neither
 * (`test/purity.test.ts`).
 *
 * There were two until 15 October 2026: THE PINBALL's, by Newton's step, and
 * the pulls', by bisection under a ceiling of 46340. They agreed everywhere
 * under the ceiling; this is the one without it. A third is a row in
 * `test/copies-table.ts`.
 */

/**
 * The largest `r` with `r * r <= n`, by Newton's method, and 0 for anything
 * under one.
 *
 * Exact, and therefore the same on every engine, which is the entire reason it
 * exists. `Math.floor` rather than `>>1` throughout: the shift is right for
 * every value this game reaches and wrong the first time somebody squares a
 * distance past a 32-bit integer.
 */
export function isqrt(n: number): number {
  if (n <= 0) return 0;
  if (n < 4) return 1;
  let x = n;
  let next = Math.floor((x + 1) / 2);
  while (next < x) {
    x = next;
    next = Math.floor((x + Math.floor(n / x)) / 2);
  }
  return x;
}
