import type { Mechanic, MechanicId } from "./mechanics.js";

/**
 * The keys of the table below, checked against the roster. `Extract` rather
 * than a bare union of strings, `SplitId`'s arrangement and for its reason: a
 * name that is not a `MechanicId` collapses to `never` and the key becomes a
 * build error, so this list cannot fall behind a rename.
 */
type HandedId = Extract<MechanicId, "balloon">;

/**
 * **The bodies answered by hands alone.** `creatures-handed.ts` next door is
 * the same family said as a bestiary entry, and the cut is the one that file
 * argues: every other group here is cut by what a body *is* or by what one
 * seat can see, and this one by what **answers** it — neither the cannon nor
 * the shield, but two thumbs at the same instant.
 *
 * Its own file rather than one more row in `mechanics-table.ts`, which stood
 * at 248 of its 250 lines when THE BALLOON arrived. `MECHANICS` names this one
 * by name rather than spreading the object, `SPLIT_MECHANICS`' arrangement and
 * for its reason: `MECHANIC_IDS` is read off key order and the bestiary walks
 * it, so a group spread in one place would move a creature away from the
 * neighbours it was written beside.
 */
export const HANDED_MECHANICS = {
  balloon: {
    what: "It comes out of nothing one lane above the ship, swells for a beat or two, and then climbs — a row up and a lane across every beat, turning at the side walls. Nothing either of you can fire touches it, and if it reaches the top of the field it goes off and the hull pays wherever the ship is standing. What answers it is two hands at once: the pilot takes the handle on its left and carries it left, the navigator takes the one on its right and carries it right, and while both are taut the skin gives. The first time, it splits into two smaller ones that hold still for a moment and then climb on; the second pops them, and a popped balloon costs nothing. There are usually several going up at once, so the only thing left to say out loud is which one.",
    reach: "spawn",
    // A wave names this kind and never a colour: a balloon carries none at
    // all, the way a wisp and a wall do, and no bolt reaches one in any
    // colour. What a wave authors instead is how fast it climbs
    // (`WaveEntry.rise`), which is how long the pair has to agree on it.
    waveNames: true,
  },
} as const satisfies Record<HandedId, Mechanic>;
