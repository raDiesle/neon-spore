/**
 * **The clock bosses' half of the surface, the third page** — THE KEEL's
 * spine to THE VALVE's drum, and THE RATCHET's rack.
 *
 * Cut when THE HASP's door took `boss-surface-clocks-b.ts` to 258 lines
 * against a 250-line limit, along the seam that file was itself cut on: the
 * **last** rows the full page held go across whole, so the boss being written
 * keeps the comment that explains it and the one being moved keeps its own.
 * Page two re-exports this one and page one re-exports page two, so nothing
 * reaching for a name through `@neon-spore/sim` knows there are three.
 *
 * **A fourth page opened when THE GRINDSTONE's names would have taken this
 * one past 250**, and THE WELL's rows went across, the last ones here
 * (`boss-surface-clocks-d.ts`); THE VISE's followed, the last again, when
 * this page reached 252, and THE TRIVET's when its window length took this
 * page to 238 — the boss being drawn went across, since it was the one open.
 *
 * The rule the first page states holds here unchanged: a name on these pages
 * is one something outside `packages/sim` imports.
 */

// THE RATCHET's rack: its phase, its teeth, whether the catch is set and
// whether a bolt is loose — for the picture, the sound, the cue and the
// director's hand. Straight off `ratchet.ts` (`docs/spec/bosses.md` §11.38).
export type { RatchetEntry } from "./boss-entries-clocks-b.js";
// THE WELL's names, THE GRINDSTONE's, THE VISE's and THE TRIVET's, the last
// rows this page held (`boss-surface-clocks-d.ts`).
export * from "./boss-surface-clocks-d.js";
// THE KEEL's spine: the phase, the movement, where the joint sits and whose
// thumb it wants, the locked segments and the tail's rock, for the picture,
// the cue and the director's hand. Straight off `keel.ts`
// (`docs/spec/bosses-choreographed.md` §24); `geometrySeat` is the spec's
// `GeometrySeat`, for the cue that has to put `PRESS` on the right screen.
export { geometrySeat } from "./geometry-seat.js";
export {
  KEEL_PHASES,
  type KeelEntry,
  type KeelPhase,
  type KeelState,
  keelBoss,
  keelCooling,
  keelDone,
  keelEndSeg,
  keelFlipping,
  keelJointCol,
  keelLit,
  keelLoose,
  keelMarrowLit,
  keelNextJoint,
  keelSeat,
  keelSegCol,
  keelThrown,
  keelWindowBeats,
  NO_JOINT,
  NO_ROCK,
} from "./keel.js";
// THE MANTLE's shell: the phase, the cursor, both handles' depths and the
// bared core's spark and finish, for the picture, the cue and the director's
// hand. Straight off `mantle.ts` (`docs/spec/bosses-choreographed.md` §23).
export {
  MANTLE_PHASES,
  type MantleEntry,
  type MantlePhase,
  type MantleState,
  mantleBoss,
  mantleBracing,
  mantleBuckling,
  mantleCharged,
  mantleDone,
  mantleFinale,
  mantleLastPull,
  mantleLeaking,
  mantlePairsLeft,
  mantlePulling,
  mantleTurning,
  mantleVenting,
  NO_SPARK,
} from "./mantle.js";
// THE OCULUS's lens: the phase, the lit step, the leaves and both thumbs, for
// the picture, the cue and the director's hand. Straight off `oculus.ts`
// (`docs/spec/bosses-choreographed.md` §27).
export {
  freshOculus,
  OCULUS_ASKS,
  OCULUS_LEAVES,
  OCULUS_PHASES,
  type OculusAsk,
  type OculusEntry,
  type OculusPhase,
  type OculusState,
  type OculusStep,
  oculusBoss,
  oculusBothHeld,
  oculusDone,
  oculusGlaring,
  oculusHolding,
  oculusLitStep,
  oculusLookCol,
} from "./oculus.js";
export { oculusWindowBeats } from "./oculus-step.js";
// THE PLUMB's bob: the phase, the lit step, the weights and both seats'
// leans, for the picture, the cue and the director's hand. Straight off
// `plumb.ts` (`docs/spec/bosses-choreographed.md` §31).
export {
  freshPlumb,
  levelling,
  PLUMB_ASKS,
  PLUMB_PHASES,
  PLUMB_SETTLES_PER_WEIGHT,
  PLUMB_UNREAD,
  type PlumbAsk,
  type PlumbEntry,
  type PlumbPhase,
  type PlumbState,
  type PlumbStep,
  plumbBoss,
  plumbDone,
  plumbLevel,
  plumbLitStep,
  plumbTrue,
} from "./plumb.js";
export {
  NO_CATCH,
  RATCHET_CLEAN,
  RATCHET_PHASES,
  RATCHET_TEETH,
  type RatchetPhase,
  type RatchetState,
  ratchetBoss,
  ratchetHeld,
  ratchetJammed,
  ratchetLoose,
  ratchetMargin,
  ratchetOpen,
  ratchetWindowBeats,
  ratchetWorking,
} from "./ratchet.js";
// THE RIME's lens: the phase, the lit step, the wipes and both halves' frost,
// for the picture, the cue and the director's hand. Straight off `rime.ts`
// (`docs/spec/bosses-choreographed.md` §29).
export {
  freshRime,
  RIME_ASKS,
  RIME_FULL_MILLI,
  RIME_PHASES,
  RIME_WIPES_PER_HALF,
  type RimeAsk,
  type RimeEntry,
  type RimePhase,
  type RimeState,
  type RimeStep,
  rimeBoss,
  rimeDone,
  rimeLitStep,
  rimeWiping,
} from "./rime.js";
// THE SEAM's ridge: the phase, the lit step and what it still wants, and the
// points sealed, for the picture, the cue and the director's hand. Straight
// off `seam.ts` (`docs/spec/bosses-choreographed.md` §26).
export {
  SEAM_ASKS,
  SEAM_PHASES,
  SEAM_POINTS,
  type SeamAsk,
  type SeamEntry,
  type SeamPhase,
  type SeamState,
  type SeamStep,
  seamBoss,
  seamDone,
  seamLitStep,
  seamStepCol,
  seamWantsShield,
  seamWantsShot,
} from "./seam.js";
export { seamStepBeats } from "./seam-step.js";
// THE SLING's fork: the phase, the lit step, the arms and both seats'
// draws, for the picture, the cue and the director's hand. Straight off
// `sling.ts` (`docs/spec/bosses-choreographed.md` §32).
export {
  freshSling,
  SLING_AIMS,
  SLING_ASKS,
  SLING_DRAWS_PER_ARM,
  SLING_PHASES,
  type SlingAim,
  type SlingAsk,
  type SlingEntry,
  type SlingPhase,
  type SlingState,
  type SlingStep,
  slingAsks,
  slingBoss,
  slingDone,
  slingLitStep,
  slingSwipe,
} from "./sling.js";
export { slingWindowBeats } from "./sling-step.js";
// THE VALVE's drum: the phase, the movement, the pins, the wheel and its mark,
// and the spark, for the picture, the cue and the director's hand. Straight
// off `valve.ts` (`docs/spec/bosses-choreographed.md` §25).
export {
  VALVE_PHASES,
  VALVE_PINS,
  type ValveEntry,
  type ValvePhase,
  type ValveState,
  valveBoss,
  valveBracing,
  valveDone,
  valveFrozen,
  valveHolding,
  valveJetting,
  valveLeaking,
  valveMark,
  valveNeedMilli,
  valveOnMark,
  valveTurning,
  valveWiping,
} from "./valve.js";
// And both windows' lengths, so the rings the picture closes read the same
// number the simulation judges by (`valve-step.ts`).
export { valveFreezeBeats, valvePullBeats } from "./valve-step.js";
