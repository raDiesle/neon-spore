import {
  type MimicState,
  midCol,
  mimicBoss,
  mimicDraws,
  mimicFiring,
  mimicStep,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE MIMIC played right**, for the autopilot. While a sign is on the skin
 * each seat with one to draw sends the glyph for it, read off the state as
 * the partner would have said it; with the core bare, the cannon goes to the
 * middle and the step's colour goes up it.
 *
 * **A changing sign is waited for**: a step authored to change is drawn only
 * once it has, so the hand plays the movement the way it is meant to be
 * played — the new sign, not the old one beaten to it.
 *
 * **The shot** wants the step's colour; `"either"` is fired cyan.
 */
type Press = Omit<TimedCommand, "tick">;

export const mimicHand = (w: World): Press[] => {
  const s = mimicBoss(w);
  if (s === null) return [];
  return [...draw(s), ...shoot(w, s)];
};

function draw(s: MimicState): Press[] {
  const step = mimicStep(s);
  if (step === null || (step.changes && !s.changed)) return [];
  return ([1, 2] as const)
    .filter((seat) => mimicDraws(s, seat))
    .map((seat) => ({ player: seat, command: { kind: "glyph", sign: s.signs[seat - 1] ?? 0 } }));
}

function shoot(w: World, s: MimicState): Press[] {
  const step = mimicStep(s);
  if (step === null || !mimicFiring(s)) return [];
  const col = midCol(w.cfg);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  const color = step.color === "either" ? "cyan" : step.color;
  return [{ player: 2, command: { kind: "fire", color } }];
}
