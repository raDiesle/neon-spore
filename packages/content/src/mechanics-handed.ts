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
    what: "A sticky mass that falls straight down one lane, at a slick's pace. A shot is spent on it — the bolt bounces off and the body is untouched — and the shield does not stop it. Either seat answers it, in the air: a thumb on the drop and a swipe to the left or to the right, and it flies out of the field along the row it was on, a few columns a beat, gone at the wall. A thumb that rests on it does nothing — it goes on falling under the finger — and a swipe on the ship's row is too late. One that reaches the ship hits the hull at once, with no scar to show for it, and splashes across the whole surface of the ship like water.",
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
    what: "A round body ringed with hooks. The thing at the top of the field fires it at the plate very fast, like a harpoon, and it clamps on wherever the plate is — no fall, no lane, and nothing to evade. A shot is spent on it: the bolt bounces off and the body is untouched. From that beat the plate has to keep moving, and it is judged between beats rather than on them — a plate that has not been found in a new column for harpoonStillBeats loses the round, a heavy hit on the hull at the plate's column. The pencil's own length is how long it stays; when that runs out the line is reeled back to the thing that fired it and the wave goes on. A timer over the body counts it down, and the seat without the plate is the one told to say MOVE SHIELD!",
    reach: "wave",
  },
  leech: {
    what: "Four needles on a round body. The thing at the top of the field fires it at the cannon very fast, like a harpoon, and it drives them into the swelling wherever the cannon is — no fall, no lane, and nothing to evade. A shot is spent on it: the bolt bounces off and the body is untouched. From that beat the cannon has to keep moving, and it is judged between beats rather than on them — a cannon that has not been found in a new column for harpoonStillBeats loses the round, a heavy hit on the hull at the cannon's column. The pencil's own length is how long it stays; when that runs out the line is reeled back to the thing that fired it and the wave goes on. A timer over the body counts it down, and the seat without the cannon is the one told to say MOVE CANNON!",
    reach: "wave",
  },
} as const satisfies Record<HandedId, Mechanic>;
