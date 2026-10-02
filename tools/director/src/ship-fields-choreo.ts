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
  stareRestBeats: "THE STARE — an eye that opens on the beat",
  stareTurns: "THE STARE — an eye that opens on the beat",
  stareChargeBeats: "THE STARE — an eye that opens on the beat",
  stareLashBeatsMilli: "THE STARE — an eye that opens on the beat",
  stareLashesFirst: "THE STARE — an eye that opens on the beat",
  stareLashPullMilli: "THE STARE — an eye that opens on the beat",
  stareRiseBeats: "THE STARE — an eye that opens on the beat",
  stareCalmBeats: "THE STARE — an eye that opens on the beat",
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
  batonSwellStrips: "THE BATON — a bead passed down an arm, one seat a beat",
  batonMergeBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonMergeWindowBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonTwinAfter: "THE BATON — a bead passed down an arm, one seat a beat",
  batonFinalBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonDownBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  batonThreadBeats: "THE BATON — a bead passed down an arm, one seat a beat",
  // ThroatConfig — five rings, where the mouth may be carried, and the pump:
  // a stroke, what it adds, what a tick takes back, and the circle it opens.
  // The three pump numbers are one sentence and change together
  // (`config-throat.ts`).
  throatRings: "THE THROAT — the boss you answer by feeding it",
  throatEvertBeats: "THE THROAT — the boss you answer by feeding it",
  throatSideMarginMilli: "THE THROAT — the boss you answer by feeding it",
  throatTopMarginMilli: "THE THROAT — the boss you answer by feeding it",
  throatStrokeMilli: "THE THROAT — the boss you answer by feeding it",
  throatPumpGainMilli: "THE THROAT — the boss you answer by feeding it",
  throatPumpDecayMilli: "THE THROAT — the boss you answer by feeding it",
  throatMinRadiusMilli: "THE THROAT — the boss you answer by feeding it",
  throatMaxRadiusMilli: "THE THROAT — the boss you answer by feeding it",
  throatRefuseTicks: "THE THROAT — the boss you answer by feeding it",
  // UndertowConfig — how long a level lasts, how many lobes each stands, and
  // how long each stage of a lobe takes. Every beat is a call: a bow is a
  // column said, a stand is a colour answered (`config-undertow.ts`).
  undertowLevelBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowOneLobes: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowTwoLobes: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowThreeLobes: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowBowBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowStandBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowTallBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowRestBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  undertowEbbBeats: "THE UNDERTOW — the boss under the floor, answered downward",
  // GorgeConfig — where the bubbles hang, how wide the ring is, the beats
  // between levels and between turns, the taps that open the bottom bubble,
  // and the beats it is held for at the end (`config-gorge.ts`).
  gorgeRow: "THE GORGE — bubbles one of you counts and the other colours",
  gorgeRingRows: "THE GORGE — bubbles one of you counts and the other colours",
  gorgeLevelGapBeats: "THE GORGE — bubbles one of you counts and the other colours",
  gorgeTurnBeats: "THE GORGE — bubbles one of you counts and the other colours",
  gorgeOpenTaps: "THE GORGE — bubbles one of you counts and the other colours",
  gorgeOutBeats: "THE GORGE — bubbles one of you counts and the other colours",
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
