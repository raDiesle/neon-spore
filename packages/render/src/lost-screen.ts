import { spanOf, type World } from "@neon-spore/sim";
import { breachHue } from "./breach-hue.js";
import { strikeSeed } from "./breach-strike.js";
import { inside, type NavBox } from "./guide-nav.js";
import { wordPlate } from "./guide-tide-plate.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { LOST_LOOK } from "./lost-look.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";

/**
 * A lost wave stops on a friendly screen: RETRY WAVE or QUIT.
 *
 * The owner asked for it by name, 13 September 2026, in place of the hold
 * that used to open the same wave again by itself. The field stays under it,
 * greyed, with the breach still where it was seen — the point of the pause was
 * that the pair look at where it got through, and a screen that hid it would
 * be a screen that took that away. Over it, in the introduction's own type:
 * which wave and which try, the two words, and one line for the two of them.
 * Then two buttons, the guide bar's own grown bodies with a word on the face
 * instead of a sign, because these two are the one place in the game where a
 * sign would not do: a wave can be *left*, and the word for that has to be
 * read, not guessed.
 *
 * **One press answers for both phones.** Either seat's RETRY opens the wave
 * again on both; either seat's QUIT ends the run on both, and the other phone
 * is told who it was (`sim/wave-fail.ts`). The line under the buttons says so,
 * because the thing the screen must not do is have two people each waiting
 * for the other to press.
 *
 * The words fall in the way the introduction's do (`text-drop.ts`), off the
 * opening's clock: `openingKey` names this screen as a page of its own, so
 * the drop replays every time the wave is lost and never while it is held.
 */

const BTN_H = 52;
const BTN_GAP = 18;
const WORD = '700 18px "Courier New",monospace';
/** The arrow beside a word, as a radius. The guide's big button uses eleven. */
const SIGN = 9;

export interface LostButtons {
  retry: NavBox;
  quit: NavBox;
}

/** Where the two buttons are, for the hand that presses them (`apps/game/src/lost.ts`). */
export function lostButtons(l: Layout): LostButtons {
  const w = Math.min(l.width - 72, 260);
  const x = (l.width - w) / 2;
  const y = l.playHeight * 0.52;
  return {
    retry: { x, y, w, h: BTN_H },
    quit: { x, y: y + BTN_H + BTN_GAP, w, h: BTN_H },
  };
}

export function lostHit(l: Layout, x: number, y: number): "retry" | "quit" | null {
  const b = lostButtons(l);
  if (inside(b.retry, x, y)) return "retry";
  if (inside(b.quit, x, y)) return "quit";
  return null;
}

export interface LostView {
  /** Seconds the screen has been up; the words fall in over the first of them. */
  age: number;
  /** Where a mouse is resting, in stage coordinates. Absent on a phone. */
  pointer?: { x: number; y: number };
  /** The membrane the frame drew, for an answer that replays the breach on it.
   * Absent where there is no ship under the screen at all (`briefing.ts`). */
  surfaceY?: SurfaceY;
  /** The foot of a band this screen is being drawn under, when it is being
   * drawn inside something else. Absent on the game, which has no band. */
  clearTop?: number;
}

/**
 * What a screen drawn inside a page does about the page's own band.
 *
 * A rehearsal plays the game inside a film, and the game's screens are part of
 * the game — so a page whose world has lost the wave draws this one at the
 * film's full size, and WAVE LOST landed 73 pixels down with the tutorial
 * plate on top of it. TORCH, BULB QUEEN, THE LURE and THE COIL each have such
 * a page (`docs/queue.md`, 16 September 2026). The owner's answer of 17
 * September 2026: **the lost screen is drawn shrunk inside the page.**
 *
 * Shrunk, rather than rearranged, because nothing on it can step aside on its
 * own the way a header or a chart does: the words are a candidate's to place
 * (`lost-look.ts`), and the buttons are hit-tested at the coordinates they are
 * drawn at (`apps/game/src/lost.ts`), so an answer that moved them *would move
 * the picture and not the thumb*. Under a transform they stay one screen, and
 * with no band there is no transform and not a pixel moves.
 *
 * **The veil is not in it.** The dimming and the tear are what the screen says
 * about the field *under* it, registered with that field's own hull — fitted
 * with the rest, they stop short of the hull and leave a lit margin round
 * three sides with a rectangle's edge across the middle of the picture, which
 * is what the first cut of this drew. So the field greys whole and what is
 * read is what moves.
 */
function fitted(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  clearTop: number,
  draw: () => void,
): void {
  const k = (l.height - clearTop) / l.height;
  ctx.save();
  ctx.translate((l.width * (1 - k)) / 2, clearTop);
  ctx.scale(k, k);
  draw();
  ctx.restore();
}

export function drawLostScreen(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  v: LostView,
): void {
  // The veil and the words are `LOST_LOOK`'s, and the shipped record draws
  // exactly what this function used to draw in these two places. The split is
  // the seam a candidate reaches through (`lost-look.ts`).
  const scarred = world.scars[world.scars.length - 1];
  const paint = {
    l,
    age: v.age,
    wave: world.wave + 1,
    tries: Math.max(1, world.waveTries),
    retries: world.retries,
    breachX: scarred === undefined ? null : tileCX(l, scarred.col),
    // **The colour the hit arrived in, off the scar itself.** A `Scar` carried
    // what hit the ship and not what colour it was wearing until 17 September
    // 2026, so a body that was shot cyan replayed in the red `breachHue` gives
    // a colourless one and the live strike and its own replay a second later
    // disagreed about what broke the hull. The field is `Scar.color`, and it
    // is absent exactly where a colour is not a fact about the hit — a rock, a
    // round from off the field — which is the `null` this passed always.
    breach:
      scarred === undefined
        ? null
        : {
            span: spanOf(scarred),
            hex: breachHue(scarred.kind, scarred.color ?? null),
            seed: strikeSeed(scarred.col, scarred.beat),
          },
    surfaceY: v.surfaceY ?? (() => l.hullY),
    hullY: l.hullY,
    buttonsY: lostButtons(l).retry.y,
  };
  LOST_LOOK.veil(ctx, paint);
  const under = v.clearTop;
  if (under !== undefined && under > 0) {
    fitted(ctx, l, under, () => {
      LOST_LOOK.words(ctx, paint);
      drawLostAnswer(ctx, l, v);
    });
    return;
  }
  LOST_LOOK.words(ctx, paint);
  drawLostAnswer(ctx, l, v);
}

/** The two buttons and the line under them: what the pair does about it. */
function drawLostAnswer(ctx: CanvasRenderingContext2D, l: Layout, v: LostView): void {
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
      WORD,
      SIGN,
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
