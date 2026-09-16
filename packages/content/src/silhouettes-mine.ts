import { walkedSilhouette } from "./body-form.js";
import type { CreatureSilhouette } from "./silhouettes.js";
import { studdedContour } from "./studded.js";

/**
 * **THE MINE is REACHER**, off the shape sheet: *four soft arms, each feeling
 * into a neighbour* (`tools/shape-sheet/src/drafts/mine.ts`). Four things
 * standing off a round body, one pointing into each of the four tiles a tap
 * must not land on — and nothing pointing at the diagonals, which are safe.
 * The rule is the picture, which is why the seeing seat is given no marks on
 * the field: the body says where the danger is, and anything drawn round it
 * would say it twice.
 *
 * **CALTROP was the shape the owner picked on 15 September 2026, and it was
 * already spent.** The draft sheet lent it to THE LEECH the day that creature
 * landed (`silhouettes-cling.ts`), and THE LEECH is on the field in act 7a, so
 * taking it back would have been two creatures with one word. REACHER is the
 * same half of the rule said the other way, by the draft's own note, and it is
 * on the same sheet for the same body. What it loses is the needle: four
 * blunt arms are not a thing that stabs, and a mine does not stab — it goes
 * off.
 *
 * **What separates it from THE LEECH is the size, and that is measured rather
 * than argued.** The two were written apart on the rim — the leech is four
 * *needles*, thin and pointed and driven in, and this is four *arms*, half as
 * long, three times as wide and rounded over — and `nameability.ts` says that
 * is not enough: both are round, both draw four things round the form, and at
 * the fixed footprint every living body gets the two drawn sizes overlapped
 * outright. One axis of the three is all it takes, so this one is drawn a
 * quarter larger and they no longer meet on any of them.
 *
 * `sizeMul` rather than a bigger `rx`, because the footprint is normalised by
 * the silhouette's own radius and a bigger `rx` would have changed nothing at
 * all — THE THROB's field, for its reason (`silhouettes-clubbed.ts`). And it
 * is the honest number as well as the working one: a leech is clamped to the
 * cannon's swelling and is drawn against it, while a mine stands alone on a
 * tile that has to be named out loud, so the one that has to be *found* is
 * the one drawn bigger.
 */

/** The body under the arms: eight faint lobes, so the four arms are the word
 * and not the lobing. LEECH's base at a different seed. */
const MINE_BASE = { lobes: 8, depth: 0.06, wobble: 0.02, seed: 3.1 };

/** A quarter larger than the body every other living kind is drawn at — the
 * one axis that tells this apart from THE LEECH, and the header says why it is
 * here rather than in `rx`. */
const MINE_SIZE = 1.25;

// The record's `lobes` is what an eye counts round the form (`rimCount`), and
// round this one an eye counts four arms — LEECH's arrangement exactly, one
// file over, for the same reason.
export const MINE: CreatureSilhouette = walkedSilhouette(
  { ...MINE_BASE, lobes: 4, sizeMul: MINE_SIZE },
  studdedContour({
    rx: 27,
    ry: 27,
    studs: 4,
    // Half CALTROP's reach and two and a half times its width, blunted almost
    // over: an arm rather than a needle, and short enough that the body under
    // it is still most of what an eye sees at a tile's width.
    reach: 0.48,
    width: 0.5,
    blunt: 0.85,
    lobes: MINE_BASE.lobes,
    depth: MINE_BASE.depth,
    seed: MINE_BASE.seed,
  }),
);
