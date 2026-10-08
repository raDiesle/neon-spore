import { type LatchGrip, type LatchState, latchGripSeat, type World } from "@neon-spore/sim";
import { latchGripRest, latchKnobAt } from "./latch-shape.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The thumbs on THE LATCH** (§11.61): the two grips on the tendril, pulled
 * down, THE MANTLE's knob in every respect but whose it is
 * (`mantle-grip.ts`).
 *
 * **The press is a message.** A grip is held by a thumb *resting* on it as
 * much as by one pulling, so the press says `on` at no depth at once — a
 * holder who never moves is still holding (`sim/latch-hand.ts`). Every move
 * after it is how far down the thumb has carried the knob, in thousandths of
 * a tile (`touch-move.ts`), which is the depth the simulation reads.
 *
 * **The partner's grip is pressed through**, not fallen through: a thumb on
 * it sends the partner's target from this seat, and the simulation refuses it
 * aloud (`latchWrong`) — the owner, 7 October 2026, *I don't understand why
 * nothing happens on tap*. Which grip is whose is the simulation's, crossed
 * in a `cross` level (`latchGripSeat`), so it is read off the boss, never
 * off the side of the screen.
 */

/** Whether the grips are there to take hold of: from the drop in until it is torn loose. */
export function latchTakesHand(s: LatchState): boolean {
  return s.phase !== "spent";
}

/** A grip's target on the wire. */
export function latchGripTarget(grip: LatchGrip): "latchGripLeft" | "latchGripRight" {
  return grip === 0 ? "latchGripLeft" : "latchGripRight";
}

/** The player whose thumb takes `grip` this frame. */
export function latchGripPlayer(s: LatchState, grip: LatchGrip): 1 | 2 {
  return latchGripSeat(s, grip) === 0 ? 1 : 2;
}

/** Where `grip`'s knob is standing — at the depth its thumb has it, which is where a ghost thumb goes. */
export function latchKnobStanding(l: Layout, world: World, s: LatchState, grip: LatchGrip): Circle {
  return latchKnobAt(l, world.cfg, s, grip);
}

/** A press on either grip: this seat's takes hold, the partner's is refused by the simulation. */
export function latchGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "latch");
  if (s === null || !latchTakesHand(s)) return null;
  for (const grip of [0, 1] as const) {
    if (!hitCircle(latchGripRest(l, field.cfg, grip), x, y)) continue;
    const target = latchGripTarget(grip);
    const seat = field.seat;
    return {
      player: seat,
      command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
      hold: { kind: "drag", target, player: seat, originX: x, originY: y },
    };
  }
  return null;
}

/**
 * Whose thumb the grip under this point takes, for the test screen's one
 * mouse: both grips answer either seat's press, and the wrong one is the
 * simulation's to refuse, so the desk asks first (`desk-grab.ts` `markSeat`).
 */
export function latchGripSeatAt(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "latch");
  if (s === null || !latchTakesHand(s)) return undefined;
  for (const grip of [0, 1] as const) {
    if (hitCircle(latchGripRest(l, field.cfg, grip), x, y)) return latchGripPlayer(s, grip);
  }
  return undefined;
}
