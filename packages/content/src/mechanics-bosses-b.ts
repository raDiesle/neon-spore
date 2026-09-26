import type { Mechanic, MechanicId } from "./mechanics.js";

/** The keys of the table below, checked against the roster for `mechanics-bosses.ts`' reason. */
type BossIdB = Extract<MechanicId, "davit" | "halter" | "vane">;

/**
 * **The bosses `mechanics-bosses.ts` had no room for**, started on 26
 * September 2026 when THE DAVIT's row would have taken that page past 250
 * lines. The same shape and the same `satisfies`: a kind added to the
 * simulation and not to a table is a build error on one page or the other.
 *
 * THE VANE's row came here the same day, out of `mechanics-table.ts`, when
 * THE DAVIT's line took that page past 250 as well. The table still names it
 * in the place it has always held, so key order is untouched.
 */
export const BOSS_MECHANICS_B = {
  davit: {
    what: "Your partner leans the boom onto the lit side: hold a draw, then swipe that way. Two each way light the pivot. Shoot it in its colour. Then reland it.",
    reach: "spawn",
  },
  halter: {
    what: "One of you touches nothing while the other holds both grips. Hold it together and the seam opens. Then shoot the bared centre.",
    reach: "spawn",
  },
  vane: {
    what: "An arm sweeps the top of the field. It mirrors everything under it across the column it stands in.",
    reach: "spawn",
  },
} as const satisfies Record<BossIdB, Mechanic>;
