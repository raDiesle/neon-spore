import { blisterIsUp, blisterMayTap } from "@neon-spore/sim";
import { flatCenter, flatRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";

/**
 * **A tap on THE BLISTER**, answered only where the simulation would count it:
 * on a blister that is up, from a seat its `by` allows (`blisterMayTap`).
 *
 * The soundbox's arrangement (`beatbox-tap.ts`) and its reason: a press
 * answered here and refused by `blisterTapped` would be a control that looks
 * live and does nothing. A blister under its pore is nothing to press, so a
 * finger there falls through to whatever else the field answers. A blister
 * refuses a hand (`sim/grippable.ts`), so `creatureAt` never finds one and
 * this is the only test that does.
 */

/** The grip's own reach, for the soundbox's reason (`beatbox-tap.ts`). */
const REACH_MUL = 1.6;

export function blisterUnder(l: Layout, field: Field, x: number, y: number): Touch | null {
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of field.creatures) {
    if (!blisterIsUp(c) || !blisterMayTap(c, field.seat)) continue;
    const { x: cx, y: cy } = flatCenter(l, c, field.beatPhase);
    const reach = flatRadius(l, field.cfg, c, field.beatPhase) * REACH_MUL;
    const d = Math.hypot(x - cx, y - cy);
    if (d > reach || d >= bestDist) continue;
    best = c.id;
    bestDist = d;
  }
  if (best === null) return null;
  return { player: field.seat, command: { kind: "tap", id: best }, hold: null };
}
