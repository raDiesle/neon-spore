import * as queenLook from "../../../../../packages/render/src/queen-look.js";
import { patch, type Variant } from "../../../variant.js";
import { scutes } from "./paint.js";

/**
 * `creature:queen` / `scutes` — the shell is seven plates lapped from the
 * wings in, each a ridge with a near side and an edge that throws a shadow.
 *
 * **What the shipped side is.** One linear gradient from her upper-left
 * corner to her lower-right, glued to her own frame, and the rock's outline
 * round it. It is one surface with no edge on it anywhere but the contour,
 * and an edge is where thickness shows: a body with no edges inside its
 * outline has no thickness to show.
 *
 * **What this argues.** That armour is *plates*, and plates lap. Seven bands
 * are cut from her own contour between six seams bowed in toward her middle,
 * and each is filled as a rounded ridge — the shipped key ramp read across
 * the plate's own width, bright on the edge nearer the light and dark on the
 * far one. From the wings in, each plate slides under the next: the lapping
 * edge throws a soft shadow onto the plate beneath it, and wears a bevel —
 * bright on the left wing, where the edge faces the key, dark on the right
 * where it faces away. The shipped light goes over all of them, so she is
 * one body and not seven slats. Then they move: the seams breathe apart and
 * back on a six-second clock, and a tilt runs across the plates from wing to
 * wing, so the shadow each edge throws widens and narrows against its
 * neighbour. The contour, the marks, the eggs and the petals are untouched.
 *
 * **How it can lose.** *It is a venetian blind.* Seven vertical bands on a
 * body three times wider than it is tall are a pattern before they are
 * armour, and if the seams read as stripes at the pair the bow and the lap
 * have not done their work. The other loss is under her: the marks hang out
 * of her underside, and a seam landing on a mark is a line the pair could
 * mistake for a tell.
 */
export const QUEEN_SCUTES: Variant = {
  slot: "creature:queen",
  name: "scutes",
  sentence:
    "the shell as seven plates lapped from the wings in — each cut from her own contour and filled as a ridge under the key, the lapping edges throwing shadows and wearing bevels, breathing apart and back with a tilt running wing to wing",
  dir: "tools/versus/candidates/creature-queen/scutes",
  patches: [
    patch({
      target: queenLook.QUEEN_LOOK,
      // No accessor: `queen.ts` reads the export itself, once per frame. The
      // module namespace is the whole route there is.
      reached: () => queenLook.QUEEN_LOOK,
      where: {
        file: "packages/render/src/queen-look.ts",
        symbol: "QUEEN_LOOK",
        type: "QueenLook",
      },
      fields: { shell: scutes },
    }),
  ],
};
