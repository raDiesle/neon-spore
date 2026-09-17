import { inside, type NavBox } from "./guide-nav.js";
import { wordPlate } from "./guide-tide-plate.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";

/**
 * What the pair does about a lost wave: RETRY WAVE, QUIT, and the line saying
 * either phone answers for both.
 *
 * Split out of `lost-screen.ts` on 17 September 2026 when that file went past
 * 250 lines. The cut is where the seam already was: everything above it —
 * the veil, the tear, the words — is `LOST_LOOK`'s and a candidate may replace
 * all of it, and **these two buttons are the one part of the screen a
 * candidate may not touch**, because `apps/game/src/lost.ts` and the
 * director's `stage-opening.ts` hit-test the boxes `lostButtons` hands out. A
 * look that moved them would move the picture and not the thumb
 * (`lost-look.ts`).
 */

const BTN_H = 52;
/**
 * **QUIT is smaller than RETRY and stands further from it**, asked for by the
 * owner on 17 September 2026: *the "quit" button, we should do less prominent
 * maybe reduce size of button or move it somewhere else, as player might
 * accidently press it.*
 *
 * The two used to be one stack of identical plates eighteen pixels apart, and
 * the only thing telling them apart was the word on the face and a glow —
 * which is nothing to a thumb coming down on a screen that has just been lost.
 * A wave can be left, and leaving it ends the run for **both** phones on one
 * press (`sim/wave-fail.ts`), so the slip is not one a pair can undo.
 *
 * Three things rather than one, because any of them alone is still a plate
 * beside a plate: a bigger gap, so the thumb has to travel; a narrower and
 * shorter body with a smaller word, so the eye reads it as the lesser of the
 * two; and it is drawn dimmer than the one you are meant to press.
 *
 * **Not a confirmation step**, which was the other answer on the table: the
 * screen prints *One press answers for both phones*, and a QUIT that asked
 * twice would make that line false for the one button where being wrong costs
 * the run.
 */
const BTN_GAP = 46;
/** QUIT's own body: a share of RETRY's width, and its own height. */
const QUIT_W = 0.56;
const QUIT_H = 36;
const WORD = '700 18px "Courier New",monospace';
const QUIT_WORD = '700 13px "Courier New",monospace';
/** How much of RETRY's brightness QUIT is drawn at. */
const QUIT_DIM = 0.7;
/** The arrow beside a word, as a radius. The guide's big button uses eleven. */
const SIGN = 9;
const QUIT_SIGN = 7;

export interface LostButtons {
  retry: NavBox;
  quit: NavBox;
}

/** Where the two buttons are, for the hand that presses them (`apps/game/src/lost.ts`). */
export function lostButtons(l: Layout): LostButtons {
  const w = Math.min(l.width - 72, 260);
  const x = (l.width - w) / 2;
  const y = l.playHeight * 0.52;
  const qw = Math.round(w * QUIT_W);
  return {
    retry: { x, y, w, h: BTN_H },
    // Centred under RETRY rather than sharing its left edge: a narrower plate
    // hung off the same edge reads as a torn-off piece of the one above it.
    quit: { x: x + Math.round((w - qw) / 2), y: y + BTN_H + BTN_GAP, w: qw, h: QUIT_H },
  };
}

export function lostHit(l: Layout, x: number, y: number): "retry" | "quit" | null {
  const b = lostButtons(l);
  if (inside(b.retry, x, y)) return "retry";
  if (inside(b.quit, x, y)) return "quit";
  return null;
}

/** The two buttons and the line under them: what the pair does about it. */
export function drawLostAnswer(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  v: { age: number; pointer?: { x: number; y: number } },
): void {
  // The buttons arrive after the words, and not by falling: a thing to be
  // pressed should be still by the time a thumb reaches it.
  //
  // Centred here rather than inherited: the words above are a candidate's to
  // draw and an answer that left the alignment anywhere would hang both button
  // faces off the side of their own bodies (`lost-look.ts`).
  const mid = l.width / 2;
  ctx.textAlign = "center";
  const shown = Math.max(0, Math.min(1, (v.age - 0.55) / 0.3));
  if (shown > 0) {
    const b = lostButtons(l);
    const skin = seatSkin(l.role);
    const over = (box: NavBox): boolean =>
      v.pointer !== undefined && inside(box, v.pointer.x, v.pointer.y);
    ctx.globalAlpha = shown;
    // **The tutorial's own plates** (`guide-tide-plate.ts`), asked for by the
    // owner on 17 September 2026 — *make sure buttons of "wave end" looks like
    // the new buttons of tutorial guide*. They were the guide bar's grown
    // bodies, which is what that bar drew until TIDE replaced it, so these two
    // were the last pair in the game still wearing the shape it left behind.
    // RETRY takes NEXT's forward arrow and QUIT takes BACK's, which is the
    // same reading TIDE made of the two: one goes on, one leaves.
    wordPlate(
      ctx,
      {
        ...b.retry,
        hex: PALETTE.pod,
        glow: 0.45 + 0.35 * Math.abs(Math.sin(v.age * 2.2)),
        live: true,
        hover: over(b.retry),
        dpr: l.dpr,
        lip: skin.lip,
      },
      "RETRY WAVE",
      1,
      WORD,
      SIGN,
    );
    ctx.globalAlpha = shown * QUIT_DIM;
    wordPlate(
      ctx,
      {
        ...b.quit,
        hex: PALETTE.hull,
        glow: 0,
        live: true,
        hover: over(b.quit),
        dpr: l.dpr,
        lip: skin.lip,
      },
      "QUIT",
      -1,
      QUIT_WORD,
      QUIT_SIGN,
    );
    ctx.globalAlpha = shown * 0.72;
    // Centred again: `wordPlate` leaves the alignment where every other caller
    // of it wants it, which is left, and the line under the buttons is the one
    // thing on this screen drawn after them.
    ctx.textAlign = "center";
    ctx.font = '11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("One press answers for both phones.", mid, b.quit.y + b.quit.h + 26);
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = "left";
}
