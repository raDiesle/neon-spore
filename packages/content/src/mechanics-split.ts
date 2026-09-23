import type { Mechanic, MechanicId } from "./mechanics.js";

/**
 * The keys of the table below, checked against the roster. `Extract` rather
 * than a bare union of strings: a name that is not a `MechanicId` collapses to
 * `never` and the key becomes a build error, so this list cannot fall behind a
 * rename.
 */
type SplitId = Extract<MechanicId, "lure" | "dart" | "veil" | "wisp" | "ghost" | "countdown">;

/**
 * The six bodies **one seat cannot see whole**: a lure only the navigator
 * knows is a fake, a dart whose next diagonal is drawn on one screen, a veil
 * only the pilot can see inside, a wisp standing on a tile only one of them is
 * shown, a ghost the pilot never sees at all, a count only the pilot can read. Every one of them is a sentence
 * that has to be said out loud, which is what makes the group a fact about the
 * game rather than a convenient cut — `render/comms.ts` and the bestiary
 * already read it as one.
 *
 * Lifted out of `mechanics-table.ts` when THE FENCE brought that file to
 * exactly its 250-line limit, along the same seam `creatures-split.ts` takes
 * next door. `MECHANICS` names each of these one by one rather than spreading
 * the object, because `MECHANIC_IDS` is read off its key order and the
 * bestiary walks it — a group spread in one place would have moved the lure to
 * sit beside the ghost.
 */
export const SPLIT_MECHANICS = {
  lure: {
    what: "A slick or a bulb in its real colour. Only Player 2 can see that it is neither. A shot on it costs the hull. Left alone, it goes away.",
    reach: "spawn",
    waveNames: true,
  },
  dart: {
    what: "It never falls straight. Every other beat it jumps two rows down and two columns sideways. Only one of you sees where it goes next.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // clasp: the silhouette is the dart's and the colour is which cannon
    // answers it, so neither can be worked out from the other.
    waveNames: true,
  },
  veil: {
    what: "A cloud with a slick or a bulb inside. Only Player 1 sees which, and it keeps swapping. A wrong colour shuts the cloud for two seconds.",
    reach: "spawn",
    // A wave names this kind and never its colour: what is inside a veil is
    // rolled at the moment it enters the field, which is the one thing about
    // this creature nobody may compose against (`veilOnSpawn`).
    waveNames: true,
  },
  wisp: {
    what: "Only one of you sees it. Every two beats it jumps to a new tile. Either colour kills it. Both screens show the lettered grid.",
    reach: "spawn",
    // A wave names this kind and never a colour: a wisp carries none at all,
    // the way a throb does, so there is nothing on the arrival to author.
    waveNames: true,
  },
  ghost: {
    what: "Player 1 holds the cannon but cannot see this body, only a band on its row. Player 2 says its column as a number.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // dart: the silhouette is the ghost's and the colour is which trigger
    // answers it, so neither can be worked out from the other.
    waveNames: true,
  },
  countdown: {
    what: "Blades shut its eye, one fewer each beat. Only Player 1 sees them. Shoot in the two beats it is open. Any other shot shuts it for three beats.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // throb: the count says *when* and the colour says *which trigger*, and
    // neither can be worked out from the other.
    waveNames: true,
  },
} as const satisfies Record<SplitId, Mechanic>;
