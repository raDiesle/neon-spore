import type { Creature } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";

/**
 * **A ring of pips round a body, one per thing still owed** — THE MINE's fuse
 * first, and THE BLISTER's blows since 8 October 2026 (`blister-help.ts`).
 * Cut out of `mine.ts` when the second creature came to want it, so the two
 * counts on the field that are attached to a body are drawn by one hand.
 */

/** How big one pip on a ring of radius `r` is. Named because the row the ring
 * stands on is worked out from how far it reaches, which is one of these past
 * the radius. */
export function pipRadius(r: number): number {
  return Math.max(1, r * 0.17);
}

/**
 * A ring of pips: one per beat the fuse holds at full, lit for the beats left
 * and dark for the beats spent, with the next one to go breathing.
 *
 * Beats and not a bar, for the reason the number is in beats at all
 * (`SimConfig.mineFuseBeats`): the pair already has the count in the ear and
 * on the HUD, so a ring of six is a thing one of them can point at and say
 * *three*, where a shortening arc is a thing they would both have to estimate
 * separately and then argue about.
 */
export function drawFuseRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fuse: { left: number; full: number },
  color: Creature["color"],
  time: number,
): void {
  const hex = color === "red" ? PALETTE.red : color === "cyan" ? PALETTE.cyan : PALETTE.wisp;
  const dim = PALETTE.sparkDim;
  const pip = pipRadius(r);
  // The breathing is on the pip about to go and on nothing else: a ring where
  // everything moved would be an alarm, and an alarm says *hurry* where this
  // has to say *how many*.
  const beat = 0.5 + 0.5 * Math.sin(time * 6);
  for (let i = 0; i < fuse.full; i++) {
    // Clockwise from the top, so a ring read at a glance counts the way a
    // clock does and the last pip to go is the one at twelve.
    const a = -Math.PI / 2 + (i / fuse.full) * Math.PI * 2;
    const lit = i < fuse.left;
    const next = i === fuse.left - 1;
    ctx.globalAlpha = lit ? (next ? 0.55 + 0.45 * beat : 1) : 0.35;
    ctx.fillStyle = lit ? hex : dim;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, pip, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
