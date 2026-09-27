import {
  type FlueState,
  flueBoss,
  flueEmberCol,
  flueFiring,
  flueLitStep,
  flueSeatIndex,
  flueSteady,
  flueTapper,
  midCol,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE FLUE played right**, for the autopilot: on a vent the rester's phone
 * sends nothing at all, and once the ember has stopped the tapper taps it on
 * the column it sits over, three times as it jumps from notch to notch;
 * through a damper neither seat sends anything; on a fire step with the core
 * bared, the cannon to the middle and the step's colour up it.
 *
 * **Sending nothing is the whole of resting** (`sim/flue-hand.ts`): every
 * command either seat sends zeroes that seat's count, and a rester's costs
 * the taps landed, so this hand never speaks for a seat the lit step asks to
 * keep still — not even to lift a thumb.
 *
 * **A tap is an edge**, THE VALVE's pin (`boss-hands-valve.ts`): a thumb
 * still down is lifted the tick after it came down, carrying the column it
 * went down on, so the next tap is an answer and never a thumb parked. The
 * third tap spends the vent and the step goes to rest, so the lift of it
 * lands between steps, where nothing is counted.
 *
 * **The shot** wants the step's colour; `"either"` is fired cyan. The cannon
 * is slid only while it is not on the middle column and the shot is sent
 * once it is.
 */
type Press = Omit<TimedCommand, "tick">;

export const flueHand = (w: World): Press[] => {
  const s = flueBoss(w);
  if (s === null) return [];
  return [...tap(w, s), ...shoot(w, s)];
};

function tap(w: World, s: FlueState): Press[] {
  const col = flueEmberCol(w.cfg, s);
  const lifts = ([1, 2] as const)
    .filter((seat) => s.tapDown[flueSeatIndex(seat)])
    .map((seat) => press(seat, false, col));
  if (lifts.length > 0) return lifts;
  const tapper = flueTapper(s);
  if (tapper === null || !flueSteady(w, s)) return [];
  return [press(tapper, true, col)];
}

function shoot(w: World, s: FlueState): Press[] {
  const step = flueLitStep(s);
  if (step?.ask !== "fire" || !flueFiring(s)) return [];
  const col = midCol(w.cfg);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}

const press = (player: 1 | 2, on: boolean, col: number): Press => ({
  player,
  command: { kind: "drag", target: "flueTap", on, fromMilli: 0, id: col },
});
