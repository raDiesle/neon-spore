import { expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { orderWaves } from "../src/curriculum-run.js";

/**
 * **`waves:order` on the shipped list changes nothing**, as
 * `boss-slots.test.ts` holds `waves:bosses`. On 17 October 2026 a run on a
 * clean `main` said *the list changes*: blocks softened by `waves:soften` and
 * faults edited after the last full order, which a `--write` would have
 * quietly undone. The order now ends with the soften pass, and a list edited
 * past it turns this red — run `bun run waves:order --write`, or fix the
 * order so it writes the edit itself.
 *
 * The whole composer runs, so this is the slowest test in the director: half
 * a minute alone.
 */
test("waves:order would change nothing on the shipped list", () => {
  const ordered = orderWaves(WAVES);
  const moved = ordered.flatMap((w, i) =>
    Bun.deepEquals(w, WAVES[i]) ? [] : [`${i + 1} ${w.id} (shipped: ${WAVES[i]?.id ?? "none"})`],
  );
  expect(moved).toEqual([]);
  expect(ordered).toHaveLength(WAVES.length);
}, 300_000);
