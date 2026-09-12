import type { Mechanic, MechanicId } from "./mechanics.js";

/**
 * The keys of the table below, checked against the roster. `Extract` rather
 * than a bare union of strings, `SplitId`'s arrangement and for its reason: a
 * name that is not a `MechanicId` collapses to `never` and the key becomes a
 * build error, so this list cannot fall behind a rename.
 */
type HandedId = Extract<MechanicId, "balloon" | "gum" | "weight" | "limpet" | "leech">;

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
  weight: {
    what: "A heavy sac that comes down one lane a beat, at a slick's pace. Nothing either of you can fire reaches it and the shield has nothing to say to it, so if it gets to the hull it simply lands and the wave is lost. What answers it is a hand from each seat, on the body itself, at the same time: hold both on it for a little over half a beat and it gives between them. One hand alone does nothing at all — and the only sign of it is on that player's own screen, a brightening under the thumb the other seat is not shown. So neither of you can see whether your partner is already pressing, and the only thing that gets two thumbs onto one body at once is one of you counting it out loud.",
    reach: "spawn",
    // A wave names this kind and never a colour, the balloon's arrangement and
    // for its reason: nothing fired reaches it. What a wave authors is the lane
    // it comes down, which is the tile the pair has to both find.
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
  // THE LIMPET and THE LEECH ride along here: bodies on the ship answered
  // by something other than a shot — this time a control being moved.
  limpet: {
    what: "A round body ringed with hooks that falls straight down one lane, at a slick's pace. No shot touches it and the shield does not stop it: it lands on the ship and clamps onto the plate, wherever the plate is. From that beat a fuse runs while the shield stands still — every beat it is found in the column it was in a beat before is a beat of the fuse, and when the fuse runs out the body goes off: a heavy hit on the hull at the plate's column, and the wave is lost. A beat the shield is found in a new column puts the fuse back to nought and is one move against the grip; enough moves and it drops off. Only the seat without the plate is shown the fuse. It cannot be evaded; the lane it falls in does not matter.",
    reach: "spawn",
    waveNames: true,
  },
  leech: {
    what: "Four needles on a round body, falling straight down one lane at a slick's pace. No shot touches it and the shield does not stop it: it lands on the ship and drives itself into the cannon, wherever the cannon is. From that beat a fuse runs while the cannon stands still — every beat it is found in the column it was in a beat before is a beat of the fuse, and when the fuse runs out the body goes off: a heavy hit on the hull at the cannon's column, and the wave is lost. A beat the cannon is found in a new column puts the fuse back to nought and is one move against the grip; enough moves and it drops off. Only the seat without the cannon is shown the fuse. It cannot be evaded; the lane it falls in does not matter.",
    reach: "spawn",
    waveNames: true,
  },
} as const satisfies Record<HandedId, Mechanic>;
