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
 * **Six kinds are never a panel's to refuse**, and each is off the panel for
 * its own reason: `restart` and the two guide verbs are the *host* talking to
 * a run rather than a seat talking to a ship, `grip` and `drag` are a hand on
 * the field rather than on a button, and `shake` is the *device* being moved,
 * which no panel could carry at all (`sim/command-types.ts`).
 *
 * `drag` has one exception inside it now — THE CLAW's crank is a `drag` sent
 * by a *button* — and it stays on the list anyway. The gate is about what a
 * key may say, and the only thing that turns a crank is a hand on one: a
 * bearing arriving on a panel with no crank finds an arm that is not out and
 * winds nothing (`sim/crank.ts`).
 */
export function panelSends(set: ControlSet, kind: Command["kind"]): boolean {
  if (OFF_PANEL.has(kind)) return true;
  // **`fire` belongs to a panel that carries a colour, even though no button
  // sends it.** Since the lance lost its own button the two colours send
  // `prime`, and the ordinary shot is what the simulation makes of the *lift*
  // (`sim/commands.ts`). Two things still send `fire` outright — the swipe on
  // the muzzle, and the desk's W, which is a colour and a guard in one press —
  // and both are only reachable on a panel that has a colour on it anyway.
  if (kind === "fire") return set.controls.some((id) => controlPress(id).down.kind === "prime");
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
  // warden's rope, a lid's cord, a body being pushed, THE CHOIR's two arrows —
  // and none of them is a button on any panel (`DragTarget`).
  "drag",
  // And the shake, which is not a hand on anything at all: it is the *device*
  // being moved. There is no panel it could be on, so there is no panel that
  // may refuse it — and a field with no membrane on it does nothing with one
  // either way (`sim/choir-gesture.ts`).
  "shake",
]);
