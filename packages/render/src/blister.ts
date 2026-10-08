import { blisterIsUp } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { flatRadius } from "./creature-place.js";
import { PALETTE } from "./palette.js";

/**
 * THE BLISTER, drawn at its plainest: a disc while it is up and nothing while
 * it is under (`sim/blister.ts`).
 *
 * **A placeholder, and named as one.** Its body, the pore it comes up from, the
 * bulge a beat before on the partner's screen and the tap help round it are
 * lane 2's (`docs/queue.md`, *THE BLISTER, lane 2*), which takes a shape from
 * the drafts rather than one the game already draws. Until then a disc says
 * *something is here and a tap reaches it* and nothing more — no colour, since
 * none of its own exists, and no contour, since `living-look.ts` answers
 * `null` for it.
 */
export function drawBlisterBody(b: Body): void {
  if (!blisterIsUp(b.c)) return;
  const r = flatRadius(b.l, b.world.cfg, b.c, b.beatPhase);
  const { ctx } = b;
  ctx.save();
  ctx.fillStyle = PALETTE.dim;
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.beginPath();
  ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
