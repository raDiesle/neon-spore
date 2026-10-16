/**
 * The shape of a **pod**: the one thing on the field that is neither a body nor
 * a shot.
 *
 * Its own file beside `hull-types.ts`, and lifted out of `types.ts` when THE
 * GYRE arrived and that file went over its limit for the fourth time. The seam
 * is the one the pod's own comment below already draws: everything left next
 * door is a thing that *lives* on the grid — a creature and the bolt fired at
 * one — and this is the thing that does neither, is never cleared, and does
 * not even have a row and a column. `pods.ts` holds what one does; this is
 * what one is, which is why the two are not one file (a world imports the
 * shape, and the shape must not import a world).
 */

import type { Color } from "./types.js";

/**
 * **What a pod is: real or hollow.** The owner, 16 October 2026: there are two
 * pods and only two, and they are two brushes rather than one brush and a
 * flag on it.
 *
 * - `pod` is **the real one**. It gives nothing — there is no cargo any more —
 *   and it is owed: from the beat it appears the pair has `podDueBeats` to
 *   shoot it loose and swallow it, and when the clock runs out with it still
 *   on the field the wave is lost (`Pod.dueTicks`).
 * - `husk` is **the hollow one**, the owner's design of 15 September 2026. It
 *   hangs, is freed and falls exactly as a pod does and shows player 1 a real
 *   pod's face; swallowing it loses the wave and refusing it costs nothing.
 *   It carries the same clock, because a clock only one of the two wore would
 *   be the tell on player 1's screen — and when a husk's runs out it lets go
 *   of the field as a refused one does, at no cost.
 *
 * There were two cargoes, `purge` and `ward`, and before them a plain `mend`.
 * The owner rejected both on 16 October 2026: a pod is a thing to be caught in
 * time, not a pickup. What they used to do is on `docs/spec/ideas.md`.
 *
 * A husk used to be a flag on a pod (`husk: true`) precisely because `kind`
 * was its cargo and a fourth cargo would have been the tell. With no cargo
 * left, `kind` says what a pod *is*, and the tell is the renderer's to keep:
 * player 1's screen draws a husk as a pod (`render/pods.ts`).
 */
export type PodKind = "pod" | "husk";

/**
 * The two, as data. `hashWorld` folds a pod's kind in by its index here
 * rather than by a ternary chain, for `BOSS_KINDS`' reason: a third pod added
 * to the type and not to a chain would hash as the second, and two devices
 * would agree about a ship they disagree about.
 */
export const POD_KINDS: readonly PodKind[] = ["pod", "husk"];

/** `Pod.dueTicks` on a pod that owes no clock: the pods a boss hangs out or
 * throws on terms of its own (bait, a bead, a plate). */
export const NO_DUE = -1;

/**
 * A supply pod. It is not a creature: it does not live, does not travel of its
 * own accord and is never a target that must be cleared. It hangs where it was
 * left until a shot knocks it loose, and then falls like a burning wreck —
 * which is the only reason its position is not a plain row and column.
 *
 * Both coordinates are in thousandths of a tile, counted the way the grid is:
 * `colMilli` from the left edge, `rowMilli` down from the top.
 */
export interface Pod {
  id: number;
  colMilli: number;
  rowMilli: number;
  /**
   * Sideways travel per tick, in thousandths, signed. Zero while it is moored;
   * drawn from the seeded rng the moment a shot frees it, because which way a
   * wreck falls away is the one thing neither player may know in advance
   * (docs/spec/structure.md).
   */
  driftMilli: number;
  /** False while it hangs, true once it is falling. */
  loose: boolean;
  /** Real or hollow (`PodKind`). Authored, never random. */
  kind: PodKind;
  /**
   * **Ticks left on its clock**, counted down by `advancePods` from the beat
   * it appears. On the tick it reaches nought with a real pod still on the
   * field the wave is lost, exactly as if it had broken on the skin; a husk
   * that reaches nought is refused, and costs nothing. `NO_DUE` on a pod with
   * no clock.
   *
   * Ticks *left* rather than a tick it falls due, because `world.tick` is not
   * monotonic (`CLAUDE.md`) and a countdown carries nothing that a restart
   * could leave pointing at the wrong moment.
   */
  dueTicks: number;
  /**
   * How fast it crosses the field while it is still moored, in thousandths of
   * a tile per tick, signed — negative leftwards. Nought is a pod that hangs
   * where the wave left it, which is every pod authored before THE CLAW.
   *
   * It is separate from `driftMilli` rather than reusing it because the two
   * are different facts about different halves of a pod's life: this is how it
   * *arrives*, authored and constant, and that is how it *falls*, drawn from
   * the rng at the moment a shot frees it and zeroed again as it homes. One
   * field carrying both would be cleared by the homing and the pod would stop
   * crossing halfway along a row nobody had reached yet.
   */
  crossMilli: number;
  /** Strung with the other roe pods in its column (`PodEntry.roe`). Absent on
   * a pod on its own, which is every pod a boss or a body hangs. */
  roe?: true;
  /** The one colour of shot that frees it (`PodEntry.tint`); the other bounces
   * off. Absent on a pod any shot frees. */
  tint?: Color;
  /** Falls straight and takes two presses (`PodEntry.heavy`). */
  heavy?: true;
  /**
   * **Ticks left in the maw's grip**, on a heavy pod the first press has
   * caught at the hull: it sits in the mouth until a second press takes it, or
   * until this reaches nought and it is lost (`pod-options.ts`). Ticks *left*
   * for `dueTicks`' reason. Absent on every pod not in the maw.
   */
  gripTicks?: number;
  /**
   * Where it swings from, in thousandths of a column, on a pod hung on a
   * thread (`PodEntry.swing`): it crosses one column either side of this while
   * it hangs, at `crossMilli`, turning at each end, and is let go in the way it
   * was swinging. Absent on a pod that hangs still.
   */
  swingMilli?: number;
}
