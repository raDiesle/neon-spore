import type { GroupName } from "./ship-groups.js";

/**
 * **The choreographed bosses' dials, the fourth page** — THE CAPSTAN and every
 * boss built after it.
 *
 * Cut on 27 September 2026, when THE BURGEE's eight numbers would have taken
 * `ship-fields-choreo-c.ts` past the 250-line wall. The seam is page three's:
 * **the order they were built in**. Spread into `CHOREO_FIELD_GROUP_C` in
 * place, so the exhaustiveness check over `ROUND_FIELD_GROUP` is unchanged
 * (`ship-fields.ts`).
 *
 * THE CAPSTAN and THE GALL came over the same day, when THE HASP's story
 * brought ten more to page three: the last bosses on the page go, never the
 * boss being worked on.
 */
export const CHOREO_FIELD_GROUP_D = {
  // CapstanConfig — the rust before the first step, the rest between steps,
  // how far a lean rocks the cradle, the reversals that wear a band bright,
  // the beats a hold needs, and the spent drum (`config-capstan.ts`).
  capstanRustBeats: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanRestBeats: "THE CAPSTAN — the boss one hand rocks for the other to wear",
  capstanLeanMilli: "THE CAPSTAN — the boss one hand rocks for the other to wear",
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
} satisfies Record<string, GroupName>;
