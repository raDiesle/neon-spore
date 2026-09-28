import { circleSubpath } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **Which mark is wanted, and by whom** — the two halves of the owner's rule
 * of 24 September 2026 that are not the verdict (`.claude/skills/new-boss/
 * owner.md`, `grip-verdict.ts` for the third): *more visible the action
 * player has to do right now … then also more visible when other player has
 * now to take action and where.* Shared by every boss with a mark, 27
 * September 2026 (*the consistent visual across all waves*); THE INSTAR was
 * the worked example they were written for.
 *
 * - **This seat's open mark wears a halo**: a soft red light breathing out
 *   past the ring, under it, so the one thing this thumb is being asked for
 *   is the brightest thing on the screen and not one ring among the body's
 *   own glow.
 * - **The partner's open mark wears a turning ring**: a dashed orbit going
 *   round it, dim, which says *someone is being waited on here* without the
 *   light that would invite this seat's thumb onto it — the wrong thumb is
 *   still refused, and still told so in red.
 * - **The partner's open mark shows a clock, not the gesture** (the owner, 24
 *   September 2026: *it's not clear enough that other player has not to
 *   touch it, he might think he has to wait and then he has to use it next*).
 *   A gesture drawn on a mark reads as *your next move*, so on the partner's
 *   it is replaced by a clock face whose hand goes round: *waiting on the
 *   other seat*. A box beside it may still name whose it is (`P1'S`).
 *
 * The fourth half — a gesture begun the right way says so — is the boss's
 * own, because it is the simulation's word and not the drawer's: THE
 * INSTAR's progress arc goes green as the part gives (`instar-marks.ts`), and
 * a pull the wrong way stands at nought (`sim/instar-hand.ts`); a swipe's arc
 * is the carry under the thumb on its way to the length that counts it,
 * filling before the lift (`sim/instar.ts` `instarSwipeAlong`). A pull handle
 * has the shared channel for it (`pull-track.ts`).
 *
 * Which bosses draw these yet, and which are still to: `render/test/
 * mark-feedback-roll-out.test.ts`.
 */

/** How far past the ring the halo reaches, in radii. */
const HALO = 2.6;

/** This seat's open mark: a breathing light under the ring. */
export function drawMarkHalo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  const breathe = 0.75 + 0.25 * Math.sin(time * 4);
  const reach = r * HALO * (0.9 + 0.1 * breathe);
  const light = ctx.createRadialGradient(x, y, r * 0.8, x, y, reach);
  light.addColorStop(0, rgba(PALETTE.redRim, 0.85 * breathe));
  light.addColorStop(1, rgba(PALETTE.red, 0));
  ctx.save();
  ctx.fillStyle = light;
  ctx.fill(new Path2D(circleSubpath(x, y, reach)));
  ctx.restore();
}

/** The partner's open mark: a dim dashed ring turning round it. */
export function drawMarkTheirs(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.text, 0.8);
  ctx.lineWidth = STROKE.outline;
  ctx.setLineDash([r * 0.45, r * 0.3]);
  ctx.lineDashOffset = -time * r * 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** How long the waiting clock's hand takes to go round, in seconds. */
const CLOCK_TURN_SECONDS = 1.6;

/** The partner's open mark, inside: a clock face, its hand going round. */
export function drawMarkWait(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  const face = r * 0.55;
  const hand = -Math.PI / 2 + (time / CLOCK_TURN_SECONDS) * Math.PI * 2;
  ctx.save();
  // A dark disc under the face, so it reads over a track narrower than it.
  ctx.fillStyle = rgba(PALETTE.background, 0.9);
  ctx.fill(new Path2D(circleSubpath(x, y, face * 1.25)));
  ctx.strokeStyle = rgba(PALETTE.text, 0.85);
  ctx.lineWidth = STROKE.outline * 1.3;
  ctx.lineCap = "round";
  ctx.stroke(new Path2D(circleSubpath(x, y, face)));
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - face * 0.5);
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(hand) * face * 0.75, y + Math.sin(hand) * face * 0.75);
  ctx.stroke();
  ctx.restore();
}
