import { strokeGlowFaded } from "./glow.js";
import { type Dial, dialAt, hubR, TRACK_IN, TRACK_OUT, trackBand } from "./governor-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE GOVERNOR's receipts, drawn** — what `governor-fx.ts` holds between
 * frames, laid through `dialAt` on the dial `governor-draw.ts` stands this
 * frame, as the marks and the studs are.
 */

/** How wide a tap's flash is either side of the mark, in thousandths of a lap, and how far past the rim it throws. */
const TAP_HALF = 38;
const TAP_THROW = 0.3;
/** How far back along the track a skid's scrape trails the needle, in thousandths, and its scratches. */
const SCRAPE_BACK = 90;
const SCRATCHES = 3;

/**
 * A tap's flash on the rim at `milli`: the piece of track under it burning
 * white and a spike of light thrown out past the rim, widening as it fades.
 */
export function drawGovernorTap(
  ctx: CanvasRenderingContext2D,
  d: Dial,
  tap: { now: number; milli: number },
): void {
  if (tap.now <= 0) return;
  const half = TAP_HALF * (1 + 0.6 * (1 - tap.now));
  const band = trackBand(d, tap.milli - half, tap.milli + half, TRACK_IN, TRACK_OUT);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.8 * tap.now);
  ctx.fill(band);
  const spike = new Path2D();
  const from = dialAt(d, tap.milli, TRACK_IN);
  const to = dialAt(d, tap.milli, 1 + TAP_THROW * (1.5 - tap.now));
  spike.moveTo(from.x, from.y);
  spike.lineTo(to.x, to.y);
  strokeGlowFaded(ctx, spike, PALETTE.hullRim, STROKE.outline, 1.6 * tap.now, 1);
}

/**
 * A skid's scrape at `milli`: a brass scratch dragged along the track behind
 * where the needle was, the thumb's pass it missed, and a few gouges across
 * it — dull, never the rim's white, so it can not be read as a tap.
 */
export function drawGovernorScrape(
  ctx: CanvasRenderingContext2D,
  d: Dial,
  scrape: { now: number; milli: number },
): void {
  if (scrape.now <= 0) return;
  const mid = (TRACK_IN + TRACK_OUT) / 2;
  const line = new Path2D();
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const at = dialAt(d, scrape.milli - (SCRAPE_BACK * i) / n, mid + 0.02 * Math.sin(i * 2.3));
    if (i === 0) line.moveTo(at.x, at.y);
    else line.lineTo(at.x, at.y);
  }
  for (let i = 0; i < SCRATCHES; i++) {
    const milli = scrape.milli - (SCRAPE_BACK * (i + 0.5)) / SCRATCHES;
    const a = dialAt(d, milli + 6, TRACK_IN + 0.02);
    const b = dialAt(d, milli - 6, TRACK_OUT - 0.02);
    line.moveTo(a.x, a.y);
    line.lineTo(b.x, b.y);
  }
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.inner * 1.4;
  ctx.strokeStyle = rgba(PALETTE.governorBrass, 0.9 * scrape.now);
  ctx.stroke(line);
  ctx.restore();
}

/** A hub hit's flash over the hub: white, and wider for every hit. */
export function drawGovernorFlash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  flash: { now: number; hits: number },
): void {
  if (flash.now <= 0 || flash.hits <= 0) return;
  const hits = Math.min(3, flash.hits);
  const r = Math.max(0.5, hubR(l) * (0.6 + 0.5 * hits) * (1.4 - 0.4 * flash.now));
  const p = new Path2D();
  p.ellipse(d.cx, d.cy, r, r * (0.5 + 0.5 * d.tilt), 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.hullRim, flash.now * (0.35 + 0.2 * hits));
  ctx.fill(p);
  strokeGlowFaded(ctx, p, PALETTE.hullRim, STROKE.inner, flash.now * (0.6 + 0.4 * hits));
}
