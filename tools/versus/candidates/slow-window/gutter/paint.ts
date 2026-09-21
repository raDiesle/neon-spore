import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";

/**
 * A light down each side of the field that flares on the beat and gutters,
 * and has less to give every beat.
 *
 * The window is two beats wide and the pair are counting them, out loud,
 * because that is what this game's control scheme is. So the picture is beats
 * and not a slide: each beat of the window lights both edges and lets them die
 * back before the next one, and each flare is weaker than the one before it —
 * a flame going out rather than a bar emptying. The last beat is the faint one,
 * and when there is no light left there is no window left.
 *
 * **The clock is `win.left`, in beats.** The fractional part is where this
 * frame stands inside the current beat and the whole is how many are still to
 * come, which is the same clock the pair are hearing. Nothing here reads
 * `view.time`: a window is spent at a third of the wall rate, so a flare on
 * wall seconds would flicker three times too fast (`slow-look.ts`).
 *
 * **It wells up from the hull corners** rather than lying down each edge as a
 * band. A band has a top, and a straight edge across the field at `gridTop` is
 * a line nobody put there — the first shot of this candidate drew one across
 * both sides. A light that starts where the pair's own hands are and reaches
 * up has no edge at all, and it says the right thing besides: the beat is
 * being spent down here, not out there.
 *
 * **How it can lose.** Twice in two beats is nearly a flicker, and a phone
 * held at arm's length may read it as a fault in the screen rather than as a
 * measure of anything. It also puts a warm colour on a field that has a warm
 * body in it already — a pod is amber — and the edges are exactly where a
 * creature crossing the outer columns is drawn.
 */

/** How far into the field the light reaches, as a share of the field's width. */
const REACH = 0.13;

/** How much further up the field it reaches than across it. */
const RISE = 2.2;

/** The flare at its brightest, on the first beat of a window. */
const FLARE = 0.5;

export const gutteringBeat: SlowLook["paint"] = (ctx, l, _world, _view, win) => {
  // Where this frame stands inside the beat: 0 the instant a beat turns over,
  // 1 the instant before the next does.
  const phase = 1 - (win.left % 1);
  // Struck and then guttering: up in no time, down across the whole beat.
  const strike = Math.max(0, 1 - phase) ** 3;
  // And less to burn every beat, so the last one is the faint one.
  const fuel = win.beats <= 0 ? 0 : win.left / win.beats;
  const lit = FLARE * strike * fuel;
  if (lit <= 0) return;
  const reach = l.gridWidth * REACH * RISE;
  const foot = l.hullY;
  ctx.save();
  for (const x of [l.gridLeft, l.gridLeft + l.gridWidth]) {
    const glow = ctx.createRadialGradient(x, foot, 0, x, foot, reach);
    glow.addColorStop(0, rgba(PALETTE.emberRim, lit));
    glow.addColorStop(1, rgba(PALETTE.ember, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(x - reach, foot - reach, reach * 2, reach);
  }
  ctx.restore();
};
