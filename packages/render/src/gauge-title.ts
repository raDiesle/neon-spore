import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE GAUGE's header: the name and the one sentence that teaches this seat
 * its half. Its own file because `gauge.ts` is the dial and the needle, and
 * the two grew past the line count together when the header learned to
 * make room for a rehearsal's plate.
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
  // caller says where the top is, because a rehearsal has a plate there
  // (`round-header.ts`).
  const y = top;
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("THE GAUGE", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(taught(role), l.width / 2, y + 22);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(withheld(role), l.width / 2, y + 38);
}

/**
 * How far under the name's baseline the title's last row ends: the two rows
 * under it sit at +22 and +38, and the last is nine pixels tall.
 */
export const GAUGE_TITLE_DEPTH = 42;
/** What this screen can do. */
function taught(role: ViewRole): string {
  if (role === "p1") return "turn it where they tell you";
  if (role === "p2") return "say where it has to go, then call";
  return "one of you turns, the other calls";
}

/** And what it is not being shown, said out loud rather than merely missing. */
function withheld(role: ViewRole): string {
  if (role === "p1") return "YOU CANNOT SEE THE MARKS";
  if (role === "p2") return "YOU CANNOT TURN IT";
  return "NEITHER HALF IS ENOUGH ON ITS OWN";
}
