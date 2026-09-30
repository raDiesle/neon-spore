import { scoutPilot, scoutRound, type World } from "@neon-spore/sim";
import type { ControlSet, ControlSetId } from "./control-sets.js";
import type { ControlDef } from "./controls.js";

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

/** The seat a control is on **on this panel** — its own, unless the set is swapped. */
export function controlSeat(set: ControlSet, def: ControlDef): 1 | 2 {
  if (set.swapped !== true) return def.player;
  return def.player === 1 ? 2 : 1;
}

const SWAPPED = new Map<ControlSetId, ControlSet>();
const UNSWAPPED = new WeakMap<ControlSet, ControlSet>();

/**
 * The same panel with the seats exchanged, one object per set so a caller
 * holding it twice holds the same thing twice.
 */
export function swapSeats(set: ControlSet): ControlSet {
  if (set.swapped === true) return set;
  let out = SWAPPED.get(set.id);
  if (out === undefined) {
    out = { ...set, swapped: true };
    SWAPPED.set(set.id, out);
    UNSWAPPED.set(out, set);
  }
  return out;
}

/** The panel this control is on `seat` in: `set` itself, or `set` swapped either way. */
export function setSeating(set: ControlSet, def: ControlDef, seat: 1 | 2): ControlSet {
  if (controlSeat(set, def) === seat) return set;
  return set.swapped === true ? (UNSWAPPED.get(set) ?? set) : swapSeats(set);
}
