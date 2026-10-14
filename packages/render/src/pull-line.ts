import type { Point } from "@neon-spore/content";
import { PULL_TRACK_W, type PullTrack } from "./pull-track.js";

/**
 * **A pull measured as a distance, as a straight channel** — the track
 * builder THE WARDEN's rope, THE LID's cord, THE STARE's lid and THE
 * CURTAIN's hem share, so the four draw one rule rather than four
 * (`pull-track.ts` draws what this returns).
 *
 * The channel starts where the hand takes hold and is the pull's full length
 * long, and lies the one way the pull runs (`way`). Every handle runs one
 * fixed path now (`sim/handle-pull.ts`), so the channel never turns to follow
 * the hand: across it is nothing, and the picture must not say otherwise.
 */

/** A direction, as a unit vector in field pixels. */
export interface PullWay {
  readonly dx: number;
  readonly dy: number;
}

export const PULL_DOWN: PullWay = { dx: 0, dy: 1 };
export const PULL_UP: PullWay = { dx: 0, dy: -1 };

export interface StraightPull {
  /** Where the hand takes hold, and the knob's radius there. */
  readonly from: Point;
  readonly r: number;
  /** The one way the pull runs. */
  readonly way: PullWay;
  /** The whole of the travel, in pixels. */
  readonly len: number;
}

export function straightPullTrack(p: StraightPull): PullTrack {
  const { dx, dy } = p.way;
  return {
    pts: [
      { x: p.from.x, y: p.from.y },
      { x: p.from.x + dx * p.len, y: p.from.y + dy * p.len },
    ],
    w: p.r * PULL_TRACK_W,
  };
}
