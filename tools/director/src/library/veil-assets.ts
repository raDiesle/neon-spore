import { anvil, foam, strata, vortex } from "@neon-spore/render";
import type { Asset } from "./types.js";
import { drawVeilStage } from "./veil-stage.js";

/**
 * THE VEIL's four clouds — what the weather is made of between its rim and
 * its lightning.
 *
 * `creature:veil` was decided on 11 September 2026: the owner kept ANVIL,
 * asked for less of it over the body on the screen that sees in, and said
 * "move the versus alternatives all to 'Shapes' page". So all four are here on
 * the game's own cloud, turning on one clock: the mass it wears and the three
 * that stood beside it.
 */

const FROM = "THE VEIL · creature:veil";

export const VEIL_ANVIL: Asset = {
  id: "veil-anvil",
  label: "ANVIL",
  from: FROM,
  inGame: true,
  claim:
    "A dark cloud built of nine soft heaps on a mass that turns. Look at the top-left shoulders: the heaps facing the light are pale, the ones under them dark, and the boundary runs across the cloud rather than straight across the picture.",
  note: "In the game since 9 September 2026, kept on 11 September against three alternatives. Player 1 sees a thinner version with the body through it.",
  draw: (c, f) => drawVeilStage(c, f, anvil),
};

export const VEIL_FOAM: Asset = {
  id: "veil-foam",
  label: "FOAM",
  from: FROM,
  claim:
    "The cloud as a froth of fourteen thin-walled bubbles packed on the turning mass. Look at one bubble coming round the left shoulder: it arrives as a sliver, swells to a ring facing you, and its rim is brighter on the side toward the light.",
  note: "Kept on 11 September 2026. A grown froth for a body that should read as a colony rather than as weather.",
  draw: (c, f) => drawVeilStage(c, f, foam),
};

export const VEIL_STRATA: Asset = {
  id: "veil-strata",
  label: "STRATA",
  from: FROM,
  claim:
    "Five stacked rings of vapour round the mass, seen a little from above, with three knots riding each ring. Look at the knots: they come round the front broad and bright, thin to slivers at the sides, and cross the back as faint marks.",
  note: "Kept on 11 September 2026. Bands for a body that should be seen turning on an axis.",
  draw: (c, f) => drawVeilStage(c, f, strata),
};

export const VEIL_VORTEX: Asset = {
  id: "veil-vortex",
  label: "VORTEX",
  from: FROM,
  claim:
    "A storm from above: three arms of grains winding into a dark eye on a turning disc. Look at the near half and the far half: the grains sweep opposite ways, which is what a turning ring does and nothing flat can.",
  note: "Kept on 11 September 2026. A spiral for a body that is a storm rather than a cloud.",
  draw: (c, f) => drawVeilStage(c, f, vortex),
};
