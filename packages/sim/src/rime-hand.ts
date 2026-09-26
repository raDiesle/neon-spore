import { midCol } from "./config.js";
import { rimeBoss, rimeRubbing, rimeWiping } from "./rime.js";
import { rimeCleared, rimeThawed } from "./rime-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Two wiping thumbs on THE RIME, one half each.
 *
 * **Geometry says whose half is whose**, THE MANTLE's rule (`mantle-hand.ts`):
 * `rimeHalfLeft` answers only Player 1 and `rimeHalfRight` only Player 2, and
 * the wrong seat's wipe does nothing, silently.
 *
 * **The reversal count is the drag's `id`**: how many times the thumb has
 * turned back on itself since it went down — `RubCount`, §29's primitive,
 * counted on the device off pointer events alone. What is kept here is the
 * last count heard, so only the reversals *since* shave frost; a count lower
 * than that is a fresh touch, and every reversal in it is new. A thumb lifted
 * sets the half's count back to nought. Heard whenever the lens is present,
 * so a thumb already wiping when a step lights is not counted twice.
 *
 * A half wiped to nought is answered **on the tick**: waiting for the beat
 * would let the frost the beat grows back undo a wipe the pair had finished.
 * In the whiteout both halves are lit at once, and it is answered when both
 * are nought together (`rimeThawed`).
 */
export function rimeHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target !== "rimeHalfLeft" && command.target !== "rimeHalfRight") return;
  const s = rimeBoss(world);
  if (s === null) return;
  const side: 0 | 1 = command.target === "rimeHalfLeft" ? 0 : 1;
  const wants: 1 | 2 = side === 0 ? 1 : 2;
  if (player !== wants) return;
  if (!command.on) {
    s.rubs[side] = 0;
    return;
  }
  const count = Math.max(0, command.id ?? 0);
  const fresh = count >= s.rubs[side] ? count - s.rubs[side] : count;
  s.rubs[side] = count;
  if (fresh === 0 || !rimeRubbing(s, side)) return;
  s.rubbed[side] = true;
  s.rimeMilli[side] = Math.max(0, s.rimeMilli[side] - fresh * world.cfg.rimeShaveMilli);
  const col = midCol(world.cfg);
  world.events.push({ type: "rimeShave", side, rimeMilli: s.rimeMilli[side], col });
  if (s.rimeMilli[side] > 0) return;
  if (rimeWiping(s) === side) rimeCleared(world, s, side);
  else rimeThawed(world, s);
}
