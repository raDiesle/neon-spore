/**
 * **The solid half of the barrel**: a boss drawn from any side, and the
 * always-on motion that keeps it alive (`packages/content/src/solid.ts` is
 * the projection). Read by the solid sheet (`bun run solid`) and by each
 * boss's renderer as it moves onto a rig. `index.ts` re-exports the page
 * whole.
 */
// THE INSTAR's rig head, and the shipped face-on head the sheet sets beside it.
export { drawFrontHead } from "./instar-head.js";
export { ENTER as INSTAR_ENTER } from "./instar-poses.js";
export { drawRigHead, drawRigSideHead, type RigHeadLook } from "./instar-rig-head-draw.js";
export { drawBall } from "./solid-ball.js";
export { backness, drawContact, hazeSkin } from "./solid-haze.js";
export { breath, chainAt, noise1 } from "./solid-motion.js";
export {
  type BallPart,
  drawRig,
  hung,
  type MarkPart,
  type Part,
  type RigLook,
  type SheetPart,
  type TubePart,
} from "./solid-rig.js";
export {
  drawSheet,
  type Glow,
  newell,
  type SeenSheet,
  seeSheet,
  sheetPath,
} from "./solid-sheet.js";
export { drawTube, rimTube, type Skin, tubePath } from "./solid-tube-draw.js";
export { type ChainFeel, VerletChains } from "./solid-verlet.js";
