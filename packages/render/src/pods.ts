import { blobPath, POD } from "@neon-spore/content";
import type { Pod, PodKind } from "@neon-spore/sim";
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
 * ammunition and must never start an argument about which shot to load. Every
 * kind is the same amber, on purpose — the pod family itself never argues
 * about which shot to load, exactly as it never did about ammunition colour —
 * and the *mark* at the centre is what says which kind it is, close up, once
 * a pair has decided to chase it, see `glyph`.
 */

/**
 * How wide a pod is drawn, as a share of a tile, and where one is on the
 * screen. Exported because a guide's caption points at a pod (`SALVAGE`'s
 * film) and a ring placed from a second copy of these two lines would sit
 * beside the thing it is meant to be round the first time either moves.
 *
 * The slow bob is deliberately not in it: it is a tenth of a tile of drift on
 * a clock the caption does not have, and a ring that breathed with the pod
 * would be a ring nobody could tell was still.
 */
export const POD_TILES = 0.38;

export function podCenter(l: Layout, p: Pod): { x: number; y: number; r: number } {
  return {
    x: tileCX(l, p.colMilli / 1000),
    y: tileCY(l, p.rowMilli / 1000),
    r: l.tile * POD_TILES,
  };
}

export function drawPods(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  pods: readonly Pod[],
  time: number,
): void {
  for (const p of pods) {
    const { x, y } = podCenter(l, p);
    // Deterministic variation: the id is the same on both devices.
    const t = time + (p.id % 7) * 0.83;
    if (p.loose) drawWreck(ctx, l, x, y, t, p.kind);
    else drawMoored(ctx, l, x, y, t, p.kind);
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
  kind: PodKind,
): void {
  const r = l.tile * POD_TILES;
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
  core(ctx, 0.55 + 0.45 * pulse, kind);
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
  kind: PodKind,
): void {
  const r = l.tile * POD_TILES;
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
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(path);
  // The fire itself stays plain ember up close — that is the wreck, not the
  // kind. The kind reads in the halo below, which is what carries at a glance.
  strokeGlow(ctx, path, PALETTE.ember, Math.max(1, r * 0.13) / scale, 0.7 + 0.9 * flicker);
  core(ctx, flicker, kind);
  ctx.restore();

  halo(ctx, x, y, r * 2.4, PALETTE.pod, 0.2 + 0.22 * flicker);
}

/** The core, in the pod's own coordinates. Inner drawing stays thin. */
function core(ctx: CanvasRenderingContext2D, brightness: number, kind: PodKind): void {
  ctx.globalAlpha = 0.35 + 0.65 * brightness;
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(0, 0, POD.rx * (0.24 + 0.06 * brightness), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = STROKE.inner * 3;
  ctx.beginPath();
  glyph(ctx, kind);
  ctx.stroke();
}

/**
 * The mark at the centre of every pod: what the shared amber shape cannot
 * say, this does. `mend` is a heart, `purge` is a bomb with a lit fuse,
 * `ward` is a shield — the three read at a glance and borrow nothing from
 * each other, because a pair chasing a pod down the field has to name the
 * kind before they decide whether it is worth chasing.
 */
function glyph(ctx: CanvasRenderingContext2D, kind: PodKind): void {
  const r = POD.rx;
  if (kind === "purge") {
    ctx.arc(0, r * 0.12, r * 0.4, 0, Math.PI * 2);
    ctx.moveTo(r * 0.26, -r * 0.22);
    ctx.quadraticCurveTo(r * 0.55, -r * 0.5, r * 0.34, -r * 0.72);
    ctx.moveTo(r * 0.22, -r * 0.78);
    ctx.lineTo(r * 0.42, -r * 0.78);
    ctx.moveTo(r * 0.32, -r * 0.88);
    ctx.lineTo(r * 0.32, -r * 0.68);
    return;
  }
  if (kind === "ward") {
    ctx.moveTo(0, -r * 0.5);
    ctx.lineTo(r * 0.42, -r * 0.32);
    ctx.lineTo(r * 0.42, r * 0.05);
    ctx.quadraticCurveTo(r * 0.42, r * 0.4, 0, r * 0.55);
    ctx.quadraticCurveTo(-r * 0.42, r * 0.4, -r * 0.42, r * 0.05);
    ctx.lineTo(-r * 0.42, -r * 0.32);
    ctx.closePath();
    return;
  }
  ctx.moveTo(0, -r * 0.15);
  ctx.quadraticCurveTo(-r * 0.3, -r * 0.5, -r * 0.55, -r * 0.1);
  ctx.quadraticCurveTo(-r * 0.55, r * 0.3, 0, r * 0.55);
  ctx.quadraticCurveTo(r * 0.55, r * 0.3, r * 0.55, -r * 0.1);
  ctx.quadraticCurveTo(r * 0.3, -r * 0.5, 0, -r * 0.15);
  return;
}
