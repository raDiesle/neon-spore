import { retriesText } from "@neon-spore/sim";
import type { LostPaint } from "./lost-look.js";
import { PALETTE } from "./palette.js";
import { drop } from "./text-drop.js";

/**
 * The words of the lost screen: WAVE LOST and the three lines under it.
 *
 * This file was the `shutters` screen whole — plates and words — taken on 16
 * September 2026. Its plates were replaced the next day by `lost-shut.ts`,
 * which draws the same sentence the right way round (its header says how), and
 * what is left here is the stack every answer in the slot shared. `wordsAt`
 * is the same text at a caller's height; `words` is it where it ships.
 */

/**
 * Where the stack starts, as a share of the play area: as far up the upper
 * plate as the plate goes, so it reads as a sign on a bulkhead rather than as
 * a caption floating over a picture.
 */
const TOP = 0.16;

/**
 * The words, starting at `top` of the play area.
 *
 * A parameter rather than the constant, for the same reason the plates and the
 * fluid came apart (`lost-blood.ts`): the owner asked on 17 September 2026 for *text of "wave
 * lost" more down near the game screen*, and a candidate that argued it by
 * copying all four lines out would be four copies of the wording to keep in
 * step. `words` below is this at the shipped number and is what ships.
 */
export function wordsAt(ctx: CanvasRenderingContext2D, p: LostPaint, top: number): void {
  const mid = p.l.width / 2;
  ctx.textAlign = "center";
  let y = p.l.playHeight * top;
  drop(ctx, mid, y, p.age, 1, 0, () => {
    ctx.font = '700 30px "Courier New",monospace';
    ctx.fillStyle = PALETTE.red;
    ctx.fillText("WAVE LOST", 0, 0);
  });
  y += 24;
  drop(ctx, mid, y, p.age, 2, 0, () => {
    ctx.font = '600 12px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAVE ${p.wave} · TRY ${p.tries} · RUN IT AGAIN`, 0, 0);
  });
  y += 22;
  drop(ctx, mid, y, p.age, 3, 0, () => {
    ctx.font = '13px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("The tear is where it came in.", 0, 0);
  });
  // The run's own figure, asked for by the owner on 16 September 2026 as *the
  // score*: not this wave's try, which the line above already gives, but how
  // many times the pair has gone again across every wave of the run. It is the
  // number the HUD's corner and the balance sheet both close on
  // (`hud.ts`, `balance.ts`), and the lost screen is where another one is
  // about to be added — so it is said in the same words `retriesText` gives
  // those two, and never spelled a second way.
  y += 20;
  drop(ctx, mid, y, p.age, 4, 0, () => {
    ctx.font = '11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.globalAlpha *= 0.8;
    ctx.fillText(`THIS RUN · ${retriesText(p.retries)}`, 0, 0);
  });
  ctx.textAlign = "left";
}

/** The shipped stack, where it has always been. */
export function words(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  wordsAt(ctx, p, TOP);
}
