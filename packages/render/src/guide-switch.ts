import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type SeatNames, seatName } from "./seat-name.js";
import { seatSkin } from "./seat-skin.js";

/**
 * The move from one player's screen to the other, and the corner that says
 * which one you are looking at.
 *
 * The owner's first instruction was that the switch must be something a pair
 * can *follow* — a cut between two screens that look alike is a screen that
 * seems to have changed by itself, and the whole lesson of the tutorial is that
 * there are two devices and they carry different halves. So the picture slides
 * (`guide-scene.ts` owns the slide) and a lit seam travels with the join.
 *
 * His second was that it was not loud enough, and the announcement grew into a
 * word across the middle of the picture that arrived with the slide and left a
 * second later. His third took the timing back out of it: *do not fade in or
 * fade out "Player 2 screen" — show it immediately and keep it showing all the
 * time, maybe top left.* That is the better answer and it is worth saying why:
 * a label that comes and goes is only true while it is on screen, so a player
 * who looks up in the middle of a page has to wait for the next one to find out
 * whose screen this is. A permanent one is always the answer. It is small, in
 * the corner, above the field and out of the caption's way — and it is in the
 * seat's own colour, which by then is also the colour of the ship underneath it
 * (`seat-skin.ts`).
 *
 * Its own file beside the stage because it is the one part of the rehearsal
 * that is pure decoration: nothing here reads a world, and removing it would
 * change how the film feels and not what it says.
 */

/** How far the seam's glow reaches either side of the join. */
const SEAM = 5;
/**
 * Where the corner label sits, and how much room it takes. The caption keeps
 * clear of it (`guide-caption.ts`), and it keeps clear of the score and the
 * hull bar, which the HUD draws along the very top of every screen.
 */
export const BANNER_TOP = 26;
export const BANNER_H = 32;

/** The join between the outgoing and incoming screens, lit as it travels. */
export function drawSwitchSeam(ctx: CanvasRenderingContext2D, l: Layout, x: number): void {
  const g = ctx.createLinearGradient(x - SEAM, 0, x + SEAM, 0);
  g.addColorStop(0, "rgba(255,86,168,0)");
  g.addColorStop(0.5, "rgba(255,86,168,.42)");
  g.addColorStop(1, "rgba(255,86,168,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - SEAM, 0, SEAM * 2, l.height);
}

/**
 * Whose screen this is, in the corner of it, for as long as it is up.
 *
 * Two lines: who, and whether that is the phone in this player's own hand. The
 * second line used to read "THIS SCREEN" whoever was looking, which is true on
 * one of the two devices and a lie on the other.
 */
export function drawSeatBanner(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  seat: 1 | 2,
  role: ViewRole,
  names?: SeatNames,
): void {
  const skin = seatSkin(seat === 1 ? "p1" : "p2");
  // The edges are the quiet half: a player who looked away and back reads the
  // colour before they read anything at all.
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = skin.tint;
  ctx.fillRect(0, 0, 4, l.height);
  ctx.fillRect(l.width - 4, 0, 4, l.height);
  ctx.globalAlpha = 1;

  const title = `${seatName(seat, names)} · SCREEN`;
  ctx.textAlign = "left";
  ctx.font = '700 13px "Courier New",monospace';
  const w = Math.min(l.width - 16, ctx.measureText(title).width + 22);
  ctx.fillStyle = "rgba(6,4,14,.92)";
  ctx.fillRect(8, BANNER_TOP, w, BANNER_H);
  ctx.fillStyle = skin.tint;
  ctx.fillRect(8, BANNER_TOP, 3, BANNER_H);
  ctx.fillStyle = skin.rim;
  ctx.fillText(title, 19, BANNER_TOP + 15);
  ctx.font = '600 9px "Courier New",monospace';
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(whose(seat, role), 19, BANNER_TOP + 26);
}

/**
 * Whether the screen on show is the one in this player's own hand. `test` is
 * one person holding both seats, so neither is theirs and neither is the
 * other's.
 */
function whose(seat: 1 | 2, role: ViewRole): string {
  if (role === "test") return "ONE OF THE TWO SCREENS";
  return (role === "p1" ? 1 : 2) === seat ? "YOUR OWN SCREEN" : "YOUR PARTNER'S SCREEN";
}
