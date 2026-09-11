import { bodyCenterCol, type Creature, gumIsStuck, spanOf } from "@neon-spore/sim";
import { flatSurface } from "./crawler-place.js";
import { type Circle, hitCircle, type Layout, tileCX } from "./layout.js";
import type { Field } from "./touch-field.js";
import type { Touch } from "./touch-hold.js";

/**
 * THE GUM as a handle: the one thing on this field a hand takes hold of that
 * is the whole body rather than a cord or a ring hanging off it, and the
 * second handle that is **player 2's** after THE BALLOON's right one.
 *
 * Its own file rather than a sixth function in `handles.ts`, which is at its
 * length, and along a seam that is true anyway: every handle there hangs off
 * something up the field, and this one lies on the ship — where the cannon and
 * the shield are also touched (`touch-ship.ts`). It is asked *before* the ship
 * is, with the rest of the handles, because a gum stuck over a lobe is on top
 * of it: a thumb on the smear is a thumb on the smear, and the ship under it
 * gets nothing, which is exactly the lane the gum has shut.
 *
 * The resting circle is on the flat hull line rather than the drawn membrane,
 * for the rule in `handles.ts` — a real finger is hit-tested against where a
 * thing rests, and by the time it has leaned the pointer is captured. As wide
 * as the smear and never narrower than a thumb, so a gum one lane wide is
 * still a thing a thumb can find.
 */
export function gumCircle(l: Layout, c: Creature): Circle {
  const tile = l.tile;
  return {
    x: tileCX(l, bodyCenterCol(c, c.col)),
    y: flatSurface(l)(0) - tile * 0.2,
    r: Math.max(tile * 0.7, (spanOf(c) * tile) / 2),
  };
}

/** The nearest stuck gum under the press, for player 2 and nobody else — the
 * seat is checked again where the message lands (`sim/gum.ts`). */
export function gumUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  if (field.seat !== 2) return null;
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of field.creatures) {
    if (!gumIsStuck(c)) continue;
    const circle = gumCircle(l, c);
    if (!hitCircle(circle, x, y)) continue;
    const d = Math.hypot(x - circle.x, y - circle.y);
    if (d >= bestDist) continue;
    best = c.id;
    bestDist = d;
  }
  if (best === null) return null;
  return {
    player: 2,
    command: { kind: "drag", target: "gum", on: true, fromMilli: 0, fromYMilli: 0, id: best },
    hold: { kind: "drag", target: "gum", player: 2, originX: x, originY: y, id: best },
  };
}
