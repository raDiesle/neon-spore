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
 * ammunition and must never start an argument about which shot to load. Within
 * that family each of the three kinds — `mend`, `purge`, `ward` — carries its
 * own accent and its own centre mark, see `ACCENTS` and `glyph`, so a pair
 * chasing one down the field can tell which it is before it decides to catch.
 */
const ACCENTS: Record<PodKind, string> = {
  mend: PALETTE.pod,
  purge: PALETTE.ember,
  // Borrows the shield's rim colour on purpose: this is the one kind that
  // acts on the shield, and the game already lets that colour mean two
  // things depending on where it appears — a fired shot, or a hull rim.
  ward: PALETTE.shieldRim,
};

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
  const r = l.tile * 0.38;
  const scale = r / Math.max(POD.rx, POD.ry);
  const bob = Math.sin(t * 1.1) * l.tile * 0.07;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  const path = podPath(t);
  const accent = ACCENTS[kind];

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate(Math.sin(t * 0.6) * 0.08);
  ctx.scale(scale, scale);
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(path);
  strokeGlow(ctx, path, accent, Math.max(1, r * 0.1) / scale, 0.8 + 0.4 * pulse);
  core(ctx, 0.55 + 0.45 * pulse, kind);
  ctx.restore();

  halo(ctx, x, y + bob, r * (2.1 + 0.3 * pulse), accent, 0.14 + 0.1 * pulse);
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
  const r = l.tile * 0.38;
  const scale = r / Math.max(POD.rx, POD.ry);
  const flicker = 0.55 + 0.45 * Math.sin(t * 17) * Math.sin(t * 6.3);
  const path = podPath(t * 2);
  const accent = ACCENTS[kind];

  // The trail: what it burned off, still hanging where it was a moment ago.
  // The near, fresher embers carry the kind's colour; the far, older ones
  // stay plain ember — the kind still has to read while it falls.
  for (let k = 1; k <= 4; k++) {
    const a = (1 - k / 5) * 0.4;
    const ty = y - k * l.tile * 0.34;
    const tx = x - Math.sin(t * 3 + k) * l.tile * 0.06 * k;
    halo(ctx, tx, ty, r * (0.9 - k * 0.12), k > 2 ? PALETTE.ember : accent, a * 0.5);
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

  halo(ctx, x, y, r * 2.4, accent, 0.2 + 0.22 * flicker);
}

/** The core, in the pod's own coordinates. Inner drawing stays thin. */
function core(ctx: CanvasRenderingContext2D, brightness: number, kind: PodKind): void {
  ctx.globalAlpha = 0.35 + 0.65 * brightness;
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(0, 0, POD.rx * (0.24 + 0.06 * brightness), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = ACCENTS[kind];
  ctx.lineWidth = STROKE.inner * 3;
  ctx.beginPath();
  glyph(ctx, kind);
  ctx.stroke();
}

/**
 * The mark at the centre of every pod. `mend` keeps the slit the pod has
 * always had — two dashes either side of the dot, since this is the pod as
 * it has always been. `purge` is a burst: four short ticks, because it
 * clears rather than mends. `ward` is a ring: a barrier drawn around the dot
 * rather than through it.
 */
function glyph(ctx: CanvasRenderingContext2D, kind: PodKind): void {
  const r = POD.rx;
  if (kind === "purge") {
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + i * (Math.PI / 2);
      ctx.moveTo(Math.cos(a) * r * 0.28, Math.sin(a) * r * 0.28);
      ctx.lineTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55);
    }
    return;
  }
  if (kind === "ward") {
    ctx.moveTo(r * 0.42, 0);
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    return;
  }
  ctx.moveTo(-r * 0.55, 0);
  ctx.lineTo(-r * 0.3, 0);
  ctx.moveTo(r * 0.3, 0);
  ctx.lineTo(r * 0.55, 0);
}
