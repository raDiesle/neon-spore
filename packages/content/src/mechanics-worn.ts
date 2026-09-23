import type { Mechanic, MechanicId } from "./mechanics.js";

/**
 * The keys of the table below, checked against the roster — `mechanics-split.ts`'
 * `SplitId` for the same reason: a name that is not a `MechanicId` collapses to
 * `never` and the key becomes a build error, so this list cannot fall behind a
 * rename.
 */
type WornId = Extract<
  MechanicId,
  "rind" | "recoil" | "carom" | "chute" | "volley" | "clasp" | "crystal"
>;

/**
 * **A slick or a bulb wearing something that has to come off first.**
 *
 * Every one of these is the ordinary rule with a delay in front of it: a layer,
 * a cage, a crust, a shell, a plate. The pair already know what to do with what
 * is inside — the matching colour, in the column it is standing in — and the
 * whole of the mechanic is that they cannot do it yet, and have to say out loud
 * how much of the wrapping is left. That is what makes the group a fact about
 * the game rather than a convenient cut: it is one sentence said six ways, and
 * the bestiary reads them beside each other.
 *
 * `chute` comes with them because it is `carriedBy: "carom"` — it is what falls
 * out when a crust cracks, and it exists nowhere a carom has not been.
 *
 * Lifted out of `mechanics-table.ts` when that file came back to its 250-line
 * limit for the second time. `MECHANICS` names each of these one by one rather
 * than spreading the object, because `MECHANIC_IDS` is read off its key order
 * and the bestiary walks it — the clasp sits five rows further down than the
 * other five and has to stay there.
 */
export const WORN_MECHANICS = {
  rind: {
    what: "A slick or a bulb three times the size of one. Each matching shot takes a layer off, and it shrinks. The third shot kills it.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for an
    // echo: the silhouette is a slick's or a bulb's and the colour is which
    // trigger answers it, so neither can be worked out from the other.
    waveNames: true,
  },
  recoil: {
    what: "A slick or a bulb in a sprung cage. A matching shot throws it two rows up, into a new column, in the other colour. The fourth shot kills it.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // rind: the silhouette is a slick's or a bulb's, and the colour is which
    // trigger answers it *first* — every bounce turns it over from there.
    waveNames: true,
  },
  carom: {
    what: "A slick or a bulb in a rock crust, bouncing in on a diagonal. The matching colour cracks it. Put the shield under the meteor that falls out.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // clasp: the silhouette is the crust's and the colour is the body sealed
    // inside it, which is which cannon opens it, so neither can be worked out
    // from the other.
    waveNames: true,
  },
  chute: {
    what: "The body from a cracked carom. It flies up, then floats down under a canopy. Shoot its colour, and put the shield under the rock.",
    reach: "spawn",
    // Thrown out by the crust cracking, the way the six on a rim are brought
    // by their wheel — so a wave reaches this without naming it, and there is
    // no wave anywhere that could name it (`addCarried`). Deliberately no
    // `waveNames`: a chute with no carom above it would be a body that had
    // been ejected from nothing.
    carriedBy: "carom",
  },
  volley: {
    what: "A rock with a slick or a bulb inside. Each time the shield meets it, it flies six rows back up. After three, it bursts. Shoot what falls out.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // carom: the silhouette is the shell's and the colour is the body sealed
    // inside it, which is which cannon finishes it once the shield is done, so
    // neither can be worked out from the other.
    waveNames: true,
  },
  crystal: {
    what: "A wide craft in an electric field, moving on a diagonal. Put the shield under it, then shoot its middle. It breaks into a slick and a bulb.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // carom: the silhouette is the shell's and the colour is the join's, which
    // is which cannon breaks it, so neither can be worked out from the other.
    waveNames: true,
  },
  clasp: {
    what: "Shots bounce off it. Trigger the shield in its column to open it. Then shoot the slick or the bulb inside.",
    reach: "spawn",
    // A wave names this kind explicitly and gives it a colour, the way it
    // does for a lure: the colour is the body *inside*, and it decides what
    // the clasp becomes (`livingKindForColor`), so an entry without one would
    // be authoring a body with no answer.
    waveNames: true,
  },
} as const satisfies Record<WornId, Mechanic>;
