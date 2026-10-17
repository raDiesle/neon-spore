import { POD } from "@neon-spore/content";
import type { Pod } from "@neon-spore/sim";
import { bodyAura } from "./body-aura.js";
import { bodyGlowSpread, halo, strokeGlow } from "./glow.js";
import { HUSK_LOOK } from "./husk-look.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawBlinkPod } from "./pod-blink.js";
import { drawGripped, drawPodDress, drawSwingThreads } from "./pod-dress.js";
import { drawDueRing } from "./pod-due-ring.js";
import { POD_LOOK } from "./pod-look.js";
import { drawDriftArrows, showsPodClock } from "./pod-seat-marks.js";
import { drawPodCore, drawWreck, podPath } from "./pod-wreck.js";
import { drawRoeThreads } from "./roe-thread.js";

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

// THE MORSEL and THE MOULT draw the core every pod wears; it is drawn next
// door with the wreck, and still asked for here.
export { drawPodCore };

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
  // Under the pods, so each strand runs into the shells rather than over them.
  drawRoeThreads(ctx, l, pods, time);
  drawSwingThreads(ctx, l, pods);
  for (const p of pods) {
    const { x, y, r } = podCenter(l, p);
    // Deterministic variation: the id is the same on both devices.
    const t = time + (p.id % 7) * 0.83;
    const beatsLeft = p.dueTicks > 0 ? p.dueTicks / ticksPerBeat : Number.POSITIVE_INFINITY;
    // In the maw's grip it is the ship's, drawn over the hull (`drawGrippedPods`).
    if (p.gripTicks !== undefined) continue;
    if (p.loose) drawWreck(ctx, l, x, y, r, t);
    else if (p.kind === "husk" && HUSK_LOOK.body) HUSK_LOOK.body(ctx, l, x, y, t, p, beatsLeft);
    else drawMoored(ctx, l, x, y, t, beatsLeft);
    // Coloured, heavy (`pod-dress.ts`).
    drawPodDress(ctx, l, p, x, y, r, t);
    // On a husk too, and the same ring: a clock only the real pod wore would
    // be the tell on the screen that must not have one (`PodKind`).
    if (p.dueTicks > 0 && showsPodClock(l, p)) drawDueRing(ctx, x, y, r, beatsLeft, time);
  }
  drawDriftArrows(ctx, l, pods, l.tile * POD_TILES, time);
}

/**
 * The heavy pods the maw is gripping, drawn with the ship rather than the field
 * (`ship-growths.ts`): the field pass is under the hull, and a pod held in the
 * mouth drawn there would be painted over by the cannon holding it.
 */
export function drawGrippedPods(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  pods: readonly Pod[],
  time: number,
  ticksPerBeat: number,
): void {
  for (const p of pods) {
    if (p.gripTicks === undefined) continue;
    const { x, y, r } = podCenter(l, p);
    drawGripped(ctx, l, x, y, r, time, p.gripTicks / ticksPerBeat, time, drawPodBody);
  }
}

/** Hanging: the tumbling seed that blinks like a pickup (`pod-blink.ts`,
 * BLINK, taken 16 October 2026). Exported so a look offered for the husk
 * (`husk-look.ts`) can draw the pod it claims to be on the screen that must
 * not be able to tell — and through `POD_LOOK`, so that is whatever a real
 * pod is drawn as. */
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
  drawBlinkPod(ctx, x, y, l.tile * POD_TILES, t, beatsLeft);
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
  ctx.globalAlpha = was * alpha;
  bodyAura(ctx, path, PALETTE.pod, r, scale, t, 0.8 + 0.4 * pulse);
  ctx.globalAlpha = was;
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
