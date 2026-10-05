import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import type { Point } from "./sinew-shape.js";

/**
 * **The hold, counted where both players are already looking** — the owner,
 * 5 October 2026: *make more clear that players need to stay in the green
 * area for some time and it's counting … something players can count, part
 * of the boss.* Two pictures of the one count, `sinewHoldBeats` read off
 * `holdBeat` and the phase, and both only while the sum is in the zone:
 *
 * - **Bars in the glass.** The tube is empty now, and while the hold runs it
 *   fills from its foot with one green bar per beat of the hold, stacked up
 *   to the zone on the screen that shows the zone and up to the sum's line on
 *   the one that shows the sum — so the last bar lit is the bar that touches
 *   the green, and the fibre parts. Every bar is outlined from the first beat,
 *   so the pair can see how many there are to fill and say them.
 * - **A beat down the strings.** On every beat of the hold a green pulse
 *   leaves the band and runs out along each whole fibre — up to the crown and
 *   down to the mass — and fades as it goes: the tendon beating with the
 *   count.
 *
 * The next fibre still frays as well (`sinew-fray.ts`): that is what the
 * count is counting down to, and these are the count.
 */

/** The bars' inset from the glass, and the gap between two, in tiles. */
const INSET = 0.12;
const GAP = 0.07;
/** The pulse's width in tiles, and the head's radius. */
const PULSE_W = 0.07;
const HEAD = 0.09;

/** The glass the bars stand in: its centre and half-sizes, in field pixels. */
export interface Glass {
  x: number;
  y: number;
  hw: number;
  hh: number;
}

/**
 * The bars, from the glass's foot up to `target` (field pixels): `holds` of
 * them, `progress` 0 (the hold just begun) to 1 (the fibre parting), each one
 * filling in its own beat. Drawn inside the glass's clip.
 */
export function drawSinewHoldBars(
  ctx: CanvasRenderingContext2D,
  glass: Glass,
  target: number,
  holds: number,
  progress: number,
  tile: number,
): void {
  const n = Math.max(1, holds);
  const inset = INSET * tile;
  const foot = glass.y + glass.hh - inset;
  const span = foot - Math.max(glass.y - glass.hh + inset, target);
  if (span <= n) return;
  // A zone low on the band leaves little height: the gaps give way first.
  const gap = Math.min(GAP * tile, (span * 0.4) / n);
  const h = (span - gap * (n - 1)) / n;
  const left = glass.x - glass.hw + inset;
  const w = (glass.hw - inset) * 2;
  const r = Math.min(h, w) * 0.25;
  ctx.save();
  ctx.lineWidth = Math.max(1, tile * 0.03);
  for (let k = 0; k < n; k++) {
    const bottom = foot - k * (h + gap);
    const slot = new Path2D();
    slot.roundRect(left, bottom - h, w, h, r);
    ctx.strokeStyle = rgba(PALETTE.good, 0.45);
    ctx.stroke(slot);
    const f = Math.max(0, Math.min(1, progress * n - k));
    if (f <= 0) continue;
    const bar = new Path2D();
    bar.roundRect(left, bottom - h * f, w, h * f, r);
    ctx.fillStyle = f >= 1 ? PALETTE.good : rgba(PALETTE.good, 0.55);
    ctx.fill(bar);
  }
  ctx.restore();
}

/** The point `t` (0..1) of the way along a polyline, by its length. */
function along(pts: Point[], t: number): { at: number; point: Point } {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i]);
  let left = total * t;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1] as Point;
    const b = pts[i] as Point;
    const d = dist(a, b);
    if (left <= d) {
      const u = d > 0 ? left / d : 0;
      return { at: i, point: { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u } };
    }
    left -= d;
  }
  return { at: pts.length - 1, point: pts[pts.length - 1] as Point };
}

function dist(a: Point | undefined, b: Point | undefined): number {
  return a === undefined || b === undefined ? 0 : Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * One beat's pulse along one run of a fibre. `pts` run **from the band
 * outward**; `phase` is how far through the beat, 0..1 — the pulse's front
 * eases out along the run and the whole of it fades as it goes.
 */
export function drawSinewPulse(
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  phase: number,
  tile: number,
): void {
  if (pts.length < 2 || phase < 0 || phase >= 1) return;
  const front = 1 - (1 - phase) * (1 - phase);
  const fade = 1 - phase;
  const { at, point } = along(pts, front);
  const path = new Path2D();
  const first = pts[0] as Point;
  path.moveTo(first.x, first.y);
  for (let i = 1; i < at; i++) {
    const p = pts[i] as Point;
    path.lineTo(p.x, p.y);
  }
  path.lineTo(point.x, point.y);
  ctx.save();
  ctx.lineCap = "round";
  strokeGlow(ctx, path, PALETTE.good, PULSE_W * tile, 1.6, fade);
  const head = new Path2D();
  head.arc(point.x, point.y, HEAD * tile, 0, Math.PI * 2);
  ctx.globalAlpha = fade;
  ctx.fillStyle = PALETTE.goodRim;
  ctx.fill(head);
  ctx.restore();
}
