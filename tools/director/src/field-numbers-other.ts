import type { SimConfig } from "@neon-spore/sim";

/**
 * The `SimConfig` fields behind every row that is not a drag — a hold, a
 * press, a tap on the mark, a shake, a mark that reads many gestures. The
 * drag rows are `field-numbers-drag.ts`; `field-numbers.ts` draws both.
 */
export const OTHER_NUMBERS: Readonly<Record<string, readonly (keyof SimConfig)[]>> = {
  // Every wave's.
  GRIP: ["gripSlowPermille"],
  "THE PUSH": ["gripPushMilli", "gripPushPauseBeats"],
  "THE MAW TAP": ["intakeWindowMs"],
  "THE SHIELD TRIGGER": ["guardWindowMs", "shieldPushBeats", "shieldPushRows"],
  "THE SCOUT'S LINE": ["scoutReelMilli"],
  "THE GUIDE'S HOLD": ["readyHoldMs"],
  // Held.
  "THE SURGE'S BULB": [
    "surgeChargeMilli",
    "surgeDecayMilli",
    "surgeNotchMilli",
    "surgeNotchStepMilli",
    "surgeWindowMilli",
    "surgeBurstMilli",
  ],
  "THE ANTIPHON'S ORGAN": ["antiphonTurnBeats", "antiphonSpringRate"],
  "THE GAUGE'S BAND": ["gaugeBindMarks", "gaugeBoundSpanMilli"],
  "THE LEAD'S STALK": ["leadHoldBeats", "leadStillBeats"],
  "THE WELL'S SEAM": ["wellHoldBeats"],
  "THE VANE'S ARM": ["vanePinBeats"],
  "THE LEDGER'S PLUG": ["ledgerPlugBeats"],
  "THE FLEET'S PLUME": ["fleetFloodBeats"],
  "THE LAMPREY'S TAIL": ["lampreyTailPullMilli"],
  "THE SCOUT'S PRIME": ["scoutHeavyMotes"],
  // Both seats holding at once.
  "THE BATON'S DRAW": ["batonMergeBeats", "batonMergeWindowBeats"],
  "THE PULSE'S ARREST": ["pulseArrestMilli", "pulseArrestGainMilli", "pulseFlutterMilli"],
  "THE OCULUS'S LEFT LEAF": ["oculusGraceBeats", "oculusLeverRadiusMilli"],
  "THE OCULUS'S RIGHT LEAF": ["oculusGraceBeats", "oculusLeverRadiusMilli"],
  "THE HIVE'S WRING": ["hivePinchBeats", "hiveSwellBeats"],
  // A tap on the mark, in time.
  "THE VALVE'S PIN": ["valvePullMilli", "valvePullBeats", "valveJetBeats", "valveBraceBeats"],
  "THE GOVERNOR'S NEEDLE": ["governorMarkMilli"],
  "THE TASTER'S PIN": ["tasterPinBeats"],
  "THE UNDERTOW'S TAP": ["undertowTallBeats", "undertowStandBeats"],
  // Pressed.
  "THE PULSE'S BRACE": ["pulseFlutterMilli", "pulseBracePermille"],
  "THE MANTLE'S CORE": ["mantleHeartbeatTaps"],
  "THE KEEL'S JOINT": ["keelJointBeats", "keelLastJointBeats", "keelChordBeats", "keelCoolFlares"],
  "THE RATCHET'S PAWL": ["ratchetWindowBeats", "ratchetWindowStepBeats"],
  "THE BATON'S STRIP": ["batonSwellStrips", "batonSwellBeats", "batonLockBeats"],
  "THE GORGE'S TAP": ["gorgeOpenTaps", "gorgeTurnBeats"],
  "THE LIGHT": ["darkLitBeats", "darkLitRadiusMilli"],
  "THE TRAPEZE'S ALIEN": ["trapezeLockBeats"],
  // Shaken.
  "THE CHOIR'S LEFT ARROW": ["choirPullMilli", "choirWindowBeats"],
  "THE CHOIR'S RIGHT ARROW": ["choirPullMilli", "choirWindowBeats"],
  // One mark, many gestures.
  "THE INSTAR'S MARKS": ["instarSwipeMilli", "instarTogetherBeats"],
  "THE MIRROR'S LOBES": ["mirrorCarryMilli", "mirrorHoldBeats", "mirrorHoldWindowBeats"],
  "THE QUEEN'S MARKS": ["queenHoldBeats"],
  "THE GALL'S TAPS AND PULL": ["gallPullMilli"],
};
