import { midCol } from "./config.js";
import { oculusBoss, oculusBothHeld, oculusHolding } from "./oculus.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Two thumbs on THE OCULUS, one leaf each.
 *
 * **Geometry says whose leaf is whose**, THE MANTLE's rule (`mantle-hand.ts`):
 * `oculusLeafLeft` answers only Player 1 and `oculusLeafRight` only Player 2,
 * and the wrong seat's thumb does nothing, silently.
 *
 * A leaf is recorded down or up whenever the lens is present, so a pair that
 * were already holding when a step lights are counted from its first beat.
 * What the hold is worth is counted on the beat (`oculus-step.ts`); what is
 * heard here is the one instant the beat cannot see — **a thumb lifting while
 * both were down**, in a lit hold step, slips the pair open and the count
 * starts again from nought.
 */
export function oculusHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target !== "oculusLeafLeft" && command.target !== "oculusLeafRight") return;
  const s = oculusBoss(world);
  if (s === null) return;
  const side: 0 | 1 = command.target === "oculusLeafLeft" ? 0 : 1;
  const wants: 1 | 2 = side === 0 ? 1 : 2;
  if (player !== wants) return;
  const wasBoth = oculusBothHeld(s);
  s.held[side] = command.on;
  if (command.on || !wasBoth || !oculusHolding(s)) return;
  s.heldBeats = 0;
  world.events.push({ type: "oculusSlip", col: midCol(world.cfg) });
}
