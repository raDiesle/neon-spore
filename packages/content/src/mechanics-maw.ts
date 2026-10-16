import type { Mechanic } from "./mechanics.js";

/** THE MORSEL's row, next door for THE BEATBOX's reason (`creatures-maw.ts`). */
export const MORSEL_MECHANIC = {
  what: "A shot in its colour does not kill it. It goes limp and keeps falling. Put the cannon under it and SUCK as it lands, or the wave is lost.",
  reach: "spawn",
  // A wave names the kind, the column and the colour that turns it.
  waveNames: true,
} as const satisfies Mechanic;
