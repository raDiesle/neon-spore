import { midCol } from "./config.js";
import type { Command } from "./types.js";
import { viseBoss, viseClosed, vising } from "./vise.js";
import type { World } from "./world.js";

/**
 * Two pinches on THE VISE, one lobe each.
 *
 * **Geometry says whose lobe is whose**, THE MANTLE's rule (`mantle-hand.ts`):
 * `viseLobeLeft` answers only Player 1 and `viseLobeRight` only Player 2, and
 * the wrong seat's pinch does nothing, silently.
 *
 * **The gap is `fromMilli`**: the distance between the two touches on the
 * lobe, in thousandths of a tile, falling as they converge — `SqueezeGap`,
 * §28's primitive. It is read straight, never below nought; a pinch lifted is
 * the lobe back at `viseOpenMilli`, nothing banked. Recorded whenever the
 * case is present, so a pinch already shut when a step lights is counted
 * from its first beat.
 *
 * What a pinch is worth is counted on the beat (`vise-step.ts`); what is heard
 * here is the one instant the beat cannot see — **a gap widening back past
 * shut** while the lit pinch step was counting, which starts its count again
 * from nought.
 */
export function viseHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target !== "viseLobeLeft" && command.target !== "viseLobeRight") return;
  const s = viseBoss(world);
  if (s === null) return;
  const side: 0 | 1 = command.target === "viseLobeLeft" ? 0 : 1;
  const wants: 1 | 2 = side === 0 ? 1 : 2;
  if (player !== wants) return;
  const was = viseClosed(world, s);
  s.gapMilli[side] = command.on
    ? Math.max(0, Math.round(command.fromMilli))
    : world.cfg.viseOpenMilli;
  if (!was || viseClosed(world, s) || !vising(s)) return;
  s.heldBeats = 0;
  world.events.push({ type: "viseSlip", side, col: midCol(world.cfg) });
}
