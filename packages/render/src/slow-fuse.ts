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
 * from 25 September 2026, and on the 27th the owner moved it: *below the boss
 * and between the ship hull*. On the 30th it became as long as the screen, and
 * stands over the boss instead when the boss is down on the hull
 * (`slow-fuse-place.ts` says where, and how it gets out of a mark's way).
 *
 * **It starts the same length every time** — the owner, 30 September 2026:
 * *the size to start should always be the same (almost full screen)*. It
 * counts from the latest ask rather than from the window's first beat, so a
 * step asked inside a window the last one left open starts whole and never
 * grows back (`slow-opening.ts`).
 *
 * **It burns in from both ends** and meets in the middle on the beat the
 * window shuts, so the eye reads one length and never has to find which end is
 * moving. There are no notches: the bar's were the part that read as a
 * spreadsheet. **Its colour is how much is left**, in quarters, the same day:
 * *starting green, then blue then to orange and then to red*.
 *
 * **Thin, and lit** — *make the glowing look better and less height*, the same
 * day: a fifth of a tile of line with a white-hot core, in a glow of three
 * wide faint strokes that fall off softly rather than one flat band, and a
 * small spark at each burning end.
 *
 * **It does not fade with the light.** A measure that dims as it empties is a
 * measure that lies about its last beat, so it stands at full strength from
 * the tick the window opens to the tick it shuts, and a step answered early
 * shuts the window and takes the fuse with it (`sim/slow.ts` `closeSlow`).
 */

/** The glow round the line, widest first: its width in lines, and its alpha. */
const GLOW: readonly (readonly [number, number])[] = [
  [5, 0.06],
  [3.2, 0.12],
  [2, 0.28],
];

/** The spark at each burning end, in lines; how thick a line is is `FUSE_THICK`. */
const SPARK = 2.6;

/** The fuse's colours for the share of its length left: green, blue, the
 * ember's orange, then red, a quarter each. */
export function fuseColours(rest: number): { body: string; core: string } {
  if (rest > 0.75) return { body: PALETTE.good, core: PALETTE.goodRim };
  if (rest > 0.5) return { body: PALETTE.blue, core: PALETTE.blueRim };
  if (rest > 0.25) return { body: PALETTE.ember, core: PALETTE.emberRim };
  return { body: PALETTE.red, core: PALETTE.redRim };
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
  const rest = Math.min(1, win.left / win.span);
  if (rest <= 0) return;
  const { body, core } = fuseColours(rest);
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
  for (const [width, alpha] of GLOW) line(thick * width, rgba(body, alpha));
  line(thick, rgba(body, 0.95));
  line(thick * 0.4, rgba(core, 0.95));

  // Where it is burning: one spark on each end, added, so the ends are the
  // brightest thing on the line and the eye goes to where it moves.
  const r = thick * SPARK;
  ctx.globalCompositeOperation = "lighter";
  for (const x of [mid - half, mid + half]) {
    const spark = ctx.createRadialGradient(x, y, 0, x, y, r);
    spark.addColorStop(0, rgba(core, 0.95));
    spark.addColorStop(0.3, rgba(body, 0.45));
    spark.addColorStop(1, rgba(body, 0));
    ctx.fillStyle = spark;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}
