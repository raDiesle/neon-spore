import type { Command } from "@neon-spore/sim";
import { controlPress } from "./control-command.js";
import type { ControlSet } from "./control-sets.js";

/**
 * Whether any control on this panel sends this kind of command.
 *
 * **The desk keyboard is gated by it.** `apps/game/src/keys.ts` used to answer
 * every key on every wave, on the argument that the rig is one person driving
 * both seats and a tester should be able to reach a control without hunting
 * for the wave that carries it. The owner reversed that: *the active control
 * set also must fit the keyboard bindings — if no cannon is visible, no cannon
 * shot is possible.* A panel that has taken the gun away is a panel where the
 * gun is gone, and a key that still fired one was the rig lying about the game.
 *
 * Derived from `controlPress` rather than listed again, so a control that
 * changes what it sends changes what the keyboard may send in the same edit —
 * a second list here is exactly the drift `purity.test.ts` keeps a table
 * against.
 *
 * **Four kinds are never a panel's to refuse**, and each is off the panel for
 * its own reason: `restart` and the two guide verbs are the *host* talking to
 * a run rather than a seat talking to a ship, and `grip` is a hand on the
 * field, which is the one command that was never half of the split
 * (`sim/command-types.ts`).
 */
export function panelSends(set: ControlSet, kind: Command["kind"]): boolean {
  if (OFF_PANEL.has(kind)) return true;
  return set.controls.some((id) => {
    const press = controlPress(id);
    return press.down.kind === kind || press.up?.kind === kind;
  });
}

const OFF_PANEL: ReadonlySet<Command["kind"]> = new Set([
  "restart",
  "brief",
  "guideStep",
  "grip",
  // A drag is a hand on something the *field* is carrying — a maze string, a
  // warden's rope, a lid's cord, a body being pushed — and none of them is a
  // button on any panel (`DragTarget`).
  "drag",
]);
