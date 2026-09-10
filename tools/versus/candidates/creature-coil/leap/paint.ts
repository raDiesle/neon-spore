import { drawBolt } from "../../../../../packages/render/src/bolt.js";
import type { ChargeDraw } from "../../../../../packages/render/src/coil-look.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * LEAP — the charge is a thing that jumps, not a line that grows.
 *
 * **The charge.** A ball of light thrown from the failed dome to the next one
 * on a bowed path — it rises off the straight line between the two and comes
 * down onto the dome it is aimed at, the way the owner said it: *bolts jump
 * from the removed dome shield object to the next one*. Behind the ball a
 * tail of five fading copies at the places it was a moment ago, so the eye
 * reads a body in motion rather than a light being slid. Nothing joins the
 * two domes for most of the flight; only in the last stretch does a short
 * bolt reach out of the ball and strike the rim it is about to land on, and
 * that is the frame the pilot is being asked to call.
 *
 * The bow leans *up*: a ball that dipped below the chord would be read as
 * falling, which every other thing on this field already is, and this is the
 * one light that is not.
 *
 * **How it can lose.** *A ball in the air is a shot.* The pair have watched
 * bullets cross this field all game; if the charge at speed reads as one of
 * theirs going sideways, the chain has become a coincidence again. The tail
 * and the bow are what argue against that — judge whether they are enough.
 */

/** How high the arc stands off the chord at its middle, in tiles. */
const BOW = 1.1;
/** Copies of the ball behind it, and how far back in the flight the last one
 * sits. */
const TAIL = 5;
const TAIL_BACK = 0.12;
/** The last share of the flight over which the bolt reaches ahead. */
const STRIKE = 0.22;
/** The ball's radius, in tiles, and the halo's reach as a multiple of it. */
const BALL = 0.14;
const HALO_MUL = 3.4;

/** Where the ball is at `s` along the flight, bowed up off the chord. */
function at(d: ChargeDraw, s: number): { x: number; y: number } {
  const { from, to, tile } = d;
  const lift = Math.sin(s * Math.PI) * BOW * tile;
  return { x: from.x + (to.x - from.x) * s, y: from.y + (to.y - from.y) * s - lift };
}

export function leap(d: ChargeDraw): void {
  const { ctx, to, t, age, tile, id } = d;
  const hot = PALETTE.shieldRim;
  const head = at(d, t);

  // The tail: where it was, fading back.
  for (let k = TAIL; k >= 1; k--) {
    const s = Math.max(0, t - (TAIL_BACK * k) / TAIL);
    const p = at(d, s);
    const fade = 1 - k / (TAIL + 1);
    ctx.save();
    ctx.globalAlpha = 0.5 * fade;
    ctx.fillStyle = rgba(hot, 0.9);
    ctx.beginPath();
    ctx.arc(p.x, p.y, tile * BALL * (0.4 + 0.6 * fade), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // The strike: in the last stretch a bolt reaches from the ball to the rim.
  if (t > 1 - STRIKE) {
    const reach = (t - (1 - STRIKE)) / STRIKE;
    const x1 = head.x + (to.x - head.x) * reach;
    const y1 = head.y + (to.y - head.y) * reach;
    const seed = Math.floor(age * 60) * 23 + id;
    drawBolt(ctx, head.x, head.y, x1, y1, tile, seed, 0.9, 1.4);
  }

  // The ball itself, brightening as it closes.
  halo(ctx, head.x, head.y, tile * BALL * HALO_MUL * (0.7 + 0.5 * t), hot, 0.4 + 0.4 * t);
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(head.x, head.y, tile * BALL, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
