export {
  BODY_HIT,
  BULB_HIT,
  DART_HIT,
  ECHO_HIT,
  type HitLook,
  hitFor,
  RIND_HIT,
  SLICK_HIT,
  type Strike,
  THROB_HIT,
  WISP_HIT,
} from "./body-hit.js";
export {
  BREACH_STRIKE_LOOK,
  type BreachStrikeLook,
  type StrikePaint,
} from "./breach-look.js";
export { BREAK_LOOK, type BreakLook, fallFrom, fractureFrom } from "./break-look.js";
export { edgeLit, faceHex, facet, type PiecePaint } from "./break-piece.js";
export { drawWaveOpening } from "./briefing.js";
export { Canvas2DRenderer } from "./canvas2d.js";
export { ClaspFrames } from "./clasp-frames.js";
// THE COUNT's looks, so the SHAPES page's LIBRARY can draw each on the real
// disc: the iris it wears, the notches it wore, and the two kept beside it
// (`countdown-look.ts`).
// Who speaks about each kind, and the word each seat's chip says — read by
// the director's CONTROLS › HELPERS for the siren's roster, and the live call
// and words its every-state rows print under each pair of screens.
export { commsCall } from "./comms.js";
export { TALKER } from "./comms-talker.js";
export { drawCountMarks, showsCount } from "./countdown.js";
export { dialCount, dialOver } from "./countdown-dial.js";
export { fuseCount, fuseOver } from "./countdown-fuse.js";
export { irisCount, irisOver } from "./countdown-iris.js";
export { COUNTDOWN_LOOK, type CountdownLook } from "./countdown-look.js";
export type { Body } from "./creature-body-in.js";
export { drawLivingBody } from "./creature-body-living.js";
export { CREATURE_GLANCE_SIZE } from "./creature-glance.js";
export {
  contourClock,
  creatureCenter,
  creatureRadius,
  livingBodyMul,
  livingRadius,
  livingScale,
  rindPrevBodyMul,
} from "./creature-place.js";
export { drawnCol, drawnRow } from "./depth.js";
export { DUTY_WORD } from "./duty-words.js";
export { smoothstep } from "./ease.js";
// The words beside the lantern, one a fault — CONTROLS › HELPERS lists them.
export { FAULT_LABEL } from "./fault-label.js";
export {
  type Dial,
  type DialView,
  drawGauge,
  showsGaugeMarks,
  showsGaugeValve,
} from "./gauge.js";
export { GAUGE_DUTY } from "./gauge-crown.js";
export { drawGaugeRound } from "./gauge-round.js";
export { halo, haloSprite, strokeGlow } from "./glow.js";
export { gripLabel } from "./grip.js";
export {
  GUIDE_LOOK,
  type GuideLook,
  type NavHit,
  navHit,
  navStepHit,
  onNavBar,
} from "./guide-look.js";
export type { NavBox, NavButtons, NavState } from "./guide-nav.js";
export { drawGuideWelcome } from "./guide-welcome.js";
// THE HANDOVER, for the host that has to answer a finger the way the frame is
// drawn: the renderer seats itself as a frame arrives, and `apps/game` seats the
// layout its hit test runs against. One function, so the panel a thumb lands on
// is the panel the eye is looking at (`handover.ts`).
export { handedLayout, handedRole } from "./handover.js";
export { signedHash, sinHash } from "./hash.js";
// THE HASP's clasp rows, THE RATCHET's pawl row and THE SPOOL's axle row, for
// the director's close cuts on CONTROLS › HELPERS (`helpers-bosses-d.ts`).
export { haspRow } from "./hasp-shape.js";
export { mixHex, rgba } from "./hex.js";
export { runLineBox } from "./hud.js";
export {
  HULL_BREAK_LOOK,
  type HullBreakLook,
  type HullBreakPaint,
} from "./hull-break-look.js";
// The look records the SHAPES page draws on the real body (`index-looks.ts`).
export * from "./index-looks.js";
// The pull handle, knob, track and way (`index-pull.ts`).
export * from "./index-pull.js";
// A boss from any side, on a page of its own (`index-solid.ts`).
export * from "./index-solid.js";
// Sprites baked at load, and the examples offered on THE INSTAR (`index-sprite.ts`).
export * from "./index-sprite.js";
// A finger on the field, and whose it is: every name a host needs to answer a
// touch the way the frame is drawn, on a page of its own (`index-touch.ts`).
export * from "./index-touch.js";
export { drawIntroScene, introOver, playBox } from "./intro-scene.js";
export { half, litBox, litColour, litRound, type Shade, shadeAt } from "./key-light.js";
export {
  bandLobes,
  type Circle,
  colFromX,
  computeLayout,
  computeStage,
  flippedLayout,
  hitCircle,
  hitReach,
  type Layout,
  type Lobe,
  rolledLayout,
  type Stage,
  type Strip,
  seatOf,
  showsCannon,
  showsShield,
  tileCX,
  tileCY,
  type ViewRole,
  worldLayout,
} from "./layout.js";
// A lever's graduated groove and its zone, for THE LEVER LAB and the game (`lever-groove.ts`).
export { drawLeverGroove, type GrooveSide, groovePoint } from "./lever-groove.js";
export { drawLiving } from "./living-draw.js";
export { LOST_LOOK, type LostLook, type LostPaint } from "./lost-look.js";
export { drawLostScreen, lostButtons, lostHit } from "./lost-screen.js";
export { drawMazeWalls, mazeCanvasAngle, mazeRimHalfGapMilli } from "./maze-walls.js";
export { bodyLife, motionLife, setMotionLife } from "./motion-life.js";
export { neonHue } from "./neon-hue.js";
export { LAUNCH_LIFE, SETTLED_AGE } from "./opening-fx.js";
export {
  PAINTED_STRIPS,
  type PaintedSheet,
  STRIP_NAMES,
  type StripName,
} from "./painted-strips.js";
export { PALETTE, STROKE } from "./palette.js";
export { drawPinBlast, drawPinTake } from "./pinball-blast.js";
export { drawPinPieces } from "./pinball-piece.js";
export { drawPinballRound, showsPinPieces } from "./pinball-round.js";
export { drawPinBall, drawPinWalls, pinAt, pinTable, type Table } from "./pinball-table.js";
export { detectRasterCaps, type RasterCaps } from "./raster-caps.js";
export { loadAtlas } from "./raster-load.js";
export { RATCHET_PAWL_ROW } from "./ratchet-shape.js";
export { drawReachArm } from "./reach-arm.js";
export { readyCircles } from "./ready-page.js";
export type { Insets, Renderer, Viewport, ViewState } from "./renderer.js";
export { NO_INSET } from "./renderer.js";
// The torch's own rock, so a tool drafting something round one can draw the
// real thing rather than a stand-in — the director's holder drafts did, until
// THE CRANE (`queen-crane.ts`) went into the game. Drawing only — it takes a
// radius and a time and reads no world.
export { torchRadius } from "./rock-size.js";
export { hasSeatName, type SeatNames, seatName } from "./seat-name.js";
export { P1_SKIN, P2_SKIN, type SeatSkin, seatSkin } from "./seat-skin.js";
export { type Fracture, type Shard, shatter } from "./shatter.js";
export { type Fall, type ShardPose, shardAt } from "./shatter-fall.js";
export { drawStepGlyph, stepHex, stepLabel } from "./simon-glyph.js";
export { sirenCentre, sirenWord } from "./siren.js";
export { type Arena, snakeArena } from "./snake-draw.js";
export { drawSnakeRound } from "./snake-round.js";
export { splinters } from "./splinter.js";
export { SPOOL_ROW } from "./spool-shape.js";
export { BURST_SHEET, SpriteBursts, type SpriteSheet } from "./sprite-burst.js";
export { clearSurface } from "./surface-clear.js";
// THE WARDEN's four ropes and the switch between them, for the ON THE FIELD
// page to draw each as the real thing (`tether-looks.ts`).
export {
  DEFAULT_TETHER_LOOK,
  TETHER_LOOKS,
  type TetherLookName,
  useTetherLook,
} from "./tether-looks.js";
export { drawTorchRock } from "./torch.js";
export { drawVane } from "./vane-draw.js";
export { INTRO_SECONDS, introSeconds, RETRY_INTRO_SECONDS } from "./wave-intro.js";
// THE WELL's projection, for the two hosts that have to answer a finger the way
// it is drawn: the game and the director's stage both ask `showsWell` to fill
// `Field.well` (`well.ts`, `touch.ts`).
export {
  showsWell,
  wellAngle,
  wellAt,
  wellCenter,
  wellHub,
  wellPlace,
  wellRadius,
  wellRim,
  wellSectors,
  wellShown,
} from "./well.js";
