import {
  midCol,
  type SeamState,
  seamBoss,
  seamLitStep,
  seamStepCol,
  seamWantsShield,
  seamWantsShot,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE SEAM played right**, for the autopilot: every answer is the standard
 * shot or shield (§26). A lit point, a rock or a glow is shot in the step's
 * colour up its own column — the ridge's middle, or the rock's — until it
 * has had enough; grit, thrown blind or not, is taken on the shield under the
 * ridge. A step with both gets both, each seat doing its half of each.
 *
 * **The shot** wants the step's colour; an `"either"` step takes cyan.
 * **The shield** is THE OCULUS's (`boss-hands-oculus.ts`): carried under the
 * middle by the navigator and pressed by the pilot.
 */
type Press = Omit<TimedCommand, "tick">;

export const seamHand = (w: World): Press[] => {
  const s = seamBoss(w);
  if (s === null) return [];
  return [...shoot(w, s), ...shield(w, s)];
};

function shoot(w: World, s: SeamState): Press[] {
  const step = seamLitStep(s);
  if (step === null || !seamWantsShot(s)) return [];
  return [
    { player: 1, command: { kind: "cannonCol", col: seamStepCol(w, step) } },
    { player: 2, command: { kind: "fire", color: step.color === "either" ? "cyan" : step.color } },
  ];
}

function shield(w: World, s: SeamState): Press[] {
  if (!seamWantsShield(s)) return [];
  const col = midCol(w.cfg);
  if (w.shieldCol !== col) return [{ player: 2, command: { kind: "shieldCol", col } }];
  return [{ player: 1, command: { kind: "guard" } }];
}
