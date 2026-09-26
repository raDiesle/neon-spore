import { midCol } from "./config.js";
import { cystBoss, cystClenched, cystClosed, cystFreezer, cystPincher, cystSide } from "./cyst.js";
import { cystStilled } from "./cyst-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CYST's four handles: a freeze mark and a flank on each side, and on
 * each side the two belong to different seats.
 *
 * **Geometry says whose is whose**, THE MANTLE's rule (`mantle-hand.ts`):
 * the pilot pinches `cystFlankLeft` and taps `cystFreezeRight`, the navigator
 * pinches `cystFlankRight` and taps `cystFreezeLeft` — the freezing hand is
 * always the pinching hand's partner (`cystFreezer`). The wrong seat's touch
 * does nothing, silently.
 *
 * **The tap is an edge**, THE VALVE's pin (`valve-hand.ts`): a thumb already
 * resting on the mark when the flank lights has to lift and come down again.
 * It lands only on the lit flank's own mark, while it waits.
 *
 * **The gap is `fromMilli`**, THE VISE's lobe (`vise-hand.ts`): read straight,
 * never below nought, and a pinch lifted is the flank back at `cystOpenMilli`.
 * Recorded whenever the sac is present, so a pinch already shut when the
 * flank is stilled counts from its first beat; what is heard here is a gap
 * widening back past shut on the stilled flank, which starts its count again
 * — or on either flank of a swell, which needs both shut together.
 */
export function cystHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = cystBoss(world);
  if (s === null) return;
  if (command.target === "cystFreezeLeft" || command.target === "cystFreezeRight") {
    const side: 0 | 1 = command.target === "cystFreezeLeft" ? 0 : 1;
    if (player !== cystFreezer(side)) return;
    if (!command.on) {
      s.tapDown[side] = false;
      return;
    }
    const edge = !s.tapDown[side];
    s.tapDown[side] = true;
    if (edge && s.phase === "lit" && cystSide(s) === side) cystStilled(world, s, side);
    return;
  }
  if (command.target !== "cystFlankLeft" && command.target !== "cystFlankRight") return;
  const side: 0 | 1 = command.target === "cystFlankLeft" ? 0 : 1;
  if (player !== cystPincher(side)) return;
  const shut = (): boolean => cystClosed(world, s) || cystClenched(world, s);
  const was = shut();
  s.gapMilli[side] = command.on
    ? Math.max(0, Math.round(command.fromMilli))
    : world.cfg.cystOpenMilli;
  if (!was || shut()) return;
  s.heldBeats = 0;
  world.events.push({ type: "cystSlip", side, col: midCol(world.cfg) });
}
