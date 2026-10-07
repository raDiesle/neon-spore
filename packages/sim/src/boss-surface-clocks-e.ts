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

// Every boss's shot asked rather than acted on, one line a boss — a page of
// their own since 5 October 2026 (`boss-surface-verdicts.ts`).
export * from "./boss-surface-verdicts.js";

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
// (`render/curtain-marks.ts`), because the page it would have joined was within twenty lines of its limit.
export { curtainHemAsks } from "./curtain-hand.js";
// THE FLUE's ember: the phase, the lit level, where the ember runs and
// which column it must be over, why a shot was spent, and the cannon held,
// for the picture, the cue and the director's hand. Straight off `flue.ts`
// (§11.57).
export {
  FLUE_MISSES,
  FLUE_PHASES,
  FLUE_WEAPONS,
  type FlueEntry,
  type FlueLevel,
  type FlueMissWhy,
  type FluePhase,
  type FlueState,
  type FlueWeapon,
  flueBoss,
  flueCannonCol,
  flueDone,
  flueEmberAlong,
  flueLitLevel,
  flueMissWhy,
  flueOver,
  flueShownLevel,
  flueTraded,
  freshFlue,
} from "./flue.js";
export { flueEmberMet, flueEmberRun, flueEmberWait, flueShotTicks } from "./flue-lead.js";
// THE GOVERNOR's needle: the phase, the lit step, the needle and its pace,
// the marks and whose they are, the taps and the hub, for the picture, the cue
// and the director's hand. Straight off `governor.ts` and `governor-mark.ts` (§43).
export {
  freshGovernor,
  GOVERNOR_ASKS,
  GOVERNOR_DOWN_MILLI,
  GOVERNOR_PHASES,
  GOVERNOR_TURN_MILLI,
  type GovernorAsk,
  type GovernorEntry,
  type GovernorMark,
  type GovernorPhase,
  type GovernorState,
  type GovernorStep,
  governorBoss,
  governorDone,
  governorDownIn,
  governorFiring,
  governorLitStep,
  governorOff,
  governorPace,
  governorTapping,
} from "./governor.js";
export {
  governorAsksSeat,
  governorMarkFor,
  governorMarkLanded,
  governorOnAnyMark,
  governorOnMark,
  governorOpenFor,
  governorOpenMarks,
} from "./governor-mark.js";
export { governorFlightTicks, governorTicksToTip } from "./governor-shot.js";
// THE LAMPREY's tail, head and teeth: the phase, the step, the seats, the
// ring, the leap, the worm's crawl and the gullet, for the picture, the cue and the director's hand (§41).
export {
  freshLamprey,
  LAMPREY_ASKS,
  LAMPREY_FOODS,
  LAMPREY_JUMP,
  LAMPREY_PHASES,
  LAMPREY_TEETH,
  LAMPREY_TRAIL,
  type LampreyAsk,
  type LampreyEntry,
  type LampreyFood,
  type LampreyMorsel,
  type LampreyPhase,
  type LampreyState,
  type LampreyStep,
  lampreyAsks,
  lampreyBiting,
  lampreyBoss,
  lampreyCrawling,
  lampreyDone,
  lampreyFiring,
  lampreyHeadPull,
  lampreyHolder,
  lampreyNextTooth,
  lampreyStep,
  lampreyTailHeld,
  lampreyTailPull,
  lampreyTapsWanted,
  lampreyTeethIn,
  lampreyToothIn,
  lampreyWorker,
} from "./lamprey.js";
export { lampreyTailWay } from "./lamprey-leap.js";
export {
  freshMimic,
  MIMIC_ASKS,
  MIMIC_PHASES,
  type MimicAsk,
  type MimicEntry,
  type MimicPhase,
  type MimicState,
  type MimicStep,
  mimicAsking,
  mimicBoss,
  mimicDone,
  mimicDraws,
  mimicFiring,
  mimicMimicking,
  mimicReadBy,
  mimicRows,
  mimicStep,
  mimicTiles,
} from "./mimic.js";
// THE MIMIC's frame and what it wants: where a picture stands, for the board,
// the crane that holds it, the reader's screen and the director's hand (§42).
export { mimicFrame, mimicInFrame, mimicPainted, mimicWants } from "./mimic-frame.js";
// THE MIMIC's pictures, one colour each, for the board and the reader's screen.
export {
  MIMIC_SHAPES,
  mimicShapeAt,
  mimicShapeSize,
  mimicShapesOfSize,
} from "./mimic-shapes.js";
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
