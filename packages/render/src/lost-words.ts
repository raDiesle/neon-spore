import { halo } from "./glow.js";
import type { LostPaint } from "./lost-look.js";
import { PALETTE } from "./palette.js";
import { drop } from "./text-drop.js";

/**
 * The words of the lost screen: WAVE LOST, which wave it was, and the try
 * count in the corner.
 *
 * **Four lines became two on 22 September 2026**, at the owner's word. What it
 * said was WAVE LOST, then `WAVE 4 · TRY 2 · RUN IT AGAIN`, then *The tear is
 * where it came in.*, then `THIS RUN · 3 RETRIES`, and under the buttons *One
 * press answers for both phones.* — five sentences on a screen whose whole job
 * is to be read in the second after something went wrong. He asked for the
 * wave's number and its name and nothing else, the try count moved to the top
 * corner where a count belongs, and WAVE LOST given the room the rest of it
 * was taking.
 *
 * **Each thing is said once.** The wave's number was on the same screen as its
 * own name would have been, so the two are one line now; the try count is in
 * the corner and therefore not in that line. The instruction about both phones
 * went because it was telling the pair a rule they find out by pressing, on
 * the one screen where they are not reading.
 *
 * The words fall in the way the introduction's do (`text-drop.ts`), off the
 * opening's clock. This file is the `shutters` candidate whole, under its own
 * name since that slot was closed with nothing taken (`versus/DECIDED.md`).
 */

/**
 * Where WAVE LOST sits, as a share of the play area.
 *
 * Centred in the upper plate rather than stamped near its top edge: the owner
 * asked for the words *more centered* in the same breath as *bigger*, and the
 * plate meets its partner at `SEAM` — 0.44 of the play area (`lost-shut.ts`)
 * — so a little over a quarter of the way down is the middle of the only
 * surface these words stand on.
 */
const TOP = 0.26;

/** WAVE LOST's own size, and the gap to the line under it. */
const HEAD = '700 46px "Courier New",monospace';
const LINE = 34;

/**
 * The bloom behind WAVE LOST: three sprites at one radius, side by side.
 *
 * The effect the owner asked for, and the one that costs nothing to read
 * through — light behind the type rather than movement on it. Three at one
 * radius and not one wide ellipse because `halo` bakes per colour and radius
 * (`glow.ts`), so a word-shaped glow would be a sprite of its own.
 */
const BLOOM = 62;
const BLOOM_SPREAD = 64;

/** The try count, in the top-left corner, where a count belongs. */
function corner(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  ctx.textAlign = "left";
  ctx.globalAlpha = Math.max(0, Math.min(1, p.age / 0.4)) * 0.85;
  ctx.font = '600 12px "Courier New",monospace';
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(`TRY ${p.tries}`, 18, 34);
  ctx.globalAlpha = 1;
}

export function words(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  corner(ctx, p);

  const mid = p.l.width / 2;
  const y = p.l.playHeight * TOP;
  ctx.textAlign = "center";

  // The bloom is drawn outside `drop` and on its own clock: `halo` sets
  // `globalAlpha` and puts it back to one (`glow.ts`), which would undo the
  // fade of anything drawn inside the fall after it.
  const lit = Math.max(0, Math.min(1, p.age / 0.5));
  for (const dx of [-BLOOM_SPREAD, 0, BLOOM_SPREAD]) {
    halo(ctx, mid + dx, y - 15, BLOOM, PALETTE.red, 0.16 * lit);
  }

  drop(ctx, mid, y, p.age, 1, 0, () => {
    ctx.font = HEAD;
    // Cast down onto the plate, then filled, then lit along the top edge: the
    // word stands off the bulkhead rather than being printed on it, and none
    // of the three moves.
    ctx.fillStyle = PALETTE.redDark;
    ctx.fillText("WAVE LOST", 0, 3);
    ctx.fillStyle = PALETTE.red;
    ctx.fillText("WAVE LOST", 0, 0);
    const was = ctx.globalAlpha;
    ctx.globalAlpha = was * 0.3;
    ctx.fillStyle = PALETTE.redRim;
    ctx.fillText("WAVE LOST", 0, -2);
    ctx.globalAlpha = was;
  });

  drop(ctx, mid, y + LINE, p.age, 2, 0, () => {
    ctx.font = '600 13px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAVE ${p.wave} · ${p.name}`, 0, 0);
  });

  ctx.textAlign = "left";
}
