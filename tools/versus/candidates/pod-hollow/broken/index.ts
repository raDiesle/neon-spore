import { blobPoints } from "../../../../../packages/content/src/shapes.js";
import type { HuskLook } from "../../../../../packages/render/src/husk-look.js";
import * as look from "../../../../../packages/render/src/husk-look.js";
import { drawMoored, POD_TILES } from "../../../../../packages/render/src/pods.js";
import { splinePath } from "../../../../../packages/render/src/spline.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * **The hollow pod as a broken lantern** — THE HOOD — BROKEN, the half of
 * the HOOD pair that exists to show the guard gone: the same three-lobed body,
 * drawn as an empty shell with no flame, and its arc snapped in two, the halves
 * tumbling slowly apart below it. It does not swing; it shivers, the motion
 * the draft carries — the thing that was alive has stopped.
 *
 * Player 1 is drawn the real pod (`drawMoored`).
 */

const HOOD = { span: 1.5, sweep: 2.5, thick: 0.22, lobes: 3, seed: 9.2 };
const DEAD = "#8A6A3A";
const PIECE_N = 10;

const broken: NonNullable<HuskLook["body"]> = (ctx, l, x, y, t, _pod, beatsLeft) => {
  if (l.role === "p1") {
    drawMoored(ctx, l, x, y, t, beatsLeft);
    return;
  }
  const r = l.tile * POD_TILES * 0.82;
  const shiver = Math.sin(t * 23) * Math.sin(t * 7.1) * r * 0.05;
  ctx.save();
  ctx.translate(x + shiver, y);
  ctx.lineCap = "round";
  piece(ctx, r, t, -1);
  piece(ctx, r, t, 1);

  const k = r / 46;
  const pts = blobPoints(0, 0, 46, 46, HOOD.lobes, 0.07, 0.04, t * 0.3, HOOD.seed).map((p) => ({
    x: p.x * k,
    y: p.y * k,
  }));
  const path = splinePath(pts, true);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#000000";
  ctx.fill(path);
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = DEAD;
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.stroke(path);
  // Where the flame was: an empty outline of it, and a crack through the shell.
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.setLineDash([r * 0.1, r * 0.08]);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.5);
  ctx.quadraticCurveTo(r * 0.36, r * 0.05, 0, r * 0.32);
  ctx.quadraticCurveTo(-r * 0.36, r * 0.05, 0, -r * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.beginPath();
  ctx.moveTo(r * 0.55, -r * 0.75);
  ctx.lineTo(r * 0.3, -r * 0.35);
  ctx.lineTo(r * 0.5, -r * 0.1);
  ctx.lineTo(r * 0.2, r * 0.2);
  ctx.stroke();
  ctx.restore();
};

/** One half of the snapped arc, fallen to its side and turning in depth. */
function piece(ctx: CanvasRenderingContext2D, r: number, t: number, side: number) {
  const R = r * (HOOD.span - HOOD.thick / 2);
  const drift = 0.5 + 0.5 * Math.sin(t * 0.5 + side);
  ctx.save();
  ctx.translate(side * r * (0.9 + 0.25 * drift), r * (0.7 + 0.2 * drift));
  ctx.rotate(side * (1.2 + 0.3 * Math.sin(t * 0.6)));
  const squash = Math.cos(t * 0.8 + side * 1.7);
  ctx.lineWidth = r * HOOD.thick;
  ctx.strokeStyle = DEAD;
  ctx.globalAlpha = 0.35 + 0.35 * Math.abs(squash);
  ctx.beginPath();
  for (let i = 0; i <= PIECE_N; i++) {
    const a = -Math.PI / 2 + (i / PIECE_N) * (HOOD.sweep / 2) * side - (side * HOOD.sweep) / 4;
    const px = Math.cos(a) * R * squash;
    const py = (Math.sin(a) + 1) * R;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

export const POD_HOLLOW_BROKEN: Variant = {
  slot: "pod:hollow",
  name: "broken",
  sentence:
    "THE HOOD — BROKEN: a black shell with no flame and a crack through it, its handle snapped in two and tumbling apart below — on player 2's screen only",
  dir: "tools/versus/candidates/pod-hollow/broken",
  patches: [
    patch({
      target: look.HUSK_LOOK,
      reached: () => look.HUSK_LOOK,
      where: { file: "packages/render/src/husk-look.ts", symbol: "HUSK_LOOK", type: "HuskLook" },
      fields: { body: broken },
    }),
  ],
};
