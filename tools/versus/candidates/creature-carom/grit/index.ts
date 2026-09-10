import * as caromLook from "../../../../../packages/render/src/carom-look.js";
import { patch, type Variant } from "../../../variant.js";
import { chips, walled } from "./paint.js";

/**
 * `creature:carom` / `grit` — only a solid sheds pieces, so this one sheds; and
 * the window is set into a thickness rather than painted on a face.
 *
 * **What the shipped side is.** A crystal with a circle left unpainted in it,
 * a bright bezel drawn round the circle, and a coloured wedge behind. The bezel
 * is a *ring on the surface*: it says where the hole is and nothing about how
 * deep the rock round it goes, so the porthole reads as a decal on a
 * silhouette. And a gradient wedge is the same wedge whether the thing making
 * it is a stone or a shadow.
 *
 * **What this argues.** Two things a solid does that a picture cannot. The
 * opening gets a **wall** — the dark the rock's own thickness throws into the
 * upper inside of its hole, and the lit lip round the lower outside — so the
 * glass is three-quarters of a rock down rather than flush. And the streak
 * becomes **chips**: twelve flecks placed on the stone by longitude and
 * latitude, each released only while its own facet is turned into the heading,
 * thrown backwards along the crossing at its own rate and dimming as it goes.
 * Each fleck takes the light of the facet it came off, so the stream is
 * brighter on the lit shoulder, and it is rock-coloured rather than the body's,
 * because what is coming away is the crust.
 *
 * **How it can lose.** *A carom is not being damaged.* Shedding says
 * *disintegrating*, and this creature is intact until a shot opens it — a pair
 * that reads the grit as *this one is already breaking* will stop firing at it,
 * which is a mechanical cost and not an aesthetic one. And twelve moving flecks
 * in a lane that already carries a body, a bezel and a hatch may simply be
 * dirt on the screen.
 */
export const CAROM_GRIT: Variant = {
  slot: "creature:carom",
  name: "grit",
  sentence:
    "a rock thick enough to shed — the window set into a wall of it, dark round the inside of its upper rim and lit round the outside of its lower one, trailing twelve chips struck off whichever facets are turned into the heading",
  dir: "tools/versus/candidates/creature-carom/grit",
  patches: [
    patch({
      target: caromLook.CAROM_LOOK,
      // No accessor: `carom.ts` reads the export itself, twice per body.
      reached: () => caromLook.CAROM_LOOK,
      where: {
        file: "packages/render/src/carom-look.ts",
        symbol: "CAROM_LOOK",
        type: "CaromLook",
      },
      fields: { shell: walled, travel: chips },
    }),
  ],
};
