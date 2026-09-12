import { fireBehind, fireInFront, hotPit, scorched } from "./meteor-blaze.js";
import { iron, plume, struck } from "./meteor-comet.js";
import { type MeteorLook, STONE_LOOK } from "./meteor-look.js";
import { charcoal, redPit, smoke } from "./meteor-smoulder.js";

/**
 * THE THREE THINGS A ROCK CAN BE, and how each rock picks one.
 *
 * On 11 September 2026 the owner asked for meteors *very different* from the
 * grey stone: *the direction of the torch fireball I like, with more fire —
 * it must look like a real meteor with craters and nice torch and fire, and
 * some small smokes on small pieces behind it falling off; it must still be
 * indestructible and cannon shots must leave marks on it.* Four answers went
 * to VERSUS as `creature:meteor`, and on 12 September he took three of them
 * into the game — BLAZE built in, COMET and SMOULDER as *alternative visuals
 * for any meteor* — and rejected FORGE.
 *
 * **Each rock picks its look by itself.** Asked whether the alternative should
 * be authored per rock, follow the rock's tier or be left for a later lane,
 * the owner chose the mix: every rock wears one of the three by its own id,
 * so a field of rocks is a field of different fires and nothing has to be
 * authored. Two to one to one, blaze first, because BLAZE is the one he asked
 * to have *built in* and the other two are the alternatives to it. Read off
 * the same seed that places a rock's pits and starts its spin, so both
 * devices agree without the simulation holding a look per body — a look is
 * render's alone, and a `Creature` field for it would be a hash entry for a
 * thing the rules never read.
 *
 * What does not vary is the shape and the rule: all three are the same
 * faceted contour at the same size, all three are indestructible, and a shot
 * leaves a pit on every one of them. The pair says the word "rock" for any of
 * them, which is the whole of why three looks on one kind is allowed at all —
 * a silhouette means one word; a material may vary under it.
 *
 * The halo, and the shell, are the stone's: the candidates were judged with
 * only their body and their pit changed, so that is what goes in.
 */

const BLAZE_LOOK: MeteorLook = {
  ...STONE_LOOK,
  body(ctx, path, r, turn, time) {
    fireBehind(ctx, r, turn, time);
    scorched(ctx, path, r, turn);
    fireInFront(ctx, r, turn, time);
  },
  pit(ctx, hx, hy, pr) {
    hotPit(ctx, hx, hy, pr);
  },
};

const COMET_LOOK: MeteorLook = {
  ...STONE_LOOK,
  body(ctx, path, r, turn, time) {
    plume(ctx, r, turn, time);
    iron(ctx, path, r, turn);
  },
  pit(ctx, hx, hy, pr) {
    struck(ctx, hx, hy, pr);
  },
};

const SMOULDER_LOOK: MeteorLook = {
  ...STONE_LOOK,
  body(ctx, path, r, turn, time) {
    smoke(ctx, r, turn, time);
    charcoal(ctx, path, r, turn, time);
  },
  pit(ctx, hx, hy, pr) {
    redPit(ctx, hx, hy, pr);
  },
};

/** The look the game builds a rock from when nothing picks one — BLAZE. */
export const METEOR_LOOK: MeteorLook = BLAZE_LOOK;

/** Blaze, comet, blaze, smoulder — the mix, by the rock's own seed. */
const MIX: readonly MeteorLook[] = [BLAZE_LOOK, COMET_LOOK, BLAZE_LOOK, SMOULDER_LOOK];

/**
 * The look this rock wears. `seed` is the creature id on the field, and
 * whatever stood in for one where there is no creature (`drawRockBody`).
 */
export function meteorLookFor(seed: number): MeteorLook {
  return MIX[Math.abs(seed) % MIX.length] as MeteorLook;
}
