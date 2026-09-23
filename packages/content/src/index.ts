/**
 * **`@neon-spore/content`'s whole surface**: the rules, waves, scenes and
 * controls named here, and every shape through `index-shapes.ts`, which
 * carries the argument for being a file of its own.
 */

export {
  type ControlPress,
  controlHeld,
  controlHold,
  controlPress,
  controlTurns,
} from "./control-command.js";
export { controlBroken, panelSlots } from "./control-fault.js";
export { controlSays } from "./control-sender.js";
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
  panelSends,
  setControls,
  setHas,
  setLance,
  wavesUsingSet,
} from "./control-sets.js";
export {
  CONTROLS,
  type ControlDef,
  type ControlId,
  control,
} from "./controls.js";
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
export { FILAMENT_SCRIPT } from "./filament-script.js";
export { GIMBAL_SCRIPT } from "./gimbal-script.js";
export * from "./index-shapes.js";
export { INSTAR_SCRIPT } from "./instar-script.js";
export {
  INTRO_ANSWER,
  INTRO_BEATS,
  INTRO_CROSS,
  INTRO_FLASH,
  INTRO_LINES,
  INTRO_LOOK,
  INTRO_SCENE_SECONDS,
  INTRO_SIDES,
  INTRO_TITLE,
  type IntroAnswer,
  type IntroBeat,
  type IntroLine,
  type IntroSeat,
} from "./intro.js";
export {
  type DeskKey,
  deskKey,
  deskKeys,
  deskSlideKeys,
  deskStepSeats,
  keyLabel,
} from "./keys-desk.js";
export { KEY, LIGHT_HALF, type LightHalf } from "./light.js";
// Which kinds are bodies and what each looks like: contour and own-motion, one row.
export { hasOwnBody, livingBodyKinds, livingSilhouette } from "./living-look.js";
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
  BANK,
  type Beats,
  BLOOM,
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
  // The four the game stopped drawing. Exported so the shape sheet can put
  // each back beside the motion that replaced it — SWALLOW, SWAY · PUMP and
  // TILT · RIPPLE on the SHAPES tab's motion axis, TREMBLE on the retired-shapes
  // page beside the contour it was written for (`tools/shape-sheet/src/retired.ts`).
  SWALLOW,
  SWAY_PUMP,
  TILT_RIPPLE,
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
  type BossPart,
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
export { SCOUT_ARENAS } from "./scout-arenas.js";
export {
  LINK_WORDS,
  type LinkWords,
  SCREEN_WORDS,
  type ScreenWords,
} from "./screen-words.js";
export {
  blobPath,
  blobPoints,
  blobRadiusMul,
  catmullRomSegments,
  catmullRomToBezierPath,
  circleSubpath,
  crystalPath,
  crystalRadiusMul,
  openSmoothPath,
  type Point,
} from "./shapes.js";
export { SNAKE_ROUNDS } from "./snake-rounds.js";
export { placedFaults, type WaveFault } from "./wave-faults.js";
export { freshWaveId } from "./wave-types.js";
export {
  type BossType,
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
