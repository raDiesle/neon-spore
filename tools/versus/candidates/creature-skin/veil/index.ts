import * as livingSkin from "../../../../../packages/render/src/living-skin.js";
import { patch, type Variant } from "../../../variant.js";
import { veil } from "./paint.js";

/**
 * `creature:skin` / `veil` — the body stays a hole, and the membrane around it
 * is what has thickness.
 *
 * This is the other answer in the slot, and it is deliberately the opposite
 * argument to the one the game now draws. The owner took `lit` into the game
 * on 8 September 2026 (`packages/render/src/living-skin.ts`), so the left-hand
 * side of this pair is no longer a hole with a neon line round it — it is
 * flesh under a key light. That does not settle this candidate; it sharpens
 * it. LIT says a creature should be a solid under a light and fills it with
 * flesh to get one. VEIL says the near-background deep was
 * *right* — it is where the neon reads from, it is what `hazed` spends
 * distance against, and it is why eleven columns of bodies do not turn the
 * field into a lamp — and that what is missing is not a filled middle but a
 * membrane with a wall.
 *
 * So the fill is untouched and the rim is given depth instead: the body's own
 * colour bleeding inward from the contour, brightest at the edge, gone by
 * about two fifths of the way in. And the band's **centre is pushed toward
 * `KEY`**, which is the whole three-dimensional claim in one number — the wall
 * reads thin where the surface faces the light and thick where it turns away,
 * which is what a rounded translucent shell actually does. The rotation the
 * transform carries is undone first, so a throb turning and a dart leaning
 * move under a light that stays where it is.
 *
 * It is the *glass and nacre* row of `docs/style-guide.md`'s material table
 * where the shipped skin is the membrane row, and the two are a real choice
 * rather
 * than a strength setting: one adds mass, the other adds a wall, and they
 * cannot both be right about what a spore is.
 *
 * How it can lose. **A rim that bleeds inward is a wider, softer rim**, and
 * the outer `strokeGlow` is already three passes of the same colour — the two
 * may add up to a body wearing a halo rather than a body with a wall, which
 * is the shape of every complaint about glow in this repo. And it says
 * *hollow*, on a roster where hollow already means something: the wisp is the
 * one body only one player can see, and its whole picture is a thing that is
 * not quite there. A material that makes every body slightly ghostly spends
 * that.
 */
export const SKIN_VEIL: Variant = {
  slot: "creature:skin",
  name: "veil",
  sentence:
    "the deep stays, and the membrane gets a wall — the body's colour bleeding inward from the contour, thin toward the light and thick away from it",
  dir: "tools/versus/candidates/creature-skin/veil",
  patches: [
    patch({
      target: livingSkin.LIVING_SKIN,
      reached: () => livingSkin.LIVING_SKIN,
      where: {
        file: "packages/render/src/living-skin.ts",
        symbol: "LIVING_SKIN",
        type: "LivingSkin",
      },
      fields: { paint: veil },
    }),
  ],
};
