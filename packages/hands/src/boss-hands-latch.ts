import {
  type LatchGrip,
  type LatchState,
  latchBoss,
  latchGripSeat,
  latchLitStep,
  latchRearing,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE LATCH played right**, for the autopilot: hand over hand. The grip
 * that does not pull takes hold first; then the puller takes hold, pulls a
 * whole reach and lets go, and the turn passes — so the rope is never let go
 * of by both at once.
 *
 * **One thing a third of a beat**, THE MIMIC's reason (`boss-hands-mimic.ts`):
 * under delayed lockstep a press lands some ticks after it is sent, and a
 * hand that decided again before the last had landed would decide twice.
 *
 * **Never a lift while the slime rears**: a yank is coming, and both hands
 * stay on the rope until it has been held.
 */
type Press = Omit<TimedCommand, "tick">;

export const latchHand = (w: World): Press[] => {
  const s = latchBoss(w);
  if (s === null || latchLitStep(s) === null) return [];
  if (w.tick % Math.max(1, Math.floor(ticksPerBeat(w.cfg) / 3)) !== 0) return [];
  const puller = s.turn;
  const holder: LatchGrip = puller === 0 ? 1 : 0;
  if (!s.down[holder]) return [grip(s, holder, true, 0)];
  if (!s.down[puller]) return [grip(s, puller, true, 0)];
  const reach = w.cfg.latchReachMilli;
  if (s.depthMilli[puller] < reach) return [grip(s, puller, true, reach)];
  if (latchRearing(w, s)) return [];
  return [grip(s, puller, false, 0)];
};

function grip(s: LatchState, g: LatchGrip, on: boolean, depth: number): Press {
  return {
    player: latchGripSeat(s, g) === 0 ? 1 : 2,
    command: {
      kind: "drag",
      target: g === 0 ? "latchGripLeft" : "latchGripRight",
      on,
      fromMilli: 0,
      ...(on ? { fromYMilli: depth } : {}),
    },
  };
}
