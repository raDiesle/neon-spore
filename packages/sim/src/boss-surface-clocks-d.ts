/**
 * **The clock bosses' half of the surface, the fourth page** — THE GRINDSTONE's
 * wheel, THE CYST's sac, THE DAVIT's boom, THE HALTER's seam, THE GALL's
 * seam, THE VISE's seed-case and THE TRIVET's stand. THE
 * WELL's face went to the fifth page, its last row, when THE HALTER's asking
 * predicates took this one to 252 lines, and THE CAPSTAN's drum after it,
 * when THE CAPSTAN's took it to 241.
 *
 * Cut when THE VALVE's window lengths took `boss-surface-clocks-c.ts` to 253
 * lines against a 250-line limit, along the seam the third page was cut on:
 * the **last** rows the full page held go across whole, with their comment.
 * Page three re-exports this one, so nothing reaching for a name through
 * `@neon-spore/sim` knows there are four.
 *
 * The rule the first page states holds here unchanged: a name on these pages
 * is one something outside `packages/sim` imports.
 */

// THE TRAPEZE and after, on the fifth page (`boss-surface-clocks-e.ts`).
export * from "./boss-surface-clocks-e.js";
// THE CYST's sac: the phase, the lit step, the flanks, their gaps and taps,
// and whose hand is on which, for the picture, the cue and the director's
// hand. Straight off `cyst.ts` (`docs/spec/bosses-choreographed.md` §34).
export {
  CYST_ASKS,
  CYST_PHASES,
  type CystAsk,
  type CystEntry,
  type CystPhase,
  type CystState,
  type CystStep,
  cystBoss,
  cystBudAsks,
  cystClenched,
  cystClosed,
  cystCoreAsks,
  cystDone,
  cystFlankAsks,
  cystFreezer,
  cystGuarding,
  cystLitStep,
  cystMarkAsks,
  cystPincher,
  cystSide,
  cystStepCol,
  freshCyst,
} from "./cyst.js";
// And how long a step is lit and a flank stilled, so the rings the picture
// closes read the numbers the simulation judges by (`cyst-step.ts`).
export { cystFrozenBeats, cystLitBeats } from "./cyst-step.js";
// THE DAVIT's boom: the phase, the lit step, the swings, the pivot, both
// seats' steers and draws, and whose is live, for the picture, the cue and the
// director's hand. Straight off `davit.ts` (`docs/spec/bosses-choreographed.md` §35).
export {
  DAVIT_ASKS,
  DAVIT_LOOSES_PER_SWING,
  DAVIT_PHASES,
  DAVIT_UNREAD,
  type DavitAsk,
  type DavitEntry,
  type DavitHalf,
  type DavitPhase,
  type DavitState,
  type DavitStep,
  davitBoss,
  davitDone,
  davitDraws,
  davitHalf,
  davitLitStep,
  davitLooseAsks,
  davitOnTarget,
  davitPivotAsks,
  davitSteerAsks,
  davitSteered,
  davitSteering,
  davitSteers,
  davitSwipe,
  freshDavit,
} from "./davit.js";
// A steering carry as the boom's angle, for the autopilot's thumb (`davit-hand.ts`).
export { davitCarryAngle } from "./davit-hand.js";
// THE GALL's seam: the phase, the lit step, the point it sits on and the
// column over it, whose pinch closes it and how shut, and what its marks ask,
// for the picture, the cue and the director's hand. Straight off `gall.ts` (§38).
export {
  freshGall,
  GALL_ASKS,
  GALL_CLOSES,
  GALL_PHASES,
  GALL_POINTS,
  type GallAsk,
  type GallEntry,
  type GallPhase,
  type GallState,
  type GallStep,
  gallBoss,
  gallClosing,
  gallDone,
  gallLitStep,
  gallPointAsks,
  gallPointCol,
  gallPresser,
  gallRootAsks,
  gallSeatAt,
  gallShut,
} from "./gall.js";
// THE GRINDSTONE's wheel: the phase, the lit step, the flats' grit, the
// caliper and both seats' jaws, for the picture, the cue and the director's
// hand. Straight off `grindstone.ts` (`docs/spec/bosses-choreographed.md` §33).
export {
  freshGrindstone,
  GRINDSTONE_ASKS,
  GRINDSTONE_FULL_MILLI,
  GRINDSTONE_PADS,
  GRINDSTONE_PASSES_PER_FLAT,
  GRINDSTONE_PHASES,
  type GrindstoneAsk,
  type GrindstoneEntry,
  type GrindstonePhase,
  type GrindstoneState,
  type GrindstoneStep,
  grinding,
  grindstoneAxleAsks,
  grindstoneBoss,
  grindstoneClamped,
  grindstoneDone,
  grindstoneFlatAsks,
  grindstoneJawAsks,
  grindstoneJawHeld,
  grindstoneLitStep,
} from "./grindstone.js";
export { grindstoneWindowBeats } from "./grindstone-step.js";
// THE HALTER's seam: the phase, the lit step, the cracks, both seats' rests
// and grips, and which pairing holds, for the picture, the cue and the
// director's hand. Straight off `halter.ts` (`docs/spec/bosses-choreographed.md` §36).
export {
  freshHalter,
  HALTER_ASKS,
  HALTER_BOTH_GRIPS,
  HALTER_PHASES,
  type HalterAsk,
  type HalterEntry,
  type HalterPhase,
  type HalterState,
  type HalterStep,
  halterBoss,
  halterCoreAsks,
  halterDone,
  halterGripAsks,
  halterGripped,
  halterGuarding,
  halterLitStep,
  halterPairing,
  halterResters,
  halterSeatIndex,
  halterSettled,
  halterSide,
} from "./halter.js";
// THE PLUMB's window in beats, for the ring round its core and the creep of
// its weights off true (`plumb-step.ts`).
export { plumbWindowBeats } from "./plumb-step.js";
// THE TRIVET's stand: the phase, the lit step, the feet and both seats' pads,
// for the picture, the cue and the director's hand. Straight off `trivet.ts`
// (`docs/spec/bosses-choreographed.md` §30).
export {
  chording,
  freshTrivet,
  TRIVET_ASKS,
  TRIVET_PADS,
  TRIVET_PHASES,
  TRIVET_PLANTS_PER_FOOT,
  type TrivetAsk,
  type TrivetEntry,
  type TrivetPhase,
  type TrivetState,
  type TrivetStep,
  trivetAsksFoot,
  trivetBoss,
  trivetChordHeld,
  trivetClosed,
  trivetDone,
  trivetFootAsks,
  trivetHubAsks,
  trivetLitStep,
  trivetNeedleAsks,
  trivetStepCol,
  trivetTipSide,
} from "./trivet.js";
export { trivetWindowBeats } from "./trivet-step.js";
// THE VISE's seed-case: the phase, the lit step, the cracks and both gaps, for
// the picture, the cue and the director's hand. Straight off `vise.ts`
// (`docs/spec/bosses-choreographed.md` §28).
export {
  freshVise,
  VISE_ASKS,
  VISE_PHASES,
  VISE_SEAMS_PER_LOBE,
  type ViseAsk,
  type ViseEntry,
  type VisePhase,
  type ViseState,
  type ViseStep,
  viseBiting,
  viseBoss,
  viseClosed,
  viseDone,
  viseKernelAsks,
  viseLitStep,
  viseLobeAsks,
  viseSeedAsks,
  viseSeedCol,
  viseShut,
  vising,
} from "./vise.js";
// And the lit step's window, so the ring the picture closes and the creep of
// the lobes read the same number the simulation judges by (`vise-step.ts`).
export { viseWindowBeats } from "./vise-step.js";
