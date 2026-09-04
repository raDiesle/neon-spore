import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type SeatNames, seatName } from "./seat-name.js";
import { seatSkin } from "./seat-skin.js";

/**
 * The move from one player's screen to the other, and the corner that says
 * what this screen is.
 *
 * The owner's first instruction was that the switch must be something a pair
 * can *follow* — a cut between two screens that look alike is a screen that
 * seems to have changed by itself, and the whole lesson of the tutorial is that
 * there are two devices and they carry different halves. So the picture slides
 * (`guide-scene.ts` owns the slide) and a lit seam travels with the join.
 *
 * The announcement itself has been through three answers. It grew into a word
 * across the middle of the picture that arrived with the slide and left a
 * second later; then the timing came out of it — *do not fade in or fade out
 * "Player 2 screen", show it immediately and keep it showing all the time,
 * maybe top left* — because a label that comes and goes is only true while it
 * is on screen. Then the word TUTORIAL joined it: *move it top left where the
 * player screen box is, above it, and combine.* So the corner carries one
 * plate: what this screen is, and whose it is.
 *
 * A third line used to say whether the screen on show was the phone in this
 * player's own hand. It is gone — *"one of the two screens" we can remove, but
 * make "Player 1 · Screen" more prominent* — and the room it freed went into
 * the line that was worth reading.
 *
 * The plate is drawn on every page of a guide. On a page with no film there is
 * no seat to name, so it says TUTORIAL and stops: the word is the half that is
 * true of the written pages and the gate as well.
 */

/** How far the seam's glow reaches either side of the join. */
const SEAM = 5;
/**
 * Where the corner plate sits and how much room it takes, so a caption can keep
 * clear of it (`guide-caption.ts`). It starts below the HUD's own top row —
 * the score on the left, the hull bar on the right — rather than over it.
 */
export const BANNER_TOP = 24;
export const BANNER_H = 46;

/** The join between the outgoing and incoming screens, lit as it travels. */
export function drawSwitchSeam(ctx: CanvasRenderingContext2D, l: Layout, x: number): void {
  const g = ctx.createLinearGradient(x - SEAM, 0, x + SEAM, 0);
  g.addColorStop(0, "rgba(255,86,168,0)");
  g.addColorStop(0.5, "rgba(255,86,168,.42)");
  g.addColorStop(1, "rgba(255,86,168,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - SEAM, 0, SEAM * 2, l.height);
}

export interface CornerPlate {
  /** Whose screen is on show, when a film is playing one. */
  seat?: 1 | 2;
  names?: SeatNames;
}

/** What this screen is, in the corner of it, for as long as the guide is up. */
export function drawGuideCorner(ctx: CanvasRenderingContext2D, l: Layout, p: CornerPlate): void {
  const skin = p.seat === undefined ? null : seatSkin(p.seat === 1 ? "p1" : "p2");
  if (skin) {
    // The edges are the quiet half: a player who looked away and back reads the
    // colour before they read anything at all.
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = skin.tint;
    ctx.fillRect(0, 0, 4, l.height);
    ctx.fillRect(l.width - 4, 0, 4, l.height);
    ctx.globalAlpha = 1;
  }

  const title = p.seat === undefined ? "" : `${seatName(p.seat, p.names)} · SCREEN`;
  ctx.textAlign = "left";
  ctx.font = '700 18px "Courier New",monospace';
  const wide = title === "" ? 0 : ctx.measureText(title).width;
  ctx.font = '700 10px "Courier New",monospace';
  const w = Math.min(l.width - 16, Math.max(wide, ctx.measureText("TUTORIAL").width + 14) + 24);
  const h = title === "" ? 24 : BANNER_H;

  if (skin) halo(ctx, 8 + w / 2, BANNER_TOP + h / 2, w * 0.7, skin.tint, 0.16);
  ctx.fillStyle = "rgba(6,4,14,.94)";
  ctx.fillRect(8, BANNER_TOP, w, h);
  ctx.fillStyle = skin ? skin.tint : PALETTE.pod;
  ctx.fillRect(8, BANNER_TOP, 3, h);

  ctx.fillStyle = PALETTE.pod;
  ctx.beginPath();
  ctx.arc(19, BANNER_TOP + 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '700 10px "Courier New",monospace';
  ctx.fillText("TUTORIAL", 27, BANNER_TOP + 15);
  if (title === "" || !skin) return;
  ctx.font = '700 18px "Courier New",monospace';
  ctx.fillStyle = skin.rim;
  ctx.fillText(title, 19, BANNER_TOP + 38);
}
