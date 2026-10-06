import {
  GOVERNOR_DOWN_MILLI,
  type GovernorState,
  governorBoss,
  governorFiring,
  governorLitStep,
  governorMarkFor,
  governorPace,
  midCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE GOVERNOR played right**, for the autopilot. On a tap step each seat
 * taps the moment the needle is on a mark of its own that is open — on an
 * ordered step only the next — so both seats work the same lap. On a fire
 * step, with the hub lit, the cannon goes to the middle and the step's colour
 * goes up it as the needle points down.
 *
 * **A tap is an edge**, THE VALVE's pin (`boss-hands-valve.ts`): a thumb still
 * down is lifted the tick after it came down, so the next tap is a new press
 * and not a thumb parked on the dial. The needle is read where the simulation
 * will judge it, because the commands are heard before the needle turns
 * (`sim/governor-turn.ts`).
 *
 * **The shot** wants the step's colour; `"either"` is fired cyan. The hub
 * judges a bolt by where the needle was when it left (`sim/governor-shot.ts`),
 * so it goes **as the needle comes into the window** a tick's turn inside its
 * edge, as a tap does: AUTO on the phone presses through the input buffer
 * (`apps/game/src/autopilot.ts`), and a press heard a few ticks late is then
 * nearer the bottom rather than past it.
 */
type Press = Omit<TimedCommand, "tick">;

export const governorHand = (w: World): Press[] => {
  const s = governorBoss(w);
  if (s === null) return [];
  return [...tap(w, s), ...shoot(w, s)];
};

function tap(w: World, s: GovernorState): Press[] {
  const lifts = ([1, 2] as const)
    .filter((seat) => s.tapDown[seat - 1])
    .map((seat) => press(seat, false));
  if (lifts.length > 0) return lifts;
  return ([1, 2] as const)
    .filter((seat) => governorMarkFor(w, s, seat) !== null)
    .map((seat) => press(seat, true));
}

function shoot(w: World, s: GovernorState): Press[] {
  const step = governorLitStep(s);
  if (step?.ask !== "fire" || !governorFiring(s)) return [];
  const col = midCol(w.cfg);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const pace = governorPace(w, s);
  const ahead = (GOVERNOR_DOWN_MILLI - s.needleMilli + 1000) % 1000;
  const edge = w.cfg.governorDownMilli - pace;
  if (ahead > edge || ahead <= edge - pace) return [];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}
const press = (player: 1 | 2, on: boolean): Press => ({
  player,
  command: { kind: "drag", target: "governorTap", on, fromMilli: 0 },
});
