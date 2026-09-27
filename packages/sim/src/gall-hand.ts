import { GALL_POINTS, gallBoss, gallClosing, gallPointCol, gallSeatAt, gallShut } from "./gall.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * A pinch on THE GALL: `gallPinch`, `fromMilli` the gap between the two
 * touches in thousandths of a tile — `SqueezeGap`, read exactly as THE VISE
 * reads it (`vise-hand.ts`) — and `id` the point on the seam it went down on.
 *
 * **A pinch counts only on the point the gall is on**: one on another point
 * is a pinch on bare seam, and a pinch left where the gall was, after it
 * jumped, is on nothing, silently. **Geometry says whose point is whose**,
 * THE MANTLE's rule: the two left points answer only the pilot and the two
 * right only the navigator.
 *
 * What a pinch is worth is counted on the beat (`gall-step.ts`); what is heard
 * here is the instant the pinch **comes shut** and the instant it **widens
 * back** past shut while a close was counting, which starts the count again.
 */
export function gallHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "gallPinch") return;
  const s = gallBoss(world);
  if (s === null) return;
  const point = command.id ?? -1;
  if (!Number.isInteger(point) || point < 0 || point >= GALL_POINTS) return;
  if (point !== s.point || gallSeatAt(point) !== player) return;
  const was = gallShut(world, s);
  s.gapMilli = command.on ? Math.max(0, Math.round(command.fromMilli)) : world.cfg.gallOpenMilli;
  const shut = gallShut(world, s);
  if (was === shut || !gallClosing(s)) return;
  const col = gallPointCol(world.cfg, point);
  if (shut) {
    world.events.push({ type: "gallPinch", point, col });
    return;
  }
  s.heldBeats = 0;
  world.events.push({ type: "gallSlip", point, col });
}
