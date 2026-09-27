import {
  HALTER_BOTH_GRIPS,
  type HalterState,
  halterBoss,
  halterLitStep,
  halterResters,
  halterSeatIndex,
  midCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE HALTER played right**, for the STATES sheet and the autopilot: on a
 * rest-and-chord step the seat that may not rest puts both grips down and the
 * other sends nothing at all; on a shot with the centre bared, the cannon to
 * the middle and the step's colour up it.
 *
 * **Sending nothing is the whole of resting** (`sim/halter-hand.ts`): every
 * command a seat sends is a stir, so this hand is silent for a seat unless a
 * grip of its is wrong. **A grip is a level**, THE TRIVET's pad
 * (`boss-hands-trivet.ts`): one drag down, kept, one drag up. A grip the lit
 * step does not want of a seat is lifted as the step lights — the one stir
 * the rester costs itself, at the top of its count — and a grip is left
 * alone between steps, when nothing is counted.
 *
 * **A guard** may be made either way round; here the pilot grips and the
 * navigator rests, the way the left segment is cracked.
 *
 * **The shot** wants the step's colour; `"either"` is fired cyan. The cannon
 * is slid only while it is not on the middle column and the shot is only
 * sent once it is, so a seat's commands on a shot are two and then a colour
 * a tick, the fire's own cooldown the limit.
 */
type Press = Omit<TimedCommand, "tick">;

const TARGETS = ["halterChordLeft", "halterChordRight"] as const;

export const halterHand = (w: World): Press[] => {
  const s = halterBoss(w);
  if (s === null) return [];
  return [...grip(s), ...shoot(w, s)];
};

/** The seat the lit step wants gripping: the one that may not rest, the pilot on a guard. */
function gripper(s: HalterState): 1 | 2 {
  const resters = halterResters(s);
  return resters.length === 1 && resters[0] === 1 ? 2 : 1;
}

function grip(s: HalterState): Press[] {
  const step = halterLitStep(s);
  if (step === null || step.ask === "fire") return [];
  const out: Press[] = [];
  const holder = gripper(s);
  for (const player of [1, 2] as const) {
    const want = player === holder ? HALTER_BOTH_GRIPS : 0;
    const down = s.grips[halterSeatIndex(player)];
    for (const [bit, target] of TARGETS.entries()) {
      const on = (want & (1 << bit)) !== 0;
      if (((down & (1 << bit)) !== 0) === on) continue;
      out.push({ player, command: { kind: "drag", target, on, fromMilli: 0 } });
    }
  }
  return out;
}

function shoot(w: World, s: HalterState): Press[] {
  const step = halterLitStep(s);
  if (step?.ask !== "fire" || !s.bared) return [];
  const col = midCol(w.cfg);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}
