import { blobPath, POD } from "@neon-spore/content";
import type { Pod } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The pod, in its two states, which have to look nothing like each other.
 *
 * Moored, it hangs perfectly still and only breathes: a lamp in the dark that
 * says "this is not coming for you". Loose, it is a burning wreck — it tumbles,
 * it trails embers, and the light in it flickers instead of pulsing. The change
 * has to be legible from the far end of a phone, because it is the moment
 * player 1 has to stop aiming and start catching.
 *
 * Its colour is amber, deliberately neither red nor cyan: a pod is not
 * ammunition and must never start an argument about which shot to load.
 */
export function drawPods(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  pods: readonly Pod[],
  time: number,
): void {
  for (const p of pods) {
    const x = tileCX(l, p.colMilli / 1000);
    const y = tileCY(l, p.rowMilli / 1000);
    // Deterministic variation: the id is the same on both devices.
    const t = time + (p.id % 7) * 0.83;
    if (p.loose) drawWreck(ctx, l, x, y, t);
    else drawMoored(ctx, l, x, y, t);
  }
}

function podPath(t: number): Path2D {
  return new Path2D(blobPath(0, 0, POD.rx, POD.ry, POD.lobes, POD.depth, POD.wobble, t, POD.seed));
}

/** Hanging: a slow bob, a steady pulse, a wide calm halo. */
function drawMoored(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  t: number,
): void {
  const r = l.tile * 0.38;
  const scale = r / Math.max(POD.rx, POD.ry);
  const bob = Math.sin(t * 1.1) * l.tile * 0.07;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  const path = podPath(t);

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(Math.sin(t * 0.6) * 0.08);
  ctx.scale(scale, scale);
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(path);
  strokeGlow(ctx, path, PALETTE.pod, Math.max(1, r * 0.1) / scale, 0.8 + 0.4 * pulse);
  core(ctx, 0.55 + 0.45 * pulse);
  ctx.restore();

  halo(ctx, x, y + bob, r * (2.1 + 0.3 * pulse), PALETTE.pod, 0.14 + 0.1 * pulse);
}

/** Loose: tumbling, flickering, trailing what it is losing. */
function drawWreck(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  t: number,
): void {
  const r = l.tile * 0.38;
  const scale = r / Math.max(POD.rx, POD.ry);
  const flicker = 0.55 + 0.45 * Math.sin(t * 17) * Math.sin(t * 6.3);
  const path = podPath(t * 2);

  // The trail: what it burned off, still hanging where it was a moment ago.
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
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(path);
  strokeGlow(ctx, path, PALETTE.ember, Math.max(1, r * 0.13) / scale, 0.7 + 0.9 * flicker);
  core(ctx, flicker);
  ctx.restore();

  halo(ctx, x, y, r * 2.4, PALETTE.ember, 0.2 + 0.22 * flicker);
}

/** The core, in the pod's own coordinates. Inner drawing stays thin. */
function core(ctx: CanvasRenderingContext2D, brightness: number): void {
  ctx.globalAlpha = 0.35 + 0.65 * brightness;
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(0, 0, POD.rx * (0.24 + 0.06 * brightness), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = STROKE.inner * 3;
  ctx.beginPath();
  ctx.moveTo(-POD.rx * 0.55, 0);
  ctx.lineTo(-POD.rx * 0.3, 0);
  ctx.moveTo(POD.rx * 0.3, 0);
  ctx.lineTo(POD.rx * 0.55, 0);
  ctx.stroke();
}
