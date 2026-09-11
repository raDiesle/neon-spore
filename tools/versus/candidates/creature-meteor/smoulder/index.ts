import * as meteorLook from "../../../../../packages/render/src/meteor-look.js";
import { patch, type Variant } from "../../../variant.js";
import { charcoal, redPit, smoke } from "./paint.js";

/**
 * `creature:meteor` / `smoulder` — a black stone on fire only where it meets
 * the air, under a thick column of dark smoke with ash coming off it.
 *
 * The owner, on 11 September 2026: *very different graphics and animations
 * for meteors — the direction of the torch fireball I like, with more fire,
 * and it must look like a real meteor with craters and nice torch and fire,
 * and some small smokes on small pieces behind it falling off. It must still
 * be indestructible and cannon shots must leave marks on it.*
 *
 * BLAZE is all fire and COMET is a long fire; SMOULDER is the least fire and
 * the most **smoke**, and puts the fire where a falling rock actually burns —
 * on its underside. The stone is charcoal-black with three big craters and a
 * white-hot rim along the bottom edge, a deep red bloom a little way up from
 * it, and eight tongues sweeping up round the sides from the underside and no
 * further; the top of the stone stays black. Behind it goes a thick column of
 * dark smoke, eight puffs growing as they rise, three radii up the lane, with
 * seven large flakes of ash tumbling up through it — and one in four of those
 * still an ember, throwing its own light and its own thread of smoke.
 *
 * A shot's mark is a hole glowing deep red from the floor up, with a grey
 * lip: the bolt broke the crust and found the heat under it. Over the shipped
 * placing, so every hit shows.
 *
 * How it can lose. **Smoke is the one thing here that is not light** — it
 * darkens what is behind it, and a column three radii tall over a lane is a
 * column of the field the pair cannot read a pod's colour through. And the
 * stone is the darkest thing on the field: at a tile's width its shape may be
 * the white rim and nothing else.
 */
export const METEOR_SMOULDER: Variant = {
  slot: "creature:meteor",
  name: "smoulder",
  sentence:
    "a black stone white-hot along its underside — a thick column of dark smoke behind it, with flakes of ash and the odd ember tumbling up it",
  dir: "tools/versus/candidates/creature-meteor/smoulder",
  patches: [
    patch({
      target: meteorLook.METEOR_LOOK,
      // No accessor: `drawMeteor` reads the export itself.
      reached: () => meteorLook.METEOR_LOOK,
      where: {
        file: "packages/render/src/meteor-look.ts",
        symbol: "METEOR_LOOK",
        type: "MeteorLook",
      },
      fields: {
        body: (ctx, path, r, turn, time) => {
          smoke(ctx, r, turn, time);
          charcoal(ctx, path, r, turn, time);
        },
        pit: (ctx, hx, hy, pr) => redPit(ctx, hx, hy, pr),
      },
    }),
  ],
};
