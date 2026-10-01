import type { GroupName } from "./ship-groups.js";

/**
 * **The choreographed bosses' dials, the fourth page** — THE CYST, THE
 * DAVIT, THE HALTER, THE CAPSTAN and every boss built after them.
 *
 * Cut on 27 September 2026, when THE BURGEE's eight numbers would have taken
 * `ship-fields-choreo-c.ts` past the 250-line wall. The seam is page three's:
 * **the order they were built in**. Spread into `CHOREO_FIELD_GROUP_C` in
 * place, so the exhaustiveness check over `ROUND_FIELD_GROUP` is unchanged
 * (`ship-fields.ts`).
 *
 * THE CAPSTAN and THE GALL came over the same day, when THE HASP's story
 * brought ten more to page three: the last bosses on the page go, never the
 * boss being worked on. THE HALTER came over on 29 September 2026, when THE
 * SLING's cool took page three past the wall again, and THE CYST and THE
 * DAVIT on the same day, when THE SPOOL's story brought nine.
 */
export const CHOREO_FIELD_GROUP_D = {
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
  davitSteerDegreesPerTile: "THE DAVIT — the boss one hand steers for the other to loose",
  // HalterConfig — the alarm before the first step, the pause between steps,
  // how long a seat must send nothing, how long the pair must hold, and the
  // spent seam (`config-halter.ts`).
  halterAlarmBeats: "THE HALTER — the boss one hand keeps still for the other to open",
  halterPauseBeats: "THE HALTER — the boss one hand keeps still for the other to open",
  halterRestThreshold: "THE HALTER — the boss one hand keeps still for the other to open",
  halterHoldBeats: "THE HALTER — the boss one hand keeps still for the other to open",
  halterSpentBeats: "THE HALTER — the boss one hand keeps still for the other to open",
  // CapstanConfig — the rust before the first step, the rest between steps,
  // how far a pull rocks the cradle, the reversals that wear a band bright,
  // the beats a hold needs, and the spent drum (`config-capstan.ts`).
  capstanRustBeats: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanRestBeats: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanPullMilli: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanWearThreshold: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanHoldBeats: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanOpenBeats: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  // GallConfig — the slack before the first step, the rest between, the beats
  // a close is kept shut, the open and shut gaps, and the flat seam (`config-gall.ts`).
  gallSlackBeats: "THE GALL — the boss that moves the moment it is closed",
  gallRestBeats: "THE GALL — the boss that moves the moment it is closed",
  gallShutBeats: "THE GALL — the boss that moves the moment it is closed",
  gallOpenMilli: "THE GALL — the boss that moves the moment it is closed",
  gallShutMilli: "THE GALL — the boss that moves the moment it is closed",
  gallFlatBeats: "THE GALL — the boss that moves the moment it is closed",
  // BurgeeConfig — the slack before the first step, the rest between, the
  // spent flag, the span and the default sweep, how near the column a tap
  // lands, and how long a freeze and a draw last (`config-burgee.ts`).
  burgeeSlackBeats: "THE BURGEE — a flag stilled by one seat and caught by the other",
  burgeeRestBeats: "THE BURGEE — a flag stilled by one seat and caught by the other",
  burgeeSpentBeats: "THE BURGEE — a flag stilled by one seat and caught by the other",
  burgeeSpanMilli: "THE BURGEE — a flag stilled by one seat and caught by the other",
  burgeeSweepMilli: "THE BURGEE — a flag stilled by one seat and caught by the other",
  burgeeMarkMilli: "THE BURGEE — a flag stilled by one seat and caught by the other",
  burgeeFreezeBeats: "THE BURGEE — a flag stilled by one seat and caught by the other",
  burgeeDrawBeats: "THE BURGEE — a flag stilled by one seat and caught by the other",
  // FlueConfig — the slack before the first step, the pause between, the
  // open damper, the span and the drift, and the beats of nothing that steady
  // the ember (`config-flue.ts`).
  flueSlackBeats: "THE FLUE — an ember one seat keeps still for the other to tap",
  fluePauseBeats: "THE FLUE — an ember one seat keeps still for the other to tap",
  flueSpentBeats: "THE FLUE — an ember one seat keeps still for the other to tap",
  flueSpanMilli: "THE FLUE — an ember one seat keeps still for the other to tap",
  flueDriftMilli: "THE FLUE — an ember one seat keeps still for the other to tap",
  flueRestThreshold: "THE FLUE — an ember one seat keeps still for the other to tap",
  // GovernorConfig — the slack before the first step, the rest between, the
  // spent hub, the idle pace, the mark's half-width, and how hot the needle
  // runs off the brake and how fast it climbs and eases (`config-governor.ts`).
  governorSlackBeats: "THE GOVERNOR — a needle one seat brakes for the other to tap",
  governorRestBeats: "THE GOVERNOR — a needle one seat brakes for the other to tap",
  governorSpentBeats: "THE GOVERNOR — a needle one seat brakes for the other to tap",
  governorIdleMilli: "THE GOVERNOR — a needle one seat brakes for the other to tap",
  governorMarkMilli: "THE GOVERNOR — a needle one seat brakes for the other to tap",
  governorHotMilli: "THE GOVERNOR — a needle one seat brakes for the other to tap",
  governorClimbMilli: "THE GOVERNOR — a needle one seat brakes for the other to tap",
  governorEaseMilli: "THE GOVERNOR — a needle one seat brakes for the other to tap",
  // LampreyConfig — the swim in, the pull off between bites, the recoil and
  // the fall, how deep a chew goes and how deep is full, and how near the
  // jaw a thumb has to be (`config-lamprey.ts`).
  lampreyEnterBeats: "THE LAMPREY — a jaw one of you pins for the other to pull teeth from",
  lampreyLooseBeats: "THE LAMPREY — a jaw one of you pins for the other to pull teeth from",
  lampreyRecoilBeats: "THE LAMPREY — a jaw one of you pins for the other to pull teeth from",
  lampreySpentBeats: "THE LAMPREY — a jaw one of you pins for the other to pull teeth from",
  lampreyBiteStepMilli: "THE LAMPREY — a jaw one of you pins for the other to pull teeth from",
  lampreyBiteFullMilli: "THE LAMPREY — a jaw one of you pins for the other to pull teeth from",
  lampreyGripCols: "THE LAMPREY — a jaw one of you pins for the other to pull teeth from",
} satisfies Record<string, GroupName>;
