import type { Mechanic, MechanicId } from "./mechanics.js";

/** The keys of the table below, checked against the roster for `mechanics-bosses.ts`' reason. */
type BossIdB = Extract<
  MechanicId,
  "burgee" | "capstan" | "davit" | "flue" | "gall" | "governor" | "halter" | "vane"
>;

/**
 * **The bosses `mechanics-bosses.ts` had no room for**, started on 26
 * September 2026 when THE DAVIT's row would have taken that page past 250
 * lines. The same shape and the same `satisfies`: a kind added to the
 * simulation and not to a table is a build error on one page or the other.
 *
 * THE VANE's row came here the same day, out of `mechanics-table.ts`, when
 * THE DAVIT's line took that page past 250 as well. Since THE GALL the table
 * spreads this page whole where its rows stood, so the rows here are in the
 * table's own order and key order is untouched.
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
  capstan: {
    what: "One of you drags the drum to turn a band toward the other, who rubs it bright. Both bands bright bare the core. Shoot it in its colour.",
    reach: "spawn",
  },
  gall: {
    what: "Pinch the gall shut where it sits, on your half. It jumps: find it and pinch it there. Three closes bare the root. Shoot it in its colour.",
    reach: "spawn",
  },
  burgee: {
    what: "One of you taps the flag still over the lit column. The other holds a draw and swipes toward it. Two catches light the spindle. Shoot it in its colour.",
    reach: "spawn",
  },
  flue: {
    what: "One of you keeps still until the ember stops. The other taps it three times before the still one moves. Then both hands off. Shoot the core in its colour.",
    reach: "spawn",
  },
  governor: {
    what: "One of you holds both brake pads to keep the needle slow. The other taps as it crosses the lit mark. Three taps each. Shoot the hub in its colour.",
    reach: "spawn",
  },
  vane: {
    what: "An arm sweeps the top of the field. It mirrors everything under it across the column it stands in.",
    reach: "spawn",
  },
} as const satisfies Record<BossIdB, Mechanic>;
