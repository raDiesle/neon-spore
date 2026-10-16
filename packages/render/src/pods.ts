import { blobPoints, POD } from "@neon-spore/content";
import type { Pod } from "@neon-spore/sim";
import { bodyGlowSpread, halo, strokeGlow } from "./glow.js";
import { HUSK_LOOK } from "./husk-look.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawDueRing } from "./pod-due-ring.js";
import { POD_LOOK } from "./pod-look.js";
import { splinePath } from "./spline.js";

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
 * ammunition and must never start an argument about which shot to load. There
 * is one real pod and it carries nothing (`PodKind`), so the core carries no
 * mark: what a pair reads off a pod is the ring round it, which is how long
 * they have (`drawDueRing`).
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
  /** Ticks in a beat, which turns a pod's clock into the beats the ring
   * counts (`drawDueRing`). */
  ticksPerBeat: number,
): void {
  for (const p of pods) {
    const { x, y, r } = podCenter(l, p);
    // Deterministic variation: the id is the same on both devices.
    const t = time + (p.id % 7) * 0.83;
    const beatsLeft = p.dueTicks > 0 ? p.dueTicks / ticksPerBeat : Number.POSITIVE_INFINITY;
    if (p.loose) drawWreck(ctx, l, x, y, t);
    else if (p.kind === "husk" && HUSK_LOOK.body) HUSK_LOOK.body(ctx, l, x, y, t, p, beatsLeft);
    else drawMoored(ctx, l, x, y, t, beatsLeft);
    // On a husk too, and the same ring: a clock only the real pod wore would
    // be the tell on the screen that must not have one (`PodKind`).
    if (p.dueTicks > 0) drawDueRing(ctx, x, y, r, beatsLeft, time);
  }
}

function podPath(t: number): Path2D {
  return splinePath(
    blobPoints(0, 0, POD.rx, POD.ry, POD.lobes, POD.depth, POD.wobble, t, POD.seed),
    true,
  );
}

/** Hanging: a slow bob, a steady pulse, a wide calm halo. Exported so a
 * look offered for the husk (`husk-look.ts`) can draw the pod it claims to be
 * on the screen that must not be able to tell — and through `POD_LOOK`, so
 * that is whatever a real pod is drawn as. */
export function drawMoored(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  t: number,
  /** Beats left on its clock, `Infinity` for none (`POD_LOOK.moored`). */
  beatsLeft: number,
): void {
  if (POD_LOOK.moored) {
    POD_LOOK.moored(ctx, l, x, y, t, beatsLeft);
    return;
  }
  const bob = Math.sin(t * 1.1) * l.tile * 0.07;
  drawPodBody(ctx, x, y + bob, l.tile * POD_TILES, t);
}

/**
 * The pod itself, at a place and a size somebody else chose — the moored
 * drawing with the bob and the field taken out of it.
 *
 * Split out so a pod can be drawn where there is no `Pod` and no column to
 * hang in: THE PULSE's fourth lane, where one falls down a chart, and the
 * button under it, which wears the same lamp. The pulse, the lean and the halo
 * stay here, because they are what a pod *is* rather than where it is.
 */
export function drawPodBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  /** How present the pod's glowed line and halo are, for the one caller that
   * fades it — THE PULSE's arrival (`drawLivingMark` says why it is a
   * parameter). */
  alpha = 1,
): void {
  const scale = r / Math.max(POD.rx, POD.ry);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  const path = podPath(t);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 0.6) * 0.08);
  ctx.scale(scale, scale);
  const was = ctx.globalAlpha;
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill(path);
  strokeGlow(
    ctx,
    path,
    PALETTE.pod,
    Math.max(1, r * 0.1) / scale,
    0.8 + 0.4 * pulse,
    alpha,
    bodyGlowSpread(scale),
  );
  ctx.globalAlpha = was;
  drawPodCore(ctx, 0.55 + 0.45 * pulse);
  ctx.restore();

  halo(ctx, x, y, r * (2.1 + 0.3 * pulse), PALETTE.pod, (0.14 + 0.1 * pulse) * alpha);
}

/** Loose: tumbling, flickering, trailing what it is losing. */
function drawWreck(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  t: number,
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
