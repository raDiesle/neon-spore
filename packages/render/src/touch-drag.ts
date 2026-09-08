import { type Command, CRANK_TURN, NO_CRANK } from "@neon-spore/sim";
import type { Hold, Touch } from "./touch-hold.js";

/**
 * **What a hand that already has hold of something says**: the message a move
 * sends, and the message a lift sends.
 *
 * Cut out of `touch.ts` when THE CLAW's crank took that file over its 250-line
 * limit, along a seam that was already there. Next door is the decision
 * procedure — *what is under this finger, and whose is it* — and this is the
 * one thing that happens after it has decided: a hold that is being carried,
 * turned round, or let go of. `touch.ts` re-exports nothing of it, because
 * nothing outside that file has ever needed it.
 *
 * **Two kinds of hand and one message.** A handle is *carried*, so what it
 * says is a displacement from where it was grabbed; a crank is *turned*, so
 * what it says is where round the circle the finger is (`sim/crank.ts`). The
 * wire carries the same `drag` either way and the simulation is where an angle
 * becomes rope — which is why the two live in one file rather than two.
 */

/**
 * One turn of a crank, as the whole answer a move gets: where the finger is
 * round the button's own middle, which the hold carries in place of the origin
 * a carried handle keeps (`touch-lobe.ts`).
 */
export function crankTurn(hold: Extract<Hold, { kind: "drag" }>, x: number, y: number): Touch {
  const command = {
    kind: "drag",
    target: "crank",
    on: true,
    fromMilli: bearingOn(hold, x, y),
  } as const;
  return { player: hold.player, command, hold };
}

/**
 * Where round a crank the finger is, in thousandths of a turn clockwise from
 * the top — or `NO_CRANK` for a finger too close to the middle to have a
 * bearing at all.
 *
 * The dead spot is the whole reason this is not one line of `atan2`. A hand
 * resting on the boss of the crank swings through whole quadrants on a pixel
 * of movement, and every one of those swings would be rope: the arm would come
 * down for a finger that was not turning. Inside it there is no bearing, which
 * is the same thing as no hand — and the next sample outside it is a fresh
 * reference rather than a step from wherever it last was (`sim/crank.ts`).
 *
 * This is the last place a pixel is legal, exactly as it is for a carried
 * handle: an angle is the same on both phones however wide they are.
 */
function bearingOn(hold: Extract<Hold, { kind: "drag" }>, x: number, y: number): number {
  const dx = x - hold.originX;
  const dy = y - hold.originY;
  if (dx * dx + dy * dy < CRANK_DEAD * CRANK_DEAD) return NO_CRANK;
  // Clockwise from the top: `y` grows downwards on a screen, so the pair goes
  // in as (across, up) and the turn comes out the way a hand winds.
  const turn = Math.atan2(dx, -dy) / (Math.PI * 2);
  return Math.round((turn - Math.floor(turn)) * CRANK_TURN) % CRANK_TURN;
}

/** How close to the middle of a crank a finger stops having a bearing, in
 * pixels. Small: it is a dead spot rather than a hole, and a thumb winding the
 * groove is nowhere near it. */
const CRANK_DEAD = 6;

/**
 * One `drag` message for a hold that is already under way.
 *
 * The `id` rides along only for a handle that hangs off a creature, and it is
 * carried from the press because that is the one moment anything knew which
 * body it was. Written once and called twice: a move and a lift say the same
 * thing about *which* handle, and two spellings of that is how a lift comes to
 * let go of a different cord than the one the hand was on.
 */
export function dragging(
  hold: Extract<Hold, { kind: "drag" }>,
  fromMilli: number,
  fromYMilli: number,
  on: boolean,
): Command {
  const { target, id } = hold;
  return {
    kind: "drag",
    target,
    on,
    fromMilli,
    fromYMilli,
    ...(id === undefined ? {} : { id }),
  };
}
