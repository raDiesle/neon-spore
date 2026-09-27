import type { GroupName } from "./ship-groups.js";

/**
 * **The choreographed bosses' dials, the fourth page** — THE BURGEE and every
 * boss built after it.
 *
 * Cut on 27 September 2026, when THE BURGEE's eight numbers would have taken
 * `ship-fields-choreo-c.ts` past the 250-line wall. The seam is page three's:
 * **the order they were built in**. Spread into `CHOREO_FIELD_GROUP_C` in
 * place, so the exhaustiveness check over `ROUND_FIELD_GROUP` is unchanged
 * (`ship-fields.ts`).
 */
export const CHOREO_FIELD_GROUP_D = {
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
} satisfies Record<string, GroupName>;
