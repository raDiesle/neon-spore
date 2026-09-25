import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { SlowWindow } from "./slow-look.js";

/**
 * **A fuse across the top of the field: how long the pair has left before the
 * step fails.**
 *
 * The owner asked on 25 September 2026 for *some progress indicator* back on
 * the slow, *remaining time left to take damage when not succeeding*, a day
 * after he took the notched bar under the boss out as *a stupid idea*. Of the
 * four answers put to him this is the one he had built into the game, and he
 * kept it over the other three in VERSUS (`tools/versus/DECIDED.md`).
 *
 * **Where the light already starts.** The streams run in from the top of the
 * screen (`slow-intake-streams.ts`), so the measure sits along that edge
 * rather than in the field: nothing under the boss, nothing between the
 * marks, and no third place to look beside the body and the band.
 *
 * **It burns in from both ends** and meets in the middle on the beat the
 * window shuts, so the eye reads one length and never has to find which end is
 * moving. There are no notches: the bar's were the part that read as a
 * spreadsheet. It goes orange at half the window and red for the last
 * `URGENT` beats — the owner's, the same day: *add an orange-like warning
 * colour before the red, somewhere in the middle*.
 *
 * **It hangs below the top chrome, not on the edge.** Drawn flush against the
 * top of the canvas it was a two-pixel line with half of each spark off the
 * screen, and the owner read it as *cut off*. So it stands clear of the ≡
 * button and the link chip (`apps/game/src/game.css`, 8 px down and 32 tall),
 * thick enough to read at a glance, with round ends pulled in from the sides.
 *
 * **It does not fade with the light.** A measure that dims as it empties is a
 * measure that lies about its last beat, so it stands at full strength from
 * the tick the window opens to the tick it shuts, and a step answered early
 * shuts the window and takes the fuse with it (`sim/slow.ts` `closeSlow`).
 */

/** How thick the fuse is, and how wide its glow, in tiles. */
const THICK = 0.2;
const GLOW = 0.6;

/** The spark at each burning end, in tiles. */
const SPARK = 0.5;

/**
 * Where the fuse's middle stands below the top of the stage, in CSS pixels:
 * under the ≡ button and the link chip, which reach 40 px down
 * (`apps/game/src/game.css`), with room for the glow above it. Pixels, not
 * tiles, because the chrome it clears is.
 */
export const FUSE_TOP_PX = 50;

/** How far each end stands in from the side of the screen, in tiles, so the
 * round cap and its spark are whole at the open. */
const SIDE = 0.35;

/** The share of the window left at which the fuse turns orange. */
const WARN = 0.5;

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

/** The fuse's colours for how much of the window is left: the ship's violet,
 * then the ember's orange, then red. */
function colours(win: SlowWindow): { body: string; core: string } {
  if (win.left <= URGENT) return { body: PALETTE.red, core: PALETTE.redRim };
  if (win.left <= win.beats * WARN) return { body: PALETTE.ember, core: PALETTE.emberRim };
  return { body: PALETTE.hull, core: PALETTE.hullRim };
}

/** Draws the fuse for the window this frame is inside. */
export function drawFuse(ctx: CanvasRenderingContext2D, l: Layout, win: SlowWindow): void {
  if (win.beats < FUSE_MIN_BEATS) return;
  const rest = win.left / win.beats;
  if (rest <= 0) return;

  const mid = l.width / 2;
  const half = (mid - l.tile * SIDE) * rest;
  const y = FUSE_TOP_PX;
  const thick = l.tile * THICK;
  const { body, core } = colours(win);
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
