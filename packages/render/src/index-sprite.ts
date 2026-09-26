/**
 * Sprites baked at load (`sprite-bake.ts`) and the examples offered on THE
 * INSTAR beside the drawings they would replace — the names `bun run sprite`
 * draws from (`tools/raster/src/sprite-demos.ts`).
 */

export { drawBakedEgg, EGG_SPRITE, stirAt } from "./instar-egg-baked.js";
export { drawEggCrack } from "./instar-egg-crack.js";
export { drawEgg, drawNests } from "./instar-eggs.js";
export { drawBakedIris, EYE_SPRITE } from "./instar-eye-baked.js";
export { type EyeIris, IRIS_LOOK } from "./instar-head-parts.js";
export { drawScales as drawHideScales, type Form, lightHide } from "./instar-hide.js";
export { drawBakedScales, HIDE_SPRITE } from "./instar-hide-baked.js";
export { PALE_LOOK, type PaleSkin } from "./instar-moult.js";
export { drawBakedPale, PALE_SPRITE } from "./instar-moult-baked.js";
export { drawBakedNests, NEST_SPRITE } from "./instar-nest-baked.js";
export type { Look } from "./instar-plate.js";
export { type BodyRing, RING_LOOK } from "./instar-profile.js";
export { drawBakedSeam, SEAM_SPRITE } from "./instar-seam-baked.js";
export { drawBakedMembrane, WING_SPRITE } from "./instar-wing-baked.js";
export { WING_LOOK, type WingSkin } from "./instar-wings.js";
export {
  blitFrame,
  greySprite,
  SPRITE_STEP,
  type Sprite,
  type SpriteSpec,
  spritePx,
  spriteRng,
  tintedSprite,
} from "./sprite-bake.js";
