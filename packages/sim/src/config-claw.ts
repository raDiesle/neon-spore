/**
 * THE CLAW's numbers — the arm, what it costs to strike something with it, and
 * what a catch is worth (`reach.ts`, `docs/spec/systems.md`).
 *
 * Its own file for the reason `config-gauge.ts` and `config-fleet.ts` give:
 * `SimConfig` extends it rather than nesting it, so every call site still
 * reads `cfg.reachTilesPerBeat`, and the split is about how much of one file a
 * reader has to hold at once.
 *
 * The claw is **not a boss and not a round**. It is a control set on the
 * ordinary field: the grid, the hull and the bodies falling on it are exactly
 * what they always are, and the only thing that changes is what player 1's
 * half of the ship does — the cannon is an arm instead of a gun.
 */
export interface ClawConfig {
  /**
   * How fast the arm travels, in tiles per beat, out and back alike.
   *
   * It is the whole difficulty of the panel. The arm is committed the moment
   * it leaves — nothing recalls it — so this number is how long a mistake
   * lasts, and how far ahead of a crossing pod the pair has to be talking.
   */
  reachTilesPerBeat: number;
  /**
   * What the arm costs the hull when it closes on a body instead of a pod, in
   * whole points.
   *
   * **It is less than the body would have cost by landing**, and that is the
   * mechanic rather than a kindness: a rock coming down a column nobody can
   * shield is answerable on this panel by reaching into it, and the price of
   * that answer is what makes it a decision instead of a reflex. Named for the
   * `damage*` family, because that is the question a reader has when they find
   * it.
   */
  damageReach: number;
  /** Score for a pod the arm brings down and the mouth takes. */
  scoreReachCatch: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * `reachTilesPerBeat` at 9 crosses the fourteen rows above the hull in about a
 * second and a half out and the same back, which is three seconds committed to
 * one press — inside a spoken exchange of 2.1-3.6 s
 * (`docs/spec/latency.md`), so the sentence that sends the arm has to be
 * finished before it leaves rather than while it is out.
 *
 * `damageReach` at 6 is under half what a plain rock costs by landing, which
 * is the shape of the trade: reaching into one is always better than letting
 * it through, and always worse than never having been in its column.
 */
export const CLAW_DEFAULTS: ClawConfig = {
  reachTilesPerBeat: 9,
  damageReach: 6,
  scoreReachCatch: 250,
};
