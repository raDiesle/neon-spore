import { circleSubpath } from "@neon-spore/content";
import {
  FILAMENT_NAVIGATOR,
  FILAMENT_PILOT,
  type FilamentState,
  filamentLateBeat,
  filamentNavigatorMay,
  filamentPilotMay,
  filamentStallBeats,
  filamentTileAt,
  filamentTiles,
  filamentTooSoon,
  filamentWaitingOn,
  NO_GRAB,
  type SimConfig,
} from "@neon-spore/sim";
import { filamentGrabCircle, filamentPoint } from "./filament-shape.js";
import { drawFilamentArrows, drawFilamentMax, drawFilamentPips } from "./filament-turn-marks.js";
import { strokeGlow } from "./glow.js";
import { drawInstarWait } from "./instar-mark-feedback.js";
import { drawInstarWord } from "./instar-word.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **Whose move THE FILAMENT is, drawn** — the owner, 25 September 2026: *not
 * clear when following is correct or not … glow red before, and when it is
 * the right time to move … what is the max distance … animated arrows …
 * player 2 should more clearly see what player 1 is doing … some timer.*
 *
 * Every figure is the simulation's reading (`sim/filament-turn.ts`), never
 * the drawer's guess:
 *
 * - **This screen's ring is green when its move is open and red when it
 *   must wait**, with the verb or `WAIT` beside it. The pilot waits while a
 *   second tile this beat would snap it, or while she is at the window; the
 *   navigator while the next lit tile is his.
 * - **The tile the thumb goes to next** wears a small ring in the same
 *   colour, and **arrows march** along the way it goes: ahead of the head on
 *   the pilot's screen, up the lit run to the head on the navigator's.
 * - **The window is three pips** under the ring, one lit per tile between
 *   the thumbs, red when full; the pilot also has a red bar across his path
 *   on the last tile he may light.
 * - **The partner's thumb is on this screen too**, dim, and wears the
 *   waiting clock with its name when the line is waiting on them
 *   (`drawInstarWait`, the owner's rule of 24 September).
 * - **The line's clock** is an arc round every ring the line waits on,
 *   emptying to the strike: white, orange from half, red for the last two
 *   beats — the fuse's colours (`slow-fuse.ts`).
 */

/** How many tiles of arrows run ahead of a thumb. */
const ARROW_TILES = 3;
/** The clock's arc, past the ring, in radii. */
const CLOCK_R = 1.35;
/** The last beats of the clock drawn red. */
const CLOCK_RED_BEATS = 2;

/** Whether this seat's move is open now: green, or red and `WAIT`. */
export function filamentGo(s: FilamentState, cfg: SimConfig, seat: 1 | 2, beat: number): boolean {
  if (seat === 2) return filamentNavigatorMay(s);
  return filamentPilotMay(s, cfg) && !filamentTooSoon(s, beat);
}

/** A seat's own ring, the tile it goes to, its arrows and its pips. */
export function drawFilamentOwn(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: FilamentState,
  seat: 1 | 2,
  beat: number,
  time: number,
): void {
  const c = filamentGrabCircle(l, s, seat);
  if (c === null) return;
  const go = filamentGo(s, cfg, seat, beat);
  const hex = go ? PALETTE.good : PALETTE.red;
  const rim = go ? PALETTE.goodRim : PALETTE.redRim;
  const from = seat === 1 ? s.head : s.tail;
  const to = seat === 1 ? Math.min(s.head + ARROW_TILES, rootOf(s)) : s.head;
  drawFilamentArrows(ctx, l, s, from, to, seat === 1 ? PALETTE.wispRim : PALETTE.goodRim, time);
  if (seat === 1) drawFilamentMax(ctx, l, cfg, s);
  const next = filamentTileAt(s, from + 1);
  if (next !== null && (seat === 1 || from + 1 <= s.head)) {
    const at = filamentPoint(l, next);
    const p = new Path2D(circleSubpath(at.x, at.y, c.r * 0.5));
    strokeGlow(ctx, p, rim, STROKE.inner, go ? 1 : 0.8);
  }
  const held = s.grab[seat - 1] !== NO_GRAB;
  const breathe = held ? 1 : 1 + 0.08 * Math.sin(time * 4);
  const p = new Path2D(circleSubpath(c.x, c.y, c.r * breathe));
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = hex;
  ctx.globalAlpha = held ? 0.55 : 0.25;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, held ? rim : hex, STROKE.inner, held ? 1.3 : 1);
  drawFilamentPips(ctx, l, cfg, s, c);
  const word = go ? (seat === 1 ? "DRAW" : "FOLLOW") : "WAIT";
  const side = awayFromMiddle(l, c.x);
  drawInstarWord(ctx, l, word, c.x + side * c.r * 1.6, c.y, side, true);
}

/** The partner's thumb, dim, with the waiting clock and their name when the line waits on them. */
export function drawFilamentTheirs(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: FilamentState,
  seat: 1 | 2,
  time: number,
): void {
  const c = filamentGrabCircle(l, s, seat);
  if (c === null) return;
  const p = new Path2D(circleSubpath(c.x, c.y, c.r * 0.75));
  strokeGlow(ctx, p, PALETTE.dim, STROKE.inner, 0.8);
  if ((filamentWaitingOn(s, cfg) & bitOf(seat)) === 0) return;
  drawInstarWait(ctx, c.x, c.y, c.r, time);
  const side = awayFromMiddle(l, c.x);
  drawInstarWord(ctx, l, seat === 1 ? "P1" : "P2", c.x + side * c.r * 1.6, c.y, side, false);
}

/** The line's clock, as an arc round each ring it waits on, on every screen that draws the ring. */
export function drawFilamentClock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: FilamentState,
  seats: readonly (1 | 2)[],
  beat: number,
  beatPhase: number,
): void {
  const waiting = filamentWaitingOn(s, cfg);
  if (waiting === 0) return;
  const left = filamentLateBeat(s, cfg) - (beat + beatPhase);
  const frac = Math.min(1, Math.max(0, left / Math.max(1, filamentStallBeats(s, cfg))));
  const hex = left <= CLOCK_RED_BEATS ? PALETTE.red : frac <= 0.5 ? PALETTE.ember : PALETTE.text;
  for (const seat of seats) {
    if ((waiting & bitOf(seat)) === 0) continue;
    const c = filamentGrabCircle(l, s, seat);
    if (c === null) continue;
    const p = new Path2D();
    p.arc(c.x, c.y, c.r * CLOCK_R, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    strokeGlow(ctx, p, hex, STROKE.outline * 1.4, 1);
  }
}

function rootOf(s: FilamentState): number {
  return (filamentTiles(s)?.length ?? 1) - 1;
}

function bitOf(seat: 1 | 2): number {
  return seat === 1 ? FILAMENT_PILOT : FILAMENT_NAVIGATOR;
}

/** The side away from the field's middle, where a word hangs off its ring. */
function awayFromMiddle(l: Layout, x: number): -1 | 1 {
  return x < l.gridLeft + (l.cols * l.tile) / 2 ? -1 : 1;
}
