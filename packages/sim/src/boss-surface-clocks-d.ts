/**
 * **The clock bosses' half of the surface, the fourth page** — THE GALL's
 * seam and THE VISE's seed-case. THE WELL's face went to the fifth page, its last row, when THE HALTER's asking
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
export type { GallWhy } from "./events-gall.js";
// THE GALL's alien: the phase, the lit step, the point it sits on and the
// column over it, whose hand it answers, its charge, and what it asks, for
// the picture, the cue and the director's hand. Straight off `gall.ts` (§38).
export {
  freshGall,
  GALL_ASKS,
  GALL_PHASES,
  GALL_POINTS,
  type GallAsk,
  type GallEntry,
  type GallPhase,
  type GallState,
  type GallStep,
  gallBoss,
  gallCharged,
  gallLeaping,
  gallLitStep,
  gallPointAsks,
  gallPointCol,
  gallPresser,
  gallSeatAt,
  gallShotAsks,
} from "./gall.js";
// THE PLUMB's window in beats, for the ring round its core and the creep of
// its weights off true (`plumb-step.ts`).
export { plumbWindowBeats } from "./plumb-step.js";
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
