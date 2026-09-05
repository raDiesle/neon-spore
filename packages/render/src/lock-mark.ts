import { isLockedOn, spanOf, type World } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * THE LOCK, drawn: the frame that says *the cannon has this one*.
 *
 * It is `target-lock.ts`'s frame and not a new picture, which is the whole of
 * the decision. That file's own argument is that a pair should learn **one**
 * marking for *an instrument has picked this body out*, and this is the first
 * time in the game the instrument is the pair's own rather than something
 * withholding a fact from one of them — so it is the same corners, the same
 * sweep and the same flicker over a lure, a veil, a queen's weak point and now
 * a body a thumb is holding.
 *
 * **Amber, and that is the second decision.** Every other lock in the game is
 * drawn in a colour that belongs to the body it is about; this one belongs to
 * the *hand*, and the hand is already amber — `grip.ts` argues that case, and
 * it is the pod's colour because the two things in this game that are on the
 * players' side. Red or cyan would read as ammunition, and the one thing this
 * frame must not say is which colour to load: the lock takes the column out of
 * the conversation and deliberately leaves the colour in (`sim/lock.ts`).
 *
 * **Both screens get it**, unconditionally. It is drawn over a body player 2
 * can see as well as player 1 for the reason the grip's own beam and label are:
 * the whole value of the gesture is on the *other* screen. Player 2 holds both
 * fire lobes, so a pilot who has locked something and cannot say so has locked
 * nothing at all.
 *
 * It goes on **outside** the grip's ring rather than instead of it. The ring is
 * a hand closed on a body and this is a bolt promised to it; they are two
 * statements about one gesture, and a body that is held without being locked —
 * a rock, which is what the grip was built for — wears the ring and no frame.
 *
 * **And a dotted line runs from the cannon to the body**, which is the owner's
 * and is the part that makes the mechanic legible at all. The frame on its own
 * says *this one is picked out*; it says nothing about **what** has picked it
 * out, and the whole of the rule is that a shot leaving a muzzle somewhere else
 * entirely is going to arrive here. So the link is drawn: cannon at one end,
 * body at the other, straight, in the grip's own amber.
 *
 * It is deliberately the same colour as the beam `grip.ts` hangs off the hull
 * and deliberately *not* the same line. That beam is vertical, solid and full
 * of lights climbing it — it is the pull, and a pull comes off the ship as a
 * whole. This is dotted and it leans, because it is not a force on the body at
 * all: it is the path a bolt has not taken yet.
 */

/** How far outside the silhouette the frame's box stands. Outside the grip's
 * own ring, which sits at 1.5 — the hand is on the body and the frame is round
 * the outside of it. */
const BOX_MUL = 2.05;

/** The dash and the gap, in pixels. Short enough to read as a dotted line at
 * arm's length rather than as a dashed one, which is a different word. */
const DASH: readonly number[] = [2.5, 5];
/** Pixels a second the dashes travel, and which way: towards the body, because
 * that is the direction the shot will go. A still dotted line reads as a
 * measurement; one that crawls reads as a route. */
const MARCH = 26;
/** How far short of the body the line stops, as a share of the frame's box —
 * it must not run under the corner brackets, which are the thing it is
 * pointing at. */
const CLEAR = 1.15;

export function drawLockMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  cannonCol: number,
  beatPhase: number,
  time: number,
): void {
  if (l.tile <= 0) return;
  for (const c of world.creatures) {
    if (!isLockedOn(world, c.id)) continue;
    const { x, y } = creatureCenter(l, c, beatPhase);
    const r = Math.max(1, creatureRadius(l, c, beatPhase) * BOX_MUL);
    // As wide as the body's footprint rather than as wide as it is tall: a
    // two-column body wears a frame over both of its columns, because both of
    // them are lanes a locked shot may arrive in.
    const halfW = Math.max(r, (spanOf(c) * l.tile) / 2);
    // The link first, so the frame is drawn over the end of it rather than the
    // other way round: the line arrives at the body, it does not cross it.
    drawLink(ctx, l, cannonCol, x, y, r * CLEAR, time);
    drawTargetLock(ctx, x, y, halfW, r, PALETTE.pod, time, 1, c.id);
  }
}

/**
 * Where the line from the cannon to the body runs — both ends of it, or null
 * when there is no line left to draw.
 *
 * Exported and separated from the stroking for `gripLabel`'s reason next door:
 * this is *what the picture says*, and it is the half that can be wrong in a
 * way nobody notices. A line stroked in the wrong colour is seen at once; a
 * line that points a tenth of a column off, or that keeps being drawn once the
 * body has arrived on top of the muzzle, is a defect an eye slides over and a
 * test does not.
 *
 * `cannonCol` is the **eased** column render carries the lobe across, never
 * `world.cannonCol`: the world moves the cannon a whole column at a time and
 * the eye is carried between the two (`field-pose.ts`), so a line drawn off the
 * integer would point at a lobe that is visibly not there yet — and it would
 * snap while the cannon glides, which is the one thing on this hull that has
 * never jumped.
 *
 * It stops `clear` short of the body rather than reaching it. A line that ran
 * under the corner brackets would be a line crossing its own subject, and the
 * brackets are what the eye is being sent to.
 */
export function lockLink(
  l: Layout,
  cannonCol: number,
  toX: number,
  toY: number,
  clear: number,
): { fromX: number; fromY: number; toX: number; toY: number } | null {
  const fromX = tileCX(l, cannonCol);
  const fromY = l.hullY;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy);
  // The body is already inside the frame the line would be pointing at: there
  // is nothing left to draw, and a zero length is a division by zero below.
  if (len <= clear) return null;
  const end = (len - clear) / len;
  return { fromX, fromY, toX: fromX + dx * end, toY: fromY + dy * end };
}

/** The same line, stroked. */
function drawLink(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cannonCol: number,
  toX: number,
  toY: number,
  clear: number,
  time: number,
): void {
  const line = lockLink(l, cannonCol, toX, toY, clear);
  if (!line) return;

  ctx.save();
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineCap = "round";
  ctx.lineWidth = 1.6;
  ctx.globalAlpha = 0.5 + 0.12 * Math.sin(time * 5);
  ctx.setLineDash([...DASH]);
  // Negative, so the dashes travel from the cannon towards the body: a dash
  // pattern is walked from the start of the path, and the path starts at the
  // muzzle end.
  ctx.lineDashOffset = -time * MARCH;
  ctx.beginPath();
  ctx.moveTo(line.fromX, line.fromY);
  ctx.lineTo(line.toX, line.toY);
  ctx.stroke();
  ctx.restore();
}
