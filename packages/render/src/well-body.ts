import { bodyCenterCol, type Creature, hullRow, type SimConfig } from "@neon-spore/sim";
import { drawnCol, drawnRow } from "./depth.js";
import type { Layout } from "./layout.js";
import { wellPlace } from "./well.js";

/**
 * Where a body stands on THE WELL — **the one spelling of the well's
 * placement**, in a file of its own so that `creature-place.ts` can read it.
 *
 * It was `well-draw.ts`'s until 13 September 2026, and `creatureCenter` could
 * not reach it there: that file draws every body through `bodyDraw`, which
 * reaches `creature-place.ts` in turn, so the one function the flat placement
 * needed from the well sat behind an import loop. `drawWellBodies` draws by
 * it, a caption finds its subject by it (`caption-anchor.ts`), a finger on the
 * picture is answered by it (`touch-well.ts`) and every mark drawn around a
 * body asks it through `creatureCenter`: a second spelling in any of them is a
 * ring or a grab beside the shape instead of on it.
 */

/** How far a body is allowed to be drawn outside the rim, in rows, before the
 * well stops drawing it: an arrival glides in from above row nought and would
 * otherwise be placed *outside* its own clock. */
const ABOVE_RIM = 0;

/**
 * Where a body stands on the well and the row it stands at. The row is clamped
 * the way the flat field never needs — nothing is drawn past the hub or above
 * the rim — and handed back because the body's size is read off it.
 */
export function wellBodyAt(
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  glide: number,
): { x: number; y: number; row: number } {
  const row = Math.min(hullRow(cfg), Math.max(ABOVE_RIM, drawnRow(c, glide)));
  const at = wellPlace(l, bodyCenterCol(c, drawnCol(c, glide)), row);
  return { x: at.x, y: at.y, row };
}
