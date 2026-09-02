/**
 * The one way this repository closes a `switch` — a `default` that only
 * type-checks once `x` has narrowed to `never`, meaning every other case
 * matched. Add a case to the union and forget a branch here, and this stops
 * type-checking instead of quietly doing nothing at runtime. See
 * `effects-spark.ts`'s comment on `burstFor` for the bug this exists to close.
 */
export function assertNever(x: never): never {
  throw new Error(`unhandled case: ${JSON.stringify(x)}`);
}
