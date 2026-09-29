import { scoutPilot, scoutRound, type World } from "@neon-spore/sim";
import { type ControlSet, swapSeats } from "./control-sets.js";

/**
 * **The panel as it is seated on this tick**: the wave's own set, or that set
 * with the seats exchanged.
 *
 * Only THE SCOUT exchanges them. The owner, 29 September 2026: *every level
 * next, the controls swap with other player* — so on the second arena player 2
 * holds the turns and the burn and player 1 the mouth, and on the third it is
 * back again (`sim` `scoutPilot`). The simulation hears a press by the seat it
 * came from, so the panel each phone draws and answers has to be asked of the
 * same rule, and this is where it is asked: the band, the touch test, the desk
 * keys and a rehearsal's thumbs all take the set from here.
 */
export function seatedSet(set: ControlSet, world: World): ControlSet {
  const round = scoutRound(world);
  return round !== null && scoutPilot(round) === 2 ? swapSeats(set) : set;
}
