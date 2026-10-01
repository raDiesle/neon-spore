/**
 * **The clock bosses' half of the surface, the fifth page** — THE BURGEE's
 * flag, whatever comes after it, and THE WELL's face, the fourth page's last
 * row, moved across on 1 October 2026 when THE HALTER's asking predicates
 * took that page past the limit, and THE CAPSTAN's drum, the same day, when
 * its own asking predicates took the fourth page within ten lines of it.
 *
 * Cut on 27 September 2026, when THE BURGEE's block would have taken
 * `boss-surface-clocks-d.ts` to the 250-line limit. Unlike the cuts before
 * it, the new boss starts the page rather than the full page's last rows
 * coming across: the fourth page was not over, only about to be, and a page
 * that begins with the boss being built needs no row moved to say why.
 * Page four re-exports this one, so nothing reaching for a name through
 * `@neon-spore/sim` knows there are five.
 *
 * The rule the first page states holds here unchanged: a name on these pages
 * is one something outside `packages/sim` imports.
 */

// THE BURGEE's flag: the phase, the lit step, the swing and the freeze, the
// lit column, whose tap stills it and whose draw looses at it, the catches
// and the spindle, for the picture, the cue and the director's hand. Straight
// off `burgee.ts` (§39).
export {
  BURGEE_ASKS,
  BURGEE_CATCHES,
  BURGEE_PHASES,
  type BurgeeAsk,
  type BurgeeEntry,
  type BurgeePhase,
  type BurgeeState,
  type BurgeeStep,
  burgeeAims,
  burgeeBoss,
  burgeeCatching,
  burgeeDone,
  burgeeFreezeAsks,
  burgeeFreezes,
  burgeeFrozen,
  burgeeHeld,
  burgeeLitStep,
  burgeeMarkCol,
  burgeeOnMark,
  burgeeSpindleAsks,
  burgeeSwipe,
  freshBurgee,
} from "./burgee.js";
// THE CAPSTAN's drum: the phase, the lit step, both bands' wear, which seat
// steers and which rubs, and the face the cradle bares, for the picture, the
// cue and the director's hand. Straight off `capstan.ts` (§37).
export {
  CAPSTAN_ASKS,
  CAPSTAN_PHASES,
  CAPSTAN_UNREAD,
  type CapstanAsk,
  type CapstanEntry,
  type CapstanPhase,
  type CapstanState,
  type CapstanStep,
  capstanBand,
  capstanBoss,
  capstanBright,
  capstanCoreAsks,
  capstanDone,
  capstanFace,
  capstanLitStep,
  capstanPullFace,
  capstanRubAsks,
  capstanSeatIndex,
  capstanSteerAsks,
  capstanSteerer,
  capstanWearer,
  freshCapstan,
} from "./capstan.js";
// Whether THE CURTAIN's hem asks the pilot for his thumb
// (`render/curtain-marks.ts`), for the reason THE UNDERTOW's asks are below.
export { curtainHemAsks } from "./curtain-hand.js";
// THE FLUE's ember: the phase, the lit step, the drift and the steadying,
// whose rest is counted and whose tap is heard, the taps, the vents and the
// core, for the picture, the cue and the director's hand. Straight off
// `flue.ts` (§40).
export {
  FLUE_ASKS,
  FLUE_PHASES,
  FLUE_TAPS,
  FLUE_VENTS,
  type FlueAsk,
  type FlueEntry,
  type FluePhase,
  type FlueState,
  type FlueStep,
  flueBoss,
  flueDone,
  flueDrifts,
  flueEmberCol,
  flueFiring,
  flueLitStep,
  flueResters,
  flueSeatIndex,
  flueSettled,
  flueSteady,
  flueTapper,
  freshFlue,
} from "./flue.js";
// THE GOVERNOR's needle: the phase, the lit step, the needle and its speed,
// whose chord brakes it and whose tap is heard, the runs and the hub, for the
// picture, the cue and the director's hand. Straight off `governor.ts` (§43).
export {
  freshGovernor,
  GOVERNOR_ASKS,
  GOVERNOR_PADS,
  GOVERNOR_PHASES,
  GOVERNOR_RUN,
  GOVERNOR_TURN_MILLI,
  type GovernorAsk,
  type GovernorEntry,
  type GovernorPhase,
  type GovernorState,
  type GovernorStep,
  governorBoss,
  governorBraked,
  governorChordWhole,
  governorDone,
  governorFiring,
  governorGovernor,
  governorLitStep,
  governorOffMark,
  governorOnMark,
  governorTapper,
  governorTapping,
} from "./governor.js";
// Whether each of THE UNDERTOW's rings asks her for a thumb
// (`render/undertow-marks.ts`). Here rather than beside its boss's other names
// because that page was within twenty lines of its limit; the rest of the
// roll-out's asks (`render/test/mark-feedback-roll-out.test.ts`) belong here
// too, for the same reason.
export { undertowFreeAsks, undertowPinAsks } from "./undertow-hand.js";
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
