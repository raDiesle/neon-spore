import {
  type Creature,
  coilCharged,
  coilIsDomed,
  coilWardReaches,
  guardArmed,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";

/**
 * **THE COIL, opened by the shield** (`sim/coil.ts`).
 *
 * A coil crosses the field inside a dome of its own, sinking at each wall, and
 * nothing answers it but the plate: the shield in its column, armed, with
 * nothing between the two (`coilWardReaches`). The field hand never stood
 * under one, so a coil on a wave with no shield fault to arm the plate by
 * itself crossed and sank until it reached the hull — nearly every composed
 * wave of THE COIL's and THE CROSSING's blocks was lost that way
 * (`docs/queue.md`, 14 October 2026).
 *
 * The rule played is the pair's, *stand in its column and hold*: under the
 * lowest coil, and the trigger once the lane below it is clear. What comes
 * out is a torch thrown to the hull at the wall furthest from the plate, and
 * that one is the field hand's ordinary rock. So a dome is opened only while
 * no rock is close to the shield, and none while a chain is already alight —
 * a charged coil opens by itself, and a second torch at the other wall in the
 * same beats would be one the plate cannot reach.
 */

type Press = Omit<TimedCommand, "tick">;

const carry = (col: number): Press => ({ player: 2, command: { kind: "shieldCol", col } });
const trigger: Press = { player: 1, command: { kind: "guard" } };

/** The shield's presses for the lowest domed coil, or null when there is none to open now. */
export function wardCoil(w: World): Press[] | null {
  let coil: Creature | undefined;
  for (const c of w.creatures) {
    if (!coilIsDomed(c)) continue;
    if (coilCharged(c)) return null;
    if (coil === undefined || c.row > coil.row) coil = c;
  }
  if (coil === undefined) return null;
  if (w.shieldCol !== coil.col) return [carry(coil.col)];
  return coilWardReaches(w, coil) && !guardArmed(w) ? [trigger] : [];
}
