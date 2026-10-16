import { blobPoints } from "../../../../../packages/content/src/shapes.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import * as look from "../../../../../packages/render/src/pod-look.js";
import { POD_TILES } from "../../../../../packages/render/src/pods.js";
import { splinePath } from "../../../../../packages/render/src/spline.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * **The pod as a hung lantern** — THE HOOD, at its own numbers: a three-lobed
 * body under an arc that touches nothing, the arc turned here into a handle
 * that spins round the body in depth, passing behind it and coming back in
 * front. The whole lantern swings from a point above the handle.
 *
 * Both motions answer to the clock. From `SWINGS_AT` beats left the swing
 * widens and the handle spins up, so a pod with little time is a lantern
 * thrashing on its hook — and the pair can see it across the field without
 * reading the ring.
 */

/** Beats left at which the lantern starts to thrash. */
const SWINGS_AT = 6;
/** THE HOOD's parameters, in its own units of the body's radius. */
const HOOD = { span: 1.5, sweep: 2.5, thick: 0.22, lobes: 3, seed: 9.2 };
const ARC_N = 28;

export function lanternPod(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  t: number,
  beatsLeft: number,
): void {
  const r = l.tile * POD_TILES * 0.82;
  const urgent = Math.max(0, Math.min(1, 1 - beatsLeft / SWINGS_AT));
  const swing = Math.sin(t * (1.5 + 2 * urgent)) * (0.16 + 0.3 * urgent);
  const yaw = t * (0.9 + 3.4 * urgent);
  const pivot = r * (HOOD.span + 0.55);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);

  halo(ctx, x, y, r * (2.4 + 0.3 * pulse), PALETTE.pod, 0.12 + 0.08 * pulse);
  ctx.save();
  ctx.translate(x, y - pivot);
  ctx.rotate(swing);
  ctx.translate(0, pivot);
  ctx.lineCap = "round";

  // The thread it hangs from: the one thing that says it hangs.
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.beginPath();
  ctx.moveTo(0, -pivot);
  ctx.lineTo(0, -r * HOOD.span);
  ctx.stroke();

  handle(ctx, r, yaw, false);
  body(ctx, r, t, pulse, urgent);
  handle(ctx, r, yaw, true);
  ctx.restore();
}

/** The half of the handle behind the body, or the half in front of it. */
function handle(ctx: CanvasRenderingContext2D, r: number, yaw: number, front: boolean) {
  const R = r * (HOOD.span - HOOD.thick / 2);
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  ctx.lineWidth = r * HOOD.thick;
  for (let i = 0; i < ARC_N; i++) {
    const a0 = -Math.PI / 2 - HOOD.sweep / 2 + (i / ARC_N) * HOOD.sweep;
    const a1 = a0 + HOOD.sweep / ARC_N;
    const z = Math.cos((a0 + a1) / 2) * s;
    if (z >= 0 !== front) continue;
    ctx.globalAlpha = front ? 0.6 + 0.4 * z : 0.22 + 0.2 * (1 + z);
    ctx.strokeStyle = front ? PALETTE.pod : PALETTE.ember;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a0) * R * c, Math.sin(a0) * R);
    ctx.lineTo(Math.cos(a1) * R * c, Math.sin(a1) * R);
    ctx.stroke();
  }
}

function body(ctx: CanvasRenderingContext2D, r: number, t: number, pulse: number, urgent: number) {
  const unit = 46;
  const k = r / unit;
  const pts = blobPoints(0, 0, unit, unit, HOOD.lobes, 0.07, 0.04, t, HOOD.seed).map((p) => ({
    x: p.x * k,
    y: p.y * k,
  }));
  const path = splinePath(pts, true);
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = Math.max(1.5, r * 0.14);
  ctx.stroke(path);
  // The flame: a teardrop of light that leans against the swing, flickering
  // harder when the clock is short.
  const flicker = 1 - urgent * 0.5 * (0.5 + 0.5 * Math.sin(t * 19));
  ctx.globalAlpha = (0.55 + 0.45 * pulse) * flicker;
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.5);
  ctx.quadraticCurveTo(r * 0.36, r * 0.05, 0, r * 0.32);
  ctx.quadraticCurveTo(-r * 0.36, r * 0.05, 0, -r * 0.5);
  ctx.fill();
}

export const POD_REAL_LANTERN: Variant = {
  slot: "pod:real",
  name: "lantern",
  sentence:
    "a lantern on a thread — THE HOOD's arc as a handle spinning round the body in depth — swinging harder as the clock runs out",
  dir: "tools/versus/candidates/pod-real/lantern",
  patches: [
    patch({
      target: look.POD_LOOK,
      reached: () => look.POD_LOOK,
      where: { file: "packages/render/src/pod-look.ts", symbol: "POD_LOOK", type: "PodLook" },
      fields: { moored: lanternPod },
    }),
  ],
};
