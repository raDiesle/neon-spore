import type { Point } from "@neon-spore/content";
import type { PullAfter } from "@neon-spore/render";
import { clamp01 } from "./noise.js";

/**
 * **Where a GOO pull is in its story**, read the same way by the channel and
 * the drop from what the PULL LAB tells a look (`PullAfter`) — and **who
 * draws the drop**: the knob while it waits and is held, the ending once it
 * is counted, the failure once it is refused. Both play the one drop the hand
 * had, from where the hand left it, all the way back to its start: the owner,
 * 10 October 2026, on the first endings — *it does not look connected, like
 * first ball disappears and a new one approaches*.
 */

/** Seconds a count's ending takes to arrive in the place, the hand still on it. */
export const ARRIVE = 0.45;
/** Seconds an ending takes from the lift to the drop at its start again. */
export const RETURN = 0.9;
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
  /** Seconds the ending has been on its way back since the lift and the arrival
   * were both done — `null` while the hand still holds it. */
  readonly back: number | null;
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
  // A lift before the arrival is done waits for it; the way back starts once it is.
  const back = held ? null : lifted - Math.max(0, ARRIVE - (age - lifted));
  let owner: Owner = "knob";
  if (last === "counted" && !(settled && (back ?? 0) >= RETURN)) owner = "ending";
  if (last === "refused" && !held && !(settled && age >= FAIL_HOLD + FAIL_BACK + FAIL_SETTLE))
    owner = "failure";
  const gap = reach === null ? Number.POSITIVE_INFINITY : reach - Math.hypot(off.x, off.y);
  return {
    held,
    time,
    owner,
    age,
    back: back === null ? null : Math.max(0, back),
    from: after?.from ?? { at: 0, off: { x: 0, y: 0 } },
    off,
    reach,
    near: held ? clamp01(1 - gap / (r * 0.5)) : 0,
  };
}
