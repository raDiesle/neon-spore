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
 * so an ending is a short green moment and a quick removal where the drop
 * was counted, whether the hand is still on it or not, and a fresh drop
 * wells up at the start once the hand is off and the old one is gone.
 */

/** Seconds a count's ending lasts: green, then gone from the place. */
export const ENDING = 0.95;
/** Of those, the seconds the green alone is shown before the drop starts to go. */
export const GREEN = 0.3;
/** Seconds a fresh drop takes to well up at the start. */
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
  const fresh = last === "counted" && !held ? Math.min(lifted, age - ENDING) : null;
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
  };
}
