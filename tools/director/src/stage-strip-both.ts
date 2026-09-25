import { type ControlSet, setHas } from "@neon-spore/content";
import type { ViewRole } from "@neon-spore/render";
import type { Command } from "@neon-spore/sim";

/**
 * **One strip carries the cannon and the shield together**, and only under
 * TEST. The owner, 25 September 2026: *when I am in test mode, I want that
 * slider moves cannon and shield in sync at the same time.*
 *
 * A stage has one mouse, and on the TEST screen it can hold one strip at a
 * time — so a column defended with the dome over the muzzle, which is most of
 * what two phones do all wave, took two drags in turn here. A slide on either
 * strip is now sent as itself and again as the other seat's slide to the same
 * column, press, carry and all, so the two lobes travel as one.
 *
 * **TEST only**, for `stage-balloon-both.ts`'s reason: `p1` and `p2` are the
 * phone, one strip each, and a second hand there would be the editor lying
 * about the control scheme. And only where the wave's panel has the other
 * control — a wave with no shield is not handed one by the desk.
 */
export function stripBothHands(
  role: ViewRole,
  player: 1 | 2,
  command: Command,
  controls: ControlSet,
): { player: 1 | 2; command: Command } | null {
  if (role !== "test") return null;
  const other: 1 | 2 = player === 1 ? 2 : 1;
  if (command.kind === "cannonCol" && setHas(controls, "shield")) {
    return { player: other, command: { kind: "shieldCol", col: command.col } };
  }
  if (command.kind === "shieldCol" && setHas(controls, "cannon")) {
    return { player: other, command: { kind: "cannonCol", col: command.col } };
  }
  return null;
}
