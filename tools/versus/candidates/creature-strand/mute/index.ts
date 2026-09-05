import * as strandBead from "../../../../../packages/render/src/strand-bead.js";
import { patch, type Variant } from "../../../variant.js";
import { mute } from "./paint.js";

/**
 * `creature:strand` / `mute` — the reel says the bead is *unknown*, and stops
 * there.
 *
 * The slot this belongs to asks what a body of unknown colour looks like on the
 * navigator's screen. What ships now is a reel rolling between the two whole
 * bodies a bead can be — a red slick, then a cyan bulb — under a bad monitor's
 * worth of interference. MUTE is the same reel as it was first built: **six
 * swaps a second instead of 2.2, and one neutral violet for both faces.**
 *
 * The case for it is that violet is the palette's own "no colour" and this
 * field is played by saying colours out loud. A bead that is visibly red for
 * half a second is a bead somebody may call red, and the navigator holds both
 * triggers — so the shipped reel spends its whole argument on a pair being
 * disciplined enough to treat a colour they can see as noise. MUTE never asks
 * them to: nothing on the thread is ever either word, and the only thing the
 * picture says is *not yet*.
 *
 * How it loses, and it is the reason it stopped shipping. At six swaps a second
 * a face is up for a twelfth of a second, which is long enough to see that the
 * bead is changing and not long enough to see into what — five of them read as
 * a strip of noise rather than five things each of which is one of two. And a
 * violet bead says only that something is withheld, where a bead that shows a
 * slick and then a bulb says the sharper thing: it is one of *these*, and which
 * is not yours to know.
 */
export const STRAND_MUTE: Variant = {
  slot: "creature:strand",
  name: "mute",
  sentence:
    "six swaps a second and one violet for both faces — the bead says only that it is withheld",
  dir: "tools/versus/candidates/creature-strand/mute",
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
      fields: { bead: mute },
    }),
  ],
};
