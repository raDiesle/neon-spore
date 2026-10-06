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
 * DAVIT on the same day, when THE SPOOL's story brought nine. THE GRINDSTONE
 * came over on 2 October 2026, when THE OCULUS's levers brought one more.
 */
export const CHOREO_FIELD_GROUP_D = {
  // GrindstoneConfig — the rests around the steps, the grit a reversal
  // shaves and a beat regrows, the film a second pass starts from, the grace
  // a clamp is given, the spent axle's fade and the snap free
  // (`config-grindstone.ts`).
  grindstoneStillBeats: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneRestBeats: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneFreeBeats: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneShaveMilli: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneRegrowMilli: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneFilmMilli: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneGraceBeats: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneFadeBeats: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
  grindstoneFadeJars: "THE GRINDSTONE — the boss two thumbs grind true, then shoot into",
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
  // FlueConfig — the slack before the first level, the pause between, the
  // fade once spent, the slot's span, the row, how near a shot must meet
  // the ember, and the shots a level gives (`config-flue.ts`).
  flueSlackBeats: "THE FLUE — an ember one seat sees and the other shoots",
  fluePauseBeats: "THE FLUE — an ember one seat sees and the other shoots",
  flueSpentBeats: "THE FLUE — an ember one seat sees and the other shoots",
  flueSpanMilli: "THE FLUE — an ember one seat sees and the other shoots",
  flueRow: "THE FLUE — an ember one seat sees and the other shoots",
  flueHitMilli: "THE FLUE — an ember one seat sees and the other shoots",
  flueShots: "THE FLUE — an ember one seat sees and the other shoots",
  // GovernorConfig — the slack before the first step, the rest between, the
  // spent hub, the idle pace, a mark's half-width and how near the bottom a
  // shot's needle must be (`config-governor.ts`).
  governorSlackBeats: "THE GOVERNOR — a needle each of you taps on your own mark",
  governorRestBeats: "THE GOVERNOR — a needle each of you taps on your own mark",
  governorSpentBeats: "THE GOVERNOR — a needle each of you taps on your own mark",
  governorIdleMilli: "THE GOVERNOR — a needle each of you taps on your own mark",
  governorMarkMilli: "THE GOVERNOR — a needle each of you taps on your own mark",
  governorDownMilli: "THE GOVERNOR — a needle each of you taps on your own mark",
  // LampreyConfig — the swim in, the leap, the recoil and the fall, the rows
  // it may land on, how long the tail lies, and how far the head and the tail
  // are pulled (`config-lamprey.ts`).
  lampreyEnterBeats: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyLeapBeats: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyRecoilBeats: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreySpentBeats: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyRowTop: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyRowBottom: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyTailTiles: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyHeadPullMilli:
    "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyTailPullMilli:
    "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  // MimicConfig — the slap into shape, how long a wrong sign is worn, the
  // flinch, when a changing sign changes, the reaches that strike the hull,
  // the clench and the fall (`config-mimic.ts`).
  mimicEnterBeats: "THE MIMIC — a sign one of you reads for the other to draw",
  mimicMimicBeats: "THE MIMIC — a sign one of you reads for the other to draw",
  mimicPeelBeats: "THE MIMIC — a sign one of you reads for the other to draw",
  mimicChangeBeats: "THE MIMIC — a sign one of you reads for the other to draw",
  mimicFrameRow: "THE MIMIC — a sign one of you reads for the other to draw",
  mimicCoreRow: "THE MIMIC — a sign one of you reads for the other to draw",
  mimicReaches: "THE MIMIC — a sign one of you reads for the other to draw",
  mimicClenchBeats: "THE MIMIC — a sign one of you reads for the other to draw",
  mimicSpentBeats: "THE MIMIC — a sign one of you reads for the other to draw",
} satisfies Record<string, GroupName>;
