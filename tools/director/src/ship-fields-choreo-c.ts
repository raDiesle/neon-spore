import type { GroupName } from "./ship-groups.js";

/**
 * **The choreographed bosses' dials, the third page** — THE SPOOL and every
 * boss built after it.
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
  // The ribs are not here, for `bellowsSeams`' reason: four is the
  // silhouette and a spool hung with five would be a different spool
  // (`sim/spool.ts`, `SPOOL_RIBS`). Nor is the rate a leg asks for — that is
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
} satisfies Record<string, GroupName>;
