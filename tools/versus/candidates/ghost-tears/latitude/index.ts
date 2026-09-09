import * as ghostLook from "../../../../../packages/render/src/ghost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { latitude } from "./paint.js";

/**
 * `ghost:tears` / `latitude` — the camouflage comes apart on a body that is
 * turning, instead of on a flat plane.
 *
 * **What the shipped side is.** `slabs` hands back seven horizontal bands with
 * a `shift`, and each is filled as a rectangle straight across the body at
 * `-GHOST.rx + shift * GHOST.rx`. Every mark on this creature is therefore
 * decided by how far *down the picture* it is — which is the exact failure
 * `docs/style-guide.md`'s Depth section names: a silhouette may be posed, and
 * anything on a surface is placed. A ghost's whole subject is a surface coming
 * apart, and it comes apart on a plane.
 *
 * **What this argues.** The bands are strips of *latitude* on a body that
 * turns. A band's throw is a longitude rather than a slide, so a badly torn one
 * goes past the limb and comes back at the other side; the patch is
 * foreshortened by the tangent plane's own map, so it is a sliver at the edge
 * and full width facing us; and the pieces that have gone round the back are
 * **drawn**, dim, rather than clipped away — which is the one cue
 * `docs/dimensional.md` calls a difference in kind rather than of degree.
 *
 * `slabs` is called and not rewritten: how many bands there are, where each
 * one sits and how far its temper has thrown it are three rules the shipped
 * look owns, and this argues about one thing only — what a `shift` means.
 *
 * **The turn is not read off the temper, and that is deliberate.** `ghostRage`
 * already drives how far a band is thrown. A turn taken off the same number
 * would be one input dressed as two cues, and the pair would watch a single
 * thing get worse while believing they were reading two. So the body turns on
 * a slow clock of its own, at the same rate calm or furious, and what the
 * temper changes is how far round the camouflage has slipped — which is what
 * the temper changes today. **The pair is being asked about the placement, not
 * about the temper.**
 *
 * **How it can lose, and the pair should watch for exactly this.** *A column
 * gets harder to read.* Player 2 has under a second to name which lane this
 * body is in, and it is the only seat that can see it at all; a camouflage
 * whose brightest patch wanders from side to side puts the visual weight
 * somewhere other than the middle of the body, and a column called off the
 * bright part is a column called wrong. The shipped bands are full-width and
 * centred for that reason, whether or not anybody wrote it down. If the pair
 * find themselves checking the outline to confirm a lane they had already read
 * off the tears, this look has cost them the second it was meant to be worth.
 */
export const GHOST_LATITUDE: Variant = {
  slot: "ghost:tears",
  name: "latitude",
  sentence:
    "the tears are strips of latitude on a turning body — a badly thrown one goes round the limb and comes back at the other side, and the pieces over the far side are drawn dim rather than clipped away",
  dir: "tools/versus/candidates/ghost-tears/latitude",
  patches: [
    patch({
      target: ghostLook.GHOST_LOOK,
      // No accessor: `ghost.ts` reads the export itself, once per body per
      // frame. The module namespace is the whole route there is.
      reached: () => ghostLook.GHOST_LOOK,
      where: {
        file: "packages/render/src/ghost-look.ts",
        symbol: "GHOST_LOOK",
        type: "GhostLook",
      },
      fields: { tears: latitude },
    }),
  ],
};
