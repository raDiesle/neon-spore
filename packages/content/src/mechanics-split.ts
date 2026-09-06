import type { Mechanic, MechanicId } from "./mechanics.js";

/**
 * The keys of the table below, checked against the roster. `Extract` rather
 * than a bare union of strings: a name that is not a `MechanicId` collapses to
 * `never` and the key becomes a build error, so this list cannot fall behind a
 * rename.
 */
type SplitId = Extract<MechanicId, "lure" | "dart" | "veil" | "wisp" | "ghost">;

/**
 * The five bodies **one seat cannot see whole**: a lure only the navigator
 * knows is a fake, a dart whose next diagonal is drawn on one screen, a veil
 * only the pilot can see inside, a wisp standing on a tile only one of them is
 * shown, a ghost the pilot never sees at all. Every one of them is a sentence
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
    what: "A slick or a bulb, full size and in its real colour — and only the navigator can see that it is neither. A shot that lands on it is the mistake and costs the hull. Left alone it goes on its own, two rows short of the ship.",
    reach: "spawn",
    waveNames: true,
  },
  dart: {
    what: "It never falls straight. Every other beat it takes a diagonal two rows down and two columns to one side, and in between it hangs for one beat. Where it is going, and where it goes after that, is on one of your screens and not the other: an arrow, a dotted path and a hole on the tile it is about to stand in.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // clasp: the silhouette is the dart's and the colour is which cannon
    // answers it, so neither can be worked out from the other.
    waveNames: true,
  },
  veil: {
    what: "A thundercloud with a slick or a bulb inside it. Only the pilot can see which, and it turns over from one to the other every few beats — so what has to be said out loud is a colour and how long it is good for. A shot in the wrong one shuts the cloud for two seconds.",
    reach: "spawn",
    // A wave names this kind and never its colour: what is inside a veil is
    // rolled at the moment it enters the field, which is the one thing about
    // this creature nobody may compose against (`veilOnSpawn`).
    waveNames: true,
  },
  wisp: {
    what: "Only one of you can see it, and it is never in the same tile twice: every two beats it stands somewhere else on the field. It does not fall and it does not leave — the wave stays open until it is shot, and either colour will do it. While one is out, both screens carry the lettered grid.",
    reach: "spawn",
    // A wave names this kind and never a colour: a wisp carries none at all,
    // the way a throb does, so there is nothing on the arrival to author.
    waveNames: true,
  },
  ghost: {
    what: "A body one of you cannot see at all. The pilot gets a band across the row it is standing in — how long there is, and nothing about which column — and the pilot is the one holding the cannon, so the column has to be said out loud as a number. Shot, it lets go and climbs out of the top of the field, and both of you watch it go.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // dart: the silhouette is the ghost's and the colour is which trigger
    // answers it, so neither can be worked out from the other.
    waveNames: true,
  },
} as const satisfies Record<SplitId, Mechanic>;
