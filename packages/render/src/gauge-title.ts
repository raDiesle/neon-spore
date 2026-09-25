import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE GAUGE's header: the name, the one sentence that teaches this seat its
 * half, and where the other half is. Its own file because `gauge.ts` is the
 * cannon and the wound, and the two grew past the line count together when the
 * header learned to make room for a rehearsal's plate.
 */

/**
 * The name, and the one sentence that teaches the round. Different on the two
 * screens because the halves are different — a pair reading the same line
 * would have nothing to tell each other, which is filter 6 of the category
 * (`docs/spec/transfers-hazelight.md`) failed in the first frame.
 */
export function drawGaugeTitle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  role: ViewRole,
  top: number,
): void {
  // Where the name sits, and the two rows keep their distance from it. The
  // caller says where the top is.
  const y = top;
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("THE GAUGE", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(taught(role), l.width / 2, y + 22);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(otherHalf(role), l.width / 2, y + 38);
}

/**
 * How far under the name's baseline the title's last row ends: the two rows
 * under it sit at +22 and +38, and the last is nine pixels tall.
 */
export const GAUGE_TITLE_DEPTH = 42;
/** What this screen does, in the round's own two things: the cannon and the wound. */
function taught(role: ViewRole): string {
  if (role === "p1") return "turn the cannon where they tell you";
  if (role === "p2") return "tell them where the wound is, then call";
  return "one of you turns the cannon, the other calls it";
}

/**
 * Where the other half is — the thing to ask the other seat for, said as a
 * fact about their screen rather than as a lack on this one. It used to be
 * YOU CANNOT SEE THE MARKS, which described a dial nobody draws any more and
 * told the pilot what he could not do; the owner asked for the words to
 * change on 20 September 2026.
 */
function otherHalf(role: ViewRole): string {
  if (role === "p1") return "THE WOUND IS ON THEIR SCREEN";
  if (role === "p2") return "THE CANNON IS IN THEIR HANDS";
  return "ONE SEES THE WOUND, THE OTHER TURNS THE CANNON";
}
