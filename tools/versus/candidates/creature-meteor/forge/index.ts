import * as meteorLook from "../../../../../packages/render/src/meteor-look.js";
import { patch, type Variant } from "../../../variant.js";
import { armour, caldera, field } from "./paint.js";

/**
 * `creature:meteor` / `forge` — the rock is a made thing, and it arrives with
 * its own field already up.
 *
 * The shipped meteor is grey stone: one flat mid-tone, the key light over it,
 * a pale outline, and holes that go dark where a shot landed. It states the
 * indestructibility rule honestly and it says nothing else at all — a rock in
 * a game about a hull, a cannon and a shield reads as the one object on the
 * field that wandered in from a different picture.
 *
 * FORGE answers with material rather than shape. The contour is untouched,
 * because `silhouettes.ts` hangs the whole indestructibility fiction on the
 * meteor getting `crystalPath` rather than `blobPath` — this argues about what
 * the facets are *made of*. Cold blue-grey armour with two plate seams, four
 * amber seams running out of a lava mouth at its centre, an amber neon ridge
 * with a hot filament inside it, and a fitted energy field just outside the
 * outline that breathes on its own clock and carries a white shockwave across
 * its leading edge. Every hole a shot opens becomes another lava mouth rather
 * than a dark pit, so a cratered rock reads as the same body cracked further.
 *
 * The field is the part worth arguing about, and it is not decoration. The
 * rule the pair has to learn about a rock is that shooting it does nothing and
 * the shield is the only answer, and today that rule is only ever taught by
 * failing at it. A rock that is visibly already shielded says it before
 * anybody says it out loud.
 *
 * How it can lose, and there are two ways. **Amber is the pod's colour** —
 * `PALETTE.pod` is `#FFC24A` and a pod is the one thing on the field the pair
 * is trying to *catch*. A rock glowing in the neighbouring hue at a tile's
 * width may cost more in the moment somebody shouts "gold, column four" than
 * the whole look is worth. And **the field is a second bright ring on a
 * screen that already has one**: the ship's own shield is cyan and arcs across
 * the bottom, so eleven columns of amber-ringed rocks may read as eleven
 * shields rather than as one. Both are questions for two phones at tempo,
 * which is what this page is.
 */
export const METEOR_FORGE: Variant = {
  slot: "creature:meteor",
  name: "forge",
  sentence:
    "cold armour with lava in its seams, ringed by its own energy field — the rock is a made thing, not a stone",
  dir: "tools/versus/candidates/creature-meteor/forge",
  patches: [
    patch({
      target: meteorLook.METEOR_LOOK,
      // No accessor: `drawMeteor` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => meteorLook.METEOR_LOOK,
      where: {
        file: "packages/render/src/meteor-look.ts",
        symbol: "METEOR_LOOK",
        type: "MeteorLook",
      },
      fields: {
        body: (ctx, path, r, turn) => armour(ctx, path, r, turn),
        pit: (ctx, hx, hy, pr) => caldera(ctx, hx, hy, pr),
        shell: field,
        haloMul: 2.1,
        haloColor: "#FFAA00",
        haloAlpha: 0.1,
      },
    }),
  ],
};
