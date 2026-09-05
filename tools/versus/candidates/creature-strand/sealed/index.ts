import * as strandBead from "../../../../../packages/render/src/strand-bead.js";
import { patch, type Variant } from "../../../variant.js";
import { sealed } from "./paint.js";

/**
 * `creature:strand` / `sealed` — the bead is a container, not a reel.
 *
 * The question this slot asks is what a body of **unknown colour** looks like.
 * The navigator sees every live bead on a thread and may not be told which of
 * the two ammunition colours it carries, so it cannot be drawn as the body it
 * really is: a slick is flat and wide and a bulb is round with nine lobes, and
 * the silhouette alone names the colour to anybody who has played one wave.
 *
 * The shipped answer is a **reel**: the bead rolls between the slick and the
 * bulb without ever settling, under a bad monitor's worth of interference, so
 * the picture says the true thing — it is one of these two and you do not know
 * which. It teaches the pair no new shape at all.
 *
 * SEALED is the answer it replaced, and the argument for it is that it is
 * *still*. A thread of five reels is five bodies flickering at six swaps a
 * second on a phone held at arm's length, next to a field of things the pair is
 * counting; a thread of five sealed beads is five calm objects with lids on,
 * and the eye can run along it without anything moving. If a reel turns out to
 * be a strip of noise where a chain should be, this is what the chain looks
 * like.
 *
 * How it can lose. A sealed bead is a **third shape** on a roster whose whole
 * discipline is that a shape means one spoken word — the pair learns slick and
 * bulb, and this asks them to learn a body that is neither and is only ever on
 * one screen. And it says nothing about *why* it is sealed: a reel tells the
 * navigator it could be either, and a lid only tells them they cannot see.
 */
export const STRAND_SEALED: Variant = {
  slot: "creature:strand",
  name: "sealed",
  sentence:
    "a smooth ovoid with a wet socket in it — the bead is a container with a lid on, and it holds still",
  dir: "tools/versus/candidates/creature-strand/sealed",
  patches: [
    patch({
      target: strandBead.STRAND_LOOK,
      // No accessor: `creature-body.ts` reads the export itself on every frame,
      // which is why it is a record at all. The module namespace is the whole
      // route there is.
      reached: () => strandBead.STRAND_LOOK,
      where: {
        file: "packages/render/src/strand-bead.ts",
        symbol: "STRAND_LOOK",
        type: "StrandLook",
      },
      fields: { bead: sealed },
    }),
  ],
};
