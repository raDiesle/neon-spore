import { blobPoints, POD } from "@neon-spore/content";
import { bodyAura } from "./body-aura.js";
import { bodyGlowSpread, halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **The pod loose, and the core every pod wears.** Cut out of `pods.ts` when
 * the pod options took it to exactly 250 lines: the wreck is the one state of
 * a pod drawn nowhere else, and the core is what THE MORSEL and THE MOULT
 * borrow (`morsel.ts`, `moult.ts`), so both stand apart from the field's pass.
 */

/** The pod's outline at time `t`, in `POD`'s own units — moored or loose. */
export function podPath(t: number): Path2D {
  return splinePath(
    blobPoints(0, 0, POD.rx, POD.ry, POD.lobes, POD.depth, POD.wobble, t, POD.seed),
    true,
  );
}

/** Loose: tumbling, flickering, trailing what it is losing. */
export function drawWreck(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  t: number,
): void {
  const scale = r / Math.max(POD.rx, POD.ry);
  const flicker = 0.55 + 0.45 * Math.sin(t * 17) * Math.sin(t * 6.3);
  const path = podPath(t * 2);

  // The trail: what it burned off, still hanging where it was a moment ago.
  // The near, fresher embers carry the pod's own amber; the far, older ones
  // stay plain ember.
  for (let k = 1; k <= 4; k++) {
    const a = (1 - k / 5) * 0.4;
    const ty = y - k * l.tile * 0.34;
    const tx = x - Math.sin(t * 3 + k) * l.tile * 0.06 * k;
    halo(ctx, tx, ty, r * (0.9 - k * 0.12), k > 2 ? PALETTE.ember : PALETTE.pod, a * 0.5);
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 2.6);
  ctx.scale(scale, scale);
  bodyAura(ctx, path, PALETTE.ember, r, scale, t, 0.7 + 0.9 * flicker);
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(path);
  // The fire itself stays plain ember up close — that is the wreck.
  strokeGlow(
    ctx,
    path,
    PALETTE.ember,
    Math.max(1, r * 0.13) / scale,
    0.7 + 0.9 * flicker,
    1,
    bodyGlowSpread(scale),
  );
  drawPodCore(ctx, flicker);
  ctx.restore();

  halo(ctx, x, y, r * 2.4, PALETTE.pod, 0.2 + 0.22 * flicker);
}

/**
 * The core, in the pod's own coordinates: a lit disc inside a thin ring. Inner
 * drawing stays thin.
 *
 * It carried a mark per cargo — a bomb for the purge, a shield for the ward —
 * until the owner rejected both on 16 October 2026; a pod that gives nothing
 * has nothing to name. Exported because THE MOULT's blend fades it in with the
 * pod it is turning into (`moult.ts`).
 */
export function drawPodCore(ctx: CanvasRenderingContext2D, brightness: number): void {
  // Under the caller's own alpha rather than over it: THE MOULT fades this in
  // with the cargo and THE PULSE fades a far arrival, and until 24 September
  // 2026 both set a fade here that the core replaced with its own.
  const was = ctx.globalAlpha;
  ctx.globalAlpha = was * (0.35 + 0.65 * brightness);
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(0, 0, POD.rx * (0.24 + 0.06 * brightness), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = was;
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = STROKE.inner * 3;
  ctx.beginPath();
  ctx.arc(0, 0, POD.rx * 0.48, 0, Math.PI * 2);
  ctx.stroke();
}
