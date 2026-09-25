import type { World } from "@neon-spore/sim";
import { bossCue } from "./boss-cue.js";
import { drawCueText } from "./boss-cue-text.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
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
  const cue = bossCue(l, world, beatPhase, skinY);
  if (cue === null) return;
  // Only where nothing already marks the place: `BossCue.framed`.
  if (cue.framed !== false) {
    drawTargetLock(ctx, cue.x, cue.y, cue.halfW, cue.halfH, PALETTE.rock, time, 0.85, cue.seed);
  }
  drawCueText(ctx, cue, time, l.width);
}
