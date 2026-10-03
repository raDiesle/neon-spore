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

export { antiphonVerdict } from "./antiphon-shot.js";
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
export { burgeeVerdict } from "./burgee-shot.js";
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
export { capstanVerdict } from "./capstan-shot.js";
// The core verdict eleven bosses share, and each one's own, which the picture asks
// where a bolt stops (`core-verdict.ts`).
export type { CoreVerdict } from "./core-verdict.js";
// Whether THE CURTAIN's hem asks the pilot for his thumb
// (`render/curtain-marks.ts`), because the page it would have joined was within twenty lines of its limit.
export { curtainHemAsks } from "./curtain-hand.js";
export { cystVerdict } from "./cyst-shot.js";
export { davitVerdict } from "./davit-shot.js";
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
  flueTapAsks,
  flueTapper,
  freshFlue,
} from "./flue.js";
export { flueVerdict } from "./flue-shot.js";
export { gallVerdict } from "./gall-shot.js";
export { gimbalVerdict } from "./gimbal-shot.js";
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
export { governorVerdict } from "./governor-shot.js";
export { grindstoneVerdict } from "./grindstone-shot.js";
export { halterVerdict } from "./halter-shot.js";
export { haspVerdict } from "./hasp-shot.js";
export { hiveVerdict } from "./hive-shot.js";
export { keelVerdict } from "./keel-shot.js";
// THE LAMPREY's jaw and teeth: the phase, the step, the seats, the ring and
// the gullet, for the picture, the cue and the director's hand (§41).
export {
  freshLamprey,
  LAMPREY_ASKS,
  LAMPREY_JUMP,
  LAMPREY_PHASES,
  LAMPREY_TEETH,
  type LampreyAsk,
  type LampreyEntry,
  type LampreyPhase,
  type LampreyState,
  type LampreyStep,
  lampreyBiting,
  lampreyBoss,
  lampreyDone,
  lampreyFiring,
  lampreyHeld,
  lampreyNextTooth,
  lampreyPinner,
  lampreyStep,
  lampreyTapper,
  lampreyTeethIn,
  lampreyToothIn,
} from "./lamprey.js";
export { type LeadVerdict, leadVerdict } from "./lead-shot.js";
export { ledgerVerdict } from "./ledger-shot.js";
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
  mimicPainted,
  mimicReadBy,
  mimicRows,
  mimicStep,
  mimicTiles,
  mimicWants,
} from "./mimic.js";
// THE MIMIC's pictures: the tile pictures and their colours, for the board,
// the reader's screen and the director's hand (§42).
export {
  MIMIC_SHAPES,
  mimicInk,
  mimicPaintMode,
  mimicShapeAt,
  mimicShapeHues,
  mimicShapeSize,
  mimicShapesUpTo,
} from "./mimic-shapes.js";
export { oculusVerdict } from "./oculus-shot.js";
export { plumbVerdict } from "./plumb-shot.js";
export { rimeVerdict } from "./rime-shot.js";
export { slingVerdict } from "./sling-shot.js";
export { trivetVerdict } from "./trivet-shot.js";
export { viseVerdict } from "./vise-shot.js";
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
