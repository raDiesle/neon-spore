import { LIGHT_HALF } from "@neon-spore/content";
import type { PinballState } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { OWN_SKIN } from "./hull.js";
import { litBox } from "./key-light.js";
import { PALETTE, STROKE } from "./palette.js";
import { pinAt, type Table } from "./pinball-table.js";

/**
 * The bucket: **the ship, in another shape, with the cannon gone.**
 *
 * The round's own fiction says the hull folds into it, and the picture used to
 * disagree — a flat violet trapezoid with an amber bar across the mouth, which
 * is a hopper and not a ship. So it is drawn out of the hull's own recipe
 * instead: `OWN_SKIN`'s four-stop body ramp (dark where it is thick, bright at
 * the skin), the hull's rim glow on the silhouette, and `litBox` under the
 * same key light every body in this game is lit by. Nothing here names a
 * colour that is not the ship's.
 *
 * **What differs from the hull is the outline and only the outline.** No
 * cannon lobe, no muzzle, no shield rim: a bowl with two horns and a mouth
 * between them, which is the one thing the round asks it to be — a shape a
 * ball can leave and has to come back into.
 */

/** How far the horns stand above the mouth, in tiles. */
const HORN_TILES = 0.2;

/** The contour, and the box it lives in. Built once and used for four passes. */
function bucketPath(
  x: number,
  floorY: number,
  half: number,
  lip: number,
  horn: number,
): { path: Path2D; top: number } {
  const L = x - half;
  const R = x + half;
  const topY = floorY - lip - horn;
  const mouthY = floorY - lip;
  const d = new Path2D();
  d.moveTo(L, topY);
  // Down the outside of the left horn and round into the bowl.
  d.bezierCurveTo(
    L - half * 0.14,
    mouthY + lip * 0.55,
    x - half * 0.95,
    floorY - lip * 0.1,
    x - half * 0.5,
    floorY,
  );
  d.quadraticCurveTo(x, floorY + lip * 0.34, x + half * 0.5, floorY);
  d.bezierCurveTo(
    x + half * 0.95,
    floorY - lip * 0.1,
    R + half * 0.14,
    mouthY + lip * 0.55,
    R,
    topY,
  );
  // The mouth, hollowed between the horns rather than flat across them.
  d.bezierCurveTo(x + half * 0.52, topY + lip * 0.5, x - half * 0.52, topY + lip * 0.5, L, topY);
  d.closePath();
  return { path: d, top: topY };
}

export function drawPinBucket(
  ctx: CanvasRenderingContext2D,
  t: Table,
  state: PinballState,
  halfMilli: number,
  flash: number,
): void {
  const at = pinAt(t, state.bucketMilli, t.rows * 1000);
  const half = (halfMilli * t.tile) / 1000;
  const lip = half;
  const horn = t.tile * HORN_TILES;
  const { path, top } = bucketPath(at.x, at.y, half, lip, horn);
  const rim = flash > 0 ? PALETTE.red : OWN_SKIN.rim;
  const edge = flash > 0 ? PALETTE.redRim : OWN_SKIN.edge;

  halo(ctx, at.x, at.y - lip * 0.3, half * 1.5, rim, 0.2 + 0.45 * flash);

  const body = ctx.createLinearGradient(0, top, 0, at.y + lip * 0.34);
  body.addColorStop(0, OWN_SKIN.body[0]);
  body.addColorStop(0.16, OWN_SKIN.body[1]);
  body.addColorStop(0.55, OWN_SKIN.body[2]);
  body.addColorStop(1, OWN_SKIN.body[3]);
  ctx.fillStyle = body;
  ctx.fill(path);
  litBox(ctx, path, at.x - half * 1.2, top, half * 2.4, at.y + lip * 0.4 - top, LIGHT_HALF.hull);

  ctx.save();
  strokeGlow(ctx, path, rim, STROKE.outline + 0.6, 0.8 + 0.2 * flash);
  ctx.restore();

  // The mouth: where the ball comes out and where it has to come back in. A
  // lit throat rather than a bar across the top, so the opening reads as a
  // way in — which is the one thing a player has to believe about it.
  ctx.save();
  ctx.globalAlpha = 0.55 + 0.3 * flash;
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(1.2, t.tile * 0.055);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y - lip, half * 0.86, lip * 0.24, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * The ball waiting in the mouth, between shots.
 *
 * Drawn here rather than beside the flying one because it is a fact about the
 * bucket: the round's whole sentence is that the thing you fire from is the
 * thing you catch with, and a mouth with nothing in it while the pair argue
 * about an angle says the opposite.
 */
export function drawPinLoaded(
  ctx: CanvasRenderingContext2D,
  t: Table,
  state: PinballState,
  halfMilli: number,
  ballMilli: number,
): void {
  const at = pinAt(t, state.bucketMilli, t.rows * 1000 - halfMilli);
  const r = (ballMilli * t.tile) / 1000;
  halo(ctx, at.x, at.y, r * 2.2, PALETTE.rock, 0.3);
  ctx.fillStyle = PALETTE.rock;
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = Math.max(1, t.tile * 0.04);
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
