import type { SimEvent } from "@neon-spore/sim";
import type { Burst } from "./effects-spark.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The bursts for a covering coming off a body that is still there — plating,
 * a shield, a dome, a crust, a join, a shell of plates — cut out of `burstFor`
 * when that file reached its limit for the second time, along the seam its
 * own comments read on: every colour here is argued against the others in
 * this list, the shell's against the shield's against the rock's, and the
 * argument is one page when the eight are in one place.
 *
 * The same table and the same rule as `effects-spark-handed.ts` — a burst is
 * a request, scaled with what it cost — and `burstFor`'s exhaustive switch
 * still names every case here, so an event added to one of these bodies and
 * forgotten in both is a type error there rather than a silence. `at` is that
 * file's, copied rather than imported so the two do not reach for each other
 * at load.
 */
export function wornBurst(
  e: Extract<
    SimEvent,
    {
      type:
        | "shellBreak"
        | "shellBare"
        | "claspBreak"
        | "coilBreak"
        | "caromCrack"
        | "crystalSplit"
        | "volleyReturn"
        | "volleyHatch";
    }
  >,
  l: Layout,
): Burst {
  switch (e.type) {
    // A piece coming off THE SHELL: an ordinary burst in the armour's own
    // material colour. The raw edge it leaves behind is not drawn here —
    // that outlives the burst and is redrawn fresh every frame straight off
    // `Creature.shell`, in `shell-draw.ts`, which needs no state of its own.
    case "shellBreak":
      return at(l, e.col, e.row, 8, PALETTE.ember);
    // The last piece: the body's colour exists from this event onward and
    // never before it (`shell-round.ts`'s `bareTheCore`) — the biggest burst
    // this file throws for anything short of a boss going down, because this
    // is the one moment the pair has no way to have seen coming.
    case "shellBare":
      return at(l, e.col, e.row, 20, e.color === "red" ? PALETTE.red : PALETTE.cyan);
    // A clasp opened by the ward. The shield came apart, so the burst is the
    // shield's own colour and not the body's — the body did not break, it was
    // uncovered, and it is standing there in its colour a frame later for
    // anyone who needs reminding which trigger to load. Sized between a
    // shell piece and a bare core: bigger than chipping something, smaller
    // than the reveal `shellBare` is, because nothing was revealed here that
    // was not already visible through the shield the whole way down.
    case "claspBreak":
      return at(l, e.col, e.row, 14, PALETTE.claspShield);

    // THE COIL's dome, and `claspBreak`'s burst word for word: it is the same
    // shell coming off, so it is the same colour and the same size, whichever
    // of the two opened it. Nothing was revealed — a rock was visible through
    // the dome the whole way across — and the lane has not closed either,
    // which is why this is deliberately not a `destroy`'s worth of anything.
    case "coilBreak":
      return at(l, e.col, e.row, 14, PALETTE.claspShield);

    // A carom's crust coming apart, in the **rock's** colour and not the
    // body's — `recoilBounce`'s argument from the other side. The body is
    // gone and the picture must not say the *column* is: a rock still stands
    // in the lane and somebody has to ward it. So the particles are the
    // shell's, as many as a `shellBare` gets — a covering coming off. And THE
    // CRYSTAL's join breaking: the same shell's colour, on the middle tile.
    case "caromCrack":
    case "crystalSplit":
      return at(l, e.col, e.row, 20, PALETTE.rock);

    // A plate off THE VOLLEY, in the **shield's** colour rather than the
    // shell's — `caromCrack`'s argument from the third side: the shell is off
    // and the lane has not closed, and the one thing worth saying is which
    // control did the work. So the sparks are the dome's, thrown where the
    // body met it — a few, because the shell's own material is real pieces
    // now (`volley-shards.ts`) and squares over fragments is two effects.
    case "volleyReturn":
      return at(l, e.col, e.row, 6, PALETTE.shieldRim);

    // And the shell itself, coming apart in mid-air: a handful of the rock's
    // colour under the fragments `volley-shards.ts` throws. Not the ordinary
    // colours: nothing died, and a red or cyan shower is what this game pays
    // for a lane closing.
    case "volleyHatch":
      return at(l, e.col, e.row, 6, PALETTE.rock);
  }
}

function at(l: Layout, col: number, row: number, n: number, hex: string): Burst {
  return { x: tileCX(l, col), y: tileCY(l, row), n, hex };
}
