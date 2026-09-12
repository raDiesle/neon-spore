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
export { BREAK_LOOK, type BreakLook, fallFrom, fractureFrom } from "./break-look.js";
export { edgeLit, faceHex, facet, type PiecePaint } from "./break-piece.js";
export { drawWaveOpening } from "./briefing.js";
export { Canvas2DRenderer } from "./canvas2d.js";
export { ClaspFrames } from "./clasp-frames.js";
// THE COUNT's looks, so the SHAPES page's LIBRARY can draw each on the real
// disc: the iris it wears, the notches it wore, and the two kept beside it
// (`countdown-look.ts`).
export { drawCountMarks, showsCount } from "./countdown.js";
export { dialCount, dialOver } from "./countdown-dial.js";
export { fuseCount, fuseOver } from "./countdown-fuse.js";
export { irisCount, irisOver } from "./countdown-iris.js";
export { COUNTDOWN_LOOK, type CountdownLook } from "./countdown-look.js";
export type { Body } from "./creature-body-in.js";
export { drawLivingBody } from "./creature-body-living.js";
export {
  contourClock,
  creatureAt,
  creatureCenter,
  creatureRadius,
  livingBodyMul,
  livingRadius,
  livingScale,
  rindPrevBodyMul,
} from "./creature-place.js";
export { drawnCol, drawnRow } from "./depth.js";
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
export { mixHex, rgba } from "./hex.js";
export { runLineBox } from "./hud.js";
export { drawIntroPage, type IntroHit, introHit, skipBox } from "./intro-page.js";
export { half, litBox, litColour, litRound, type Shade, shadeAt } from "./key-light.js";
export {
  bandLobes,
  type Circle,
  colFromX,
  computeLayout,
  computeStage,
  hitCircle,
  type Layout,
  type Lobe,
  type Stage,
  type Strip,
  showsCannon,
  showsShield,
  tileCX,
  tileCY,
  type ViewRole,
} from "./layout.js";
export { drawLid } from "./lid.js";
export { bevel } from "./lid-bevel.js";
export { iris } from "./lid-iris.js";
export { LID_LOOK, type LidLook, type LidPlates } from "./lid-look.js";
export { drawPlates } from "./lid-plates.js";
export { drawLiving } from "./living-draw.js";
export { drawMazeWalls, mazeCanvasAngle, mazeRimHalfGapMilli } from "./maze-walls.js";
export { MOUNT_LOOK, type MountLook } from "./mount-look.js";
export { rasp } from "./mount-rasp.js";
export { taproot } from "./mount-taproot.js";
export { LAUNCH_LIFE, SETTLED_AGE } from "./opening-fx.js";
export { PALETTE, STROKE } from "./palette.js";
export { drawPinBlast, drawPinTake } from "./pinball-blast.js";
export { drawPinPieces } from "./pinball-piece.js";
export { drawPinballRound, showsPinPieces } from "./pinball-round.js";
export { drawPinBall, drawPinWalls, pinAt, pinTable, type Table } from "./pinball-table.js";
export { carapace } from "./queen-carapace.js";
export { facet as facetShell } from "./queen-facet.js";
export { armour, QUEEN_LOOK, type QueenLook, type ShellDraw } from "./queen-look.js";
export { scutes } from "./queen-scutes.js";
export { detectRasterCaps, type RasterCaps } from "./raster-caps.js";
export { loadAtlas } from "./raster-load.js";
export { drawReachArm } from "./reach-arm.js";
export { readyCircles } from "./ready-page.js";
export { drawRecoilCage } from "./recoil.js";
export { calyx } from "./recoil-calyx.js";
export { foam as foamCage } from "./recoil-foam.js";
export { globe } from "./recoil-globe.js";
export { type CageDraw, RECOIL_LOOK, type RecoilLook, springs } from "./recoil-look.js";
export { moons } from "./recoil-moons.js";
export type { Renderer, Viewport, ViewState } from "./renderer.js";
export { flakes } from "./rind-flakes.js";
export { RIND_LOOK, type RindLook, type RindShed, rindWears } from "./rind-look.js";
export { pod } from "./rind-pod.js";
export { drawShed } from "./rind-skin.js";
export { slough } from "./rind-slough.js";
export { hasSeatName, type SeatNames, seatName } from "./seat-name.js";
export { P1_SKIN, P2_SKIN, type SeatSkin, seatSkin } from "./seat-skin.js";
export { type Fracture, type Shard, shatter } from "./shatter.js";
export { type Fall, type ShardPose, shardAt } from "./shatter-fall.js";
export { drawStepGlyph, stepHex, stepLabel } from "./simon-glyph.js";
export { sirenCentre } from "./siren.js";
export { hitSlab, type Slab, slabFor, slabPanel } from "./slabs.js";
export { type Arena, showsSnakeBody, showsSnakeFood, snakeArena } from "./snake-draw.js";
export { drawSnakeRound } from "./snake-round.js";
export { FIELD_TRAIL_SCALE, neonHue } from "./splash-blob.js";
export { SplashTrail } from "./splash-trail.js";
export { BURST_SHEET, SpriteBursts, type SpriteSheet } from "./sprite-burst.js";
export { type CanvasBox, pointOnStage } from "./stage-point.js";
export { clearSurface } from "./surface-clear.js";
// THE WARDEN's four ropes and the switch between them, for the ON THE FIELD
// page to draw each as the real thing (`tether-looks.ts`).
export {
  DEFAULT_TETHER_LOOK,
  TETHER_LOOKS,
  type TetherLookName,
  useTetherLook,
} from "./tether-looks.js";
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
export { drawVeilCloud } from "./veil.js";
export { foam } from "./veil-foam.js";
export { VEIL_LOOK, type VeilLook, type VeilMassDraw } from "./veil-look.js";
export { anvil } from "./veil-mass.js";
export { strata } from "./veil-strata.js";
export { vortex } from "./veil-vortex.js";
export { drawVolleyShell, showsVolleyCore } from "./volley.js";
export { drawVolleyCore } from "./volley-core.js";
export { emberSeams } from "./volley-ember.js";
export { VOLLEY_LOOK, type VolleyLook, type VolleyShell } from "./volley-look.js";
export { pittedStone } from "./volley-pitted.js";
export { shippedSeams, shippedStone } from "./volley-stone.js";
export { drawWarden } from "./warden.js";
export { WARDEN_LOOK, type WardenLook } from "./warden-look.js";
export { mantle } from "./warden-mantle.js";
export { roll } from "./warden-roll.js";
export { drawWardenSurface, type WardenSurfaceDraw } from "./warden-surface.js";
export { whorl } from "./warden-whorl.js";
export { INTRO_SECONDS } from "./wave-intro.js";
// THE WISP whole, and its fringe record, so the SHAPES page's LIBRARY can
// draw the real jellyfish wearing each fringe the owner kept
// (`tools/director/src/library`). Drawing only — the jump is read off a beat
// the card supplies, and no world is touched.
export { type WispJump, wispJump } from "./wisp.js";
export { arms } from "./wisp-arms.js";
export { drawWispBody } from "./wisp-body.js";
export { WISP_LOOK, type WispFringe, type WispLook } from "./wisp-look.js";
export { drawTentacles, strandWave } from "./wisp-tentacles.js";
