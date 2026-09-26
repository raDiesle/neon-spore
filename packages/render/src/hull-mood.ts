import type { EggFlare } from "./egg-skin.js";
import type { HarpoonDanger } from "./harpoon-danger.js";
import type { ShieldSegment } from "./shield.js";

/**
 * What the ship is doing this frame, as `hull-frame.ts` reads it: where its
 * lobes stand and how its membrane is behaving. Two interfaces and their
 * reasons, kept apart from the geometry that consumes them so each file
 * stays under the limit; `hull-frame.ts` re-exports both, and every reader
 * of the ship's state imports them from there.
 */

/**
 * Where the lobes are, in columns. Fractional: the world moves them a whole
 * column at a time and render/ carries the eye across — `Glide` for the
 * cannon, a chain of them for the shield (`ShieldBody`).
 */
export interface LobePositions {
  cannon: number;
  /** The shield's body, head first. Each segment is its own bump. */
  shield: readonly ShieldSegment[];
}

/**
 * The ship's transient state, all of it eased and none of it in the world.
 * One object rather than four arguments, because every one of them is the
 * same kind of thing: how the membrane is behaving this frame.
 */
export interface HullMood {
  /** 0..1 towards the shield held open. */
  armed: number;
  /**
   * 0..1 while a clasp is standing in the shield's own column: the ship's
   * half of the link, drawn as arcs off the shield's rim (`resonantLook` in
   * `shield-spark.ts`).
   *
   * It sits beside `armed` and is a different question. `armed` is *this
   * player pressed the trigger*; this is *there is something up the field
   * that your shield can open*, which is true whether or not anybody has
   * pressed anything, and is the only prompt either player gets that the two
   * of them are lined up on the same column.
   */
  resonance?: number;
  /**
   * 0..1 while the rim is red after the shield pushed a creature back up —
   * the right save made the wrong way (`shield-push-fx.ts`). Eased by the
   * renderer's own clock, like `armed`, and absent on a ship with no shield.
   */
  wrong?: number;
  /** 0..1 towards the cannon lobe turned inside out — the maw. */
  intake: number;
  /** 0..1 while the skin around the maw comes apart over a pod. */
  chew: number;
  /** 0..1 the light that goes through the ship once the pod is inside. */
  charge: number;
  /**
   * The laying phase, 0 → 2 (`cannon-maw.ts`'s `LayState`, which defines it).
   *
   * Its first half — 0..1, towards the shot that has been pressed leaving the
   * muzzle — is the one field here that is *not* eased and not this package's
   * invention: the world fixes the tick the shot goes, to the tick, on both
   * devices, so easing it would put the two cannons out of step with each
   * other. Its second half, 1..2, is the opposite kind of thing and is here
   * only because there was nowhere else to put it: the world stops saying
   * anything the moment the shot leaves, so the mouth's follow-through is the
   * renderer's, out of `Effects`. Absent on a ship with no trigger of its own
   * — THE MIRROR's copy performs shots rather than firing them.
   */
  lay?: number;
  /**
   * The release burn — how hot the cannon's mouth is still glowing, and in
   * which ammunition colour (`egg-skin.ts`'s `EggFlare`).
   *
   * It is a separate field rather than part of `lay` because it is a separate
   * clock: the body goes slack over six tenths of a beat and the colour has to
   * stay legible for longer than that. Absent on a ship that has not fired,
   * and on THE MIRROR's copy, which performs shots rather than firing them.
   */
  layFlare?: EggFlare;
  /**
   * How near each control is to losing the round under a harpoon, nought to
   * one, or absent when no such fault is in force (`harpoon-danger.ts`).
   *
   * It sits here with `armed` and `intake` and is the odd one out among them:
   * every other field is eased by the renderer and this one is read straight
   * off the world. That is deliberate and it is `lay`'s own argument — the
   * tick the count runs out is fixed for both devices, and a glow this file
   * eased would have one phone's cannon already white while the other's was
   * still coming up to it. The restart on a move is the simulation's too: the
   * number goes to nought on the tick the count is cleared, because it is that
   * count (`sim/harpoon.ts`).
   */
  danger?: HarpoonDanger;
}
