import type { WaveEntry } from "./wave-entry.js";

/**
 * **Whether a wave carries both creatures a bare finger answers** — a mine
 * and a soundbox (THE BEATBOX). A blind tap that lands on a box is eaten by
 * it, so no wave may carry both; why at length: `test/tap-waves.test.ts`.
 *
 * One function so the test that refuses such a wave and the composer that
 * must never draw one (`tools/director/src/compose-check.ts`) ask the same
 * question.
 */
export function tapsClash(entries: readonly Pick<WaveEntry, "kind">[]): boolean {
  return entries.some((e) => e.kind === "mine") && entries.some((e) => e.kind === "beatbox");
}
