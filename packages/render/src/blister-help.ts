import { blisterIsUp, blisterLeft, blisterMayTap, type World } from "@neon-spore/sim";
import { blisterRise } from "./blister.js";
import { flatCenter, flatRadius } from "./creature-place.js";
import { drawInstarGlyph } from "./instar-glyphs.js";
import { type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkWait } from "./mark-feedback.js";
import { PALETTE } from "./palette.js";
import { drawFuseRing } from "./pip-ring.js";

/**
 * **THE BLISTER's help for TAP**, called and not drawn anew
 * (`docs/controls-catalogue.md`): the same pieces every mark in the game
 * wears, laid over and round a body that is up.
 *
 * - On the seat that may knock it down: `drawMarkHalo` inside the body, the
 *   tap's flaring dots (`drawInstarGlyph`) over it, and one pip round it for
 *   each blow still owed (`pip-ring.ts`, THE MINE's ring).
 * - On the seat that may not: the waiting clock over it (`drawMarkWait`) and
 *   the same pips — never the gesture, which reads as *your next move*
 *   (`mark-feedback.ts`). How many are left is no secret; the seat with the
 *   hand counts them off and the other is better for hearing it.
 * - The verdict on each blow is a transient and is `blister-verdicts.ts`'.
 *
 * Flat, after every body, outside the perspective transform — the tap's
 * reach is hit-tested at `flatCenter` and `flatRadius` (`blister-tap.ts`), so
 * the help is drawn on the circle the thumb is answered on. It fades in and
 * out with the body coming up and going down (`blisterRise`), and **it never
 * changes the body's shape**: everything here sits on top of the contour.
 */
export function drawBlisterHelp(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  for (const c of world.creatures) {
    if (!blisterIsUp(c)) continue;
    const h = blisterRise(world.cfg, c, beatPhase);
    if (h <= 0) continue;
    const { x, y } = flatCenter(l, c, beatPhase);
    const r = flatRadius(l, world.cfg, c, beatPhase);
    const left = blisterLeft(world.cfg, c);
    const mine = l.role === "test" || blisterMayTap(c, seatOf(l.role));
    ctx.save();
    ctx.globalAlpha *= h;
    if (mine) {
      drawMarkHalo(ctx, x, y, r, time);
      ctx.strokeStyle = PALETTE.text;
      ctx.fillStyle = PALETTE.text;
      drawInstarGlyph(ctx, "tap", x, y, r, time);
    } else {
      drawMarkWait(ctx, x, y, r, time);
    }
    drawFuseRing(ctx, x, y, r * 1.45, { left, full: left }, c.color, time);
    ctx.restore();
  }
}
