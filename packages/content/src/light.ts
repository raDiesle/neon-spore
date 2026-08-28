/**
 * WHERE THE LIGHT IS.
 *
 * The game already draws a hull sheen, a rimmed crater, a contact shadow and a
 * glow on every body. Every one of those implies a light and none of them named
 * one, so the field was lit from nowhere in particular and read flat however
 * good each effect was on its own. This file is the naming.
 *
 * **Why it is here, and not in `render`.** The direction has to be readable
 * from two places that are forbidden to reach each other:
 * `tools/director/src/skins/light.ts`, which may not import `packages/render`,
 * and `packages/render` itself, which may not import `tools/`. `content` is the
 * only package both already depend on. The alternative was two copies and a
 * `COPIES` row in `packages/sim/test/purity.test.ts` — which would not have
 * worked, because that scan walks `sim` and `content` only and would never have
 * looked at either copy.
 *
 * **This is the first drawing fact to live in `content`, and it belongs.** The
 * package is not "things the simulation reads" — `silhouettes.ts`, `shapes.ts`
 * and `own-motion.ts` are all pictures, and `hull-shape.ts` is the contour of
 * the ship. What `content` actually holds is *authored data that more than one
 * drawing surface has to agree about*, which is this constant exactly. It is a
 * unit vector: no clock, no randomness, no DOM, nothing `purity.test.ts`
 * objects to, and nothing the simulation can see. `hashWorld` is untouched, no
 * `SimConfig` field decides an angle, and two devices that disagree about a
 * highlight still agree about the world.
 */

/**
 * The key light, in screen axes with y down, pointing **from the body toward
 * the light**. Upper left.
 *
 * Upper left because the hull's own aura sits low and even, so a bright
 * shoulder up and left is where a lit edge argues with the glow least — the
 * reasoning `tools/director/src/skins/light.ts` arrived at over six skins, kept
 * word for word rather than re-decided here.
 *
 * It is a **constant and never a parameter**. Six surfaces each free to pick an
 * angle is six directions on one screen, which is the mistake an eye reads as
 * *wrong* without being able to say why. Nothing else in the tree may name an
 * angle; everything that wants one reads this.
 */
export const KEY = { x: -Math.SQRT1_2, y: -Math.SQRT1_2 } as const;

/**
 * How much of the light a surface is allowed to take.
 *
 * A real key light does two things at once: it changes how *bright* a surface
 * is, and it changes what *colour* it is — lit toward the warmth of the light,
 * shadowed toward the cool of the sky. The two are separable, and on this game
 * they have to be.
 *
 * `"value"` is the brightness half alone: a terminator and a contact shadow,
 * which are darkening and nothing else. `"value+hue"` adds the warm lit
 * shoulder and the cool bounce.
 */
export type LightHalf = "value" | "value+hue";

/**
 * Who gets which half, and the one entry that is a rule rather than a taste.
 *
 * **Creatures take the value half only.** `docs/alive.md` refuses a hue split
 * on a body in a wave, and the ground is gameplay rather than caution: a
 * creature's red-or-cyan is a fact one player says out loud across a two-second
 * delay, so at 26 px a tint that moved a red body toward cyan would be moving
 * the callout. Darkening cannot do that — scaling all three channels by one
 * number leaves hue exactly where it was — which is why the split falls on this
 * line and not somewhere more generous.
 *
 * The hull and the rocks take both halves. The hull is on screen every frame,
 * it is the player's own ship and it carries no ammunition colour; the rocks
 * are inert by fiction and are the one body whose volume is already better than
 * the creatures'.
 */
export const LIGHT_HALF = {
  hull: "value+hue",
  rock: "value+hue",
  creature: "value",
} as const satisfies Record<string, LightHalf>;
