import type { BossState } from "./boss-union.js";
import { type BreachWeight, breachHull } from "./hull-damage.js";
import type { World } from "./world.js";

/** Which boss, by the name its state carries. */
export type BossKind = BossState["kind"];

/** The rounds, which break the hull with no body on the field to do it. */
export type RoundKind = Extract<
  BossKind,
  "fleet" | "gauge" | "mirror" | "pinball" | "pulse" | "scout" | "snake"
>;

/** Who struck, on the `breach` event: a boss and which of its blows, or a
 * round. Only the fields that are set are written, so a body's breach has none. */
export interface Strike {
  by?: BossKind;
  blow?: string;
  round?: RoundKind;
}

/**
 * **A boss's window ran out, and the boss itself breaks the hull.**
 *
 * The owner, 26 September 2026: a boss that damages the ship because time is
 * over is seen doing it — never a rock falling out of the top of the field
 * that was never in the picture. Until then every such hit was
 * `breachHull(world, col, "meteorFastest", 0, "heavy")`, and render/ replayed
 * that as a meteor coming down from row 0 (`rock-impact.ts`).
 *
 * The rule is the same hit — the scar, the wave lost, the heavy sound — with
 * the boss named on the `breach` event. render/ reads `by` and draws the blow
 * out of the boss's own body instead of the rock (`boss-strike-fx.ts`, with
 * the boss's own look in `boss-strike-look.ts`). The scar keeps the rock's
 * kind, so the crack it leaves and the sound are what they always were.
 *
 * A boss that really does throw something the pair watched fall — THE
 * SCUTTLE's part, THE SINEW's mass — breaks the hull with that body and does
 * not come here.
 */
export function bossStrikesHull(
  world: World,
  by: BossKind,
  col: number,
  /** The row the blow starts from, when the sim knows one; 0 otherwise. */
  fromRow = 0,
  /** Which of the boss's blows, when it has more than one: render/ draws
   * each its own way (`boss-strike-look.ts`). */
  blow?: string,
): void {
  breachHull(world, col, "meteorFastest", fromRow, "heavy", null, blow ? { by, blow } : { by });
}

/**
 * **A round's window ran out, or its verdict went against the pair, and the
 * round itself breaks the hull.** The same hit as ever — the rock's kind for
 * the scar and the sound, the wave lost — with the round named on the
 * `breach` event, so render/ can offer the round's own picture of it beside
 * the rock (a VERSUS slot in render/; the owner, 26 September
 * 2026: *give me a versus version so i can compare on page*).
 */
export function roundStrikesHull(
  world: World,
  round: RoundKind,
  col: number,
  /** The row the hit starts from: THE MIRROR's own body; 0 otherwise. */
  fromRow = 0,
  /** `light` where nothing hit the ship and the pair simply did not finish. */
  weight: BreachWeight = "heavy",
): void {
  breachHull(world, col, "meteorFastest", fromRow, weight, null, { round });
}
