import type { Mounted } from "../skins/mounted.js";
import { at, disc, inside, place, sacs, turning } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * ROE — the sacs are full of eggs.
 *
 * It was `creature:slick` / `roe` on the ALTERNATIVES page, and the owner sent
 * it here on 9 September 2026 with the other three offered to that body. The
 * shipped slick had two dots in it, one per sac, in the rim colour, at a fixed
 * place — a body the pair sees on more waves than any other, drawn as a bag
 * with two full stops in it.
 *
 * This says the sacs are *carrying* something, and it says it with the one
 * thing a still cannot fake: the eggs are pinned to a surface and the surface
 * turns, so the ones at the back come round into view and the ones at the front
 * go away (`docs/dimensional.md`'s reveal).
 *
 * **A spiral rather than a ring.** A ring at one latitude folds to a line the
 * moment it goes round the back and a ring at one longitude never leaves the
 * limb — both are the shapes `surface.ts` warns about. Five eggs at the golden
 * angle climb as they go round, so there is always something near and something
 * far.
 *
 * It is the opposite answer to GUT's next door: ROE says *contents* and GUT
 * says *anatomy*, and at twenty-six pixels the two should be tellable apart
 * instantly. That is the whole reason both are on the row.
 */

/** How many eggs a sac carries, and how big each is against the sac's reach. */
const EGGS = 5;
const EGG = 0.38;
/** How fast the surface turns, in radians per second. */
const SPIN = 0.55;
/** What an egg keeps of its colour in full shadow. At 0 the far half of a sac
 * is empty, which reads as a body that has lost its contents. */
const DIM = 0.26;
/** The sac's own ball, as a share of the body's half-height. */
const REACH = 0.58;

/** Where the eggs sit, worked out once at module load: a pin is constant for
 * the life of a look, and every figure on the page shares this table. */
const LAYOUT = Array.from({ length: EGGS }, (_, i) => ({
  lon: i * 2.39,
  lat: ((i / (EGGS - 1)) * 2 - 1) * 0.82,
}));

export const ROE: Filling<"roe"> = {
  id: "roe",
  label: "ROE",
  hint: "each sac full of eggs on a turning surface — the far ones come round into view",
  build(ctx: FillingContext) {
    const g = inside(ctx, "roe");
    const reach = (ctx.extent.h / 2) * REACH;
    const clusters = sacs(ctx).map((cx, side) => {
      const marks: Mounted[] = [];
      const sac = at(cx);
      for (const q of LAYOUT) {
        // The egg's own radius is its circle of latitude's — a mark near a pole
        // is a smaller thing on the ball, and `spin` foreshortens it from
        // there. Drawing every egg the same size and letting the transform
        // shrink it is the sticker failure.
        const el = disc(reach * EGG * Math.cos(q.lat), ctx.colour, 0.55);
        sac.appendChild(el);
        marks.push(place(el, q.lon, q.lat, reach, DIM));
      }
      g.appendChild(sac);
      // Half a turn between the two, so a slick is not one cluster drawn twice.
      return { marks, offset: side === 0 ? 0 : Math.PI };
    });
    turning(ctx, SPIN, clusters);
  },
};
