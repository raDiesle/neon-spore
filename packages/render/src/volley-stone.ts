import { LIGHT_HALF } from "@neon-spore/content";
import { litRound } from "./key-light.js";
import { STROKE } from "./palette.js";
import { drawCracks } from "./volley-cracks.js";
import type { VolleyShell } from "./volley-look.js";
import { drawSeams } from "./volley-seams.js";

/**
 * **The shipped paint of THE VOLLEY's shell**, in the two passes
 * `volley-look.ts` names: the stone inside the ward's clip, and the skeleton
 * and seams drawn whole over it.
 *
 * Moved here out of `volley.ts` when the shell became a record a candidate
 * could patch, for `throb-look.ts`'s reason: the record needs the paint and
 * `volley.ts` needs the record, so with the paint left there the two would
 * import each other. `volley.ts` keeps what the shell *is* — its size, its
 * tumble, which sectors a ward has taken — and this is what one is painted
 * with.
 */

/** The stone's unlit mid-tone, `meteor-look.ts`'s own, so a volley and the
 * rocks it shares a field with are visibly one material. */
export const STONE_FILL = "#8A8F9C";

/**
 * The stone: the mid-tone, and the key light handed the rotation so the light
 * stays where it is while the ball rolls under it. Drawn inside whatever clip
 * the caller has set, which is what makes a ward take material away. It is
 * deliberately *only* the filling — the outline is `drawFrame`, and the whole
 * point of the two being separate is that one of them survives.
 */
export function fillRock(
  ctx: CanvasRenderingContext2D,
  ball: Path2D,
  r: number,
  turn: number,
): void {
  ctx.save();
  ctx.rotate(turn);
  ctx.fillStyle = STONE_FILL;
  ctx.fill(ball);
  ctx.clip(ball);
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  ctx.restore();
}

/**
 * The rim, drawn whole however much filling is left. It is the skeleton the
 * owner asked for: a volley that has been warded twice is still round, still
 * the size it was, and still unmistakably the same body — what has changed is
 * that you can see through it.
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  ball: Path2D,
  turn: number,
  metal: string,
): void {
  ctx.save();
  ctx.rotate(turn);
  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(ball);
  ctx.restore();
}

/** The shipped stone: the filling, and the damage a ward has done to what is
 * left of it. */
export function shippedStone(s: VolleyShell): void {
  fillRock(s.ctx, s.ball, s.r, s.turn);
  if (s.plates < s.total) {
    drawCracks(s.ctx, s.ball, s.r, s.turn, s.total - s.plates, s.id, s.metal);
  }
}

/** The shipped skeleton: the rim and the four seams, whole on every frame. */
export function shippedSeams(s: VolleyShell): void {
  drawFrame(s.ctx, s.ball, s.turn, s.metal);
  drawSeams(s.ctx, s.ball, s.r, s.turn, s.glow);
}
