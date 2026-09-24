import { halo } from "./glow.js";
import type { LostPaint } from "./lost-look.js";
import { PALETTE } from "./palette.js";
import { drop } from "./text-drop.js";

/**
 * The words of the lost screen: WAVE 7 LOST, and under it the wave's name and
 * how many tries the run has taken.
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
 * **The number went into the heading on 24 September 2026**, at the owner's
 * word again: *add number of wave in middle of header text "wave lost" so it's
 * e.g. "wave 42 lost"*. The line under it lost its `WAVE 7 ·` with that, and
 * the try count came down out of the corner to stand beside the name — and it
 * counts every try at every wave of the run now, not the tries at this one
 * (`World.runTries`). A corner nobody looks at was the one place on the screen
 * a number could go unread.
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
 * plate meets its partner at `SEAM` (`lost-shut.ts`). Both came up on 24
 * September 2026 with the buttons under them (`lost-answer.ts`), and this is
 * still about the middle of the plate.
 */
const TOP = 0.17;

/**
 * The heading's own size, and the gap to the line under it. **The size is a
 * ceiling**: `WAVE 42 LOST` is three characters wider than `WAVE LOST` was,
 * and on a 240-wide phone forty-six pixels of it would run off both edges, so
 * the heading is shrunk to the width it has (`headFont`).
 */
const HEAD_PX = 46;
const HEAD_MIN_PX = 24;
const HEAD_MARGIN = 16;
const LINE = 34;

function headFont(px: number): string {
  return `700 ${px}px "Courier New",monospace`;
}

/** The largest heading that fits between the margins, never above `HEAD_PX`. */
function fitHead(ctx: CanvasRenderingContext2D, text: string, width: number): string {
  ctx.font = headFont(HEAD_PX);
  const room = width - HEAD_MARGIN * 2;
  const wide = ctx.measureText(text).width;
  if (wide <= room || wide <= 0) return ctx.font;
  return headFont(Math.max(HEAD_MIN_PX, Math.floor((HEAD_PX * room) / wide)));
}

/** The run's tries, as a count a player can say: `1 TRY`, `9 TRIES`. */
export function triesText(tries: number): string {
  return `${tries} ${tries === 1 ? "TRY" : "TRIES"}`;
}

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

export function words(ctx: CanvasRenderingContext2D, p: LostPaint): void {
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

  const head = `WAVE ${p.wave} LOST`;
  const font = fitHead(ctx, head, p.l.width);
  drop(ctx, mid, y, p.age, 1, 0, () => {
    ctx.font = font;
    // Cast down onto the plate, then filled, then lit along the top edge: the
    // word stands off the bulkhead rather than being printed on it, and none
    // of the three moves.
    ctx.fillStyle = PALETTE.redDark;
    ctx.fillText(head, 0, 3);
    ctx.fillStyle = PALETTE.red;
    ctx.fillText(head, 0, 0);
    const was = ctx.globalAlpha;
    ctx.globalAlpha = was * 0.3;
    ctx.fillStyle = PALETTE.redRim;
    ctx.fillText(head, 0, -2);
    ctx.globalAlpha = was;
  });

  drop(ctx, mid, y + LINE, p.age, 2, 0, () => {
    ctx.font = '600 13px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`${p.name} · ${triesText(p.tries)}`, 0, 0);
  });

  ctx.textAlign = "left";
}
