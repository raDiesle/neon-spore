export { BREAK_LOOK, type BreakLook, fallFrom, fractureFrom } from "./break-look.js";
export { edgeLit, faceHex, facet, type PiecePaint } from "./break-piece.js";
export { drawWaveOpening } from "./briefing.js";
export { Canvas2DRenderer } from "./canvas2d.js";
export { ClaspFrames } from "./clasp-frames.js";
export {
  creatureAt,
  creatureCenter,
  creatureRadius,
  livingRadius,
  livingScale,
} from "./creature-place.js";
export { smoothstep } from "./ease.js";
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
export { drawGuideNav, NAV_H, navButtons, navHit, onNavBar } from "./guide-nav.js";
export { signedHash, sinHash } from "./hash.js";
export { drawIntroPage, type IntroHit, introHit, skipBox } from "./intro-page.js";
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
export { drawMazeWalls, mazeCanvasAngle, mazeRimHalfGapMilli } from "./maze-walls.js";
export { LAUNCH_LIFE, SETTLED_AGE } from "./opening-fx.js";
export { PALETTE, STROKE } from "./palette.js";
export { drawPinBlast, drawPinTake } from "./pinball-blast.js";
export { drawPinPieces } from "./pinball-piece.js";
export { drawPinballRound, showsPinPieces } from "./pinball-round.js";
export { drawPinBall, drawPinWalls, pinAt, pinTable, type Table } from "./pinball-table.js";
export { detectRasterCaps, type RasterCaps } from "./raster-caps.js";
export { loadAtlas } from "./raster-load.js";
export { drawReachArm } from "./reach-arm.js";
export { readyCircles } from "./ready-page.js";
export type { Renderer, Viewport, ViewState } from "./renderer.js";
export { hasSeatName, type SeatNames, seatName } from "./seat-name.js";
export { P1_SKIN, P2_SKIN, type SeatSkin, seatSkin } from "./seat-skin.js";
export { type Fracture, type Shard, shatter } from "./shatter.js";
export { type Fall, type ShardPose, shardAt } from "./shatter-fall.js";
export { drawStepGlyph, stepHex, stepLabel } from "./simon-glyph.js";
export { hitSlab, type Slab, slabFor, slabPanel } from "./slabs.js";
export { type Arena, showsSnakeBody, showsSnakeFood, snakeArena } from "./snake-draw.js";
export { drawSnakeRound } from "./snake-round.js";
export { FIELD_TRAIL_SCALE, neonHue } from "./splash-blob.js";
export { SplashTrail } from "./splash-trail.js";
export { BURST_SHEET, SpriteBursts, type SpriteSheet } from "./sprite-burst.js";
export { type CanvasBox, pointOnStage } from "./stage-point.js";
export { clearSurface } from "./surface-clear.js";
// The torch's own rock, so a tool drafting what *holds* one can draw the real
// thing rather than a stand-in (`tools/director/src/holders`). Drawing only —
// it takes a radius and a time and reads no world.
export { drawTorchRock, torchRadius } from "./torch.js";
export { type Field, type Hold, type Touch, touchDown, touchMove, touchUp } from "./touch.js";
export {
  cannonGrab,
  type ShipHand,
  type ShipMark,
  shieldGrab,
  shipHand,
  shipUnder,
  sucksOnLift,
  swipeColor,
} from "./touch-ship.js";
export { drawVane } from "./vane-draw.js";
export { INTRO_SECONDS } from "./wave-intro.js";
