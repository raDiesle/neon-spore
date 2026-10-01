import { type Layout, tileCX } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { lobeHeight } from "./undertow-shape.js";

/**
 * **A thumb on a tall lobe**, either seat's: the one handle THE UNDERTOW has
 * (`sim/undertow-press.ts` `undertowTapped`). There is no ring — the lobe
 * itself is what is pressed, as high as it is drawn and a shoulder either
 * side, so the press lands where the eye already is.
 *
 * Only a tall lobe answers. A standing one is the colour's to answer and a
 * bowing plate has nothing up yet, so a thumb there falls through to whatever
 * is behind it — the cannon strip, as often as not. The tap is a press with
 * no hold: the lift says nothing to the simulation.
 */

/** Half the tap's width round a lobe's column, in tiles: wider than the lobe, for a thumb. */
const TAP_HALF = 0.7;
/** How far below the skin the tap still reaches, in tiles. */
const TAP_BELOW = 0.4;

export function undertowTapUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const u = bossOf(field, "undertow");
  if (u === null) return null;
  // The nearest tall lobe wins a thumb that covers two, `lidCordUnder`'s rule.
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const b of u.lobes) {
    if (b.stage !== "tall") continue;
    const h = lobeHeight(field.cfg, u, b, field.beat, field.beatPhase);
    const cx = tileCX(l, b.col);
    const d = Math.abs(x - cx);
    if (d > TAP_HALF * l.tile || d >= bestDist) continue;
    if (y > l.hullY + TAP_BELOW * l.tile || y < l.hullY - h * l.tile) continue;
    best = b.col;
    bestDist = d;
  }
  if (best === null) return null;
  return {
    player: field.seat,
    command: {
      kind: "drag",
      target: "undertowTap",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: best,
    },
    hold: null,
  };
}
