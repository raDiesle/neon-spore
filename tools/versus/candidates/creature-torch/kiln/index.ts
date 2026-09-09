import * as torchLook from "../../../../../packages/render/src/torch-look.js";
import { patch, type Variant } from "../../../variant.js";
import { kiln } from "./paint.js";

/**
 * `creature:torch` / `kiln` — the fire is on the rock rather than around it,
 * and it rolls, so half of it is behind the stone at any instant.
 *
 * A torch is the fastest thing in the field and it is a *dead* rock: the flame
 * it is named for is gone, and what is left of it is one faint ring stroked
 * just outside the outline at 0.4 alpha. That ring is honest about the rule and
 * it is also the flattest mark in the game — a circle, drawn once, in front of
 * everything, at the same brightness the whole way round. Nothing about it can
 * tell a player which side of the rock is nearer.
 *
 * KILN puts fourteen embers on the stone's own skin, at fixed longitudes and
 * latitudes, and turns them about its vertical axis once every four and a half
 * seconds. Each is a tongue drawn about its own origin and foreshortened by the
 * tangent plane's map, so one crossing the face is wide and fast and one near
 * the limb is a thin vertical sliver crawling — the 22.9 : 1 ratio
 * `docs/dimensional.md` measures, against the 1.10 : 1 an affine pose manages.
 *
 * **And the rock hides half of them.** The far pass is drawn *before* the
 * stone, which is why the seam it patches hands the stone back as a field of
 * the draw rather than painting it first: an ember goes out of sight at one
 * limb and comes back at the other, and that occlusion is the one cue that is a
 * difference in kind rather than of degree. The stone is not repainted, not
 * moved and not re-shaded — the shipped hand draws it, in the middle of this
 * candidate's own three passes.
 *
 * **It costs no baked canvas and no allocation per ember**: fourteen pins are
 * built once at module scope, and a frame is one `facet` call and one ellipse
 * each, of which about half are drawn. The flicker is a sine of the frame clock
 * and the id, so it is deterministic and two phones draw one fire.
 *
 * How it can lose, and it is a specific thing to watch for at 26 px. **A rock
 * should not sparkle.** The torch is the body the pair has the least time to
 * read — it covers two columns and arrives before the sentence about it is
 * finished — and the shipped ring's whole virtue is that it says *rock,
 * burning, two wide* in one glance with no moving parts. Fourteen travelling
 * marks on the fastest thing in the field could easily read as glitter, or
 * worse, as damage: the craters a shot opens are also small dark marks on this
 * body, and a fire that competes with them makes the one readout this rock
 * carries harder to count. If the pair cannot tell an ember from a crater at
 * tempo, the answer is the shipped ring.
 */
export const TORCH_KILN: Variant = {
  slot: "creature:torch",
  name: "kiln",
  sentence:
    "fourteen embers on the stone's own skin instead of one ring around its outline — they roll with the rock, cross the face fast and crawl at the edge, and the far half is hidden behind it",
  dir: "tools/versus/candidates/creature-torch/kiln",
  patches: [
    patch({
      target: torchLook.TORCH_LOOK,
      // No accessor: `drawTorchRock` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => torchLook.TORCH_LOOK,
      where: {
        file: "packages/render/src/torch-look.ts",
        symbol: "TORCH_LOOK",
        type: "TorchLook",
      },
      fields: { flame: kiln },
    }),
  ],
};
