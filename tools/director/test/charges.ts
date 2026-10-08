import { PLAY_CHARGE, type SimConfig } from "@neon-spore/sim";

/**
 * **The two charges a hand has to play at**, and every `autopilot-*.test.ts`
 * runs its `describe` under both (`describe.each(CHARGES)`).
 *
 * The director plays at whatever its panel says, nought by default
 * (`POSE_CONFIG`); the game lays every shot over half a beat (`PLAY_CHARGE`,
 * `sim/shot-charge.ts`), so a press leaves on the charge's grid and out of
 * the column the cannon stands in then. A hand that times a shot to a tick is
 * right at one and wrong at the other: THE TRAPEZE's went four for four here
 * and one for ten in the game, and THE JAM's slid the cannon off its runaway
 * shot while it was still in the muzzle (8 October 2026).
 */
export const CHARGES: readonly (readonly [string, Partial<SimConfig>])[] = [
  ["with no charge", {}],
  ["at the game's charge", PLAY_CHARGE],
];
