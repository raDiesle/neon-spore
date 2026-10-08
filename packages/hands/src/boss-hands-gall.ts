import {
  type GallState,
  gallBoss,
  gallCharged,
  gallLeaping,
  gallLitStep,
  gallPointCol,
  gallPresser,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE GALL played right**, for the autopilot: on a leap step the seat
 * whose half the alien sits on taps it until it is charged and then pulls it
 * up; on a fire step the cannon goes under it and the step's colour up it.
 *
 * **A tap is a press and a lift** (`sim/gall-hand.ts`), so the hand puts the
 * finger down one tick and lifts it the next — still, for a tap, or two
 * pulls' worth up once the alien is charged. A finger is never left down
 * past its lift, and the `id` is the point it goes down on.
 *
 * **The shot** wants the step's colour; `"either"` is fired cyan. The cannon
 * is slid only while it is not under the alien and the shot is sent once it is.
 */
type Press = Omit<TimedCommand, "tick">;

export const gallHand = (w: World): Press[] => {
  const s = gallBoss(w);
  if (s === null) return [];
  return [...tap(w, s), ...shoot(w, s)];
};

function tap(w: World, s: GallState): Press[] {
  if (!gallLeaping(s)) return [];
  const player = gallPresser(s);
  const down = s.down[player - 1] === s.point;
  const up = down && gallCharged(s) ? -2 * w.cfg.gallPullMilli : 0;
  return [
    {
      player,
      command: {
        kind: "drag",
        target: "gallPress",
        on: !down,
        fromMilli: 0,
        fromYMilli: up,
        id: s.point,
      },
    },
  ];
}

function shoot(w: World, s: GallState): Press[] {
  const step = gallLitStep(s);
  if (step?.ask !== "fire") return [];
  const col = gallPointCol(w.cfg, s.point);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}
