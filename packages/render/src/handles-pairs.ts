import { balloonHandleCircle, balloonHandleSeat } from "./balloon-handles.js";
import { choirRubUnder } from "./choir-rub.js";
import { hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";

/**
 * **The two handles that come in pairs** — THE BALLOON's two sides, and THE
 * CHOIR's rub that both seats make together — split off `handles.ts` when THE BATON's
 * socket took that file over its limit, along the seam its own header drew:
 * everything left there is one handle in one place, and these are the two that
 * are a left and a right.
 *
 * The rules they are asked under, and the order they are asked in, are
 * `handles.ts`': a resting circle, the nearest of two overlapping, and a miss
 * that falls through to whatever is behind it.
 */

/**
 * THE BALLOON's handles, and the first on this field that are **not** the
 * pilot's — one each. Which side belongs to which seat is
 * `balloonHandleSeat`'s and is asked here rather than decided here, so the
 * circle a finger is answered at and the circle the picture draws are one
 * fact (`balloon-handles.ts`).
 *
 * The nearest wins when two overlap, which is `lidCordUnder`'s rule and
 * `creatureAt`'s before it: a thumb covers more than a handle, and the body a
 * player meant is the one they put their thumb closest to. It matters more
 * here than it ever has — a wave puts several of these up at once on purpose,
 * and grabbing the wrong one is grabbing a body the other seat is not on.
 */
export function balloonHandleUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const side = field.seat === 1 ? -1 : 1;
  if (balloonHandleSeat(side) !== field.seat) return null;
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of field.creatures) {
    if (c.kind !== "balloon") continue;
    const circle = balloonHandleCircle(l, field.cfg, c, field.beat, field.beatPhase, side);
    if (!hitCircle(circle, x, y)) continue;
    const d = Math.hypot(x - circle.x, y - circle.y);
    if (d >= bestDist) continue;
    best = c.id;
    bestDist = d;
  }
  if (best === null) return null;
  const target = side === -1 ? "balloonLeft" : "balloonRight";
  return {
    player: field.seat,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id: best },
    hold: { kind: "drag", target, player: field.seat, originX: x, originY: y, id: best },
  };
}

/** THE CHOIR's rub, in the middle of the field and both seats' — asked in the
 * slot its two arrows had, so a thumb that misses it falls through to
 * whatever is behind it (`choir-rub.ts`). Re-exported here so `handles.ts`
 * reads the pairs from one place. */
export { choirRubUnder };
