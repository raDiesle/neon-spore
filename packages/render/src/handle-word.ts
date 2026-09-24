import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The word under a handle** — the one part of a handle that is not a shape.
 *
 * It lived beside the ring, the gauge, the rest mark and the sag curve in
 * `handle-draw.ts`, which is where every handle on this field gets its
 * *drawing* from. This is the seam that file's own header names, and it is cut
 * here because the ring grew a seat rule of its own (`theirs`, 22 September
 * 2026) and pushed the file past its 250 lines. The two halves have nothing to
 * say to each other: a caller that wants a ring imports `handle-draw.js`, a
 * caller that wants a word imports this, and THE MAZE's string — which draws no
 * ring at all — now imports only what it uses.
 */

/** How loud the word under a handle is. The tether and the string share one
 * set of figures; the lid's is a shade smaller, because its handle hangs off a
 * body rather than out of the hull. */
export interface HintStyle {
  fontTiles: number;
  mine: number;
  theirs: number;
}

export const HINT_LOUD: HintStyle = { fontTiles: 0.3, mine: 0.9, theirs: 0.45 };
export const HINT_SOFT: HintStyle = { fontTiles: 0.26, mine: 0.8, theirs: 0.4 };

/**
 * Whose handle it is, in words, and only while nobody has hold of it.
 *
 * The pair cannot see each other's thumbs, so the one thing the picture cannot
 * say by itself is which of the two of them is supposed to reach for it — and
 * that is the whole coupling. The seat that owns it reads its word brightly and
 * the other seat reads the word said about it, rather than waiting for a turn
 * that never comes. It goes as soon as a hand lands: from then on the handle's
 * own position says it.
 *
 * **Whose it is, is an argument.** Every handle on this field was the pilot's
 * until THE BALLOON, which has one per seat, and the seat was baked in here as
 * `role !== "p2"` — so the balloon grew a four-line copy of this word with the
 * seat passed in. `HandleWords` is that copy folded back: the three older
 * callers pass `{ seat: 1, mine: "PULL", theirs: "P1'S" }` and draw byte for
 * byte what they always drew.
 */
export interface HandleWords {
  /** Which of the two seats may pull this one. */
  seat: 1 | 2;
  /** What that seat reads. */
  mine: string;
  /** What the other seat reads. The balloon says the same thing to both,
   * because its word names a direction rather than an owner. */
  theirs: string;
}

/** The pilot's handle, said the way the three handles older than THE BALLOON
 * say it. Named so a fourth one of the same kind does not spell it out again. */
export const PILOT_HANDLE: HandleWords = { seat: 1, mine: "PULL", theirs: "P1'S" };

export function drawHandleHint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  role: ViewRole,
  x: number,
  y: number,
  style: HintStyle,
  words: HandleWords = PILOT_HANDLE,
): void {
  const mine = role === "test" || (role === "p1") === (words.seat === 1);
  ctx.save();
  ctx.font = `600 ${Math.round(l.tile * style.fontTiles)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.globalAlpha = mine ? style.mine : style.theirs;
  const word = mine ? words.mine : words.theirs;
  // Kept on the glass: a handle resting against the screen's edge (THE
  // BALLOON's, in a wall column) would otherwise centre its word half off it.
  const half = ctx.measureText(word).width / 2;
  ctx.fillText(word, Math.min(Math.max(x, half), l.width - half), y);
  ctx.restore();
}
