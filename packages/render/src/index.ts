export { drawBriefing } from "./briefing.js";
export { Canvas2DRenderer } from "./canvas2d.js";
export {
  CAST_MAX_ALPHA,
  type CastShadow,
  castShadows,
  drawCastShadows,
  SHADOW_DIR,
  shadedColour,
} from "./cast-shadow.js";
export { creatureAt, creatureCenter, creatureRadius } from "./creature-place.js";
export {
  type Dial,
  type DialView,
  drawGauge,
  showsGaugeMarks,
  showsGaugeValve,
} from "./gauge.js";
export { drawGaugeRound } from "./gauge-round.js";
export { halo, haloSprite, strokeGlow } from "./glow.js";
export { gripLabel } from "./grip.js";
export { half, litBox, litColour, litRound, type Shade, shadeAt } from "./key-light.js";
export {
  type Circle,
  colFromX,
  computeLayout,
  computeStage,
  hitCircle,
  type Layout,
  type Stage,
  type Strip,
  showsCannon,
  showsShield,
  tileCX,
  tileCY,
  type ViewRole,
} from "./layout.js";
export { PALETTE, STROKE } from "./palette.js";
export type { Renderer, Viewport, ViewState } from "./renderer.js";
export { drawStepGlyph, stepHex, stepLabel } from "./simon-glyph.js";
export { hitSlab, type Slab, slabFor, slabPanel } from "./slabs.js";
// The torch's own rock, so a tool drafting what *holds* one can draw the real
// thing rather than a stand-in (`tools/director/src/holders`). Drawing only —
// it takes a radius and a time and reads no world.
export { drawTorchRock, torchRadius } from "./torch.js";
export { type Field, type Hold, type Touch, touchDown, touchMove, touchUp } from "./touch.js";
export { drawVane } from "./vane-draw.js";
