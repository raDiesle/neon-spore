import type { Mechanic, MechanicId } from "./mechanics.js";

/**
 * The keys of the table below, checked against the roster — `mechanics-split.ts`'
 * `SplitId` for the same reason: a name that is not a `MechanicId` collapses to
 * `never` and the key becomes a build error, so this list cannot fall behind a
 * rename.
 */
type WornId = Extract<MechanicId, "rind" | "recoil" | "carom" | "chute" | "volley" | "clasp">;

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
    what: "A slick or a bulb three times the size of one. The matching colour takes a layer off rather than killing it, twice — the body is a size smaller each time — and only the third shot finishes it. Its size is how much is left.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for an
    // echo: the silhouette is a slick's or a bulb's and the colour is which
    // trigger answers it, so neither can be worked out from the other.
    waveNames: true,
  },
  recoil: {
    what: "A slick or a bulb in a sprung cage. The matching colour does not kill it: it throws the body two rows back up the field and a lane to one side neither of you can predict, and turns it over to the other colour on the way. Three times, with the cage visibly more broken each time, and only the fourth shot finishes it.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // rind: the silhouette is a slick's or a bulb's, and the colour is which
    // trigger answers it *first* — every bounce turns it over from there.
    waveNames: true,
  },
  carom: {
    what: "A slick or a bulb sealed inside a rock crust. It never falls — it comes in on a diagonal, four columns and two rows a beat, and turns at the side walls twice before it reaches the ship. The shield has nothing to say to it while the crust is on. The matching cannon cracks it open, and what drops out of the shell is a plain meteor coming down at a row a beat, which now has to be warded.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // clasp: the silhouette is the crust's and the colour is the body sealed
    // inside it, which is which cannon opens it, so neither can be worked out
    // from the other.
    waveNames: true,
  },
  chute: {
    what: "The body that was sealed inside a carom, blown out of the hatch when the crust cracks. It is the only thing in the game that goes up: it climbs to the top of the field, opens a canopy there and comes back down at half the speed of a slick, still in its own colour. The matching cannon kills it exactly the way it kills a slick — but the rock it came out of is falling at the same time, and that one is the shield's.",
    reach: "spawn",
    // Thrown out by the crust cracking, the way the six on a rim are brought
    // by their wheel — so a wave reaches this without naming it, and there is
    // no wave anywhere that could name it (`addCarried`). Deliberately no
    // `waveNames`: a chute with no carom above it would be a body that had
    // been ejected from nothing.
    carriedBy: "carom",
  },
  volley: {
    what: "A rock with a slick or a bulb sealed in it, falling a tile a beat like any other. The shield does not destroy it: a ward hits it straight back up the field, six rows, taking one plate of shell with it — and it comes down the same lane again. Three wards, and at the top of the last climb the shell bursts in mid-air and what falls out is a plain body the cannon has to finish. Holding the lane for all three is the whole cost of one.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // carom: the silhouette is the shell's and the colour is the body sealed
    // inside it, which is which cannon finishes it once the shield is done, so
    // neither can be worked out from the other.
    waveNames: true,
  },
  clasp: {
    what: "Shots bounce off it. The shield in its column, triggered, takes the shield off — and what is left is an ordinary slick or bulb that still has to be shot.",
    reach: "spawn",
    // A wave names this kind explicitly and gives it a colour, the way it
    // does for a lure: the colour is the body *inside*, and it decides what
    // the clasp becomes (`livingKindForColor`), so an entry without one would
    // be authoring a body with no answer.
    waveNames: true,
  },
} as const satisfies Record<WornId, Mechanic>;
