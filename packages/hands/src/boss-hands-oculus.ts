import {
  midCol,
  type OculusState,
  oculusBoss,
  oculusHolding,
  oculusLitStep,
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
 * navigator fires cyan.
 */
type Press = Omit<TimedCommand, "tick">;

export const oculusHand = (w: World): Press[] => {
  const s = oculusBoss(w);
  if (s === null) return [];
  return [...hold(s), ...shoot(w, s)];
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
  if (step?.ask !== "fire" || !s.socketOpen) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: midCol(w.cfg) } },
    { player: 2, command: { kind: "fire", color: step.color === "either" ? "cyan" : step.color } },
  ];
}
