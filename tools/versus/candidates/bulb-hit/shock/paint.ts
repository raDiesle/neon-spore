import type { Strike } from "../../../../../packages/render/src/body-hit.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";

/**
 * SHOCK — the body takes the hit before it goes.
 *
 * The other two answers start with the case already failing. This one spends
 * its first tenth of a second on the **impact**: the bolt came up the column
 * and struck the body from below, so the contour is drawn squashed — pressed
 * flat against the blow, wide and short, its bottom driven up — and then it
 * rebounds past its own shape, tall and narrow, and on that rebound it lets
 * go. What comes out of it is pressure: two rings of the body's cyan leave
 * the point of impact at the bottom of the contour and run down the column
 * to the ship, the first bright and thin and the second broad and faint,
 * held to the width of the lane so they read as a wave down the column and
 * not a hoop drawn over the neighbours'. Behind the rings the body is a haze — the contour filled at a fraction
 * and blown outward, thinning to nothing by the middle of the strike.
 *
 * What it leaves is on the ship: the first ring reaches the skin line, and
 * where it does, the hull under the column is lit for the rest of the strike
 * — a low arc of the body's rim colour on the ship's own surface, fading — so
 * the impact is seen to have gone somewhere.
 *
 * Every colour is the body's cyan or its rim, which is the shot's. The squash
 * is a **pose** and says so: the contour is scaled about its own base, and
 * nothing on its surface is asked to turn.
 *
 * **How it can lose.** *A squash is a body still there.* For a tenth of a
 * second the whole contour is on screen, filled, and it moves. That tenth is
 * the point: the pair should see the shot *land*, and nothing else in the
 * game shows a hit as a blow rather than a burst. If at 26 px the squash
 * reads as the bulb dodging or shrinking rather than being struck, this loses
 * — and the rings alone would not be a candidate.
 */

/** How long the impact — squash and rebound — takes, in seconds. */
const IMPACT = 0.12;
/** How flat the body is pressed at the blow, and how far past its shape it
 * rebounds, as scale factors on height. */
const SQUASH = 0.55;
const REBOUND = 1.25;
/** How far a ring may reach sideways, in tiles: the wave runs down the
 * column to the ship and stays in the column, because two people are
 * reading the lanes beside it. */
const SIDE = 1.1;

function contour(ctx: CanvasRenderingContext2D, s: Strike, sx: number, sy: number): void {
  ctx.beginPath();
  for (let i = 0; i < s.outline.length; i++) {
    const p = s.outline[i] as { x: number; y: number };
    // Scaled about the base of the body, where the blow landed: the bottom
    // stays put and the top is what moves.
    const x = p.x * sx;
    const y = (p.y - s.ry) * sy + s.ry;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function shock(ctx: CanvasRenderingContext2D, s: Strike): void {
  const r = Math.max(s.rx, s.ry);

  if (s.age < IMPACT) {
    // The blow: flat first, then past its own shape.
    const c = s.age / IMPACT;
    const sy =
      c < 0.5 ? 1 - (1 - SQUASH) * (c / 0.5) : SQUASH + (REBOUND - SQUASH) * ((c - 0.5) / 0.5);
    const sx = 1 / Math.sqrt(sy);
    contour(ctx, s, sx, sy);
    ctx.fillStyle = mixHex(s.hex, s.rim, c);
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, r * 0.18);
    ctx.strokeStyle = mixHex(s.rim, "#FFFFFF", c * 0.7);
    ctx.stroke();
    return;
  }

  // After the rebound: the haze the body became, blown outward and thinning.
  const a = (s.age - IMPACT) / (s.life - IMPACT);
  if (a < 0.5) {
    const blow = 1 + 0.9 * a;
    contour(ctx, s, blow, blow * REBOUND);
    ctx.fillStyle = rgba(s.hex, 0.45 * (1 - a * 2));
    ctx.fill();
  }

  // The pressure: two rings leaving the point of impact and running down to
  // the ship, wider than tall, the first bright and thin and the second broad
  // and faint. The first is sized to arrive at the skin exactly.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const base = s.ry;
  const drop = s.floor - base;
  let arrived = 0;
  for (const [delay, width, alpha, share] of [
    [0, 0.14, 0.95, 1],
    [0.15, 0.4, 0.4, 0.7],
  ] as const) {
    const c = Math.max(0, (a - delay) / (1 - delay));
    if (c <= 0) continue;
    const v = drop * share * (1 - (1 - c) * (1 - c));
    if (share === 1) arrived = Math.max(0, (v - drop * 0.8) / (drop * 0.2));
    ctx.lineWidth = Math.max(0.5, r * width * (1 - c * 0.6));
    ctx.strokeStyle = rgba(s.rim, alpha * (1 - c) * (1 - c * 0.5));
    ctx.beginPath();
    ctx.ellipse(
      0,
      base,
      Math.max(1, Math.min(v, s.tile * SIDE)),
      Math.max(1, v),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();

  // What it leaves: where the first ring reached the ship, the hull is lit.
  if (arrived > 0) {
    const fade = 1 - Math.max(0, (a - 0.7) / 0.3);
    const w = s.rx * (1.6 + 1.4 * arrived);
    ctx.lineWidth = Math.max(1.5, r * 0.16);
    ctx.strokeStyle = rgba(s.rim, 0.9 * arrived * fade);
    ctx.beginPath();
    ctx.ellipse(0, s.floor - s.ry * 0.1, w, Math.max(1, s.ry * 0.3), 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
