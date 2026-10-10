import type { GroupName } from "./ship-groups.js";

/**
 * **The choreographed bosses' dials, the fourth page** — THE CAPSTAN and
 * every boss built after them.
 *
 * Cut on 27 September 2026, when THE TRAPEZE's eight numbers would have taken
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
 * THE CYST's and THE GRINDSTONE's left the game with them on 8 October 2026.
 */
export const CHOREO_FIELD_GROUP_D = {
  // CapstanConfig — the rust before the first step, the rest between steps,
  // how far a pull rocks the cradle, the reversals that wear a band bright,
  // the beats a hold needs, and the spent drum (`config-capstan.ts`).
  capstanRustBeats: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanRestBeats: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanPullMilli: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanWearThreshold: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanHoldBeats: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanOpenBeats: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  // GallConfig — the slack before the first step, the rest between, the
  // leap's flight, the pull's reach and the flat seam (`config-gall.ts`).
  gallSlackBeats: "THE GALL — the alien tapped, pulled and thrown across the hull",
  gallRestBeats: "THE GALL — the alien tapped, pulled and thrown across the hull",
  gallLeapBeats: "THE GALL — the alien tapped, pulled and thrown across the hull",
  gallPullMilli: "THE GALL — the alien tapped, pulled and thrown across the hull",
  gallFlatBeats: "THE GALL — the alien tapped, pulled and thrown across the hull",
  // TrapezeConfig — the swing coming down, the rest between levels and the
  // spent swing; its ropes, its period and its reach; a push, a brake, the
  // damping and what a gong leaves; a swipe's run, a shot's reach and the
  // lock's length (`config-trapeze.ts`).
  trapezeEnterBeats: "THE TRAPEZE — an alien swung up to a gong",
  trapezeRestBeats: "THE TRAPEZE — an alien swung up to a gong",
  trapezeSpentBeats: "THE TRAPEZE — an alien swung up to a gong",
  trapezeAnchorMilli: "THE TRAPEZE — an alien swung up to a gong",
  trapezeRopeMilli: "THE TRAPEZE — an alien swung up to a gong",
  trapezePeriodBeats: "THE TRAPEZE — an alien swung up to a gong",
  trapezeStartMilli: "THE TRAPEZE — an alien swung up to a gong",
  trapezeMaxMilli: "THE TRAPEZE — an alien swung up to a gong",
  trapezePushMilli: "THE TRAPEZE — an alien swung up to a gong",
  trapezeBrakeMilli: "THE TRAPEZE — an alien swung up to a gong",
  trapezeDampMilli: "THE TRAPEZE — an alien swung up to a gong",
  trapezeKeepMilli: "THE TRAPEZE — an alien swung up to a gong",
  trapezeSwipeMilli: "THE TRAPEZE — an alien swung up to a gong",
  trapezeHitMilli: "THE TRAPEZE — an alien swung up to a gong",
  trapezeLockBeats: "THE TRAPEZE — an alien swung up to a gong",
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
  flueBeamBeats: "THE FLUE — an ember one seat sees and the other shoots",
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
  // it may land on, how long the tail lies, how far the head and the tail are
  // pulled, and the tow's rows, curve and lunge (`config-lamprey.ts`).
  lampreyOutCols: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyFeedRow: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyHighRow: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyLowRow: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyCrawlTiles: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyLungeTiles: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyFoodCols: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyEdgeCols: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
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
  lampreyTowRow: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyTowFromRow: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyTowMilli: "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyTowAngerMilli:
    "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyTowBackMilli:
    "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyPlugStartMilli:
    "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyPlugCreepMilli:
    "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyPlugPushMilli:
    "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyPlugFlushMilli:
    "THE LAMPREY — an eel one of you holds by the tail for the other to pull off",
  lampreyPlugYankMilli:
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
  // LatchConfig — a knot and a reach, the yank and its rear, where the grips
  // hang, and the beats around the levels (`config-latch.ts`).
  latchEnterBeats: "THE LATCH — a rope you haul down in turns, never both letting go",
  latchRestBeats: "THE LATCH — a rope you haul down in turns, never both letting go",
  latchSpentBeats: "THE LATCH — a rope you haul down in turns, never both letting go",
  latchKnotMilli: "THE LATCH — a rope you haul down in turns, never both letting go",
  latchStrokeMilli: "THE LATCH — a rope you haul down in turns, never both letting go",
  latchReachMilli: "THE LATCH — a rope you haul down in turns, never both letting go",
  latchYankEveryBeats: "THE LATCH — a rope you haul down in turns, never both letting go",
  latchRearBeats: "THE LATCH — a rope you haul down in turns, never both letting go",
  latchGripRowMilli: "THE LATCH — a rope you haul down in turns, never both letting go",
  // BastionConfig — the beats around the shells, a plate's tear, the rim
  // and the front, a node's charge (`config-bastion.ts`).
  bastionEnterBeats: "THE BASTION — a metal moon you take apart, one layer at a time",
  bastionShedBeats: "THE BASTION — a metal moon you take apart, one layer at a time",
  bastionRegrowBeats: "THE BASTION — a metal moon you take apart, one layer at a time",
  bastionSpentBeats: "THE BASTION — a metal moon you take apart, one layer at a time",
  bastionPullMilli: "THE BASTION — a metal moon you take apart, one layer at a time",
  bastionSnapMilli: "THE BASTION — a metal moon you take apart, one layer at a time",
  bastionRimMilli: "THE BASTION — a metal moon you take apart, one layer at a time",
  bastionFrontMilli: "THE BASTION — a metal moon you take apart, one layer at a time",
  bastionChargeBeats: "THE BASTION — a metal moon you take apart, one layer at a time",
  bastionGapBeats: "THE BASTION — a metal moon you take apart, one layer at a time",
} satisfies Record<string, GroupName>;
