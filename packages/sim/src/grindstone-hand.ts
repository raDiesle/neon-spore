import { midCol } from "./config.js";
import {
  GRINDSTONE_PADS,
  type GrindstoneState,
  grinding,
  grindstoneBoss,
  grindstoneClamped,
} from "./grindstone.js";
import { grindstoneCleared } from "./grindstone-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Two grinding thumbs and two jaws on THE GRINDSTONE, one of each a seat.
 *
 * **Geometry says whose is whose**, THE MANTLE's rule (`mantle-hand.ts`): the
 * `…Left` targets answer only Player 1 and the `…Right` only Player 2, and the
 * wrong seat's touch does nothing, silently.
 *
 * **A flat is heard as THE RIME hears a half** (`rime-hand.ts`): the drag's
 * `id` is how many times the thumb has turned back since it went down, only
 * the reversals since the last count shave grit, a lift sets the count back
 * to nought, and a flat ground to nought is answered on the tick.
 *
 * **A jaw is heard as THE TRIVET hears a foot** (`trivet-hand.ts`): one drag
 * a pad, its `id` naming which, kept as a mask whenever the wheel is present
 * so a clamp already down counts from the step's first beat; a pad lifting
 * in a lit clamp that was held starts its count again.
 */
export function grindstoneHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = grindstoneBoss(world);
  if (s === null) return;
  const t = command.target;
  if (t === "grindFlatLeft" || t === "grindFlatRight") {
    const side: 0 | 1 = t === "grindFlatLeft" ? 0 : 1;
    if (player === side + 1) ground(world, s, side, command.on ? (command.id ?? 0) : null);
  } else if (t === "grindJawLeft" || t === "grindJawRight") {
    const side: 0 | 1 = t === "grindJawLeft" ? 0 : 1;
    if (player === side + 1) jaw(world, s, side, command.id ?? -1, command.on);
  }
}

/** A reversal count on a flat, or null for the thumb lifted. */
function ground(world: World, s: GrindstoneState, side: 0 | 1, id: number | null): void {
  if (id === null) {
    s.rubs[side] = 0;
    return;
  }
  const count = Math.max(0, id);
  const fresh = count >= s.rubs[side] ? count - s.rubs[side] : count;
  s.rubs[side] = count;
  if (fresh === 0 || grinding(s) !== side) return;
  s.rubbed[side] = true;
  s.gritMilli[side] = Math.max(0, s.gritMilli[side] - fresh * world.cfg.grindstoneShaveMilli);
  const col = midCol(world.cfg);
  world.events.push({ type: "grindstoneShave", side, gritMilli: s.gritMilli[side], col });
  if (s.gritMilli[side] === 0) grindstoneCleared(world, s, side);
}

/** A pad on a jaw down or up. */
function jaw(world: World, s: GrindstoneState, side: 0 | 1, pad: number, on: boolean): void {
  if (!Number.isInteger(pad) || pad < 0 || pad >= GRINDSTONE_PADS) return;
  const was = grindstoneClamped(s);
  const bit = 1 << pad;
  s.padsDown[side] = on ? s.padsDown[side] | bit : s.padsDown[side] & ~bit;
  if (!was || grindstoneClamped(s)) return;
  s.heldBeats = 0;
  world.events.push({ type: "grindstoneSlip", side, col: midCol(world.cfg) });
}
