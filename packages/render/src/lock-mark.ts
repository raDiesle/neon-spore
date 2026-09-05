import { isLockedOn, spanOf, type World } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";
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
 */

/** How far outside the silhouette the frame's box stands. Outside the grip's
 * own ring, which sits at 1.5 — the hand is on the body and the frame is round
 * the outside of it. */
const BOX_MUL = 2.05;

export function drawLockMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
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
    drawTargetLock(ctx, x, y, halfW, r, PALETTE.pod, time, 1, c.id);
  }
}
