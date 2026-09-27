import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { FUSE_THICK, type FusePlace } from "./slow-fuse-place.js";
import type { SlowWindow } from "./slow-look.js";

/**
 * **A fuse under the boss: how long the pair has left before the step fails.**
 *
 * The owner asked on 25 September 2026 for *some progress indicator* back on
 * the slow, *remaining time left to take damage when not succeeding*, a day
 * after he took the notched bar under the boss out as *a stupid idea*. Of the
 * four answers put to him this is the one he had built into the game, and he
 * kept it over the other three in VERSUS (`tools/versus/DECIDED.md`).
 *
 * **Where the eye already is.** It stood along the top edge of the screen
 * from 25 September 2026, beside where the light runs in, and on the 27th the
 * owner moved it: *below the boss and between the ship hull*. So it stands
 * level on the boss's own column, halfway between the bottom of the body and
 * the top of the hull, and never over a live mark (`slow-fuse-place.ts` says
 * where, and how it gets out of a mark's way). The pair is already looking at
 * the body the window is about, and the measure is read without looking away.
 *
 * **It burns in from both ends** and meets in the middle on the beat the
 * window shuts, so the eye reads one length and never has to find which end is
 * moving. There are no notches: the bar's were the part that read as a
 * spreadsheet. It goes orange at half the window and red for the last
 * `URGENT` beats — the owner's, the same day: *add an orange-like warning
 * colour before the red, somewhere in the middle*.
 *
 * **It is thick enough to read at a glance** — *more visible (e.g. more
 * height)*, the same day: more than twice the two-tenths of a tile it was at
 * the top, with the glow and the sparks widened to match, and round ends.
 *
 * **It does not fade with the light.** A measure that dims as it empties is a
 * measure that lies about its last beat, so it stands at full strength from
 * the tick the window opens to the tick it shuts, and a step answered early
 * shuts the window and takes the fuse with it (`sim/slow.ts` `closeSlow`).
 */

/** How wide the fuse's glow is, in tiles; how thick it is is `FUSE_THICK`. */
const GLOW = 1.2;

/** The spark at each burning end, in tiles. */
const SPARK = 0.8;

/** The share of the window left at which the fuse turns orange. */
const WARN = 0.5;

/** Beats left at which the fuse turns red. */
const URGENT = 2;

/** The fuse's colours for how much of the window is left: the ship's violet,
 * then the ember's orange, then red. */
export function fuseColours(win: Omit<SlowWindow, "asks">): { body: string; core: string } {
  if (win.left <= URGENT) return { body: PALETTE.red, core: PALETTE.redRim };
  if (win.left <= win.beats * WARN) return { body: PALETTE.ember, core: PALETTE.emberRim };
  return { body: PALETTE.hull, core: PALETTE.hullRim };
}

/**
 * Draws the fuse for the window this frame is inside — **only on one that
 * asks.** A dramatic beat, a fall or a landing, asks for nothing and fails
 * nobody (`decisions.md` #33); a fuse on it would count down to a hit that
 * never comes. The world says which it is (`sim/slow.ts` `SlowKind`), so the
 * fuse no longer guesses from the window's length.
 */
export function drawFuse(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  win: SlowWindow,
  at: FusePlace,
): void {
  if (!win.asks) return;
  const rest = win.left / win.beats;
  if (rest <= 0) return;
  const { body, core } = fuseColours(win);
  drawFuseLine(ctx, l, at, rest, body, core);
}

/**
 * **The line itself**, `rest` of its whole length centred on `at`, with
 * a spark at each end. Shared with THE REPRISE's measure (`reprise-fuse.ts`),
 * so the two fuses in the game are one drawing and only what they count
 * differs.
 */
export function drawFuseLine(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: FusePlace,
  rest: number,
  body: string,
  core: string,
): void {
  const mid = at.x;
  const half = at.half * rest;
  const y = at.y;
  const thick = l.tile * FUSE_THICK;
  const line = (width: number, colour: string): void => {
    ctx.lineWidth = width;
    ctx.strokeStyle = colour;
    ctx.beginPath();
    ctx.moveTo(mid - half, y);
    ctx.lineTo(mid + half, y);
    ctx.stroke();
  };

  ctx.save();
  ctx.lineCap = "round";
  // Glow, body, core: widest and faintest first, so it reads as lit rather
  // than ruled.
  line(l.tile * GLOW, rgba(body, 0.18));
  line(thick * 1.6, rgba(body, 0.35));
  line(thick, rgba(body, 0.95));
  line(thick * 0.4, rgba(core, 0.95));

  // Where it is burning: one spark on each end, added, so the ends are the
  // brightest thing on the line and the eye goes to where it moves.
  const r = l.tile * SPARK;
  ctx.globalCompositeOperation = "lighter";
  for (const x of [mid - half, mid + half]) {
    const spark = ctx.createRadialGradient(x, y, 0, x, y, r);
    spark.addColorStop(0, rgba(core, 0.95));
    spark.addColorStop(0.35, rgba(body, 0.5));
    spark.addColorStop(1, rgba(body, 0));
    ctx.fillStyle = spark;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}
