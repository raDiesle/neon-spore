import { livingSilhouette } from "../../../../../packages/content/src/index.js";
import { BULB } from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:bulb` / `six` — six lobes deep enough to be lobes, instead of nine
 * shallow enough to be a texture.
 *
 * Nine lobes at `depth` 0.13 on a 52 × 52 body is a rim that moves by about
 * seven pixels at the size a bulb is actually drawn. At that amplitude the
 * count is not something an eye reads, it is something a rim *has*: the body
 * comes out as a circle with a serration on it, and the word the pair reaches
 * for is "the round one" rather than "the bulb".
 *
 * SIX makes the same claim loudly. Six lobes at 0.24 is the same round body
 * with a rim that scallops far enough to be counted, and it is the shape a
 * *spore* has — which is the game's own word for what these things are. It is
 * also the direction `docs/versus.md` guessed at in its worked example and
 * nobody has ever put in front of an eye; this is that, actually offered.
 *
 * **Six is free and the whole roster is why.** Slick has 2, choir and dart
 * have 3, wisp 5, throb 3 under its clubs and bulb 9 — so lobe count, the one
 * axis `nameability.ts` measures, has a gap at 6 and this lands in it without
 * touching a neighbour. The body stays perfectly round at 52 × 52, because
 * roundness is what separates it from the slick, and it stays the size every
 * living kind draws at.
 *
 * How it can lose, and both ways are about the same number from opposite
 * sides. **0.24 may be a flower rather than a body** — six deep scallops on a
 * circle is a shape with soft corners in it, and `docs/alive.md` is clear that
 * corners belong to the dead things; the wisp went from four deep lobes to
 * five shallow ones for exactly that reason, and this walks back the other
 * way. And **nine is not nothing**: a fine rim is what a swollen, gas-filled
 * sac looks like, and six may be a fruit. `bun run shapes:report` measures the
 * first; only an eye at 26 px settles the second.
 */
export const BULB_SIX: Variant = {
  slot: "creature:bulb",
  name: "six",
  sentence:
    "six lobes deep enough to be counted instead of nine shallow enough to be a texture — a spore, not a serrated circle",
  dir: "tools/versus/candidates/creature-bulb/six",
  patches: [
    patch({
      target: BULB,
      reached: () => livingSilhouette("bulb"),
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "BULB",
        type: "CreatureSilhouette",
      },
      fields: { lobes: 6, depth: 0.24 },
    }),
  ],
};
