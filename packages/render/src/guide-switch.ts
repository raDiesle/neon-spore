import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The move from one player's screen to the other, made followable.
 *
 * The owner's instruction was that the switch must be something a pair can
 * *follow* — a cut between two screens that look alike is a screen that seems
 * to have changed by itself, and the whole lesson of the tutorial is that there
 * are two devices and they carry different halves. So the picture slides
 * (`guide-scene.ts` owns the slide), a lit seam travels with the join, and a
 * banner names the screen that has arrived.
 *
 * Its own file beside the stage because it is the one part of the rehearsal
 * that is pure decoration: nothing here reads a world, and removing it would
 * change how the film feels and not what it says.
 */

/** How far the seam's glow reaches either side of the join. */
const SEAM = 5;
/**
 * Where the banner sits, and how tall it is. A caption keeps clear of it.
 *
 * It is more than twice the height it was, and it runs the full width. The
 * owner's instruction was that **whose screen this is has to be much more
 * visible** — the old banner was eleven-point type in a pill the width of its
 * own words, which said "player 1" to somebody already looking for it and
 * nothing at all to somebody watching a blob fall.
 */
export const BANNER_TOP = 22;
export const BANNER_H = 50;

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
 * Whose screen this is, across the top. It fades in with the slide and stays
 * for the rest of the page: a pair who looked away and back has to be able to
 * answer "which of us is this" without waiting for the next switch.
 *
 * Two lines, because they are two different facts and one of them is the one
 * that matters: **PLAYER 1** in twenty-two point, and under it, smaller,
 * whether that is the phone in this player's own hand. That second line used to
 * read "THIS SCREEN" whoever was looking, which is true on one of the two
 * devices and a lie on the other — the film is the same on both, and only the
 * viewer's own `role` says which of them is holding it.
 *
 * And a rule of the seat's own colour down both edges of the stage, so the
 * answer is on the screen even when the words are not what the eye is on.
 */
export function drawSeatBanner(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  seat: 1 | 2,
  k: number,
  role: ViewRole,
): void {
  if (k <= 0) return;
  const hex = seat === 1 ? PALETTE.hull : PALETTE.cyan;
  const rim = seat === 1 ? PALETTE.hullRim : PALETTE.cyanRim;

  ctx.globalAlpha = k;
  // The edges first and under everything: they are the quiet half of this.
  ctx.fillStyle = hex;
  ctx.globalAlpha = k * 0.5;
  ctx.fillRect(0, 0, 4, l.height);
  ctx.fillRect(l.width - 4, 0, 4, l.height);

  ctx.globalAlpha = k;
  ctx.fillStyle = "rgba(9,7,20,.94)";
  ctx.fillRect(0, BANNER_TOP, l.width, BANNER_H);
  ctx.fillStyle = hex;
  ctx.fillRect(0, BANNER_TOP, l.width, 3);
  ctx.fillRect(0, BANNER_TOP + BANNER_H - 3, l.width, 3);

  ctx.textAlign = "center";
  ctx.font = '700 22px "Courier New",monospace';
  ctx.fillStyle = rim;
  ctx.fillText(seat === 1 ? "PLAYER 1" : "PLAYER 2", l.width / 2, BANNER_TOP + 26);
  ctx.font = '600 10px "Courier New",monospace';
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(whose(seat, role), l.width / 2, BANNER_TOP + 41);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}

/**
 * Whether the screen on show is the one in this player's own hand. `test` is
 * one person holding both seats, so neither is theirs and neither is the
 * other's.
 */
function whose(seat: 1 | 2, role: ViewRole): string {
  if (role === "test") return "ONE OF THE TWO SCREENS";
  return (role === "p1" ? 1 : 2) === seat ? "YOUR SCREEN" : "YOUR PARTNER'S SCREEN";
}
