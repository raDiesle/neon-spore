import type { BossState } from "./boss-union.js";
import { breachHull } from "./hull-damage.js";
import type { World } from "./world.js";

/** Which boss, by the name its state carries. */
export type BossKind = BossState["kind"];

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
  breachHull(world, col, "meteorFastest", fromRow, "heavy", null, by, blow);
}
