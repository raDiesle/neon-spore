import type { SimConfig } from "@neon-spore/sim";
import type { GroupName } from "./ship-groups.js";

/**
 * The cannon's numbers — the shot it fires and the arm THE CLAW puts in its
 * place — sorted into their cards.
 *
 * Cut out of `ship-fields.ts` on 25 September 2026, when HARD's wasted-shot
 * rule took that file to two lines under its limit, on the seam
 * `ship-fields-balloon.ts` names: a group of keys lifts out and the parent
 * spreads it back in. `satisfies` for the reason that file gives.
 */
export const CANNON_FIELDS = {
  // ShotConfig
  bulletTilesPerBeat: "AIM — colour and column",
  lancePrimeBeats: "LANCE — a column marked, then spent",
  lanceBeamBeats: "LANCE — a column marked, then spent",
  fireEveryBeats: "AIM — colour and column",
  shotChargeBeats: "AIM — colour and column",
  colourArmourMs: "AIM — colour and column",
  hitHeightMilli: "PLUMBING — not a dial a person turns",
  // ClawConfig
  reachTilesPerBeat: "THE CLAW — the cannon replaced by an arm",
  windTilesPerTurn: "THE CLAW — the cannon replaced by an arm",
} satisfies Partial<Record<keyof SimConfig, GroupName>>;
