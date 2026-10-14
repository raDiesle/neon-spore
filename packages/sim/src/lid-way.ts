import type { SimConfig } from "./config.js";
import { handleBoundsMilli } from "./handle-pull.js";
import { cordRest, lidSide } from "./lid.js";
import type { Creature } from "./types.js";

/**
 * **The one path THE LID's cord runs**, chosen by the simulation at the grab.
 * The owner, 13 October 2026: a fixed path, as THE WARDEN's rope has had
 * since the 10th — and the lane's (b), so a low lid can still be opened.
 *
 * A way is one of four, and the code says which absolutely rather than
 * relative to the body, so the stored pull needs nothing else to be a
 * direction: `LID_DOWN`, `LID_RIGHT`, `LID_LEFT`, `LID_UP`. The cord tries
 * them in the order the channel always has: **down**, then **across toward
 * the middle** (the side the cord hangs on, `lidSide`), then **across the
 * other way**, then **up** — the first the field holds the whole of
 * `lidTautMilli` of, straight, from where the cord rests; and when none does,
 * the one with the most room. Only travel along it counts (`lidHeard`).
 *
 * Here and not in render, because which way a hand has to go decides whether
 * the plates part: two phones that chose differently would disagree about
 * whether a shot landed. Render draws the channel along it
 * (`render/lid-track.ts`); the autopilot pulls along it.
 */

export const LID_DOWN = 0;
export const LID_RIGHT = 1;
export const LID_LEFT = 2;
export const LID_UP = 3;

const VEC: readonly { dx: number; dy: number }[] = [
  { dx: 0, dy: 1 },
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: -1 },
];

/** The unit step of way `w`, x across and y down the field. */
export function lidWayVec(w: number): { dx: number; dy: number } {
  return VEC[w] ?? { dx: 0, dy: 1 };
}

/**
 * How far the handle can go along way `w` from where the cord rests today
 * before its circle meets the field's edge or the app's chrome — the bounds
 * `handleBoundsMilli` keeps every handle inside — in thousandths of a tile.
 * Nought, never less, for a rest already past the bound that way.
 */
export function lidWayRoom(cfg: SimConfig, c: Creature, w: number): number {
  const rest = cordRest(cfg, c);
  const b = handleBoundsMilli(cfg);
  const room = [b.y1 - rest.y, b.x1 - rest.x, rest.x - b.x0, rest.y - b.y0][w] ?? 0;
  return Math.max(0, room);
}

/** The way a grab on this cord would take now: the first with room for the whole cord, else the roomiest. */
export function lidFittingWay(cfg: SimConfig, c: Creature): number {
  const inward = lidSide(cfg, c) > 0 ? LID_RIGHT : LID_LEFT;
  const order = [LID_DOWN, inward, inward === LID_RIGHT ? LID_LEFT : LID_RIGHT, LID_UP];
  let best = LID_DOWN;
  let bestRoom = -1;
  for (const w of order) {
    const room = lidWayRoom(cfg, c, w);
    if (room >= cfg.lidTautMilli) return w;
    if (room > bestRoom) {
      best = w;
      bestRoom = room;
    }
  }
  return best;
}

/** The way this cord runs: the one its hand took at the grab, or the one a grab would take now. */
export function lidWayNow(cfg: SimConfig, c: Creature): number {
  return c.lidWay ?? lidFittingWay(cfg, c);
}
