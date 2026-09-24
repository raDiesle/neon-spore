import { CHOREO_FIELD_GROUP_B } from "./ship-fields-choreo-b.js";
import type { GroupName } from "./ship-groups.js";

/**
 * **The choreographed bosses' dials**, sorted into their cards.
 *
 * Cut out of `ship-fields-round.ts` when THE LEDGER's nine numbers took that
 * file eleven lines over its 250-line limit, along the seam
 * `sim/src/config-boss-clocks.ts` and `render/src/boss-draw-clocks.ts` already
 * cut twice: next door is whichever **round** has taken the field away, and
 * everything here belongs to a boss from
 * `docs/spec/bosses-choreographed.md` — a body or a fixture over the ordinary
 * field, whose whole difficulty is a beat count. Fifteen of those are designed
 * and each brings a block of its own, so this is the half that grows.
 *
 * THE STARE is in it and is not a round either: its dials came here with the
 * comment that says so, and moving them now would only lose the argument.
 *
 * It is spread into `ROUND_FIELD_GROUP` in place, so the exhaustiveness check
 * two files along is unchanged: a `SimConfig` field missing from *any* of the
 * pages is still a compile error there. **From THE LEDGER on the dials are
 * on a second page** (`ship-fields-choreo-b.ts`), spread in here at the end,
 * cut when THE LEAD's twelve put this one at 240 and the next boss's dozen
 * would have landed on the wall; the seam is the order they were built in
 * and nothing depends on it.
 */
