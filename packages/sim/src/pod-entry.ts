import type { PodKind } from "./pod-types.js";

/**
 * Where a pod is left hanging — the one thing a wave authors that is not a
 * body. Its own queue rather than an entry in the spawn queue: a pod is not a
 * creature, it is never cleared, and a wave that ends with one still hanging
 * has still ended (docs/spec/systems.md 5.7).
 *
 * Cut out of `entries.ts` when THE MOULT arrived, which is the creature that
 * makes the seam worth drawing rather than merely convenient: a moult is a
 * *body* that is wearing a pod's cargo on alternate counts, so the two shapes
 * had to stop being neighbours in one file before one of them could be read as
 * a version of the other. `PodEntry.kind` is what a pod **is**.
 */
export interface PodEntry {
  beat: number;
  col: number;
  /** Row it hangs at, from the top. Never the hull row. */
  row: number;
  /** Real or hollow — the two pod brushes (`PodKind`). */
  kind: PodKind;
  /**
   * How many beats a real pod gives the pair to take it in, counted from the
   * beat it appears. Absent means `cfg.podDueBeats`. A husk wears the clock
   * too, so the clock is never the tell, and is let go when it runs out.
   * Authored rather than rolled for `speed`'s reason: how long the pair has is
   * the whole of the difficulty.
   */
  due?: number;
  /**
   * Which way it crosses the field, and absent for a pod that hangs where it
   * was left — which is every pod authored before THE CLAW.
   *
   * A crossing pod enters at the edge it is authored in and travels its row
   * until it leaves the far side, so it is a *window* rather than a place: the
   * pair has as long as it takes to cross, and a pod that got away loses the
   * wave exactly as one that breaks on the skin does.
   */
  cross?: -1 | 1;
  /**
   * How fast it crosses, in tiles per beat. Absent means
   * `cfg.podCrossTilesPerBeat`, and it is meaningless on a pod that does not
   * cross. Authored rather than rolled for `wears`' reason: how long the pair
   * has is the whole of the difficulty, and a wave cannot be composed against
   * a speed its author does not know.
   */
  speed?: number;
  /**
   * A pod of a **roe**: strung with every other roe pod hanging in its
   * column, so the one shot that frees one frees the string, and they all slide
   * the same way (`freePod`). The owner's SUCK page, 16 October 2026: three
   * pods one above the other, a beat apart on the way down, the first wave
   * that tells a pair the maw has a length. Absent is a pod on its own.
   */
  roe?: true;
}
