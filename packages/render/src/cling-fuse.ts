import type { ClingKind } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsCannon, showsShield, type ViewRole } from "./view-role.js";

/**
 * **The fuse on a clinger, and who is shown it.**
 *
 * The seat that can move the control is not told how long it has: the
 * plate is player 2's, so a limpet's fuse is on player 1's screen alone, and
 * the cannon is player 1's, so a leech's is on player 2's. The seat that
 * sees it has nothing to press about it, and the seat that can press sees
 * a body and no count — the word *move* is the only thing that joins them,
 * and it has to be said before the count runs out by the one who can see it
 * running (`sim/cling.ts`). The test view, which is both seats, is shown
 * both fuses.
 *
 * **The count is a row of lights over the body**, one per beat of the fuse,
 * going out from the left one a beat: what is lit is what is left, THE
 * COUNT's blades laid flat. The last two beats are the loud ones — the row
 * pulses on the beat, and on the last beat everything over the body flashes
 * in the fire's ember at twice the rate, since what comes next is a blast
 * and the one thing this picture must never be is quiet about it
 * (`docs/looks.md`: a failure announces itself). No numeral: the game puts
 * no text on the field but the duty words.
 */

/** Whether this screen is shown the fuse on a clinger of `kind`. */
export function showsClingFuse(role: ViewRole, kind: ClingKind): boolean {
  if (role === "test") return true;
  return kind === "limpet" ? !showsShield(role) : !showsCannon(role);
}

/** The lights' spacing and size, in tiles. */
const GAP = 0.22;
const DOT = 0.06;

/**
 * The fuse over a body whose crown is at (`x`, `top`). `fuse` is the whole
 * count, `still` how many beats of it have gone.
 */
export function drawClingFuse(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  tile: number,
  fuse: number,
  still: number,
  beatPhase: number,
  time: number,
): void {
  const left = Math.max(0, fuse - still);
  const y = top - tile * 0.3;
  const last = left <= 1;
  const loud = left <= 2;
  // The pulse: on the beat when loud, twice a beat on the last one.
  const pulse = loud ? (last ? Math.abs(Math.sin(time * 14)) : 1 - beatPhase) : 0;
  const hot = last ? PALETTE.ember : PALETTE.arcRim;
  if (loud)
    halo(ctx, x, y + tile * 0.3, Math.round(tile * (0.9 + 0.5 * pulse)), hot, 0.35 + 0.4 * pulse);
  ctx.save();
  ctx.lineWidth = STROKE.outline;
  const x0 = x - ((fuse - 1) * GAP * tile) / 2;
  for (let k = 0; k < fuse; k++) {
    const lit = k >= fuse - left;
    const cx = x0 + k * GAP * tile;
    ctx.beginPath();
    ctx.arc(cx, y, tile * DOT * (lit ? 1 + 0.5 * pulse : 0.7), 0, Math.PI * 2);
    if (lit) {
      ctx.fillStyle = loud ? hot : PALETTE.arcRim;
      ctx.fill();
      halo(ctx, cx, y, Math.round(tile * 0.25), loud ? hot : PALETTE.arc, 0.6);
    } else {
      ctx.strokeStyle = PALETTE.arc;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}
