import { midCol } from "./config.js";
import {
  GOVERNOR_PADS,
  type GovernorState,
  governorBoss,
  governorChordWhole,
  governorOnMark,
  governorTapper,
} from "./governor.js";
import { governorLanded } from "./governor-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GOVERNOR's three handles: the two chords and the tap.
 *
 * **The chords are THE TRIVET's feet** (`trivet-hand.ts`): geometry says
 * whose, so `governorChordLeft` answers only Player 1 and
 * `governorChordRight` only Player 2, and the wrong seat's press does nothing,
 * silently. One drag is one pad, its `id` the pad, nought up to
 * `GOVERNOR_PADS`, and `on` whether it is down. Recorded whenever the
 * governor is up, so a chord already whole when a step lights brakes it from
 * its first tick. A chord coming whole and coming apart is said, because the
 * flyweights answer both.
 *
 * **The tap is `governorTap`**, an edge like THE VALVE's pin
 * (`valve-hand.ts`): a thumb already resting on it has to lift and come down
 * again. It lands only from the lit step's tapper and only while the needle is
 * on the mark (`governorOnMark`) — **however fast the needle is running**,
 * which is the whole of this boss's departure from every other chord on the
 * page. A tap off the mark is a missed pass, and the needle goes round again.
 */
export function governorHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = governorBoss(world);
  if (s === null) return;
  if (command.target === "governorTap") tap(world, s, player, command.on);
  else if (command.target === "governorChordLeft" || command.target === "governorChordRight") {
    const side: 0 | 1 = command.target === "governorChordLeft" ? 0 : 1;
    if (player === side + 1) pad(world, s, side, command.id ?? -1, command.on);
  }
}

function pad(world: World, s: GovernorState, side: 0 | 1, id: number, on: boolean): void {
  if (!Number.isInteger(id) || id < 0 || id >= GOVERNOR_PADS) return;
  const was = governorChordWhole(s, side);
  const bit = 1 << id;
  s.padsDown[side] = on ? s.padsDown[side] | bit : s.padsDown[side] & ~bit;
  const now = governorChordWhole(s, side);
  if (was === now || s.phase === "spent") return;
  const col = midCol(world.cfg);
  world.events.push({ type: now ? "governorPlant" : "governorSlip", side, col });
}

function tap(world: World, s: GovernorState, player: 1 | 2, on: boolean): void {
  const side: 0 | 1 = player === 1 ? 0 : 1;
  if (!on) {
    s.tapDown[side] = false;
    return;
  }
  const edge = !s.tapDown[side];
  s.tapDown[side] = true;
  if (!edge || governorTapper(s) !== player) return;
  if (!governorOnMark(world, s)) {
    world.events.push({ type: "governorSkid", side, col: midCol(world.cfg) });
    return;
  }
  governorLanded(world, s, side);
}
