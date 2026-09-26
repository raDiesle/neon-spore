import {
  type InstarMark,
  type InstarState,
  instarActing,
  instarMarkDone,
  instarStep,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import { instarMarkPoint, type Point } from "./instar-place.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **What the second act throws at the hull**, drawn on its way down while the
 * window is open (docs/spec/bosses.md §11.32, *The second act*): the rear's
 * two globs of fire out of the mouth, and the spread's embers shaken off the
 * wings. Each falls to its own mark and gets there as the window closes, so
 * the ring near the hull is where something is visibly *coming*, and the
 * shield or the maw under it is the answer the picture already asks for.
 *
 * A mark answered takes its glob or its embers with it; one let through is
 * the strike's to draw (`instar-strike.ts`, the `glob` and `ember` rows).
 */
export function drawInstarSpit(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: InstarState,
  sway: { xMilli: number; yMilli: number },
  threat: number,
  mouth: Point,
  time: number,
): void {
  if (!instarActing(s)) return;
  const marks = instarStep(s)?.marks ?? [];
  marks.forEach((mark, i) => {
    if (instarMarkDone(s, i)) return;
    const to = instarMarkPoint(l, mark, sway, threat);
    if (mark.part === "glob") drawGlob(ctx, l, mouth, to, threat, time, i);
    else if (mark.part === "ember") drawEmbers(ctx, l, mark, to, threat, time);
  });
}

/** A glob: a ball of fire swelling in the mouth over the first fifth of the
 * window, then arcing out and down to its mark, a trail of flame behind it. */
function drawGlob(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  mouth: Point,
  to: Point,
  threat: number,
  time: number,
  i: number,
): void {
  const grow = smoothstep(threat / 0.2);
  const fly = smoothstep((threat - 0.15) / 0.85);
  // Out of the mouth sideways first, then falling: a lob, not a laser.
  const bend = (to.x - mouth.x) * 0.35;
  const at = (t: number): Point => ({
    x: mouth.x + (to.x - mouth.x) * t + bend * Math.sin(Math.PI * t),
    y: mouth.y + (to.y - mouth.y) * t * t,
  });
  const here = at(fly);
  const r = l.tile * (0.25 + 0.35 * grow) * (1 + 0.08 * Math.sin(time * 18 + i));
  ctx.save();
  for (let k = 1; k <= 5 && fly > 0; k++) {
    const p = at(Math.max(0, fly - k * 0.035));
    ctx.fillStyle = rgba(PALETTE.ember, 0.35 * (1 - k / 6));
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * (1 - k * 0.13), 0, Math.PI * 2);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(here.x, here.y, 0, here.x, here.y, r * 1.8);
  g.addColorStop(0, rgba(PALETTE.podRim, 0.95));
  g.addColorStop(0.35, rgba(PALETTE.pod, 0.9));
  g.addColorStop(0.7, rgba(PALETTE.ember, 0.6));
  g.addColorStop(1, rgba(PALETTE.ember, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(here.x, here.y, r * 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The embers: a scatter of sparks drifting down to the mark, fluttering as
 * they come, gathering round it as the window runs out. */
function drawEmbers(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  mark: InstarMark,
  to: Point,
  threat: number,
  time: number,
): void {
  const n = 7;
  const fall = l.tile * 5;
  ctx.save();
  for (let k = 0; k < n; k++) {
    const seed = sinHash(k + mark.xMilli);
    // Each spark starts at its own height and they arrive together.
    const t = Math.min(1, threat * (1 + 0.4 * seed));
    const spread = l.tile * (1.4 - 1.1 * t) * (seed - 0.5) * 2;
    const x = to.x + spread + Math.sin(time * 5 + k * 1.7) * l.tile * 0.25;
    const y = to.y - fall * (1 - t) * (0.6 + 0.4 * sinHash(k * 3 + 1));
    const r = l.tile * (0.07 + 0.06 * sinHash(k + 7));
    const flicker = 0.6 + 0.4 * Math.sin(time * 22 + k * 2.3);
    ctx.fillStyle = rgba(PALETTE.ember, 0.35 * flicker);
    ctx.beginPath();
    ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(PALETTE.emberRim, 0.95 * flicker);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
