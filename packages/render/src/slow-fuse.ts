import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { SlowWindow } from "./slow-look.js";

/**
 * **A fuse along the top of the screen: how long the pair has left before the
 * step fails.**
 *
 * The owner asked on 25 September 2026 for *some progress indicator* back on
 * the slow, *remaining time left to take damage when not succeeding*, a day
 * after he took the notched bar under the boss out as *a stupid idea*. Of the
 * four answers put to him this is the one he had built into the game, and the
 * others stand in VERSUS against it (`tools/versus/candidates/slow-measure/`).
 *
 * **Where the light already starts.** The streams run in from the top of the
 * screen (`slow-intake-streams.ts`), so the measure sits on that edge rather
 * than in the field: nothing under the boss, nothing between the marks, and
 * no third place to look beside the body and the band. The stage already
 * stands inside the phone's own furniture (`layout-stage.ts`), so the top of
 * this canvas is under the status bar and not behind it.
 *
 * **It burns in from both ends** and meets in the middle on the beat the
 * window shuts, so the eye reads one length and never has to find which end is
 * moving. There are no notches: the bar's were the part that read as a
 * spreadsheet. It goes red for the last `URGENT` beats, which is the one
 * thing it says that its length does not.
 *
 * **It does not fade with the light.** A measure that dims as it empties is a
 * measure that lies about its last beat, so it stands at full strength from
 * the tick the window opens to the tick it shuts, and a step answered early
 * shuts the window and takes the fuse with it (`sim/slow.ts` `closeSlow`).
 */

/** How thick the fuse is, and how far its glow falls down the screen, in
 * tiles. */
const THICK = 0.12;
const GLOW = 0.45;

/** The spark at each burning end, in tiles. */
const SPARK = 0.45;

/** Beats left at which the fuse turns red. */
const URGENT = 2;

/**
 * **The shortest window the fuse is drawn on, in beats.**
 *
 * Nothing in the world says whether a window asks for something. Most boss
 * windows do — a step to answer, a pry to hold — and they run from six beats
 * up; the rest are a dramatic beat or two, a fall or a landing, that asks for
 * nothing and fails nobody (`decisions.md` #33). THE INSTAR's fall is four. A
 * fuse on one of those would count down to a hit that never comes, so the
 * length decides until the world can say it (`docs/queue.md`).
 */
export const FUSE_MIN_BEATS = 5;

/** Draws the fuse for the window this frame is inside. */
export function drawFuse(ctx: CanvasRenderingContext2D, l: Layout, win: SlowWindow): void {
  if (win.beats < FUSE_MIN_BEATS) return;
  const rest = win.left / win.beats;
  if (rest <= 0) return;

  const mid = l.width / 2;
  const half = mid * rest;
  const thick = l.tile * THICK;
  const urgent = win.left <= URGENT;
  const body = urgent ? PALETTE.red : PALETTE.hull;
  const core = urgent ? PALETTE.redRim : PALETTE.hullRim;

  ctx.save();
  // The glow first, falling from the fuse into the field and gone within a
  // tile, so the edge reads as lit rather than ruled.
  const glow = ctx.createLinearGradient(0, 0, 0, l.tile * GLOW);
  glow.addColorStop(0, rgba(body, 0.35));
  glow.addColorStop(1, rgba(body, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(mid - half, 0, half * 2, l.tile * GLOW);

  ctx.fillStyle = rgba(body, 0.9);
  ctx.fillRect(mid - half, 0, half * 2, thick);
  ctx.fillStyle = rgba(core, 0.95);
  ctx.fillRect(mid - half, 0, half * 2, thick / 2);

  // Where it is burning: one spark on each end, added, so the ends are the
  // brightest thing on the line and the eye goes to where it moves.
  const r = l.tile * SPARK;
  ctx.globalCompositeOperation = "lighter";
  for (const x of [mid - half, mid + half]) {
    const spark = ctx.createRadialGradient(x, thick / 2, 0, x, thick / 2, r);
    spark.addColorStop(0, rgba(core, 0.9));
    spark.addColorStop(0.35, rgba(body, 0.45));
    spark.addColorStop(1, rgba(body, 0));
    ctx.fillStyle = spark;
    ctx.fillRect(x - r, 0, r * 2, r + thick / 2);
  }
  ctx.restore();
}
