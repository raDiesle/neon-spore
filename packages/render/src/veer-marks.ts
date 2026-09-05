import { spanOf, veerChangesLeft, veerHeading, type World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { drawDartArrow } from "./dart.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";
import { rockRadius } from "./torch.js";

/**
 * THE VEER's two half-pictures: the arrow over the rider on player 1's screen,
 * and the *ask* on player 2's. THE DART's arrangement with the seats the other
 * way round, and the two files' worth of marks folded into one because a rock
 * has no colour to preview and no second leg to draw — there is one fact here,
 * and it is a side.
 *
 * **Why round the other way.** A rock is announced on the pilot's strip and
 * answered by the navigator's shield (docs/spec/roles.md), so the seat that
 * can be shown where this one is going is exactly the seat that cannot put
 * anything under it. Player 1 reads a side and says it; player 2 hears it and
 * moves the shield, three rows before the rock gets there. The dart is the
 * same sentence with the cannon in it, which is why it is player 2 who speaks
 * there and player 1 here.
 *
 * **The two screens are told different things, not more and less.** Player 1
 * gets one arrow, full weight, in the rock's own grey: *left*. Player 2 gets
 * two faint arrows and a target lock: *this one moves, and you are not the one
 * who knows which way*. That is `dart-query.ts`'s vocabulary exactly, and it is
 * reused rather than reinvented on purpose — a pair who have met a dart already
 * know what two dim arrows inside a frame mean, and teaching them a second
 * marking for one idea is what `comms.ts` exists to stop.
 *
 * **Neither mark outlives the last change.** After the third one the rock is a
 * plain tier falling down a settled column, and a mark still standing over it
 * would be saying there is something left to call. `veerChangesLeft` is the
 * gate, and it is the simulation's rule rather than a count kept here.
 */

/** How faint the navigator's two arrows are beside the pilot's one — the same
 * distance `dart-query.ts` puts between a mark that says *left* and a mark
 * that says *either*. */
const ASK_ALPHA = 0.5;
/** The frame's half-extent, in body radii: the square a lure wears and a dart
 * wears, because three markings that mean *picked out* have to be one size. */
const BOX_MUL = 1.55;
/** How far above the rider the marks stand, in rock radii. Clear of the hat's
 * pompom, which is the tallest thing on the body (`veer-clown.ts`) — an arrow
 * crossing the hat would read as part of it. */
const LIFT = 1.5;

/**
 * Whether this screen carries the side. Player 2 never does — that is the whole
 * creature — and `test` does, because it is both seats on one screen and a rig
 * that hid half the picture would be no rig. `showsDartArrow`'s shape, asked of
 * the other seat.
 */
export function showsVeerArrow(l: Layout): boolean {
  return l.role !== "p2";
}

export function drawVeerMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  /** The wall clock, for the lock's flicker (`target-lock.ts`). */
  time: number,
): void {
  const tell = showsVeerArrow(l);
  for (const c of world.creatures) {
    if (c.kind !== "veer") continue;
    if (veerChangesLeft(world.cfg, c.row) <= 0) continue;
    const { x, y } = creatureCenter(l, c, beatPhase);
    const r = rockRadius(l, spanOf(c));
    const above = y - r * LIFT;
    if (tell) {
      // In the rock's own grey rather than a signal colour, for the reason the
      // dart's arrow is in its body's colour: it is a fact about that body, and
      // the pair should read "the rock, going left" off one mark.
      drawDartArrow(ctx, x, above, r, veerHeading(c), PALETTE.rock);
      continue;
    }
    drawDartArrow(ctx, x, above, r, -1, PALETTE.text, ASK_ALPHA);
    drawDartArrow(ctx, x, above, r, 1, PALETTE.text, ASK_ALPHA);
    // Sized off the rock's own radius rather than off a tile, so a body far up
    // the field wears a frame that shrinks with it (`depthScale`).
    drawTargetLock(ctx, x, y, r * BOX_MUL, r * BOX_MUL, PALETTE.text, time, 0.9, c.id);
  }
}
