export { BALLOON, balloonKnot, balloonOutline, balloonPath } from "./balloon-shape.js";
export {
  type ClubbedRim,
  clubbedPoints,
  livingPath,
  livingPoints,
  rimCount,
} from "./body-path.js";
export {
  type ControlPress,
  controlHeld,
  controlHold,
  controlPress,
} from "./control-command.js";
export { controlBroken, panelSlots } from "./control-fault.js";
export {
  CONTROL_SETS,
  type ControlSet,
  type ControlSetId,
  controlSet,
  controlSetForWave,
  DEFAULT_CONTROL_SET_ID,
  firstOnPanel,
  groupsCoveredBy,
  heldBack,
  layoutSet,
  panelForm,
  panelSends,
  setControls,
  setHas,
  wavesUsingSet,
} from "./control-sets.js";
export {
  CONTROLS,
  type ControlDef,
  type ControlId,
  control,
  type PanelForm,
} from "./controls.js";
export {
  CRAWLER,
  CRAWLER_PULSE,
  type CrawlerSilhouette,
  crawlerOutline,
  crawlerPath,
  crawlerPoints,
  PULSE_STEPS,
} from "./crawler-shape.js";
export {
  authorsBodyColor,
  type ControlGroup,
  CREATURES,
  type CreatureCategory,
  type CreatureDef,
  categoryOf,
  isInstalled,
  kindForColor,
  type RadarOwner,
  radarOwner,
  showsRadar,
} from "./creatures.js";
export {
  GHOST,
  type GhostSilhouette,
  ghostOutline,
  ghostPath,
  ghostPoints,
} from "./ghost-shape.js";
export {
  type Bump,
  bumpAdd,
  hullAngleAtX,
  hullPointAtX,
  hullRadiusMul,
} from "./hull-shape.js";
export {
  INTRO_PAGE_COUNT,
  INTRO_PAGES,
  type IntroFigure,
  type IntroPage,
} from "./intro.js";
export {
  type DeskKey,
  deskKey,
  deskKeys,
  deskSlideKeys,
  keyLabel,
} from "./keys-desk.js";
export { LID, type LidSilhouette, lidOutline, lidPath } from "./lid-shape.js";
export { KEY, LIGHT_HALF, type LightHalf } from "./light.js";
// Which kinds are bodies, and what each one looks like — the contour and the
// own-motion out of one row per kind, so the two cannot drift apart.
export { livingBodyKinds, livingSilhouette } from "./living-look.js";
export { type LongAxis, longAxis, poseOn } from "./long-axis.js";
export { MAGNET_SHAPE, type MagnetShape, magnetOutline } from "./magnet-shape.js";
export { MAZE_ROUNDS } from "./maze-rounds.js";
export {
  MECHANIC_IDS,
  MECHANICS,
  type Mechanic,
  type MechanicId,
  type MechanicSwitch,
  mechanic,
  mechanicsInWave,
  type Reach,
  type RunMechanicId,
  unreachedMechanics,
  type WaveKind,
} from "./mechanics.js";
// The metaball trace SYMBIOSIS, the Colony and THE CHOIR are all drawn with —
// one description for the game and for the shape sheet (`metaball.ts`).
export { type Bounds, type Field, isoLoops, perimeter, resample } from "./metaball.js";
export { resampleAll } from "./metaball-spread.js";
export {
  type Beats,
  beats,
  beatsFromSeconds,
  bodyPhase,
  FLICKER,
  livingMotion,
  type MotionAxis,
  type OwnMotion,
  type Pose,
  poseClock,
  REST,
  SWAY_PUMP,
  TILT_RIPPLE,
  // Spare since the runt was retired for THE LURE. Exported so the shape
  // sheet's own retired-shapes page can put it back beside the contour it was
  // written for (`tools/shape-sheet/src/retired.ts`).
  TREMBLE,
} from "./own-motion.js";
export {
  PIN_COLS,
  PINBALL_ROUNDS,
  pinBoard,
  pinBoardRows,
  pinPicture,
} from "./pinball-rounds.js";
export {
  AUTHORED_COL_MAX,
  AUTHORED_COLS,
  bossFromWave,
  buildBoss,
  buildPods,
  buildQueue,
  mapCol,
  podsFromWave,
  queueFromWave,
} from "./queue.js";
export { actCol, sceneCommands, sceneScript } from "./scene-script.js";
export {
  type GuideScene,
  guideScene,
  SCENES,
  type SceneAct,
  type SceneAnchor,
  type SceneId,
  type SceneStep,
  sceneSteps,
  stepAt,
  stepSpan,
} from "./scenes.js";
export {
  blobPath,
  blobRadiusMul,
  catmullRomSegments,
  catmullRomToBezierPath,
  circleSubpath,
  crystalPath,
  crystalRadiusMul,
  openSmoothPath,
  type Point,
} from "./shapes.js";
export {
  BULB,
  CANNON_LOBE,
  CHOIR,
  type CreatureSilhouette,
  type CrystalSilhouette,
  HULL,
  type HullSilhouette,
  type LobeShape,
  MAW,
  METEOR,
  POD,
  QUEEN_SHELL,
  SHELL,
  SHIELD_LOBE,
  SLICK,
  THROB,
  TORCH,
} from "./silhouettes.js";
export { SNAKE_ROUNDS } from "./snake-rounds.js";
// THE VEER's rider, as figures and as loops — one description of the clown for
// the game that draws it in colour and the palette that draws it as a contour.
export {
  type ClownArc,
  type ClownDisc,
  type ClownFigure,
  type ClownSilhouette,
  clownFigure,
  clownLoops,
  VEER_CLOWN,
} from "./veer-clown-shape.js";
export {
  type RingSilhouette,
  WARDEN_OPENING,
  WARDEN_PUPIL_OPEN,
  WARDEN_RING,
  type WardenOpening,
  wardenOpening,
} from "./warden-shape.js";
export { freshWaveId } from "./wave-types.js";
export {
  guideSteps,
  PROSE_PAGES,
  WAVES,
  type Wave,
  type WaveEntry,
  type WaveGuide,
  waveGuideSteps,
} from "./waves.js";
export {
  DEMONSTRATIONS,
  type Demonstration,
  demonstrationConfig,
  demonstrationIndex,
  demonstrationWave,
} from "./waves-demo.js";
