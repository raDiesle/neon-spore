import { POD, sacPoints } from "../../../../../packages/content/src/index.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { showsHuskMark } from "../../../../../packages/render/src/husk-mark.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import { drawMoored, glyph, POD_TILES } from "../../../../../packages/render/src/pods.js";
import { splinePath } from "../../../../../packages/render/src/spline.js";
import type { Pod } from "../../../../../packages/sim/src/index.js";

/**
 * HUSK 1 off the shape sheet, drawn on the field: the pod's own contour with
 * its mass gone to the bottom, and the light gone out of its core.
 *
 * **Player 1 gets the pod.** That screen must not be able to tell — up to the
 * mouth a husk *is* a pod, and the whole creature is that one seat has to be
 * told by the other — so on `p1` this is `drawMoored`, byte for byte the thing
 * a pod is drawn as. The seat is read through `showsHuskMark`, the same
 * question the shipped frame asks, so the two answers cannot disagree about
 * who sees.
 *
 * **Player 2 gets the sag.** The same lobes, depth, wobble and seed as the
 * POD card, with `sacPoints`' bias moving the mass down — so every difference
 * on the screen is the sag, and nothing else is a landmark to argue about
 * (`tools/shape-sheet`'s HUSK 1 said the same, and this is that draft with a
 * field under it). The motion is the sheet's SAG: down slowly, caught at the
 * bottom, nothing lifting it, and never the pod's bob. The core does not
 * pulse and the rim does not breathe: a dead lamp beside three live ones is
 * the tell, before the shape is.
 */
export function sagBody(
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
  huskBody(ctx, x, y, l.tile * POD_TILES, t, pod, 0);
}

/** The sheet's SAG, in the pod's own units: `crown` is how far one shoulder
 * has fallen in (HUSK 2), nought is the plain sag (HUSK 1). */
export function huskBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  pod: Pod,
  crown: number,
): void {
  const scale = r / Math.max(POD.rx, POD.ry);
  const p = (t % 2) / 2;
  const drop = p < 0.8 ? p / 0.8 : 1 - (p - 0.8) / 0.2;
  const path = splinePath(
    sacPoints(
      t,
      0.3,
      POD.rx,
      POD.ry,
      { lobes: POD.lobes, depth: POD.depth, wobble: POD.wobble, seed: POD.seed },
      64,
      crown,
    ),
    true,
  );
  ctx.save();
  ctx.translate(x, y + drop * r * 0.22);
  ctx.scale(scale * (1 + drop * 0.06), scale * (1 - drop * 0.05));
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(path);
  strokeGlow(ctx, path, PALETTE.pod, Math.max(1, r * 0.1) / scale, 0.35);
  deadCore(ctx, pod);
  ctx.restore();
  halo(ctx, x, y, r * 1.6, PALETTE.pod, 0.06);
}

/** `drawPodCore` with the light out: the rim at a fixed dim, the mark still
 * there but in the pod's dark, so the kind can be read up close and never
 * glows. */
function deadCore(ctx: CanvasRenderingContext2D, pod: Pod): void {
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(0, POD.ry * 0.12, POD.rx * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = STROKE.inner * 3;
  ctx.beginPath();
  ctx.translate(0, POD.ry * 0.12);
  glyph(ctx, pod.kind);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
