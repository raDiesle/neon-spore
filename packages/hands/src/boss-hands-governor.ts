import {
  GOVERNOR_PADS,
  type GovernorState,
  governorBoss,
  governorFiring,
  governorGovernor,
  governorLitStep,
  governorOnMark,
  governorTapper,
  midCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE GOVERNOR played right**, for the autopilot. On a tap step the
 * braking seat puts both pads down and keeps them there, and the tapper taps
 * the moment the needle is on the lit mark. On a fire step, with the hub lit,
 * the cannon goes to the middle and the step's colour goes up it.
 *
 * **A chord is two drags**, one per pad, as THE TRIVET's hand sends them
 * (`boss-hands-trivet.ts`). A pad already down is not sent again. **It is
 * never lifted**: once the chord is whole, lifting a pad is a slip, and a
 * seat whose pads are down while it taps brakes nothing and costs nothing
 * (`sim/governor-hand.ts`).
 *
 * **A tap is an edge**, THE VALVE's pin (`boss-hands-valve.ts`): a thumb still
 * down is lifted the tick after it came down, so the next tap is a new press
 * and not a thumb parked on the dial. The needle is read where the simulation
 * will judge it, because the commands are heard before the needle turns
 * (`sim/governor-turn.ts`).
 *
 * **The shot** wants the step's colour; `"either"` is fired cyan.
 */
type Press = Omit<TimedCommand, "tick">;

export const governorHand = (w: World): Press[] => {
  const s = governorBoss(w);
  if (s === null) return [];
  return [...brake(s), ...tap(w, s), ...shoot(w, s)];
};

function brake(s: GovernorState): Press[] {
  const seat = governorGovernor(s);
  if (seat === null) return [];
  const down = s.padsDown[seat - 1] ?? 0;
  const target = seat === 1 ? "governorChordLeft" : "governorChordRight";
  const out: Press[] = [];
  for (let pad = 0; pad < GOVERNOR_PADS; pad++) {
    if ((down >> pad) & 1) continue;
    out.push({ player: seat, command: { kind: "drag", target, on: true, fromMilli: 0, id: pad } });
  }
  return out;
}

function tap(w: World, s: GovernorState): Press[] {
  const lifts = ([1, 2] as const)
    .filter((seat) => s.tapDown[seat - 1])
    .map((seat) => press(seat, false));
  if (lifts.length > 0) return lifts;
  const tapper = governorTapper(s);
  if (tapper === null || !governorOnMark(w, s)) return [];
  return [press(tapper, true)];
}

function shoot(w: World, s: GovernorState): Press[] {
  const step = governorLitStep(s);
  if (step?.ask !== "fire" || !governorFiring(s)) return [];
  const col = midCol(w.cfg);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}

const press = (player: 1 | 2, on: boolean): Press => ({
  player,
  command: { kind: "drag", target: "governorTap", on, fromMilli: 0 },
});
