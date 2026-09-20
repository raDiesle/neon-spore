import type { Stage } from "./layout.js";
import type { Viewport } from "./renderer.js";

/**
 * **The letterbox**: what is drawn in the window but outside the game.
 *
 * The game is a phone-shaped rectangle centred in whatever window it is given
 * (`layout-stage.ts`), and on a desktop that leaves a margin either side which
 * is not the game and must not look like it. Two marks make it: the flat paint
 * that covers whatever was there last frame, and the hairline that says where
 * the phone ends.
 *
 * Cut out of `canvas2d.ts` when that file crossed its 250-line limit, and this
 * is what went because it is the one thing in there that is not about the
 * world: everything else in `draw` reads a world and writes pixels for it,
 * while these two read a viewport and a rectangle and would say the same thing
 * on a frame with no game in it at all.
 */

/**
 * The paint, before the clip. A phone whose stage fills its window needs none
 * of it and pays for none; a bare frame gets black rather than the shell's own
 * near-black, because a thumbnail is cut out of its background rather than sat
 * on one.
 */
export function paintOutside(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  stage: Stage,
  bare: boolean | undefined,
): void {
  if (!bare && stage.width >= viewport.width && stage.height >= viewport.height) return;
  ctx.fillStyle = bare ? "#000000" : "#05040B";
  ctx.fillRect(0, 0, viewport.width, viewport.height);
}

/** And the seam, after the clip is let go: a wide window shows where the phone
 * ends. Half-pixel offsets so a one-pixel line lands on one pixel. */
export function drawStageSeam(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  stage: Stage,
): void {
  if (stage.width >= viewport.width) return;
  ctx.strokeStyle = "#1C1640";
  ctx.lineWidth = 1;
  ctx.strokeRect(stage.left + 0.5, stage.top + 0.5, stage.width - 1, stage.height - 1);
}
