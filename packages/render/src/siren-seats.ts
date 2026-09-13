import type { Seat } from "./comms.js";
import { drawEarGlyph, drawSpeechGlyph } from "./comms-glyphs.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { hasSeatName, type SeatNames, seatName } from "./seat-name.js";

/**
 * The two chips that flank the siren: which seat, and what that seat has to do
 * about the thing on the field.
 *
 * Its own file beside `siren.ts` for the reason `veil-marks.ts` sits beside
 * `veil-marks.ts`: next door is the *instrument* — a dial with rings and a
 * turning core, all of it phase off a clock — and this is the *answer*, which
 * has no motion in it worth speaking of and is entirely about legibility at
 * twenty pixels. They are argued about separately and they change separately.
 */

/** The corner button — ☰, the way back to the menu — as `apps/game/src/menu.css`
 * places it: eight pixels in from the right, thirty-two wide, and over
 * everything. Furniture in fixed pixels like the hull bar and the beat dots,
 * so the instrument can know it is there without knowing the DOM. */
const MENU_CHIP_REACH = 8 + 32;

/** The gap between the cluster and the right edge of the screen. It lives here
 * with the chip's own box rather than in `siren.ts`, because the torch alarm's
 * line hangs off the same edge (`torch-alarm.ts`) and this file is the one
 * both can read without importing the instrument. One edge, named once.
 *
 * **Clear of the corner button, not of the edge.** The first two phones with
 * names on them (13 September 2026) showed the right chip's last letters and
 * its ear under the ☰, and the seat's own ring on top of it: the chips are
 * level with the button's bottom third, and a pad of ten pixels put the whole
 * P2 pill inside its box before there were names to lengthen it. */
export const SIREN_PAD = MENU_CHIP_REACH + 6;

/**
 * The chip's own box — the **narrowest** it is drawn at, which is what P1 and
 * P2 need, and what every chip was until the two people had names.
 */
export const PILL_W = 34;
const PILL_H = 20;
/** The label's own type, and the one number that lets a chip be sized without
 * a canvas: Courier is monospaced, so a nine-pixel character is 5.4 across and
 * a label's width is its length. `sirenCentre` needs the width before anything
 * has a context to measure with (`siren.ts`), and a second measurement taken
 * with one would be the same number arrived at twice. */
const PILL_FONT = '700 9px "Courier New",monospace';
const CHAR_W = 5.4;
/** What is around the label inside the pill: the left inset, and the glyph at
 * the right end with its own air — the glyph is centred nine pixels in and is
 * eleven wide, so anything under fourteen and a half has a long name's last
 * letter touching it, which is what the first phone with names showed. */
const TEXT_LEFT = 4;
const GLYPH_ROOM = 16;

/**
 * How wide this chip is, for the label it is carrying.
 *
 * **The pill grows and the name is never cut.** The owner asked for the two
 * people's names where the game used to write P1 and P2, and a name clipped to
 * a fixed box is the thing that asks for — a pair squinting at DAVI. So the box
 * follows the word, and what keeps the cluster affordable is the *name's* own
 * limit (`packages/net/src/nickname.ts`, twelve characters, chosen against this
 * pill) and the fact that these chips are drawn while a call is on and at no
 * other time (`siren.ts`).
 */
export function pillWidth(label: string): number {
  return Math.max(PILL_W, Math.round(TEXT_LEFT + label.length * CHAR_W + GLYPH_ROOM));
}

/**
 * What this chip says: the seat's own name where the room knows one, and the
 * two letters the game has always used where it does not — a device playing
 * alone, a seat nobody has claimed, a frame test.
 *
 * P1 rather than `seatName`'s PLAYER 1 for the nameless case, because this is
 * the one label in the game with no room to spare and the letters are what it
 * was drawn for.
 */
export function seatChip(seat: Seat, names?: SeatNames): string {
  const who = seat === "p1" ? 1 : 2;
  return hasSeatName(who, names) ? seatName(who, names) : `P${who}`;
}
/** The housing colour the label is knocked out of, shared with the dial. */
const CASE = "#0D1117";

/**
 * One seat's chip: its name and the job it has this frame.
 *
 * **The talker is a solid block and the listener is an outline**, and that is
 * the whole of the difference — not two brightnesses of the same shape. The
 * first version drew both as dim pills and separated them by alpha, which is a
 * distinction the eye has to *compare* to read: with one chip on screen there
 * is nothing to compare it against, and the answer to "am I the one talking"
 * arrives a beat late. Filled against unfilled is legible on its own, from a
 * glance, with no second chip to hold it up.
 *
 * **`mine` is a ring and not a brightness, and that took two tries.** Dimming
 * the partner's chip is the obvious way to say whose is whose, and it fights
 * the sentence above: on the navigator's screen the seat that has to talk is
 * the *other* one, so the chip carrying the whole message was the chip being
 * faded out. Both are now drawn at full strength and the local seat is circled
 * in the hull's own purple instead — the colour of the ship each player is
 * sitting in, used nowhere else up here. Talk versus listen is read off the
 * fill; you versus them is read off the ring; neither costs the other anything.
 */
export function drawSeat(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  seat: Seat,
  talks: boolean,
  cx: number,
  cy: number,
  time: number,
  /** The two people's names, where the room knows them (`seatChip`). */
  names?: SeatNames,
): void {
  // The test view is both halves on one screen, so neither chip is anybody's
  // "own" and neither is ringed — the same exemption `showsVeilCore` makes.
  const mine = l.role === seat;
  // Only a talker's chip breathes. A listener has nothing to time.
  const pulse = talks ? 0.84 + 0.16 * Math.sin(time * 6) : 1;
  const label = seatChip(seat, names);
  const width = pillWidth(label);
  const left = cx - width / 2;
  const top = cy - PILL_H / 2;

  ctx.font = PILL_FONT;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  if (talks) {
    // Light behind it first, so the block reads as lit rather than as painted.
    halo(ctx, cx, cy, width * 0.85, PALETTE.text, 0.2 * pulse);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = PALETTE.text;
    ctx.beginPath();
    ctx.roundRect(left, top, width, PILL_H, 5);
    ctx.fill();
    // Knocked out of the block rather than drawn on it: dark on light is the
    // one contrast nothing else in this HUD uses.
    ctx.globalAlpha = 1;
    ctx.fillStyle = CASE;
    ctx.fillText(label, left + TEXT_LEFT, cy + 0.5);
    drawSpeechGlyph(ctx, left + width - 9, cy - 0.5, 5.4, CASE, 1);
  } else {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = CASE;
    ctx.beginPath();
    ctx.roundRect(left, top, width, PILL_H, 5);
    ctx.fill();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = PALETTE.dim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(left + 0.5, top + 0.5, width - 1, PILL_H - 1, 5);
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText(label, left + TEXT_LEFT, cy + 0.5);
    drawEarGlyph(ctx, left + width - 9, cy, 5, PALETTE.dim, 0.95);
  }

  // The ring that says *this one is you*, outside the box either way.
  if (mine) {
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = PALETTE.hull;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(left - 2.5, top - 2.5, width + 5, PILL_H + 5, 7);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}
