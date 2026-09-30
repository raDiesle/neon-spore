import {
  type Color,
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
 *
 * **The false point and the dark are sent nothing**: neither wants a shot or
 * the shield (`seamHoldsFire`), so both halves of the hand fall silent there.
 *
 * **And nothing is sent that the lit step will not take.** A bolt takes some
 * eighty ticks to leave the top of the field, and a laid shot up to half a
 * beat more, so a hand that fired until the step was answered left two or
 * three bolts climbing the middle after it — and the one released last
 * arrived under the false point two steps later, which baited it and lost the
 * wave (`seam-auto.test.ts`). The hand fires only while what is already on
 * its way up the step's column, in its colour, is short of what it asks: one
 * shot, or the glow's shots still owed.
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
  const col = seamStepCol(w, step);
  const color = step.color === "either" ? "cyan" : step.color;
  const owed = step.ask === "glow" ? w.cfg.seamGlowShots - s.quenched : 1;
  if (onTheWay(w, col, color) >= owed) return [{ player: 1, command: { kind: "cannonCol", col } }];
  return [
    { player: 1, command: { kind: "cannonCol", col } },
    { player: 2, command: { kind: "fire", color } },
  ];
}

/** Shots of `color` in the muzzle or climbing `col`: the laid one leaves up
 * whatever column the cannon holds, and the hand holds it on `col`. */
function onTheWay(w: World, col: number, color: Color): number {
  let n = w.charge !== null && w.charge.color === color ? 1 : 0;
  for (const b of w.bullets) if (b.col === col && b.color === color) n += 1;
  return n;
}

function shield(w: World, s: SeamState): Press[] {
  if (!seamWantsShield(s)) return [];
  const col = midCol(w.cfg);
  if (w.shieldCol !== col) return [{ player: 2, command: { kind: "shieldCol", col } }];
  return [{ player: 1, command: { kind: "guard" } }];
}
