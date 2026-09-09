import * as ghostLook from "../../../../../packages/render/src/ghost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { slide } from "./paint.js";

/**
 * `ghost:tears` / `slide` — the bands turn under the body, instead of the body
 * turning under its bands.
 *
 * **What the shipped side is.** `slabs` hands back seven horizontal bands with
 * a `shift`, and each is filled as a rectangle straight across the body at
 * `-GHOST.rx + shift * GHOST.rx`. Every mark on this creature is therefore
 * decided by how far *down the picture* it is, which is the exact failure
 * `docs/style-guide.md`'s Depth section names: a silhouette may be posed, and
 * anything on a surface is placed.
 *
 * **What this argues, against LATITUDE standing beside it.** Both candidates
 * agree that a `shift` should be a longitude rather than a slide, and disagree
 * about what is turning. LATITUDE turns the whole body on a slow clock of its
 * own: a band goes past the limb and comes back at the other side, and the
 * pieces round the back are drawn dim rather than clipped away. SLIDE turns
 * nothing. `theta` is nought at every frame, the body stands exactly still, and
 * what a band's throw moves is only **where along its own strip it is catching
 * the light** — the patch crawls out toward the limb and dies there, the way a
 * mark on a surface does, and the strip it is crawling along stays across the
 * whole body from one rim to the other.
 *
 * **The reason it can win a fight LATITUDE cannot.** LATITUDE's own card names
 * the risk and this is the answer to it. Player 2 has under a second to say
 * which lane this body is in, and is the only seat that can see it at all; a
 * camouflage whose brightest patch wanders from side to side puts the visual
 * weight somewhere other than the middle of the body, and a column called off
 * the bright part is a column called wrong. Here the *mass* never moves —
 * every band is present across the full width at every moment, at rest and
 * furious alike — so the thing the eye weighs is centred whatever the temper is
 * doing, and only the highlight travels. That is the whole conservative bet:
 * the surface cue is bought, and the one thing it was risking is not spent.
 *
 * It is also the honest picture of what this creature *is*. A ghost is not a
 * body rotating; it is a body whose camouflage is failing, and a failure that
 * slides across a stationary shape is a nearer description of that than a shape
 * that has begun to spin. LATITUDE has to introduce a turn that nothing in the
 * simulation knows about, on a clock invented for the look; this introduces
 * nothing — the whole picture is `shift`, which the game already computes,
 * read through the projection.
 *
 * **The turn is not read off the temper in either candidate, and here there is
 * no turn to read.** `ghostRage` drives how far a band is thrown and that is
 * the only input, so the pair are looking at one thing getting worse and
 * cannot mistake it for two.
 *
 * **How it can lose, and the pair should watch for exactly this.** *It may read
 * as a wash rather than as a tear.* The shipped look is violent — hard-edged
 * slabs displaced against each other, and the violence is what says this body
 * is broken. A strip that is present everywhere with a bright place on it is a
 * gentler picture, and gentler may simply be *wrong* for a creature whose whole
 * job is to look like a signal coming apart. If the ghost stops reading as
 * torn and starts reading as shimmering, that is this look, and turning the
 * patch up will not fix it — the tearing is in the hard edge, which this
 * candidate spends on purpose. The second thing to watch is cost: seven
 * gradients a frame where the shipped look draws seven rectangles, on a body
 * that can be on the field more than once.
 */
export const GHOST_SLIDE: Variant = {
  slot: "ghost:tears",
  name: "slide",
  sentence:
    "the body never turns and the bands never leave the middle — each tear is a full-width strip with one lit patch crawling along it toward the limb, so the weight the pair reads a lane off stays put",
  dir: "tools/versus/candidates/ghost-tears/slide",
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
      fields: { tears: slide },
    }),
  ],
};
