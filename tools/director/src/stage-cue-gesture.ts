import type { Layout } from "@neon-spore/render";
import { BEARING_TURN, instarBoss, instarMarkDone, instarStep, type World } from "@neon-spore/sim";

/**
 * **What the held `3` does next**, on the one boss whose marks are not a press.
 *
 * `stage-cue-key.ts` puts a thumb on every mark the field is asking for. On
 * every other boss that is the whole gesture — a press, or a hold the key
 * holds. THE INSTAR's six are mostly *motion*: a pull stands at a depth, a
 * swipe is a carry that ends in a lift, a turn winds clockwise, a tap counts
 * presses (`sim/instar-hand.ts`). A thumb that goes down and never moves
 * answers one of the six, which is why the owner saw the rings light and the
 * step strike anyway.
 *
 * So the desk moves the thumb, once a tick, through the same `touchMove` and
 * `touchUp` the mouse goes through — this file only says **where the finger
 * would be**, in the mark's own units read off `InstarMark.need`, and never
 * touches a command. It is the rig performing the gesture, not a second
 * implementation of it.
 *
 * **It stops at the mark's own line and no further.** A mark already answered
 * asks for nothing (`instarMarkDone`) — but the thumb stays down, because a
 * pull let go of before the beat lands slips back to nought and takes the
 * partner's with it (`instar-step.ts`).
 */

/** What the desk's finger does this tick. `null` is: stay exactly where it is. */
export type CueGesture =
  | { do: "move"; x: number; y: number }
  | { do: "again" }
  | { do: "lift" }
  | null;

/**
 * How far round a `turn` mark the desk winds in one tick, in thousandths.
 * An eighth, which is well inside the half-turn past which a step reads as a
 * hand that came round the other way — `bearing.ts` names the desk keyboard
 * as the synthetic reporter that rule was written for.
 */
const TURN_STEP = BEARING_TURN / 8;

/** Thousandths of a tile, as pixels down the screen. */
function depth(l: Layout, milli: number): number {
  return (milli * l.tile) / 1000;
}

/** A little past the line, so a rounded pixel cannot land just short of it. */
const OVERSHOOT = 20;

export function instarGesture(
  l: Layout,
  world: World,
  /** The mark this thumb took hold of, and where it took hold. */
  held: { id: number | undefined; x: number; y: number },
  /** Ticks the thumb has been down, counting from one. */
  n: number,
): CueGesture {
  const s = instarBoss(world);
  if (s === null || held.id === undefined) return null;
  const mark = instarStep(s)?.marks[held.id];
  if (mark === undefined || instarMarkDone(s, held.id)) return null;
  // What the part has pushed back while this thumb was on it (`pushMilli`,
  // `sim/instar-step.ts`): the finger goes that much further, as a hand would.
  const pushed = Math.max(0, s.ref[held.id] ?? 0);
  switch (mark.gesture) {
    case "hold":
      return null;
    case "pullDown":
      return { do: "move", x: held.x, y: held.y + depth(l, mark.need + pushed + OVERSHOOT) };
    case "pullUp":
      return { do: "move", x: held.x, y: held.y - depth(l, mark.need + pushed + OVERSHOOT) };
    case "swipeDown":
      // Down past the line on the first tick, off on the next: an egg is
      // counted on the lift that follows the carry, never on the carry.
      return n === 1
        ? { do: "move", x: held.x, y: held.y + depth(l, world.cfg.instarSwipeMilli + OVERSHOOT) }
        : { do: "lift" };
    case "tap":
      // The press this thumb went down with was the first slap; a held thumb
      // is not a second, so each tick is an off and an on again.
      return { do: "again" };
    case "turn": {
      const wound = n * TURN_STEP;
      if (wound > mark.need + TURN_STEP) return null;
      const angle = ((wound % BEARING_TURN) / BEARING_TURN) * Math.PI * 2;
      // The radius is free — a bearing is an angle — so long as it is clear of
      // the dead spot a hand resting on the middle sits in (`touch-drag.ts`).
      const r = l.tile * 0.5;
      return { do: "move", x: held.x + r * Math.sin(angle), y: held.y - r * Math.cos(angle) };
    }
  }
}
