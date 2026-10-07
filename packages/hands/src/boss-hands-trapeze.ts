import {
  midCol,
  type TimedCommand,
  type TrapezeState,
  trapezeBoss,
  trapezeCatching,
  trapezeFrozen,
  trapezeLitStep,
  trapezeOnMark,
  type World,
} from "@neon-spore/sim";

/**
 * **THE TRAPEZE played right**, for the autopilot: on a catch or a recatch
 * the step's freezer taps the flag still the tick it swings over the lit
 * column, and the other seat, its finger down on the draw since the step
 * lit, swipes toward that column once the draw is counted and the flag is
 * frozen; with the spindle lit, the cannon to the middle and the step's
 * colour up it.
 *
 * **A tap is an edge** (`sim/trapeze-hand.ts`), THE VALVE's pin
 * (`boss-hands-valve.ts`): a thumb still on the ring is lifted the tick after
 * it came down, so the next freeze is an answer, never a thumb parked. **A
 * recatch's freezer is either seat**, and this hand has the pilot take it, so
 * the navigator is the one who draws, as on the first catch.
 *
 * **The draw is held from the moment the step lights**, so its beats are
 * counted by the time the flag is still, and it is lifted only while the
 * flag is frozen: a lift any sooner would be a flutter. A finger still down
 * when no catch is lit is lifted with no swipe, which the sim ignores.
 *
 * **The shot** wants the step's colour; `"either"` is fired cyan. The cannon
 * is slid only while it is not on the middle column and the shot is sent
 * once it is.
 */
type Press = Omit<TimedCommand, "tick">;

export const trapezeHand = (w: World): Press[] => {
  const s = trapezeBoss(w);
  if (s === null) return [];
  return [...tap(w, s), ...draw(w, s), ...shoot(w, s)];
};

/** The seat whose tap the lit step asks for, 0 or 1: the pilot on `"either"`. */
function freezer(s: TrapezeState): 0 | 1 {
  const f = trapezeLitStep(s)?.freezer;
  return f === 2 ? 1 : 0;
}

function tap(w: World, s: TrapezeState): Press[] {
  const lifts = ([0, 1] as const)
    .filter((side) => s.tapDown[side])
    .map((side) => ring(side, false));
  if (lifts.length > 0 || !trapezeCatching(s) || trapezeFrozen(s) || !trapezeOnMark(w, s))
    return lifts;
  return [ring(freezer(s), true)];
}

function draw(w: World, s: TrapezeState): Press[] {
  const step = trapezeLitStep(s);
  const aimer = freezer(s) === 0 ? 1 : 0;
  const out: Press[] = [];
  for (const side of [0, 1] as const) {
    if (side !== aimer || step === null || !trapezeCatching(s)) {
      if (s.holding[side]) out.push(track(side, false, 0));
      continue;
    }
    if (!s.holding[side]) out.push(track(side, true, 0));
    else if (trapezeFrozen(s) && s.drawnBeats[side] >= w.cfg.trapezeDrawBeats) {
      out.push(track(side, false, Math.sign(step.offset) * 1000));
    }
  }
  return out;
}

function shoot(w: World, s: TrapezeState): Press[] {
  const step = trapezeLitStep(s);
  if (step?.ask !== "fire" || !s.spindleLit) return [];
  const col = midCol(w.cfg);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}

const ring = (side: 0 | 1, on: boolean): Press => ({
  player: side === 0 ? 1 : 2,
  command: { kind: "drag", target: "trapezeFreeze", on, fromMilli: 0 },
});

const track = (side: 0 | 1, on: boolean, fromMilli: number): Press => ({
  player: side === 0 ? 1 : 2,
  command: { kind: "drag", target: "trapezeDraw", on, fromMilli },
});
