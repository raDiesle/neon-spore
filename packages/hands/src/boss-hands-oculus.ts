import {
  midCol,
  type OculusState,
  oculusBoss,
  oculusHolding,
  oculusLitStep,
  oculusLookCol,
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
 * once when a hold step lights and lifts it once the step is answered. The
 * lift after a shut is safe — the lens is already resting, and a slip is only
 * heard while a hold step is lit.
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

function hold(s: OculusState): Press[] {
  const want = oculusHolding(s);
  const out: Press[] = [];
  for (const index of [0, 1] as const) {
    if (s.held[index] === want) continue;
    const target = index === 0 ? "oculusLeafLeft" : "oculusLeafRight";
    const player = index === 0 ? 1 : 2;
    out.push({ player, command: { kind: "drag", target, on: want, fromMilli: 0 } });
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
