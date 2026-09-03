export {
  CONTROL_SETS,
  type ControlSet,
  type ControlSetId,
  controlSet,
  controlSetForWave,
  DEFAULT_CONTROL_SET_ID,
  panelForm,
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
  authorsBodyColor,
  type ControlGroup,
  CREATURES,
  type CreatureCategory,
  type CreatureDef,
  categoryOf,
  kindForColor,
  type RadarOwner,
  radarOwner,
  showsRadar,
} from "./creatures.js";
export { GHOST, type GhostSilhouette, ghostOutline, ghostPath } from "./ghost-shape.js";
export {
  type Bump,
  bumpAdd,
  hullAngleAtX,
  hullPointAtX,
  hullRadiusMul,
} from "./hull-shape.js";
export { LID, type LidSilhouette, lidOutline, lidPath } from "./lid-shape.js";
export { KEY, LIGHT_HALF, type LightHalf } from "./light.js";
// Which kinds are bodies, and what each one looks like — the contour and the
// own-motion out of one row per kind, so the two cannot drift apart.
export { livingBodyKinds, livingSilhouette } from "./living-look.js";
export { type LongAxis, longAxis, poseOn } from "./long-axis.js";
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
export {
  blobPath,
  blobRadiusMul,
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
export {
  type RingSilhouette,
  WARDEN_OPENING,
  WARDEN_PUPIL_OPEN,
  WARDEN_RING,
  type WardenOpening,
  wardenOpening,
} from "./warden-shape.js";
export { WAVES, type Wave, type WaveEntry, type WaveGuide } from "./waves.js";
export {
  DEMONSTRATIONS,
  type Demonstration,
  demonstrationConfig,
  demonstrationIndex,
  demonstrationWave,
} from "./waves-demo.js";
