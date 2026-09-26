import type { GroupName } from "./ship-groups.js";

/**
 * **The choreographed bosses' dials, the third page** — THE SPOOL and every
 * boss built after it, THE HASP first among them the same day.
 *
 * Cut on 22 September 2026, when THE SPOOL's twelve numbers would have left
 * `ship-fields-choreo-b.ts` seven lines under the 250-line wall and the next
 * boss's dozen with nowhere to land. The seam is the one page two was itself
 * cut along: **the order they were built in**, which nothing depends on, and
 * the boss being worked on keeps its own block rather than being handed
 * across. Spread into `CHOREO_FIELD_GROUP_B` in place, so the exhaustiveness
 * check over `ROUND_FIELD_GROUP` is unchanged — a `SimConfig` field missing
 * from *any* page is still a compile error there (`ship-fields.ts`).
 */
export const CHOREO_FIELD_GROUP_C = {
  // SpoolConfig — how far the brake travels, the two ends of what a depth on
  // it is worth in line a beat, the widest zone and the narrowest, the beats
  // a leg runs and the grace at the head of one, and the four the picture is
  // given: taut, slipped, easing and adrift (`config-spool.ts`).
  //
  // The ribs are not here, because four is the silhouette and a spool hung
  // with five would be a different spool (`sim/spool.ts`, `SPOOL_RIBS`). Nor is the rate a leg asks for — that is
  // rolled off the seed between these two ends, so a pair cannot learn a
  // wave's numbers by heart.
  spoolReachMilli: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  spoolRateFastMilli: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  spoolRateSlowMilli: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  spoolZoneWideMilli: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  spoolZoneNarrowMilli:
    "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  spoolLegBeats: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  spoolGraceBeats: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  spoolTautBeats: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  spoolSlipBeats: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  spoolEaseBeats: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  spoolSlowBeats: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  spoolSlackBeats: "THE SPOOL — the boss where the line runs out at the speed one of you reads",
  // HaspConfig — how far the latch travels and the depth it counts as held
  // at, how long each phase holds, the fuse and the shorter last one, the
  // cooling, how far the wheel has to be wound and how much further each
  // clasp asks, and the loose bolt's patience (`config-hasp.ts`).
  haspReachMilli: "THE HASP — the boss where one of you only has to hold on, and cannot",
  haspGripMilli: "THE HASP — the boss where one of you only has to hold on, and cannot",
  haspStillBeats: "THE HASP — the boss where one of you only has to hold on, and cannot",
  haspHoldBeats: "THE HASP — the boss where one of you only has to hold on, and cannot",
  haspLastHoldBeats: "THE HASP — the boss where one of you only has to hold on, and cannot",
  haspBurnBeats: "THE HASP — the boss where one of you only has to hold on, and cannot",
  haspWindMilli: "THE HASP — the boss where one of you only has to hold on, and cannot",
  haspWindStepMilli: "THE HASP — the boss where one of you only has to hold on, and cannot",
  haspSwingBeats: "THE HASP — the boss where one of you only has to hold on, and cannot",
  haspBoltBeats: "THE HASP — the boss where one of you only has to hold on, and cannot",
  haspClearBeats: "THE HASP — the boss where one of you only has to hold on, and cannot",
  // RatchetConfig — how far the catch travels and the depth it counts as
  // set at, the still, each window and how much shorter the next one is,
  // the climb, the loose bolt's patience and the open rack's hang
  // (`config-ratchet.ts`). Seven teeth and five clean are the silhouette.
  ratchetReachMilli: "THE RATCHET — the boss where every step you take stays taken",
  ratchetGripMilli: "THE RATCHET — the boss where every step you take stays taken",
  ratchetStillBeats: "THE RATCHET — the boss where every step you take stays taken",
  ratchetWindowBeats: "THE RATCHET — the boss where every step you take stays taken",
  ratchetWindowStepBeats: "THE RATCHET — the boss where every step you take stays taken",
  ratchetClimbBeats: "THE RATCHET — the boss where every step you take stays taken",
  ratchetBoltBeats: "THE RATCHET — the boss where every step you take stays taken",
  ratchetOpenBeats: "THE RATCHET — the boss where every step you take stays taken",
  // MantleConfig — the floor either handle must clear before it counts toward
  // the sum, how long the shell hangs dark before the first handles light,
  // the hazard spark's patience, THE SLOW on every shear, the alternating
  // finish's own taps, and the dark core's hang (`config-mantle.ts`). The four
  // thresholds are not here, because they are the wave's own
  // (`mantle-script.ts`).
  mantleFloorMilli: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleStillBeats: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleSparkBeats: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleSlowBeats: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleHeartbeatTaps: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleOpenBeats: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleBraceBeats: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleLastBeats: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleBuckleBeats: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleBuckleWindowBeats:
    "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleVentBeats: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleCrossBeats: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  mantleTurnBeats: "THE MANTLE — the boss both hands have to pull at once, or neither counts",
  // KeelConfig — how many segments, and the patience of every row of the
  // beat list: the joint's window per movement, the rest, the split, the
  // socket, the flip, the marrow, the rigid hold, the rock's fall, the
  // cooldown and the end (`config-keel.ts`).
  // The socket's colour and the fast run's order are the wave's own.
  keelSegments: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelStillBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelJointBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelRestBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelSplitBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelSocketBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelLastJointBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelTempoBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelRigidBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelRockBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelOpenBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelFlipBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelChordBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelMarrowBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelCoolBeats: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  keelCoolFlares: "THE KEEL — the boss whose next joint is whichever thumb is nearer",
  // ValveConfig — how near the mark counts, the lap, the depth of a pull,
  // the kick, and the patience of every row of the beat list
  // (`config-valve.ts`). Where the marks sit is the wave's own.
  valveStillBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valveNearMilli: "THE VALVE — the boss one hand turns and the other hand stops",
  valveLapMilli: "THE VALVE — the boss one hand turns and the other hand stops",
  valveFreezeBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valveFreezeFastBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valvePullBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valvePullFastBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valvePullMilli: "THE VALVE — the boss one hand turns and the other hand stops",
  valveKickMilli: "THE VALVE — the boss one hand turns and the other hand stops",
  valveListBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valveSparkBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valveOpenBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valveJetBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valveBraceBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valveShudderBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valveWipeRubs: "THE VALVE — the boss one hand turns and the other hand stops",
  valveWipeBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valveSealBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  valveStrainBeats: "THE VALVE — the boss one hand turns and the other hand stops",
  // SeamConfig — how long each kind of step stays lit, and the rests
  // around them (`config-seam.ts`). The script is the wave's own.
  seamStillBeats: "THE SEAM — the boss answered with the cannon and the shield, in order",
  seamPointBeats: "THE SEAM — the boss answered with the cannon and the shield, in order",
  seamGritBeats: "THE SEAM — the boss answered with the cannon and the shield, in order",
  seamRockBeats: "THE SEAM — the boss answered with the cannon and the shield, in order",
  seamBothBeats: "THE SEAM — the boss answered with the cannon and the shield, in order",
  seamBlindBeats: "THE SEAM — the boss answered with the cannon and the shield, in order",
  seamGlowBeats: "THE SEAM — the boss answered with the cannon and the shield, in order",
  seamGlowShots: "THE SEAM — the boss answered with the cannon and the shield, in order",
  seamRestBeats: "THE SEAM — the boss answered with the cannon and the shield, in order",
  seamSplitBeats: "THE SEAM — the boss answered with the cannon and the shield, in order",
  // OculusConfig — the rests around the steps, the grace a hold is given on
  // top of its count, and the shatter (`config-oculus.ts`). The script is the
  // wave's own.
  oculusStillBeats: "THE OCULUS — the boss both hands hold shut, then shoot into",
  oculusRestBeats: "THE OCULUS — the boss both hands hold shut, then shoot into",
  oculusGraceBeats: "THE OCULUS — the boss both hands hold shut, then shoot into",
  oculusShatterBeats: "THE OCULUS — the boss both hands hold shut, then shoot into",
  // ViseConfig — the rests around the steps, the grace a pinch is given on
  // top of its count, the split, and what open and shut are (`config-vise.ts`).
  // The script is the wave's own.
  viseStillBeats: "THE VISE — the boss two pinches crack, then shoot into",
  viseRestBeats: "THE VISE — the boss two pinches crack, then shoot into",
  viseGraceBeats: "THE VISE — the boss two pinches crack, then shoot into",
  viseSplitBeats: "THE VISE — the boss two pinches crack, then shoot into",
  viseOpenMilli: "THE VISE — the boss two pinches crack, then shoot into",
  viseShutMilli: "THE VISE — the boss two pinches crack, then shoot into",
  // RimeConfig — the rests around the steps, the shatter, and how much frost
  // a reversal shaves, a beat regrows and a first wipe leaves (`config-rime.ts`).
  // The script is the wave's own.
  rimeStillBeats: "THE RIME — the boss two rubs wipe clear, then shoot into",
  rimeRestBeats: "THE RIME — the boss two rubs wipe clear, then shoot into",
  rimeShatterBeats: "THE RIME — the boss two rubs wipe clear, then shoot into",
  rimeShaveMilli: "THE RIME — the boss two rubs wipe clear, then shoot into",
  rimeRegrowMilli: "THE RIME — the boss two rubs wipe clear, then shoot into",
  rimeFilmMilli: "THE RIME — the boss two rubs wipe clear, then shoot into",
  // TrivetConfig — the rests around the steps, the grace a chord is given on
  // top of its count, and the collapse (`config-trivet.ts`). The script is the
  // wave's own, pads and all.
  trivetStillBeats: "THE TRIVET — the boss two chords plant, then shoot into",
  trivetRestBeats: "THE TRIVET — the boss two chords plant, then shoot into",
  trivetGraceBeats: "THE TRIVET — the boss two chords plant, then shoot into",
  trivetCollapseBeats: "THE TRIVET — the boss two chords plant, then shoot into",
  // PlumbConfig — the rests around the steps, the grace a level is given on
  // top of its count, and the swing free (`config-plumb.ts`). The script is
  // the wave's own, ranges and all.
  plumbStillBeats: "THE PLUMB — the boss two phones hold level, then shoot into",
  plumbRestBeats: "THE PLUMB — the boss two phones hold level, then shoot into",
  plumbGraceBeats: "THE PLUMB — the boss two phones hold level, then shoot into",
  plumbFreeBeats: "THE PLUMB — the boss two phones hold level, then shoot into",
  // SlingConfig — the rests around the steps, the grace a draw is given on
  // top of its count, and the snap free (`config-sling.ts`). The script is
  // the wave's own, aims and all.
  slingStillBeats: "THE SLING — the boss two draws loose, then shoot into",
  slingRestBeats: "THE SLING — the boss two draws loose, then shoot into",
  slingGraceBeats: "THE SLING — the boss two draws loose, then shoot into",
  slingFreeBeats: "THE SLING — the boss two draws loose, then shoot into",
  // GrindstoneConfig — the rests around the steps, the grit a reversal
  // shaves and a beat regrows, the film a second pass starts from, the grace
  // a clamp is given, and the snap free (`config-grindstone.ts`).
  grindstoneStillBeats: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneRestBeats: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneFreeBeats: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneShaveMilli: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneRegrowMilli: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneFilmMilli: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneGraceBeats: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  // CystConfig — the rests around the steps, the tap's window, the grace a
  // stilled flank is given, the split, and the gaps a flank rests at and
  // counts as shut below (`config-cyst.ts`).
  cystStillBeats: "THE CYST — the boss one hand stills for the other to crack",
  cystRestBeats: "THE CYST — the boss one hand stills for the other to crack",
  cystTapBeats: "THE CYST — the boss one hand stills for the other to crack",
  cystGraceBeats: "THE CYST — the boss one hand stills for the other to crack",
  cystSplitBeats: "THE CYST — the boss one hand stills for the other to crack",
  cystOpenMilli: "THE CYST — the boss one hand stills for the other to crack",
  cystShutMilli: "THE CYST — the boss one hand stills for the other to crack",
  // DavitConfig — the rests around the steps, the grace a swing is given
  // past its beats, the spent boom, and how fast an unsteered boom swings
  // back (`config-davit.ts`).
  davitStillBeats: "THE DAVIT — the boss one hand steers for the other to loose",
  davitRestBeats: "THE DAVIT — the boss one hand steers for the other to loose",
  davitGraceBeats: "THE DAVIT — the boss one hand steers for the other to loose",
  davitSpentBeats: "THE DAVIT — the boss one hand steers for the other to loose",
  davitDriftMilli: "THE DAVIT — the boss one hand steers for the other to loose",
  // HalterConfig — the alarm before the first step, the pause between steps,
  // how long a seat must send nothing, how long the pair must hold, and the
  // spent seam (`config-halter.ts`).
  halterAlarmBeats: "THE HALTER — the boss one hand keeps still for the other to open",
  halterPauseBeats: "THE HALTER — the boss one hand keeps still for the other to open",
  halterRestThreshold: "THE HALTER — the boss one hand keeps still for the other to open",
  halterHoldBeats: "THE HALTER — the boss one hand keeps still for the other to open",
  halterSpentBeats: "THE HALTER — the boss one hand keeps still for the other to open",
} satisfies Record<string, GroupName>;
