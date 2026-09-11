import * as meteorLook from "../../../../../packages/render/src/meteor-look.js";
import { patch, type Variant } from "../../../variant.js";
import { iron, plume, struck } from "./paint.js";

/**
 * `creature:meteor` / `comet` — a rusted iron stone with a long plume of fire
 * standing three radii up the lane behind it.
 *
 * The owner, on 11 September 2026: *very different graphics and animations
 * for meteors — the direction of the torch fireball I like, with more fire,
 * and it must look like a real meteor with craters and nice torch and fire,
 * and some small smokes on small pieces behind it falling off. It must still
 * be indestructible and cannon shots must leave marks on it.*
 *
 * Where BLAZE wraps the rock in fire, COMET puts the fire **behind** it and
 * makes it long: one tapered plume swaying up the lane, with seven tongues
 * rising inside it from the stone to the tip, so the whole thing reads as a
 * body falling fast through air. The stone is rusted iron — a brown at 15°
 * that is nobody's ammunition — dimpled all over with the shallow round
 * thumbprints an iron meteorite wears, and white-hot along its underside where
 * it meets the air. Four chips of the stone tumble up the plume, dark against
 * the fire, each trailing three small puffs of smoke.
 *
 * A shot's mark is a dark hole with a white-hot lip: the metal under the
 * crust, bright where the bolt opened it, over the shipped placing.
 *
 * How it can lose. **The plume is three radii long**, and a rock a row from
 * the ship has a plume reaching up through the two rows above — a wave of
 * eleven of these is eleven columns of fire the pair has to read pods
 * through. And the direction is the argument: a long plume says *fast*, and
 * a meteor in this game falls a row a beat, which at tempo is not fast.
 */
export const METEOR_COMET: Variant = {
  slot: "creature:meteor",
  name: "comet",
  sentence:
    "a rusted iron stone, dimpled and white-hot underneath — a long plume of fire behind it with chips of the rock tumbling up it",
  dir: "tools/versus/candidates/creature-meteor/comet",
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
          plume(ctx, r, turn, time);
          iron(ctx, path, r, turn);
        },
        pit: (ctx, hx, hy, pr) => struck(ctx, hx, hy, pr),
      },
    }),
  ],
};
