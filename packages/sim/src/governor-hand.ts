import { midCol } from "./config.js";
import { type GovernorState, governorBoss } from "./governor.js";
import { governorAsksSeat, governorMarkFor } from "./governor-mark.js";
import { governorLanded } from "./governor-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GOVERNOR's one handle: the tap.
 *
 * **The tap is `governorTap`**, an edge like THE VALVE's pin
 * (`valve-hand.ts`): a thumb already resting on it has to lift and come down
 * again. It lands one of the seat's own marks, among those open — every one
 * not landed, or on an ordered step only the next — while the needle is on it
 * (`governorMarkFor`). A tap from a seat with a mark still to land and the
 * needle on none it may land now — off the mark, or on an ordered step out
 * of turn — is a missed pass, and the needle goes round again; it costs
 * nothing landed. From a seat with nothing left to land, it does nothing.
 */
export function governorHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "governorTap") return;
  const s = governorBoss(world);
  if (s !== null) tap(world, s, player, command.on);
}

function tap(world: World, s: GovernorState, player: 1 | 2, on: boolean): void {
  const side: 0 | 1 = player === 1 ? 0 : 1;
  if (!on) {
    s.tapDown[side] = false;
    return;
  }
  const edge = !s.tapDown[side];
  s.tapDown[side] = true;
  if (!edge || !governorAsksSeat(s, player)) return;
  const mark = governorMarkFor(world, s, player);
  if (mark === null) {
    world.events.push({ type: "governorSkid", side, col: midCol(world.cfg) });
    return;
  }
  governorLanded(world, s, side, mark);
}
