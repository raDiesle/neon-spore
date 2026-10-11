import type { Point } from "@neon-spore/content";
import type { PullAfter } from "@neon-spore/render";
import { clamp01 } from "./noise.js";

/**
 * **Where a GOO pull is in its story**, read the same way by the channel and
 * the drop from what the PULL LAB tells a look (`PullAfter`) — and **who
 * draws the drop**: the knob while it waits and is held, the ending once it
 * is counted, the failure once it is refused.
 *
 * A count is never carried home. The owner, 10 October 2026: *in game, after
 * pull we usually never move the pulled circle back to original position* —
 * so an ending is a quick removal where the drop was counted, whether the
 * hand is still on it or not, and a fresh drop comes in at the start once the
 * hand is off — while the old one is still going, so the path comes in early
 * (the owner, the same day: *the entering path animation must come earlier*).
 */

/** Seconds a count's ending lasts: FIZZ, from the count to nothing left. */
export const ENDING = 0.75;
/** Seconds after a count a fresh drop may start to come in, the hand being off. */
export const FRESH_AFTER = 0.45;
/** Seconds a fresh drop takes to grow at the start (`enter.ts` has the rest). */
export const SPAWN = 0.35;
/** A failure: seconds it shudders where it was let go, is carried home, and settles. */
export const FAIL_HOLD = 0.2;
export const FAIL_BACK = 0.45;
export const FAIL_SETTLE = 0.5;

export type Owner = "knob" | "ending" | "failure";

export interface GooMoment {
  readonly held: boolean;
  readonly time: number;
  readonly owner: Owner;
  /** Seconds since the verdict, kept after it stops being shown. */
  readonly age: number;
  /** Seconds since a fresh drop began to well up at the start: once the ending
   * is over and the hand is off — `null` before. */
  readonly fresh: number | null;
  /** Where the drop was when the verdict was given: along the track, and off it. */
  readonly from: { readonly at: number; readonly off: Point };
  /** The hand's offset off the path, the tolerance either side, and how near the
   * drop's rim is to the edge of it, 0..1 (1 touching), while it is held. */
  readonly off: Point;
  readonly reach: number | null;
  readonly near: number;
  /** Seconds since the drop was taken, and since it was let go; long ago when the lab
   * does not say. */
  readonly grabbed: number;
  readonly lifted: number;
  /** Seconds since a drop came in at the start — a fresh one after a count, or the
   * first one on the field — and the path with it (`enter.ts`); long ago otherwise. */
  readonly enter: number;
}

export function momentOf(
  held: boolean,
  time: number,
  after: PullAfter | undefined,
  r: number,
): GooMoment {
  const age = after?.age ?? after?.since ?? 0;
  const off = after?.off ?? { x: 0, y: 0 };
  const reach = after?.reach ?? null;
  const settled = (after?.rested ?? 1) > 0;
  const last = after?.last ?? null;
  const lifted = after?.lifted ?? 0;
  const fresh = last === "counted" && !held ? Math.min(lifted, age - FRESH_AFTER) : null;
  let owner: Owner = "knob";
  // The ending keeps the drop until the fresh one has welled up and the knob is home under it.
  if (last === "counted" && !(settled && fresh !== null && fresh >= SPAWN)) owner = "ending";
  if (last === "refused" && !held && !(settled && age >= FAIL_HOLD + FAIL_BACK + FAIL_SETTLE))
    owner = "failure";
  const gap = reach === null ? Number.POSITIVE_INFINITY : reach - Math.hypot(off.x, off.y);
  return {
    held,
    time,
    owner,
    age,
    fresh: fresh === null || fresh < 0 ? null : fresh,
    from: after?.from ?? { at: 0, off: { x: 0, y: 0 } },
    off,
    reach,
    near: held ? clamp01(1 - gap / (r * 0.5)) : 0,
    grabbed: after?.grabbed ?? 9,
    lifted: after?.lifted ?? 9,
    enter: fresh !== null ? Math.max(0, fresh) : last === null ? (after?.born ?? 9) : 9,
  };
}
