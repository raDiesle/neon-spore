import * as meteorLook from "../../../../../packages/render/src/meteor-look.js";
import { patch, type Variant } from "../../../variant.js";
import { fireBehind, fireInFront, hotPit, scorched } from "./paint.js";

/**
 * `creature:meteor` / `blaze` — the torch's fireball with a scorched stone in
 * it, shedding glowing pieces up the wake.
 *
 * The owner, on 11 September 2026: *very different graphics and animations
 * for meteors — the direction of the torch fireball I like, with more fire,
 * and it must look like a real meteor with craters and nice torch and fire,
 * and some small smokes on small pieces behind it falling off. It must still
 * be indestructible and cannon shots must leave marks on it.*
 *
 * BLAZE is the most literal answer: the rock **is** a torch. Behind the stone
 * the same ball of fire `torch-fire.ts` puts behind THE TORCH, drawn larger
 * and stretched upward, with nine tongues fanned over the top; in front of it,
 * six more curling up from the underside, and a veil of heat over the whole
 * body. The stone is scorched basalt, near-black with a warm cast, with four
 * deep craters it was born with and ember-bright cracks running out of the
 * largest. Six glowing pieces of it come away up the wake, each one cooling as
 * it rises and trailing its own small smoke, over five larger puffs that go
 * up further and fade.
 *
 * What a shot does is still a hole — but a hole with the heat showing
 * through: a glowing bowl with a hot lip, over the shipped placing, so the
 * pair still sees every hit land, and sees it land on something that does
 * not care.
 *
 * How it can lose. **It is a lot of light in a lane** — the ball reaches a
 * radius and a half past the rock on every side, and a wave of eleven of
 * these is eleven bonfires over a field the pair is trying to read colours
 * on. And a rock that is all fire may stop reading as a rock at all at a
 * tile's width, which is the thing the owner asked for it to be.
 */
export const METEOR_BLAZE: Variant = {
  slot: "creature:meteor",
  name: "blaze",
  sentence:
    "a torch's fireball with a scorched, cratered stone in it — glowing pieces come away up the wake, each with its own smoke",
  dir: "tools/versus/candidates/creature-meteor/blaze",
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
          fireBehind(ctx, r, turn, time);
          scorched(ctx, path, r, turn);
          fireInFront(ctx, r, turn, time);
        },
        pit: (ctx, hx, hy, pr) => hotPit(ctx, hx, hy, pr),
      },
    }),
  ],
};
