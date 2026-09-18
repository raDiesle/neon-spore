import { balloonHandleCircle, balloonHandleSeat } from "./balloon-handles.js";
import { choirArrowCircle, showsChoirArrows } from "./choir-arrows.js";
import { hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";

/**
 * **The two handles that come in pairs** — THE CHOIR's arrows against the two
 * walls, and THE BALLOON's two sides — split off `handles.ts` when THE BATON's
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

/**
 * THE CHOIR's two arrows, and only the pilot's for the fourth time and the
 * same reason: player 2 is the seat that fires and carries both colours, so a
 * membrane either of them could open would be a creature one phone could play.
 *
 * The **last** handle asked, and the ordering is deliberate. These two sit
 * against the walls of the field, where nothing else in the game is drawn and
 * where a body could still be falling behind one — so a thumb that finds an
 * arrow was reaching for an arrow, and a thumb that misses one falls through
 * to whatever is behind it exactly as it would if no membrane were up.
 *
 * Their resting circle *is* their grab circle: an arrow does not travel, it is
 * a switch a hand throws, and the whole gesture is how far the hand has come
 * from where it took hold (`choirArrowHeard`).
 *
 * `showsChoirArrows` is the one gate, shared with the drawing, so an arrow
 * can never be answered where none was drawn.
 */
export function choirArrowUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  if (field.seat !== 1 || !showsChoirArrows(l, field.creatures)) return null;
  for (const side of [-1, 1] as const) {
    if (!hitCircle(choirArrowCircle(l, side), x, y)) continue;
    const target = side === -1 ? "choirLeft" : "choirRight";
    return {
      player: 1,
      command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
      hold: { kind: "drag", target, player: 1, originX: x, originY: y },
    };
  }
  return null;
}
