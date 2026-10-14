import { type World, wellBoss, wellHeldNow } from "@neon-spore/sim";
import { cueFrame } from "./boss-cue-frame.js";
import { holdDropR } from "./cue-helper.js";
import type { Layout } from "./layout.js";
import { drawSoakHold } from "./soak-hold.js";
import { wellAngle, wellAt, wellHub, wellRim, wellSectorAngle, wellShown } from "./well.js";

/**
 * **THE WELL's hold, on the seam**: the HOLD LAB's drop in the middle of the
 * empty sector while the face slips — the owner, 13 October 2026, every hold
 * the drop. The seam is the handle (`touch-well.ts`, `sim/well-hand.ts`), and
 * until this it was a hold with nothing on it to say so but the two walls.
 *
 * Only while the face slips: that is when a thumb there is a hold. Stopped at
 * the far end the same press is the wind, a turn, and the drop is gone; at
 * rest nothing is asked. Sunk while his thumb is on the seam, and its water is
 * the hold he has spent this cycle, `heldBeats` of `wellHoldBeats` — the budget
 * running out is the drop filling. The pilot's screen only, the one the well
 * is drawn on (`wellShown`).
 *
 * Its own size is the cue's (`holdDropR`), kept inside the sector at the
 * radius it stands at, so the drop never crosses a wall.
 */

/** How much of the sector's width at its middle the drop may take. */
const ROOM = 0.7;

export function drawWellSeamHold(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  const b = wellBoss(world);
  if (b === null || b.phase !== "rolling" || !wellShown(l, world)) return;
  const radius = (wellHub(l) + wellRim(l)) / 2;
  const at = wellAt(l, wellAngle(l, -1), radius);
  const room = radius * Math.sin(wellSectorAngle(l) / 2) * ROOM;
  const r = Math.min(holdDropR(cueFrame(l)), room);
  const fill = Math.min(1, b.heldBeats / Math.max(1, world.cfg.wellHoldBeats));
  drawSoakHold(ctx, at, r, { time, held: wellHeldNow(b), fill });
}