export const CHOREO_FIELD_GROUP = {
  // StareConfig — the eye is not a round and its dials live here anyway: it
  // takes the panel away in the one sense that matters, and every number in it
  // is a count of beats a pair says something in (`config-stare.ts`).
  stareAwayBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareTellBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareLookBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareLookGrowBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareLookMaxBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareTurnBackBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareLidPullMilli: "THE STARE — an eye that freezes whoever it looks at",
  stareLidHoldBeats: "THE STARE — an eye that freezes whoever it looks at",
  stareReopenBeats: "THE STARE — an eye that freezes whoever it looks at",
  // DiastoleConfig — two cadences that do not divide each other, what a
  // chamber can take, and how long the bridge takes to split. Every one of
  // them is the pair's arithmetic rather than a difficulty knob: three against
  // five is a coincidence every fifteen beats, and a pair that changed either
  // number would be counting a different boss (`config-diastole.ts`).
  diastoleLeftBeats: "THE DIASTOLE — two hearts on two cadences, one each",
  diastoleRightBeats: "THE DIASTOLE — two hearts on two cadences, one each",
  diastoleRightAloneBeats: "THE DIASTOLE — two hearts on two cadences, one each",
  diastoleChamberHits: "THE DIASTOLE — two hearts on two cadences, one each",
  diastoleBurstBeats: "THE DIASTOLE — two hearts on two cadences, one each",
  // And the clamp's two: how long a thumb holds the alone chamber open, and
  // what a thumb on the wrong beat costs (`diastole-hand.ts`).
  diastoleClampBeats: "THE DIASTOLE — two hearts on two cadences, one each",
  diastoleSpasmBeats: "THE DIASTOLE — two hearts on two cadences, one each",
  // BatonConfig — the arm's length and every beat a handover takes. All of
  // them are the pair's cadence: a flight is a word and a press, a turn is a
  // look and a word, and a lock is *not you, not this beat* (`config-baton.ts`).
  batonSockets: "THE BATON — a bead passed down an arm, one seat a beat",
  batonFlightBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonTurnBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonTightTurnBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonTightenAfter: "THE BATON — a bead passed down an arm, one seat a beat",
  batonLockBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonSwingAfter: "THE BATON — a bead passed down an arm, one seat a beat",
  batonShedAfter: "THE BATON — a bead passed down an arm, one seat a beat",
  batonShedBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonSwellBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonMergeBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonMergeWindowBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonTwinAfter: "THE BATON — a bead passed down an arm, one seat a beat",
  batonFinalBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonDownBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonThreadBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  // ThroatConfig — five rings, a mouth a third of the way down, the inhale
  // and what it tightens to, and how far the mouth steps between inhales.
  // Every one of them is a deadline somebody has to say out loud rather than a
  // difficulty knob: shorten the inhale and the fight does not get harder, it
  // gets quiet (`config-throat.ts`).
  throatRings: "THE THROAT — the boss you answer by feeding it",
  throatMouthRow: "THE THROAT — the boss you answer by feeding it",
  throatInhaleBeats: "THE THROAT — the boss you answer by feeding it",
  throatTightBeats: "THE THROAT — the boss you answer by feeding it",
  throatSlideCols: "THE THROAT — the boss you answer by feeding it",
  throatQuickCols: "THE THROAT — the boss you answer by feeding it",
  throatEvertBeats: "THE THROAT — the boss you answer by feeding it",
  throatCinchBeats: "THE THROAT — the boss you answer by feeding it",
  throatHaulMilli: "THE THROAT — the boss you answer by feeding it",
  // UndertowConfig — how often it comes up, and how long each part of a push
  // takes. Every beat is a call: a bow is a column said, a stand is a maw
  // opened or a plate moved on a word (`config-undertow.ts`).
  undertowSingles: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowPairs: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowPairGap: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowTalls: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowBowBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowStandBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowRestBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowWidenMilli: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowWideMilli: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowUnseatBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowUnseatedBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowFreeBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowRiseBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowHoldBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowLastBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowDownBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowSlowBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  // OrreryConfig — three orbits, the beat they first come together on, what
  // the core does with the gap once a ring is off it, and what a turn of the
  // pilot's thumb costs. Every one but the last is a count the pair says out
  // loud; the last is a measure of a thumb (`config-orrery.ts`).
  orreryOuterOrgans: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryMiddleOrgans: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryInnerOrgans: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryFirstBeats: "THE ORRERY — three orbits, and neither of you can see all three",
  orrerySpitBeats: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryDebris: "THE ORRERY — three orbits, and neither of you can see all three",
  orrerySlowBeats: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryOutBeats: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryHandMilliPerOrgan: "THE ORRERY — three orbits, and neither of you can see all three",
  orreryCrackOrgans: "THE ORRERY — three orbits, and neither of you can see all three",
  // CandleConfig — how many steps the glow has, how long the dark takes to
  // fall, the counts it drifts, turns, eats and goes out on, and the two the
  // last step is played on: how far the thumb carries the flame off the wick
  // and how long the wick smokes. Every one a count the pair says aloud in
  // the dark (`config-candle.ts`).
  candleGlowSteps: "THE CANDLE — the boss fought in the dark",
  candleDarkBeats: "THE CANDLE — the boss fought in the dark",
  candleMoveBeats: "THE CANDLE — the boss fought in the dark",
  candleTurnBeats: "THE CANDLE — the boss fought in the dark",
  candleEatSteps: "THE CANDLE — the boss fought in the dark",
  candleLastSteps: "THE CANDLE — the boss fought in the dark",
  candlePinchMilli: "THE CANDLE — the boss fought in the dark",
  candleSmokeBeats: "THE CANDLE — the boss fought in the dark",
  candleOutBeats: "THE CANDLE — the boss fought in the dark",
  candleFlashSlowBeats: "THE CANDLE — the boss fought in the dark",
  // GorgeConfig — how wide the sack is, how many beads fill an intake, how
  // long a full one holds before venting, and when it spits and gorges
  // (`config-gorge.ts`).
  gorgeIntakes: "THE GORGE — the boss you hurt by not shooting",
  gorgeFullBeads: "THE GORGE — the boss you hurt by not shooting",
  gorgeVentBeats: "THE GORGE — the boss you hurt by not shooting",
  gorgeVentShots: "THE GORGE — the boss you hurt by not shooting",
  gorgeSpitRuptures: "THE GORGE — the boss you hurt by not shooting",
  gorgeSpitBeats: "THE GORGE — the boss you hurt by not shooting",
  gorgeMouthRuptures: "THE GORGE — the boss you hurt by not shooting",
  gorgeSinkPer: "THE GORGE — the boss you hurt by not shooting",
  gorgeOutBeats: "THE GORGE — the boss you hurt by not shooting",
  gorgePryBeats: "THE GORGE — the boss you hurt by not shooting",
  gorgePryFills: "THE GORGE — the boss you hurt by not shooting",
  // CurtainConfig — where the sheet hangs, how much of it must stay on the
  // field, how often the hem softens and how many lobes at a time, when it
  // is light, how often the core fires covered and naked, how soon it
  // re-rolls, how many hits end it and how long it holds the wave after
  // (`config-curtain.ts`).
  curtainRow: "THE CURTAIN — the boss that is in the way",
  curtainKeepCols: "THE CURTAIN — the boss that is in the way",
  curtainSoftBeats: "THE CURTAIN — the boss that is in the way",
  curtainSoftCount: "THE CURTAIN — the boss that is in the way",
  curtainLightLobes: "THE CURTAIN — the boss that is in the way",
  curtainFireBeats: "THE CURTAIN — the boss that is in the way",
  curtainNakedFireBeats: "THE CURTAIN — the boss that is in the way",
  curtainRerollBeats: "THE CURTAIN — the boss that is in the way",
  curtainPinBeats: "THE CURTAIN — the boss that is in the way",
  curtainLiftMilli: "THE CURTAIN — the boss that is in the way",
  curtainCoreHits: "THE CURTAIN — the boss that is in the way",
  curtainOutBeats: "THE CURTAIN — the boss that is in the way",
  // TasterConfig — how many blades the fan holds, the two windows it tastes
  // over, how long a blade grows, the counts that move the fight along, and
  // what each of the three thumbs on the fan costs (`config-taster.ts`).
  tasterBlades: "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterWindowBeats:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterFastWindowBeats:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterGrowBeats:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterThickMax:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterFanShorn:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterFanBlades:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterHurryShorn:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterEdgeBeats:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterClosedBlades:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterCrestCuts:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterPinBeats:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterWipeMilli:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterPryMilli:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterPryBeats:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterPryFills:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  tasterOutBeats:
    "THE TASTER — the boss that grows its armour in the colour you have been spending",
  // THE LEDGER and everything after it (`ship-fields-choreo-b.ts`).
  ...CHOREO_FIELD_GROUP_B,
} satisfies Record<string, GroupName>;
