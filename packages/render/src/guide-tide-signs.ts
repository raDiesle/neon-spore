import { arrow, CREST_H, plate, type WordPlate } from "./guide-tide-plate.js";
import { drawBeads, loopSign } from "./nav-button.js";

/**
 * The bar's icon-only plates: BACK, REPLAY and SKIP, each TIDE's cut body with
 * one sign on the face of it, centred, and a bead hanging off the sign the way
 * NEXT's arrow has one.
 *
 * **The signs are `nav-button.ts`'s**, not new ones. That file drew the whole
 * bar before TIDE and its two shapes — the grown arrow with the concave back,
 * the loop with a head tangent to its own line — were each argued out with the
 * owner. A second pair drawn here would be the same two shapes disagreeing.
 * SKIP is the arrow twice, overlapped: the owner asked for *just two arrows*
 * on 25 September 2026, and NEXT's own arrow doubled is the one that reads as
 * *past NEXT* without a word.
 *
 * Out of `guide-tide-bar.ts` on line count the day SKIP joined the row.
 */

export type Sign = "back" | "replay" | "skip";

/** How big a sign on an icon-only plate is. NEXT's own arrow is eleven, and
 * the row reads as one kit only while they are the same size. */
const SIGN_R = 11;

export function signPlate(ctx: CanvasRenderingContext2D, p: WordPlate, sign: Sign): void {
  plate(ctx, p, p);
  const lit = p.live && (p.hover || p.glow > 0);
  // SKIP's plate is the narrow one, so its pair of arrows is drawn a step
  // smaller to keep clear of the rim.
  const size = SIGN_R * (sign === "skip" ? 0.8 : 1) * (1 + 0.12 * p.glow);
  ctx.fillStyle = p.live ? (lit ? "#FFF6E4" : p.hex) : "#3A3160";
  ctx.strokeStyle = ctx.fillStyle;
  // On the middle of the body below the crest, the way a word is: the crest
  // takes the top of the plate and a sign centred on the box rides high.
  const cy = p.y + (p.h + CREST_H) / 2;
  const cx = p.x + p.w / 2;
  if (sign === "replay") loopSign(ctx, cx, cy, size);
  else if (sign === "skip") {
    arrow(ctx, cx - size * 0.45, cy, size, 1);
    arrow(ctx, cx + size * 0.45, cy, size, 1);
  } else arrow(ctx, cx, cy, size, -1);
  if (p.live) drawBeads(ctx, cx + size * 0.1, cy + size * 1.05, size);
}
