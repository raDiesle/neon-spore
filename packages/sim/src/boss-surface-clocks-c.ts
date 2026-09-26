/**
 * **The clock bosses' half of the surface, the third page** — THE WELL's face
 * and the thumb on its seam, and THE RATCHET's rack.
 *
 * Cut when THE HASP's door took `boss-surface-clocks-b.ts` to 258 lines
 * against a 250-line limit, along the seam that file was itself cut on: the
 * **last** rows the full page held go across whole, so the boss being written
 * keeps the comment that explains it and the one being moved keeps its own.
 * Page two re-exports this one and page one re-exports page two, so nothing
 * reaching for a name through `@neon-spore/sim` knows there are three.
 *
 * The rule the first page states holds here unchanged: a name on these pages
 * is one something outside `packages/sim` imports.
 */

// THE RATCHET's rack: its phase, its teeth, whether the catch is set and
// whether a bolt is loose — for the picture, the sound, the cue and the
// director's hand. Straight off `ratchet.ts` (`docs/spec/bosses.md` §11.38).
export type { RatchetEntry } from "./boss-entries-clocks-b.js";
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
  keelDone,
  keelJointCol,
  keelLit,
  keelLoose,
  keelNextJoint,
  keelSeat,
  keelSegCol,
  keelThrown,
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
  mantleCharged,
  mantleDone,
  mantleFinale,
  mantleLeaking,
  mantlePairsLeft,
  mantlePulling,
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
  oculusHolding,
  oculusLitStep,
} from "./oculus.js";
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
  valveDone,
  valveFrozen,
  valveHolding,
  valveLeaking,
  valveMark,
  valveNeedMilli,
  valveOnMark,
  valveTurning,
} from "./valve.js";
// THE WELL's face, and the thumb on its seam: how far it has turned and which
// way it is read, for the projection that draws it (`render/well-roll.ts`),
// the hit test that answers it (`render/touch-well.ts`) and the director's
// hand. On a clocks page at all because `boss-surface.ts` is at its limit
// (`well.ts`).
export {
  NO_WELL_GRIP,
  WELL_PHASES,
  type WellPhase,
  type WellState,
  wellBoss,
  wellHeldNow,
  wellHoldLeft,
  wellMaxOffsetMilli,
} from "./well.js";
