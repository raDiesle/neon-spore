import type { VeilMassDraw } from "./veil-look.js";
import { VEIL_FLATTEN } from "./veil-shape.js";

/**
 * THE VEIL's cloud, filled: what a thunderhead is made of between its rim and
 * its lightning.
 *
 * Cut out of `veil.ts` when the fill went through a record, for
 * `magnet-look.ts`'s reason — `veil-look.ts` needs the paint and `veil.ts`
 * needs the record. Nothing about the paint moved: the same two stops, the same
 * axis and the same two alphas the cloud has always been filled with.
 */

/**
 * A vertical gradient over the contour — a cloud is lit from above and heavy
 * underneath, and the dark underside is what makes it read as weather instead
 * of as a grey blob.
 *
 * See-through on player 1's screen and nowhere else. Well short of half, so the
 * colour underneath is unambiguous — the pilot has to be able to say "cyan"
 * without leaning in — and well short of nothing, so the cloud is still plainly
 * the thing they are looking at.
 */
export function overcast(d: VeilMassDraw): void {
  const { ctx, r } = d;
  const g = ctx.createLinearGradient(0, -r * 0.85, 0, r * VEIL_FLATTEN);
  g.addColorStop(0, d.top);
  g.addColorStop(1, d.bottom);
  ctx.save();
  ctx.globalAlpha = d.seeThrough ? 0.66 : 1;
  ctx.fillStyle = g;
  ctx.fill(d.path, "nonzero");
  ctx.restore();
}
