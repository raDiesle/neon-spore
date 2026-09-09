import { crystalPath, METEOR } from "@neon-spore/content";
import { type Crater, centreY, cutY, LID } from "./crater-geom.js";

/**
 * The hole itself, as the game has always drawn it.
 *
 * Lifted out of `craters.ts`'s loop word for word so that the shipped picture
 * can go through a record a candidate is able to patch (`crater-look.ts`), with
 * not one pixel moved. Nothing here is new; the comments are the ones that were
 * in the loop.
 */
export function pit(ctx: CanvasRenderingContext2D, c: Crater): void {
  ctx.save();
  // Everything above `cutY` is outside the ship — clip it away *before*
  // rotating, in screen space, so the cut stays flat and level regardless of
  // which way the rock itself is facing.
  ctx.beginPath();
  ctx.rect(c.x - c.r * 2, cutY(c), c.r * 4, c.r * 2 + LID);
  ctx.clip();

  ctx.translate(c.x, centreY(c));
  ctx.rotate(c.rotation);
  const d = crystalPath(0, 0, c.r, c.r, METEOR.sides, METEOR.depth, METEOR.wobble, 0, METEOR.seed);
  // Fill only — no outline. A stroke here reads as the rock's own material
  // edge, the same light grey the ship's solid rock objects are rimmed in; a
  // hole has no rim of its own material, only the dark of what is gone.
  ctx.fillStyle = "#14101F";
  ctx.fill(new Path2D(d));
  ctx.restore();

  // A hairline of the tail's old colour along the cut itself — the seam where
  // the rock ended and the skin resumes, still a little hot. It runs the
  // mouth's own width, so it reads as the lip of this hole.
  const rim = ctx.createLinearGradient(c.left, c.top.y, c.right, c.top.y);
  rim.addColorStop(0, "rgba(255,122,47,0)");
  rim.addColorStop(0.5, "rgba(255,122,47,0.4)");
  rim.addColorStop(1, "rgba(255,122,47,0)");
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(c.left, c.top.y);
  ctx.lineTo(c.right, c.top.y);
  ctx.stroke();
}
