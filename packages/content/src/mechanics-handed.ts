import type { Mechanic, MechanicId } from "./mechanics.js";

/**
 * The keys of the table below, checked against the roster. `Extract` rather
 * than a bare union of strings, `SplitId`'s arrangement and for its reason: a
 * name that is not a `MechanicId` collapses to `never` and the key becomes a
 * build error, so this list cannot fall behind a rename.
 */
type HandedId = Extract<MechanicId, "balloon" | "gum" | "choke">;

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
  gum: {
    what: "A sticky mass that falls straight down one lane, at a slick's pace. No shot touches it and the shield does not stop it: it lands on the ship and sticks, and from that beat the cannon cannot fire from any column it covers — the trigger clicks and nothing comes out. It stays until it is swiped off, and the swipe is player 2's, on the body itself, and it only counts while player 1 is holding the cannon under it. Toward the nearer side wall it comes off; away from that wall it spreads a lane wider instead, and the hand has to lift before it can try again. The one who can move the cannon cannot swipe, and the one who can swipe cannot move the cannon.",
    reach: "spawn",
    // A wave names this kind and never a colour, the balloon's arrangement:
    // nothing fired reaches it. What a wave authors is where it comes down,
    // which is the lane the cannon is about to lose.
    waveNames: true,
  },
  choke: {
    what: "A tall boneless body that falls straight down one lane, at a slick's pace. No shot touches it and the shield does not stop it: it lands on the ship and takes the cannon. From that beat the cannon strip answers nobody and the cannon walks a column a beat toward one wall, turns, and walks back, for as long as the choke has it — and player 2 goes on firing from wherever it happens to be standing. What gets it off is player 1 tapping the dead strip, over and over, a lift between each: every fresh press loosens the grip by one, and enough of them and it lets go. It cannot be evaded; the lane it falls in does not matter, because it goes to the cannon wherever the cannon is.",
    reach: "spawn",
    // A wave names this kind and never a colour, the gum's arrangement:
    // nothing fired reaches it. What a wave authors is the beat it comes,
    // which is the beat the pair loses the steering.
    waveNames: true,
  },
} as const satisfies Record<HandedId, Mechanic>;
