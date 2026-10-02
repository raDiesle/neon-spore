import {
  midCol,
  type OculusState,
  oculusBoss,
  oculusLitStep,
  oculusLookCol,
  oculusPairing,
  oculusTapsEach,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE OCULUS played right**, for the STATES sheet and the autopilot: both
 * leaves held down together while a pair or a reseal is lit, and the open
 * socket shot in its colour up the middle.
 *
 * **The hold is a level**: a leaf is recorded down or up on the tick it is
 * sent and stays so (`sim/oculus-hand.ts`), so each seat presses its own leaf
 * once when a pair lights and lifts it once the step is answered. The lift
 * after a shut is safe — the lens is already resting, and a slip is only
 * heard while a hold step is lit. **A tap** is the leaf down one tick and up
 * the next, until that seat's half of the taps is in; **a turn** is the leaf
 * held and carried on round a few hundredths of a tile a tick.
 *
 * **The shot** wants the step's colour; a white core takes either, and the
 * navigator fires cyan. **A look** is the same shot up the column the eye
 * looks down, and **a glare** is the shield carried under the eye and pressed.
 */
type Press = Omit<TimedCommand, "tick">;

export const oculusHand = (w: World): Press[] => {
  const s = oculusBoss(w);
  if (s === null) return [];
  return [...hold(s), ...shoot(w, s), ...shield(w, s)];
};

/** How far round a lever is carried in a tick, in thousandths of a tile. */
const CARRY = 120;

function hold(s: OculusState): Press[] {
  const step = oculusLitStep(s);
  const want = oculusPairing(s);
  const out: Press[] = [];
  for (const index of [0, 1] as const) {
    const target = index === 0 ? "oculusLeafLeft" : "oculusLeafRight";
    const player = index === 0 ? 1 : 2;
    const down = s.held[index];
    const press = (on: boolean, fromMilli = 0): void => {
      out.push({ player, command: { kind: "drag", target, on, fromMilli } });
    };
    if (step?.ask === "tap" && want) {
      if (down) press(false);
      else if (s.taps[index] < oculusTapsEach(step)) press(true);
      continue;
    }
    if (step?.ask === "turn" && want && down) {
      press(true, s.leverAt[index] + CARRY);
      continue;
    }
    if (down !== want) press(want);
  }
  return out;
}

function shoot(w: World, s: OculusState): Press[] {
  const step = oculusLitStep(s);
  if ((step?.ask !== "fire" && step?.ask !== "look") || !s.socketOpen) return [];
  const col = step.ask === "look" ? oculusLookCol(midCol(w.cfg), step) : midCol(w.cfg);
  return [
    { player: 1, command: { kind: "cannonCol", col } },
    { player: 2, command: { kind: "fire", color: step.color === "either" ? "cyan" : step.color } },
  ];
}

function shield(w: World, s: OculusState): Press[] {
  if (oculusLitStep(s)?.ask !== "glare") return [];
  const col = midCol(w.cfg);
  if (w.shieldCol !== col) return [{ player: 2, command: { kind: "shieldCol", col } }];
  return [{ player: 1, command: { kind: "guard" } }];
}
