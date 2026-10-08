import { GALL_POINTS, gallBoss, gallClosing, gallPointCol, gallSeatAt, gallShut } from "./gall.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * A press on THE GALL: `gallPress`, one finger — or one mouse button — held
 * down on the nodule, and `id` the point on the seam it went down on. While it
 * is down the gall is pressed shut, its gap nought; lifted, it stands open
 * again at `gallOpenMilli`. `fromMilli` is not read: a hand that wanders
 * while it holds is still holding. The owner swapped THE VISE's two-finger
 * press for this on 7 October 2026, because the director on a desk has one
 * pointer and the difficulty was never meant to be in the fingers.
 *
 * **A press counts only on the point the gall is on**: one on another point
 * is a press on bare seam, and a press left where the gall was, after it
 * jumped, is on nothing, silently. **Geometry says whose point is whose**,
 * THE MANTLE's rule: the two left points answer only the pilot and the two
 * right only the navigator.
 *
 * What a press is worth is counted on the beat (`gall-step.ts`); what is heard
 * here is the instant it **comes shut** and the instant it **lifts** while a
 * close was counting, which starts the count again.
 */
export function gallHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "gallPress") return;
  const s = gallBoss(world);
  if (s === null) return;
  const point = command.id ?? -1;
  if (!Number.isInteger(point) || point < 0 || point >= GALL_POINTS) return;
  if (point !== s.point || gallSeatAt(point) !== player) return;
  const was = gallShut(world, s);
  s.gapMilli = command.on ? 0 : world.cfg.gallOpenMilli;
  const shut = gallShut(world, s);
  if (was === shut || !gallClosing(s)) return;
  const col = gallPointCol(world.cfg, point);
  if (shut) {
    world.events.push({ type: "gallPress", point, col });
    return;
  }
  s.heldBeats = 0;
  world.events.push({ type: "gallSlip", point, col });
}
