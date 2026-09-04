import { smoothstep } from "./ease.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";

/**
 * The move from one player's screen to the other, made unmissable.
 *
 * The owner's first instruction was that the switch must be something a pair
 * can *follow* — a cut between two screens that look alike is a screen that
 * seems to have changed by itself, and the whole lesson of the tutorial is that
 * there are two devices and they carry different halves. So the picture slides
 * (`guide-scene.ts` owns the slide) and a lit seam travels with the join.
 *
 * His second was that it still was not loud enough: *that it is player 1 or
 * player 2 screen and the switch animation must look more prominent — maybe
 * have "Player 1 screen" text in the middle of screen, then we can remove the
 * top header.* So the band across the top is gone and the announcement is a
 * card-sized word in the middle of the picture, arriving with the slide and
 * clearing off it a second later. It is the seat's own colour, which by then is
 * also the colour of the ship underneath it (`seat-skin.ts`) — the announcement
 * teaches the colour, and after that the colour does the work on its own.
 *
 * **It is announced once per page, not once per turn of it.** A page repeats
 * until the pair presses NEXT, and a word this big arriving every two seconds
 * would be the thing they were reading instead of the film.
 *
 * Its own file beside the stage because it is the one part of the rehearsal
 * that is pure decoration: nothing here reads a world, and removing it would
 * change how the film feels and not what it says.
 */

/** How far the seam's glow reaches either side of the join. */
const SEAM = 5;
/**
 * Where a caption may start. There is no banner to keep clear of any more, so
 * this is the top of the picture plus room for the hull bar — which is the
 * thing the old banner used to sit on top of, and the reason the last page's
 * words could not be read against it.
 */
export const BANNER_TOP = 6;
export const BANNER_H = 22;

/** Ticks the announcement takes to arrive, to stand, and to leave. */
const IN_TICKS = 16;
const HOLD_TICKS = 96;
const OUT_TICKS = 26;

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
 * Whose screen this is, across the middle of it.
 *
 * `age` is ticks since this page opened and `first` is whether this is its
 * first turn — together they are the whole of when this shows. Two lines: the
 * seat, big, in its own colour, and under it whether that is the phone in this
 * player's own hand. The second line used to read "THIS SCREEN" whoever was
 * looking, which is true on one of the two devices and a lie on the other.
 */
export function drawSeatBanner(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  seat: 1 | 2,
  age: number,
  role: ViewRole,
  first: boolean,
): void {
  const skin = seatSkin(seat === 1 ? "p1" : "p2");
  // The edges are the quiet, permanent half and are drawn whatever the age is:
  // a player who looked away and back reads the colour, not the word.
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = skin.tint;
  ctx.fillRect(0, 0, 4, l.height);
  ctx.fillRect(l.width - 4, 0, 4, l.height);
  ctx.globalAlpha = 1;

  if (!first) return;
  const k = fade(age);
  if (k <= 0) return;

  const mid = l.width / 2;
  const y = l.playHeight * 0.42;
  const text = seat === 1 ? "PLAYER 1 SCREEN" : "PLAYER 2 SCREEN";
  ctx.textAlign = "center";
  ctx.font = '700 26px "Courier New",monospace';
  const w = ctx.measureText(text).width + 40;

  // A band the width of the words and nothing more, so the film is covered for
  // a second rather than hidden behind a card.
  ctx.globalAlpha = k * 0.86;
  ctx.fillStyle = "rgba(6,4,14,.94)";
  ctx.fillRect(mid - w / 2, y - 34, w, 62);
  ctx.fillStyle = skin.tint;
  ctx.fillRect(mid - w / 2, y - 34, w, 3);
  ctx.fillRect(mid - w / 2, y + 25, w, 3);

  ctx.globalAlpha = k;
  ctx.fillStyle = skin.rim;
  ctx.fillText(text, mid, y);
  ctx.font = '600 11px "Courier New",monospace';
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(whose(seat, role), mid, y + 18);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}

/** In, stand, out — 0 before and after. */
function fade(age: number): number {
  if (age < 0) return 0;
  if (age < IN_TICKS) return smoothstep(age / IN_TICKS);
  if (age < IN_TICKS + HOLD_TICKS) return 1;
  const out = (age - IN_TICKS - HOLD_TICKS) / OUT_TICKS;
  return out >= 1 ? 0 : 1 - smoothstep(out);
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
