import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { drawInstarGlyph } from "./instar-glyphs.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **A swipe is drawn as the way the thumb goes, not as a place to press.**
 *
 * The owner, 24 September 2026, generic for every gesture control in the
 * game: *instead of a circle for swiping in a direction it should be visual
 * like … a slider … minimum the bar path of a slider, but without the circle
 * of it.* So a swipe mark is a track — a rounded bar from where the thumb goes
 * down to the length the lift counts at — with the chevrons running along it
 * and no knob. The green fill runs down the bar as the carry goes
 * (`sim/instar.ts` `instarSwipeAlong`), so the end of the bar is the end of
 * the swipe, said in the picture.
 *
 * Everything a ring wears, the track wears in its own shape: the window
 * closes on it as a wider bar round it, this seat's light is a soft bar under
 * it, and the partner's is a dashed bar turning round it. The press is still
 * answered at the top, where the bar starts (`instar-mark-grip.ts`).
 */

/** The bar's half-width, in mark radii. */
const HALF = 0.42;

/** Where a swipe mark's bar ends, for the drawer and its words. */
export interface Track {
  x: number;
  /** Where the thumb goes: the top of the bar. */
  top: number;
  /** Where the lift counts: the bottom of the bar. */
  bottom: number;
  /** The bar's half-width. */
  w: number;
}

export function instarTrack(x: number, y: number, r: number, length: number): Track {
  return { x, top: y, bottom: y + length, w: r * HALF };
}

/** A vertical bar with round ends, `grow` wider than the track all round. */
function bar(t: Track, grow: number): Path2D {
  const w = t.w + grow;
  const p = new Path2D();
  p.arc(t.x, t.top, w, Math.PI, 0);
  p.lineTo(t.x + w, t.bottom);
  p.arc(t.x, t.bottom, w, 0, Math.PI);
  p.closePath();
  return p;
}

/** The track itself: dim red, its fill green down to how far the carry has gone. */
export function drawInstarTrack(
  ctx: CanvasRenderingContext2D,
  t: Track,
  r: number,
  mine: boolean,
  held: boolean,
  along: number,
  time: number,
  awaited: boolean,
): void {
  const p = bar(t, 0);
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = PALETTE.red;
  ctx.globalAlpha = held ? 0.45 : mine ? 0.22 : 0.1;
  ctx.fill(p);
  ctx.restore();
  if (along > 0) {
    ctx.save();
    ctx.clip(p);
    ctx.fillStyle = PALETTE.good;
    ctx.globalAlpha = 0.85;
    const reach = t.top + (t.bottom - t.top) * along;
    ctx.fillRect(t.x - t.w, t.top - t.w, t.w * 2, reach - t.top + t.w);
    ctx.restore();
  }
  const rim = held || awaited ? PALETTE.redRim : PALETTE.red;
  strokeGlow(ctx, p, along >= 1 ? PALETTE.good : rim, STROKE.inner, mine ? 1.3 : 0.4);
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.globalAlpha = mine ? 0.9 : 0.5;
  drawInstarGlyph(ctx, "swipeDown", t.x, (t.top + t.bottom) / 2, r * 1.1, time);
  ctx.restore();
}

/** The window closing on the track: a bar round it, narrowing as the beats go. */
export function drawInstarTrackWindow(
  ctx: CanvasRenderingContext2D,
  t: Track,
  r: number,
  left: number,
  mine: boolean,
): void {
  const urgency = 1 - left;
  const alpha = (0.25 + 0.65 * urgency) * (mine ? 1 : 0.5);
  strokeGlow(ctx, bar(t, r * (0.75 + 1.1 * left)), PALETTE.red, STROKE.inner, alpha);
}

/** This seat's track: a soft red light under it, breathing. */
export function drawInstarTrackHalo(
  ctx: CanvasRenderingContext2D,
  t: Track,
  r: number,
  time: number,
): void {
  const breathe = 0.75 + 0.25 * Math.sin(time * 4);
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.redRim, 0.28 * breathe);
  ctx.fill(bar(t, r * 0.9));
  ctx.fillStyle = rgba(PALETTE.redRim, 0.18 * breathe);
  ctx.fill(bar(t, r * 0.45));
  ctx.restore();
}

/** The partner's track: a dim dashed bar turning round it. */
export function drawInstarTrackTheirs(
  ctx: CanvasRenderingContext2D,
  t: Track,
  r: number,
  time: number,
): void {
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.text, 0.8);
  ctx.lineWidth = STROKE.outline;
  ctx.setLineDash([r * 0.45, r * 0.3]);
  ctx.lineDashOffset = -time * r * 1.2;
  ctx.stroke(bar(t, r * 0.45));
  ctx.restore();
}

/** An open swipe mark, whole: the light or the partner's bar, the track and
 * its window — what `instar-marks.ts` draws for a ring, in this shape. */
export function drawInstarSwipe(
  ctx: CanvasRenderingContext2D,
  t: Track,
  r: number,
  mine: boolean,
  held: boolean,
  along: number,
  time: number,
  awaited: boolean,
  left: number,
): void {
  if (mine) drawInstarTrackHalo(ctx, t, r, time);
  drawInstarTrack(ctx, t, r, mine, held, along, time, awaited);
  if (!mine) drawInstarTrackTheirs(ctx, t, r, time);
  drawInstarTrackWindow(ctx, t, r, left, mine);
}
