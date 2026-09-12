import { DEFAULT_CONFIG } from "../../packages/sim/src/config.js";

/**
 * The `SimConfig` fields no document names, frozen as they stood on 12 September
 * 2026 — and the one reason all 158 of them share.
 *
 * `doc-drift.test.ts` next door holds every field of `SimConfig` to being named
 * somewhere under `docs/spec/` or in a `docs/*.md`, because a tunable nobody ever
 * wrote a sentence about is a number the next session has to reverse-engineer
 * from whatever reads it. 76 of the 234 fields pass, and the line between the two
 * groups is sharper than it has any right to be: **every field declared in
 * `packages/sim/src/config.ts` itself is named in a document** — the grid, the
 * beat, the windows, the input delay, the hull's limits and its two damage
 * figures, the run's clock — and **not one of the 158 below is**.
 *
 * They are all the same kind of thing: a per-creature or per-round number
 * declared in a `config-<thing>.ts` of its own — how many beads a strand has,
 * how hard a pinball wall gives back, what a warden plate scores. Their
 * *mechanic* is specified: `docs/spec/` has a sheet for every one of these
 * bodies and rounds, and the sheet argues about what the thing does rather than
 * about which field holds the figure. So the miss is not a mechanic nobody wrote
 * down; it is a name nobody quoted.
 *
 * **Whether that is worth 158 sentences is the owner's to say**, and the
 * question is in `docs/queue.md` on an `Asks:` line with the three options it
 * picks between. Meanwhile this list does the one thing that cannot wait: it
 * freezes today's debt, so a field added tomorrow is a red test rather than the
 * hundred and fifty-ninth miss. `damageCreature` was the hundred and fifty-ninth
 * when this was written, and it got its sentence instead
 * (`docs/spec/systems.md`, under the damage table whose figures are its own).
 *
 * Held honest from both ends: a name that leaves `SimConfig` has to leave this
 * list, and so does a name a document starts naming. Shrinking it is the point —
 * write the sentence, delete the name.
 */
export const UNDOCUMENTED_CONFIG_FIELDS: readonly string[] = [
  "balloonClimbBeats",
  "balloonRiseRows",
  "balloonSplits",
  "balloonSwellBeats",
  "beatboxBeats",
  "beatboxFallBeats",
  "beatboxWindowMs",
  "caromCols",
  "caromRows",
  "choirFuseBeats",
  "choirPullMilli",
  "choirWindowBeats",
  "chuteFallBeats",
  "chuteRiseRows",
  "claspBreakBeats",
  "coilCols",
  "coilDropRows",
  "coilJumpBeats",
  "crawlerSegments",
  "crawlerStepBeats",
  "crystalCols",
  "crystalRows",
  "depthHaze",
  "depthNearScale",
  "echoFallBeats",
  "echoSplitBeats",
  "echoSplits",
  "fenceGapCols",
  "gaugeCallRestBeats",
  "gaugeDriftMilli",
  "gaugeMarks",
  "gaugeRoundBeats",
  "gaugeSpanMilli",
  "gaugeTurnMilli",
  "ghostChargeLaps",
  "ghostCrossCols",
  "ghostCrossRow",
  "ghostDiveTiles",
  "gyreSinkLaps",
  "gyreSpinCapMilli",
  "gyreSpinGainMilli",
  "gyreSpinMilli",
  "gyreSuckMs",
  "gyreSuckSpinMilli",
  "handleRadiusMilli",
  "hitHeightMilli",
  "lidCordMilli",
  "lidTautMilli",
  "lureBlastPlaces",
  "malfunctionEveryBeats",
  "mazeDragBreakMilli",
  "mazeDragMilliPerTile",
  "mazeRow",
  "mazeSnapMilli",
  "mazeSpanMilli",
  "mazeTurnMilli",
  "mirrorRow",
  "pinballBallMilli",
  "pinballCatchMilli",
  "pinballCols",
  "pinballGravityMilli",
  "pinballLaunchMilli",
  "pinballPegMilli",
  "pinballPowerMilli",
  "pinballRows",
  "pinballSweepMilli",
  "pinballWallPermille",
  "pinballWeakPermille",
  "podCrossTilesPerBeat",
  "podHomeTiles",
  "podHomeTilesPerBeat",
  "pulseGoodMilli",
  "pulseGoodTicks",
  "pulseLeadTicks",
  "pulseMeterMaxMilli",
  "pulseMeterStartMilli",
  "pulseMissMilli",
  "pulsePerfectMilli",
  "pulsePerfectTicks",
  "pulseStepTicks",
  "pulseStrayMilli",
  "queenEggGrowShare",
  "queenRow",
  "recoilBounces",
  "recoilRows",
  "rindLayers",
  "rockCrossCols",
  "snakeCols",
  "snakeFireRestBeats",
  "snakeGrowTiles",
  "snakeMawRestTicks",
  "snakeMawTicks",
  "snakeRows",
  "snakeStartTiles",
  "strandBeads",
  "strandFallBeats",
  "throbFaceMilli",
  "vanePins",
  "veerMaxDist",
  "veerRowsApart",
  "veilArmourMs",
  "volleyPlates",
  "volleyRiseBeats",
  "volleyRiseRows",
  "wardenHangRows",
];

/** Every name above is still a field. A list that outlived its fields is a lie. */
export function deadAllowances(): string[] {
  const fields = new Set(Object.keys(DEFAULT_CONFIG));
  return UNDOCUMENTED_CONFIG_FIELDS.filter((f) => !fields.has(f));
}
