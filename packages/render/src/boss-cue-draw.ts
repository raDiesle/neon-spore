import type { World } from "@neon-spore/sim";
import { bossCue, bossCues } from "./boss-cue.js";
import { drawCueText } from "./boss-cue-text.js";
import { cueBoxed, cueDrawnAt, drawCueHelper, markIsHere } from "./cue-helper.js";
import { drawDeskChordRings, pointerSpeaksForBoth } from "./desk-chord-ring.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * **The cue this screen is owed, drawn**: the frame on the mark, and the two
 * lines beside it. The reading is `boss-cue.ts`, the two lines are
 * `boss-cue-text.ts`, and why any of it is on the field at all is
 * `docs/decisions.md` #34.
 *
 * What is left here is the **frame**, which is the one part a cue may go
 * without: `BossCue.framed` is `false` where the boss's own picture already
 * puts a box round the place, and a second box round one place is exactly the
 * four-pictures-for-one-idea mistake `target-lock.ts` records the owner ending.
 * THE SCUTTLE borrows the navigator's own lock; THE SINEW, THE SURGE and THE
 * ANTIPHON stand their words on a handle ring, which is a mark already.
 *
 * On a screen whose pointer speaks for both seats, every chord body asked for
 * is drawn first, as THE INSTAR's `HOLD BOTH` ring (`desk-chord-ring.ts`).
 */
export function drawBossCue(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
  /** The plating without the cannon on it, for the one boss whose marks stand
   * on lobes coming up through it (`undertow-lobe.ts`). */
  skinY: SurfaceY = () => l.hullY,
): void {
  if (pointerSpeaksForBoth(l.role))
    drawDeskChordRings(ctx, l, world.cfg, bossCues(l, world, beatPhase, skinY), time);
  const read = bossCue(l, world, beatPhase, skinY);
  if (read === null) return;
  // A shot is drawn on what it is for, not on the cannon (`cueDrawnAt`).
  const cue = cueDrawnAt(read, l.hullY);
  // Only where nothing already marks the place: `BossCue.framed` — and not
  // where a hold's circle or a rub's line stands on it, which is the frame
  // there (`cue-helper.ts`). A shot's box stands round its crosshair.
  if (cue.framed !== false && !markIsHere(cue) && cueBoxed(cue, l.hullY)) {
    drawTargetLock(ctx, cue.x, cue.y, cue.halfW, cue.halfH, PALETTE.rock, time, 0.85, cue.seed);
  }
  const muzzle = { x: tileCX(l, world.cannonCol), y: l.hullY };
  drawCueHelper(ctx, cue, l.hullY, time, seatSkin(l.role), muzzle);
  drawCueText(ctx, cue, time, l.width);
}
