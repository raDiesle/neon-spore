import { bakedCache } from "./baked.js";

/**
 * A gradient built once and handed back on every frame after — for the ones
 * whose every argument is a radius and a constant.
 *
 * A burning rock is drawn from thirty-odd gradients a frame, and a third of
 * them never move: the ball of heat round a BLAZE, the bow along a COMET's
 * underside, the bowls of the craters each was born with, the ramp up a body
 * of flame. Their centres are the rock's own frame, their radii a fixed
 * multiple of `r`, their stops constants — so the object built on frame one
 * is, stop for stop, the object frame two would build. THE CAIRN stands seven
 * of these fires in one pile, which is where the rebuilding showed.
 *
 * **Nothing keyed on `time` may come through here.** A gradient that moves —
 * a tongue's along its bend, a stone's along the key axis, a puff's at its
 * drifting place — is built fresh where it is drawn, as it always was; a key
 * that carried a moving number would miss every frame and grow without a
 * ceiling, which is what `bakedCache` exists to catch (`test/baked-growth`).
 * The key names the gradient and the radius, nothing else.
 */
const held = bakedCache<string, CanvasGradient>();

export function heldGradient(key: string, build: () => CanvasGradient): CanvasGradient {
  const have = held.get(key);
  if (have) return have;
  const g = build();
  held.set(key, g);
  return g;
}
