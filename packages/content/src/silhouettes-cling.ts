import { walkedSilhouette } from "./body-form.js";
import type { CreatureSilhouette } from "./silhouettes.js";
import { studdedContour } from "./studded.js";

/**
 * **THE LIMPET and THE LEECH, off the shape sheet.**
 *
 * **THE LIMPET is HOOK COLONY's body**, one of the grown bodies in
 * `tools/shape-sheet/src/grown-bodies.ts`: *a rim of hooklets + one welt* on
 * a round three-lobed base, rx 33 by ry 33, depth 0.1. The sheet's own note
 * on it is that *every hook turned the same way, so the whole body reads as
 * travelling* — and a body whose whole picture is that it holds on is what
 * that rim was waiting for. The base is here; the nine hooklets are drawn
 * in render in the game's vocabulary (`render/cling.ts`), THE WARDEN's
 * arrangement for CILIATE (`warden-skin.ts`): the parts of a grown body are
 * a picture, not a contour.
 *
 * **THE LEECH is CALTROP**, a draft in `tools/shape-sheet/src/drafts/mine.ts`:
 * *four needles, one at each tile that hurts*, the studded rim at four
 * studs, reach 0.95, width 0.2, no blunting, on an eight-lobed base barely
 * lobed at all. Four needles standing off a round body is a thing that is
 * *driven in*, which is what it does to the cannon's swelling, and it is the
 * rind's rim at the rind's other extreme — the rind wears many blunt knobs
 * (`render/rind-burr.ts`), this four points — so at 26 px the two are two
 * words. The draft's numbers whole, through `studdedContour` and
 * `walkedSilhouette`, the route THE GUM's sac takes for TENDRIL.
 *
 * Neither has a colour: nothing fired reaches either. Their material is the
 * malfunction's arc-blue (`render/palette.ts`), because that is what they
 * are — a thing that has a control of the ship's.
 */

export const LIMPET: CreatureSilhouette = {
  lobes: 3,
  depth: 0.1,
  wobble: 0.02,
  rx: 33,
  ry: 33,
  seed: 5.6,
};

/** CALTROP's base, before the rim: barely lobed, so the needles are the word. */
const LEECH_BASE = { lobes: 8, depth: 0.06, wobble: 0.02, seed: 4.4 };

// The record's `lobes` is what an eye counts round the form (`rimCount`),
// and round this form an eye counts the four needles, not the eight faint
// lobes of the core under them — THE THROB's clubs, in the walked form.
export const LEECH: CreatureSilhouette = walkedSilhouette(
  { ...LEECH_BASE, lobes: 4 },
  studdedContour({
    rx: 34,
    ry: 34,
    studs: 4,
    reach: 0.95,
    width: 0.2,
    blunt: 0,
    lobes: LEECH_BASE.lobes,
    depth: LEECH_BASE.depth,
    seed: LEECH_BASE.seed,
  }),
);
