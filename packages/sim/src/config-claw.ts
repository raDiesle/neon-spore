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
   * How fast the arm travels **outward**, in tiles per beat.
   *
   * Outward only, since the crank: the way back is wound by hand and is
   * `windTilesPerTurn`'s number rather than this one. It is still half the
   * difficulty of the panel. The arm is committed the moment it leaves —
   * nothing recalls it — so this is how long a mistake lasts, and how far
   * ahead of a crossing pod the pair has to be talking.
   */
  reachTilesPerBeat: number;
  /** Score for a pod the arm brings down and the mouth takes. */
  scoreReachCatch: number;
  /**
   * How much rope one whole turn of the crank takes in, in tiles.
   *
   * **The arm does not come home by itself.** It goes up on its own and turns
   * round at the top or on whatever it closed on, and from there it hangs
   * exactly where it stopped until player 1 winds it down — a finger going
   * round and round inside the crank on the panel (`crank.ts`). So this number
   * is what the return *costs*, in turns of a thumb rather than in beats, and
   * it is the second half of the difficulty `reachTilesPerBeat` is the first
   * half of: the press commits the arm, and the winding is the price of
   * getting it back.
   */
  windTilesPerTurn: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * `reachTilesPerBeat` at 9 crosses the fourteen rows above the hull in about a
 * second and a half, and the winding home is at least as long again — so one
 * press is three seconds of the panel at the least, which is longer than a
 * spoken exchange of 2.1-3.6 s (`docs/spec/latency.md`): the sentence that
 * sends the arm has to be finished before it leaves rather than while it is
 * out.
 *
 * `windTilesPerTurn` at 4 puts the whole field — the fourteen rows the arm can
 * be hanging at — inside three and a half turns of the crank, which is about
 * two seconds of a thumb going round at a comfortable rate and slower than the
 * beat and a half the arm used to take coming home on its own. That is the
 * point of it: the return was free and is now a thing one player is *doing*
 * while the other reads the field out to them.
 *
 * `damageReach` at 6 is under half what a plain rock costs by landing, which
 * is the shape of the trade: reaching into one is always better than letting
 * it through, and always worse than never having been in its column.
 */
export const CLAW_DEFAULTS: ClawConfig = {
  reachTilesPerBeat: 9,
  scoreReachCatch: 250,
  windTilesPerTurn: 4,
};
