import type { CatalogueEntry } from "../catalogue.js";
import { LURCH } from "../motions.js";
import { cable, claw } from "./machined.js";

/**
 * The two boss bodies the sheet could not draw.
 *
 * Twelve rounds are designed and none of them had a picture, and the first
 * thing drawing them says is that most of them do not need one:
 * `docs/spec/interludes.md` fixes the material as **slabs and glyphs, never
 * blobs**, and `slab` and `glyphed` are already in the catalogue. THE VAULT is
 * a grid of slabs. THE ACCORD is two dials, which is BEARING RING twice. THE
 * LATHE is the blob vocabulary itself, drawn on purpose. THE GAUGE is built.
 * Those are answered, and a card for each would have been four more pictures
 * of things the page already holds.
 *
 * Two are not answered, and both fail for the same reason: the sheet knows how
 * to draw a body and a sweep, and neither of these is either. A claw is
 * machinery with a grip — an outline that closes on something, which nothing in
 * the catalogue does. A cable is a line that crosses itself, which no arm here
 * does, because every arm hangs from a pivot and sweeps in one direction.
 *
 * A third — THE BELT — was drawn and thrown away, and the reason is in
 * `docs/asset-catalogue.md` where it is more use than a card would have been.
 */
export const ROUND_DRAFTS: CatalogueEntry[] = [
  {
    subject: claw("THE CLAW", "two fingers under a shaft, opening and shutting", {
      stem: 52,
      bar: 12,
      reach: 62,
      period: 4.2,
    }),
    motion: LURCH,
    status: "draft",
    slot: "field",
    suggests: "THE CLAW",
    owner:
      "the strongest argument that a round like this is cheap, and it needed one shape nobody had drawn: a thing that grips. The pilot slides it along a rail with the cannon's exact verb, so the motion is a travel with a destination and the gape is in the contour — an own-motion can move a body about and cannot close a hand. What it must not be read as is THE MOTHER, which is also arms around an opening: hers is a hole with the field showing through the middle of a body, and this has no inside at all below the shaft",
  },
  {
    subject: cable("THE SPLICE", "one strand, two free ends, and a crossing in between", {
      height: 120,
      width: 34,
      writhe: 0.18,
      period: 9,
    }),
    status: "draft",
    slot: "field",
    suggests: "THE SPLICE",
    owner:
      "the round only exists while the tangle cannot be followed by eye, so the crossing is the mechanic and not the decoration: the strand doubles back on its own descent, which is the difference between a line that wanders and one that is tangled. Both ends are on the axis, top and bottom, because the navigator sees where a strand enters and the pilot where it leaves and the card has to hold both. It must not be read as THE NEEDLE or LIGHT TRACE — those hang from a pivot and sweep one way, and neither ever crosses itself. The only card here with no own-motion offered: SLITHER is a wave running the length of a body and the tangle already shifts along its own, so the two would be the same sentence said twice",
  },
];
