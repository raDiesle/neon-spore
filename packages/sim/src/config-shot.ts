/**
 * Everything about a shot, as numbers: how fast one travels, how often one may
 * go, what it is worth holding the lobe for, and — since the shot became a
 * thing that is *laid* rather than fired — which moments one may leave on.
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-boss.ts`, `config-pair.ts` and `config-gauge.ts` already give: every
 * call site still reads `cfg.fireEveryBeats`, and the split is about how much
 * of one file a reader has to hold at once. The immediate reason is the same
 * one `config-gauge.ts` records — `config.ts` had one line left under the size
 * limit and `shotChargeBeats` needed more than one. The better reason is that
 * these seven belong together and were already sitting in a row: the shot is
 * the pair's whole answer to the field, and its tuning is argued about as one
 * thing rather than seven.
 */
export interface ShotConfig {
  /** Bullet speed, in tiles per beat. */
  bulletTilesPerBeat: number;
  /**
   * Beats player 1 has to hold the lance with the cannon standing still before
   * the lobe is full — THE LANCE's whole cost, as a number. It sits inside the
   * voice delay on purpose (docs/spec/latency.md): long enough that the pair
   * has to have agreed on the column beforehand, short enough that the
   * agreement is still worth acting on when the hold is done.
   */
  lancePrimeBeats: number;
  /**
   * Bodies one lance takes before it is spent. The "up to 3 segments in a
   * line" of the drill in docs/spec/systems.md 5.5. Only living bodies of the
   * shot's own colour are counted — a rock stops it whatever is left.
   */
  lancePierce: number;
  /**
   * Lance speed, in tiles per beat. Deliberately below `bulletTilesPerBeat`:
   * the drill in 5.5 is the slower weapon, and a lance that arrived as fast as
   * an ordinary shot would be a pure upgrade rather than a trade.
   */
  lanceTilesPerBeat: number;
  /** Minimum gap between shots, in beats. */
  fireEveryBeats: number;
  /**
   * How long an ordinary body refuses *everything* after a shot of the wrong
   * colour, in milliseconds.
   *
   * The rule is docs/spec/structure.md's own — *a missed shot in the wrong
   * colour: brief invulnerability* — and until now the only thing built for it
   * was a grey outline render/ held for a third of a second, which cost the
   * pair nothing at all: a second bolt was already loaded and the body died on
   * the beat it would have died on anyway. The owner's reading of that was
   * that it *is not long enough to hurt*.
   *
   * Seven hundred is twice the old flash and a little over one beat at the
   * game's own tempo, so a wrong colour now costs the shot **and** the next
   * chance to fire — which is exactly the sentence the pair says to each other
   * about it. Deliberately far short of `veilArmourMs`: a veil's armour is the
   * creature, and this is a penalty on top of a mistake that already spent a
   * bolt.
   */
  colourArmourMs: number;
  /**
   * The grid a shot may leave the muzzle on, in beats — how a press becomes a
   * shot that is *laid* rather than fired (`shot-charge.ts`). A press waits for
   * the next point on this grid, so the wait is between one tick and one part
   * of a beat and always ends on a named moment. Every beat is a grid point
   * whatever the value, which is what makes "on the three" literally true
   * across two seconds of voice delay (docs/spec/latency.md).
   *
   * **Zero here, and only here.** No grid is a press that is a bullet, exactly
   * as it always was, so every recorded run keeps its timing to the tick.
   * `apps/game` turns it on at half a beat — *beside* `PAIR_ON` rather than
   * inside it, because unlike those three switches this one stops nothing and
   * no headless caller is blocked by it. It is off by default to protect
   * replays, not because it needs two thumbs.
   *
   * Useful values divide a beat: 1, 0.5, 0.25. One that does not leaves a
   * short last part before the beat rather than walking off it.
   */
  shotChargeBeats: number;
  /**
   * Height of the invisible box a shot tests against, in thousandths of a
   * tile. One tile means a creature is hit over exactly the tile it looks like
   * it stands on; more is generous, less asks for precision the beat does not
   * give. The width is always the column.
   */
  hitHeightMilli: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`. At 96 BPM and 12 tiles a beat a
 * bolt crosses the whole field in a little over one beat, and `fireEveryBeats`
 * lets a second one go halfway through that — which is why `shotChargeBeats`
 * is a *half* beat wherever it is turned on: the grid and the reload gap then
 * coincide, and the rate of fire is exactly what it always was.
 */
export const SHOT_DEFAULTS: ShotConfig = {
  bulletTilesPerBeat: 12,
  lancePrimeBeats: 3,
  lancePierce: 3,
  lanceTilesPerBeat: 6,
  fireEveryBeats: 0.5,
  colourArmourMs: 700,
  shotChargeBeats: 0,
  hitHeightMilli: 1000,
};
