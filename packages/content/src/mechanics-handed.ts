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
    what: "It climbs from the ship to the top. No shot touches it. Player 1 pulls its left handle, Player 2 its right, both at once.",
    reach: "spawn",
    // A wave names this kind and never a colour: a balloon carries none at
    // all, the way a wisp and a wall do, and no bolt reaches one in any
    // colour. What a wave authors instead is how fast it climbs
    // (`WaveEntry.rise`), which is how long the pair has to agree on it.
    waveNames: true,
  },
  weight: {
    what: "A heavy sac that no shot or shield stops. Both of you hold a thumb on it at the same time. Count it out loud.",
    reach: "spawn",
    // A wave names this kind and never a colour, the balloon's arrangement and
    // for its reason: nothing fired reaches it. What a wave authors is the lane
    // it comes down, which is the tile the pair has to both find.
    waveNames: true,
  },
  gum: {
    what: "No shot or shield stops it. Put a thumb on it and swipe left or right. It flies out along its row.",
    reach: "spawn",
    // A wave names this kind and never a colour, the balloon's arrangement:
    // nothing fired reaches it. What a wave authors is where it comes down,
    // which is the lane one of the pair has to reach.
    waveNames: true,
  },
  // THE LIMPET and THE LEECH ride along here: bodies on the ship answered by
  // something other than a shot — this time a control being moved.
  //
  // **Neither carries `waveNames` any more**, and the flag is exactly the fact
  // that changed: the owner ruled on 15 September 2026 that these two exist
  // only as a pencil, so a wave never names the kind, it places the fault and
  // the fault fires the body (`sim/harpoon.ts`). `mechanics.test.ts` holds the
  // flag against `isInstalled` in the bestiary, so the two say one thing.
  limpet: {
    what: "It clamps on the shield and no shot touches it. Keep moving the shield to new columns until its timer runs out.",
    reach: "wave",
  },
  leech: {
    what: "It sticks to the cannon and no shot touches it. Keep moving the cannon to new columns until its timer runs out.",
    reach: "wave",
  },
} as const satisfies Record<HandedId, Mechanic>;
