import type { ControlSet } from "./control-sets.js";
import { setHas } from "./control-sets.js";
import type { ControlGroup } from "./creatures.js";

/**
 * **The panel half of the coverage rule**, and nothing else.
 *
 * Cut out of `control-sets.ts` when THE SCOUT's id took that file one line
 * over its 250-line limit, and the seam is the one the file's own header
 * already draws twice: everything left there is about a *panel* — what is on
 * it, which one it is a picture of, what is held back — and this is the one
 * question asked of a panel on a **creature's** behalf. It is the sibling of
 * `controlsForKinds` in `creatures.ts` rather than of anything next door, and
 * `test/waves.test.ts` puts the two together over every wave.
 *
 * `control-sets.ts` re-exports it, so nothing that already asked
 * `groupsCoveredBy` through that file had to move.
 */

/**
 * Which control groups this panel can answer.
 *
 * `ControlGroup` is aim and guard — *the two things a wave may be missing* —
 * and a creature declares which of them it demands (`CreatureDef.controls`).
 * The union rule is that a wave's panel covers every group its creatures
 * demand, and this is the half of it that reads a panel; `controlsForKinds`
 * is the half that reads the creatures, and `test/waves.test.ts` puts them
 * together over every wave.
 *
 * Derived from the controls in the set rather than declared beside them,
 * because a declaration is a second copy of something already written down.
 * Aim is a cannon and something to fire out of it: neither half alone puts a
 * bolt up a column.
 *
 * **Guard is the trigger, and the strip that carries the plate is not part
 * of it.** It used to ask for both, on the argument that either half alone
 * was a group the pair could not use — and STANDARD 3 is the counter-example
 * the ladder was built around. The plate is on the hull whether or not
 * anybody can slide it; without the trigger nothing ever raises it, which is
 * a rock nobody can answer, but with the trigger and no strip a rock in the
 * plate's own column is answered exactly as the wave intends. So coverage is
 * *can this panel answer the group at all*, and where the answer has to
 * happen is the wave author's problem.
 */
export function groupsCoveredBy(set: ControlSet): ControlGroup[] {
  const covered: ControlGroup[] = [];
  const fires = setHas(set, "fireRed") || setHas(set, "fireCyan");
  if (setHas(set, "cannon") && fires) covered.push("aim");
  // **The arm covers `guard`, and it is the only thing but the trigger that
  // does.** The group means *can this panel answer a rock at all*, and THE
  // CLAW's answer is to reach into it: the body is crushed and the hull pays
  // `damageReach`, which is less than the same body costs by landing
  // (`sim/reach.ts`). It is a worse answer than the dome and a real one, which
  // is exactly what a panel with no dome on it should have.
  if (setHas(set, "guard") || setHas(set, "reach")) covered.push("guard");
  return covered;
}
