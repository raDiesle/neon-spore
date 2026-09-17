import { showsHuskMark } from "../../../../../packages/render/src/husk-mark.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { drawMoored, POD_TILES } from "../../../../../packages/render/src/pods.js";
import type { Pod } from "../../../../../packages/sim/src/index.js";
import { huskBody } from "../sag/paint.js";

/**
 * HUSK 2 off the shape sheet: the same sag, and one shoulder fallen in.
 *
 * The body is `sag`'s, with `sacPoints`' crown cut where an intact pod has a
 * shoulder — off-centre, so it reads as damage rather than as a shape the
 * thing was built with. Player 1 gets the pod, for the reason `sag/paint.ts`
 * gives. Shared with `sag` rather than copied because the two answers differ
 * by one number, and a vote between them is a vote about that number.
 */
export function dentBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  t: number,
  pod: Pod,
): void {
  if (!showsHuskMark(l)) {
    drawMoored(ctx, l, x, y, t, pod.kind);
    return;
  }
  huskBody(ctx, x, y, l.tile * POD_TILES, t, pod, 0.26);
}
