import * as wardenLook from "../../../../../packages/render/src/warden-look.js";
import { patch, type Variant } from "../../../variant.js";
import { bevel } from "./paint.js";

/**
 * `warden:plates` / `bevel` — the boss's armour is a ring of slabs with a
 * thickness and a lit edge, instead of a ring of strokes.
 *
 * The plates are the only health bar in this game. One comes off per opened
 * eye, the gap never fills, and the pair reads how far in they are off the
 * silhouette without a number anywhere on the screen — which makes this the
 * most load-bearing decoration on the field and, today, the plainest: a single
 * arc stroked in `PALETTE.rock` at a couple of pixels, at one brightness the
 * whole way round, on the biggest body the game ever draws.
 *
 * The depth direction says the big bodies are where this is cheap and safe, and
 * the warden is the biggest of them. BEVEL gives each plate an inside and an
 * outside, stands it a hair off the rim so the wall it stands on is visible,
 * shades its face by its own normal against the fixed key, runs a specular
 * along the outer edge only where the light actually reaches, and lays a
 * contact seam where it meets the body — the five zones of
 * `docs/style-guide.md` less the cast shadow, which nothing in this game has.
 *
 * **The ring does not turn and must not.** Where a plate is follows from its
 * index (`plateStart`), which is what makes a gap stay where it was opened
 * across a restart and on both phones — so this candidate calls the shipped
 * placement rather than writing one, and the only motion it adds is a breath of
 * eight thousandths of a radius, on a phase of its own per plate. That is a
 * deliberate half of the rule rather than an oversight: `docs/dimensional.md`
 * says a lit body that does not move is a still life, and this one answers that
 * it is a machine bolted to a boss and is *supposed* to be. Whether that is
 * enough at 26 px is exactly what the pair is being asked.
 *
 * How it can lose, and there are two ways. **The count is the picture.** Nine
 * shaded slabs are visually busier than nine strokes, and if a dark plate on
 * the shadow side reads as a plate already gone, this candidate has broken the
 * one thing the ring is for — that is a defect and not a taste, and it is worth
 * counting the plates out loud at the pair before voting on anything else. The
 * second is the opening: the armour is cut where the shot comes up, and a slab
 * with a wall and a seam has three edges near that cut where the shipped stroke
 * had one. If the way in stops looking open, the answer is the shipped ring.
 */
export const WARDEN_BEVEL: Variant = {
  slot: "warden:plates",
  name: "bevel",
  sentence:
    "each plate is a slab with a wall, a shaded face, a lit outer edge and a contact seam, standing a hair off the rim — where the shipped ring is one stroked arc at one brightness the whole way round",
  dir: "tools/versus/candidates/warden-plates/bevel",
  patches: [
    patch({
      target: wardenLook.WARDEN_LOOK,
      // No accessor: `drawWarden` reads the export itself. The module namespace
      // is the whole route there is.
      reached: () => wardenLook.WARDEN_LOOK,
      where: {
        file: "packages/render/src/warden-look.ts",
        symbol: "WARDEN_LOOK",
        type: "WardenLook",
      },
      fields: { plates: bevel },
    }),
  ],
};
