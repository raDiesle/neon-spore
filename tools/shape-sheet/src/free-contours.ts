import type { CreatureSilhouette, CrystalSilhouette } from "@neon-spore/content";
import type { CatalogueEntry } from "./catalogue.js";
import { moulded, rooted } from "./forms/index.js";
import { RETIRED } from "./retired.js";
import { blob, crystal, hullArc } from "./subjects.js";

/**
 * The spare contours: a picture with no behaviour behind it.
 *
 * Split out of `catalogue.ts` when that file went past the length limit, and
 * along the seam the catalogue's own three states already name. `drafts/` has
 * been its own folder for a while and the grown bodies arrived as their own
 * files; the free contours were the last state still written inline, which
 * left one file holding both *what the catalogue is* and *most of what is in
 * it*. What stays there is the shape of an entry and what the game already
 * draws.
 *
 * Most of them are transcribed from `legacy/style-guide.html` and sampled
 * through the same radius functions the taken ones are, so a spare shape is
 * judged against the built ones on equal terms, at the same size, in the same
 * still.
 */

/**
 * Five spiky lobes with a fast, nervous shiver. Drawn in the style guide as
 * "Wespe" and never carried by anything: the marine and insect names went with
 * the setting (`docs/decisions.md` #11, #13), the contour did not. A creature
 * that takes it gets a name of its own out of the bestiary's naming rules —
 * this is a shape, not a name.
 */
const SPIKE: CreatureSilhouette = {
  lobes: 5,
  depth: 0.3,
  wobble: 0.11,
  rx: 42,
  ry: 42,
  seed: 3.0,
};

/**
 * Long, narrow and almost unlobed, with a slow slither across its whole
 * length — the style guide's "Wurm". The one drawn contour that is taller than
 * it is wide, which is why it reads as different at 26 px rather than as
 * another blob in another tint.
 */
const RIBBON: CreatureSilhouette = {
  lobes: 1,
  depth: 0.08,
  wobble: 0.09,
  rx: 26,
  ry: 72,
  seed: 4.0,
};

/** The style guide's crystal patch: a small faceted plate laid on the hull. */
const PATCH: CrystalSilhouette = {
  sides: 6,
  depth: 0.15,
  wobble: 0.02,
  seed: 7.0,
};

/** A ring of light, which is a circle: no lobes, no depth, no breathing. */
const RING: CreatureSilhouette = {
  lobes: 1,
  depth: 0,
  wobble: 0,
  rx: 34,
  ry: 34,
  seed: 0,
};

export const FREE_CONTOURS: CatalogueEntry[] = [
  ...RETIRED,
  {
    subject: blob("SPIKE", SPIKE),
    status: "free",
    slot: "creature",
    owner: "nothing — tuned for a name the setting no longer has",
  },
  {
    subject: blob("RIBBON", RIBBON),
    status: "free",
    slot: "creature",
    owner: "nothing — the one contour taller than it is wide",
  },
  {
    subject: crystal(
      "BURNING ROCK",
      { sides: 9, depth: 0.22, wobble: 0.02, seed: 8.0 },
      70,
      "9 facets · deeper than the meteor's",
    ),
    status: "free",
    slot: "creature",
    owner:
      "no creature — the live torch draws as a plain meteor, and this survives only as a spare contour",
  },
  {
    subject: hullArc(
      "RIM ARC",
      "a span of the hull's own edge, thickened where the shield sits",
      0.22,
    ),
    status: "free",
    slot: "ship",
    owner: "nothing — the shield became a lobe of the contour instead",
  },
  {
    subject: crystal("CRYSTAL PATCH", PATCH, 30, "6 facets · a plate laid on the hull"),
    status: "free",
    slot: "ship",
    owner: "nothing — one of the four shield ideas the style guide drew",
  },
  {
    subject: blob("GLOW RING", RING),
    status: "free",
    slot: "ship",
    owner: "nothing — light rather than silhouette, which is why it lost",
  },
  {
    subject: rooted("TAPROOT", "a bulb that will not come loose", 46, 40, 5, 0.7, 0.18, 6),
    status: "free",
    slot: "creature",
    owner:
      "nothing yet — a body that is held rather than falling, which no creature in the bestiary is; whatever takes it inherits the claim that it cannot be pushed off a column, and that is a rule before it is a picture",
  },
  {
    subject: moulded("MASS", "one body poured out of four, necked where they meet", 52, [
      [0, 0, 1.0],
      [-1.6, -0.6, 0.75],
      [1.5, 0.7, 0.85],
      [0.25, -1.65, 0.62],
    ]),
    status: "free",
    slot: "creature",
    owner:
      "nothing — the only contour here that is not star-shaped about its own centre, which is the one thing a radius-per-angle sample can never be; drawn large on purpose, as the single body that fills a field rather than one of a wave of them",
  },
];
