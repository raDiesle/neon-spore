import * as meteorLook from "../../../../../packages/render/src/meteor-look.js";
import { patch, type Variant } from "../../../variant.js";
import { armour, caldera } from "./paint.js";

/**
 * `creature:meteor` / `forge` — the rock is a made thing rather than a stone,
 * and nothing but the rock is on the frame.
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
 * amber seams running out of a lava mouth at its centre, and an amber neon
 * ridge with a hot filament inside it. Every hole a shot opens becomes another
 * lava mouth rather than a dark pit, so a cratered rock reads as the same body
 * cracked further.
 *
 * ## The field is gone, and it was the half that lost
 *
 * This candidate arrived wearing a fitted energy shell just outside the
 * outline — a round amber ring that breathed on its own clock and carried a
 * white shockwave across its leading edge. The argument for it was real: the
 * rule the pair has to learn about a rock is that shooting it does nothing and
 * the shield is the only answer, and a rock that is visibly already shielded
 * says so before anybody says it out loud.
 *
 * The owner looked at it on 8 September 2026 and cut it, and the two ways the
 * candidate's own notes said it could lose are both about the same thing.
 * **The field is a second bright ring on a screen that already has one** — the
 * ship's shield is cyan and arcs across the bottom, and eleven columns of
 * ringed rocks read as eleven shields rather than as one. And a ring standing
 * off the contour is a **second outline arguing about where the rock ends**,
 * which is the one thing a body the pair has to name a column for cannot
 * afford. The halo went with it: the rock keeps the shipped grey one rather
 * than an amber bloom at twice the radius, so what is left on the frame is the
 * metal and nothing around it.
 *
 * How it can still lose. **Amber is the pod's colour** — `PALETTE.pod` is
 * `#FFC24A` and a pod is the one thing on the field the pair is trying to
 * *catch*. A rock glowing in the neighbouring hue at a tile's width may cost
 * more in the moment somebody shouts "gold, column four" than the whole look
 * is worth. That is a question for two phones at tempo, which is what this
 * page is.
 */
export const METEOR_FORGE: Variant = {
  slot: "creature:meteor",
  name: "forge",
  sentence:
    "cold armour with lava in its seams and a hot ridge round it — the rock is a made thing, not a stone",
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
      },
    }),
  ],
};
