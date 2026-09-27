import {
  midCol,
  type SlingState,
  slingAsks,
  slingBoss,
  slingLitStep,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE SLING played right**, for the autopilot: each seat holds its own draw
 * down while the lit step asks it, until the step's beats are held, then
 * lifts it swiping toward the lit side; both seats at once on a redraw; the
 * lit yoke shot in its colour up the middle.
 *
 * **A draw is one drag** (`sim/sling-hand.ts`): the finger goes down once the
 * seat is asked, and the lift carries the swipe on `fromMilli`, its sign
 * alone. A lift before the beats are held, or toward the wrong side, springs
 * the arm, so this hand lifts only once `drawnBeats` has reached the step's
 * `beats`. A finger still down when its seat is no longer asked is let go
 * with no swipe, which outside an asking step only lets go.
 *
 * **The shot** wants the step's colour; the white yoke takes either, and the
 * navigator fires cyan. The cannon is slid only while it is off the middle
 * and the shot is sent once it is on it.
 */
type Press = Omit<TimedCommand, "tick">;

export const slingHand = (w: World): Press[] => {
  const s = slingBoss(w);
  if (s === null) return [];
  return [...draw(s), ...shoot(w, s)];
};

const TARGET = ["slingDrawLeft", "slingDrawRight"] as const;
/** A swipe's `fromMilli`: only its sign is read. */
const SWIPE = 1000;

function draw(s: SlingState): Press[] {
  const step = slingLitStep(s);
  const out: Press[] = [];
  for (const side of [0, 1] as const) {
    const asked = step !== null && slingAsks(s, side);
    if (!s.holding[side]) {
      if (asked) out.push(hold(side, true, 0));
      continue;
    }
    if (!asked) out.push(hold(side, false, 0));
    else if (s.drawnBeats[side] >= step.beats)
      out.push(hold(side, false, step.aim === "left" ? -SWIPE : SWIPE));
  }
  return out;
}

function shoot(w: World, s: SlingState): Press[] {
  const step = slingLitStep(s);
  if (step?.ask !== "fire" || !s.yokeLit) return [];
  const col = midCol(w.cfg);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}

const hold = (side: 0 | 1, on: boolean, fromMilli: number): Press => ({
  player: side === 0 ? 1 : 2,
  command: { kind: "drag", target: TARGET[side], on, fromMilli },
});
