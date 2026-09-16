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
 * a version of the other. `SpawnEntry.cargo` is a field on a body;
 * `PodEntry.kind` is what a pod **is**.
 */
export interface PodEntry {
  beat: number;
  col: number;
  /** Row it hangs at, from the top. Never the hull row. */
  row: number;
  /** What the pod gives when swallowed. Every pod says: the plain pod that a
   * wave got by saying nothing gave hull points, and there are none. On a husk
   * it is the cargo the thing pretends to be, and it gives nothing. */
  kind: PodKind;
  /**
   * A husk rather than a pod: the thing that must be refused (`Pod.husk`).
   * Absent is a real pod, which is every pod authored before this one.
   *
   * Authored with the kind it is pretending to be and never rolled, for
   * `kind`'s own reason twice over: a wave is composed against what the pair
   * will see, and what they see is a `purge` or a `ward` hanging there.
   */
  husk?: true;
  /**
   * Which way it crosses the field, and absent for a pod that hangs where it
   * was left — which is every pod authored before THE CLAW.
   *
   * A crossing pod enters at the edge it is authored in and travels its row
   * until it leaves the far side, so it is a *window* rather than a place: the
   * pair has as long as it takes to cross, and a pod that got away is a missed
   * gift rather than a punishment, exactly as one that breaks on the skin is.
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
}
