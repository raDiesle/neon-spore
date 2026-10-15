import { blisterPlaceRow } from "./blister.js";
import { minePlaceRow } from "./mine.js";
import type { SpawnEntry, World } from "./world.js";

/**
 * **The row an arrival comes up on inside the field**, for the two that do not
 * come in at the top or over a wall: a mine, which is already standing on its
 * authored tile, and a blister, whose first pore is its authored row pulled
 * clear of the hull. `undefined` for everything else.
 *
 * One answer for two askers: `spawn.ts` puts the body there, and the warning
 * strip (`render/radar-blip.ts`) marks the row on the wall beside it, so the
 * strip's column and the wall's row cross where it appears (the owner, 15
 * October 2026). A mine's row is asked of the world as it stands — the mines
 * already on the field are what move it — so a warning read a few beats early
 * is the answer as of now.
 */
export function fieldRowFor(world: World, entry: SpawnEntry, col: number): number | undefined {
  if (entry.kind === "mine") return minePlaceRow(world, col, entry.row);
  if (entry.kind === "blister") return blisterPlaceRow(world.cfg, entry.row);
  return undefined;
}
