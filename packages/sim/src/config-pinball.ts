/**
 * PINBALL's numbers — the table, the ball and what a dropped one costs
 * (`pinball.ts`, `docs/spec/bosses.md` 11.7).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-gauge.ts` and `config-snake.ts` already give: every call site still
 * reads `cfg.pinballGravityMilli`, and the split is about how much of one file
 * a reader has to hold at once.
 *
 * **Distances are thousandths of a tile and speeds are thousandths of a tile
 * per tick.** Not per second, and not per beat: this is the first boss in the
 * game with a continuously moving body under an acceleration, and an
 * acceleration expressed per beat would have to be divided by `ticksPerBeat`
 * at every call site — which is a rounding step, done eleven times, in the one
 * place in the game where a rounding step compounds. At 120 ticks a second a
 * gravity of 2 is 288 tiles per second squared, and nobody should ever have to
 * work that out: the numbers here are chosen by what the ball does, and the
 * table in the header of `pinball-physics.ts` says what each one buys.
 *
 * **The one invariant that is not a taste.** `pinballSpeedCapMilli` must stay
 * below `pinballBallMilli` plus the thinnest half-thickness any piece may
 * have, or a ball moving at full speed steps straight through a piece between
 * one tick and the next. `pinballFault` enforces the piece half of that on
 * every authored board and `test/pinball-physics.test.ts` enforces the config
 * half, because a tunnelled ball is not a bug anybody would find by playing —
 * it happens once, at speed, and looks like a miss.
 */
export interface PinballConfig {
  /** The table's width, in tiles. Eleven, so it is the field's own width. */
  pinballCols: number;
  /** The table's height, in tiles. Portrait, and taller than the field. */
  pinballRows: number;
  /** The ball's radius, in thousandths of a tile. */
  pinballBallMilli: number;
  /** A peg's radius, in thousandths of a tile. Every peg is this size. */
  pinballPegMilli: number;
  /** What the ball gains downward each tick, in thousandths of a tile per tick. */
  pinballGravityMilli: number;
  /** The fastest it may ever travel, in thousandths of a tile per tick. */
  pinballSpeedCapMilli: number;
  /** How much speed survives a bounce off a piece, in thousandths. */
  pinballBouncePermille: number;
  /** How much survives a bounce off a wall. Deader than a peg, on purpose. */
  pinballWallPermille: number;
  /** The speed a ball leaves the bucket at on a full-power launch. */
  pinballLaunchMilli: number;
  /** The weakest launch, as a fraction of the full one, in thousandths. */
  pinballWeakPermille: number;
  /**
   * How far the needle sweeps either side of straight up, in thousandths of a
   * degree — `MAZE_TURN`'s unit, because the sine it is turned into comes off
   * `mazeSinMilli` and a second angle unit in the same package is a conversion
   * nobody would remember to do twice.
   */
  pinballSweepMilli: number;
  /** How far it travels each tick, in thousandths of a degree. The whole of the aim. */
  pinballNeedleMilli: number;
  /** How far the power bar travels each tick, in thousandths. */
  pinballPowerMilli: number;
  /** How far a held slab slides the bucket each tick, in thousandths of a tile. */
  pinballSlideMilli: number;
  /** Half the bucket's mouth, in thousandths of a tile. What a catch is. */
  pinballBucketMilli: number;
  /** Beats one shot may stay in the air before the table gives it back. */
  pinballFlightBeats: number;
  /** What running out of time takes off the hull, in whole points. */
  damagePinball: number;
  /** What a ball that missed the bucket takes off it. */
  damagePinballDrop: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * `pinballGravityMilli: 2` drops a ball the height of the table in about a
 * second and a tenth, which is Peggle's fall and is not a coincidence — a
 * slower one turns every shot into waiting and a faster one is over before
 * either player has said anything about it.
 *
 * `pinballNeedleMilli: 190` sweeps the needle across its whole arc in about
 * six and a half seconds. That number is the round: a spoken exchange in this game
 * takes 2.1–3.6 s (`docs/spec/latency.md`), so a sweep this slow is one a pair
 * can talk *during* — "further… further… now" lands while the needle is still
 * short of where it was called. THE GAUGE's needle crosses in 2.8 s and is
 * meant to be fought with a thumb; this one is meant to be talked over, and
 * the two numbers are three times apart for that reason alone.
 *
 * `pinballBouncePermille: 880` is a steel ball on a hard peg: lively enough
 * that a cluster cascades, dead enough that the ball always comes down.
 */
export const PINBALL_DEFAULTS: PinballConfig = {
  pinballCols: 11,
  pinballRows: 18,
  pinballBallMilli: 240,
  pinballPegMilli: 200,
  pinballGravityMilli: 2,
  // Below `pinballBallMilli` plus `PIN_THIN_MILLI` — see the header.
  pinballSpeedCapMilli: 300,
  pinballBouncePermille: 880,
  pinballWallPermille: 820,
  pinballLaunchMilli: 250,
  pinballWeakPermille: 450,
  // Seventy-five degrees either side of straight up: the needle covers
  // everything above the bucket and never points at the floor it just left.
  pinballSweepMilli: 75_000,
  pinballNeedleMilli: 190,
  // A hundred and twenty-five ticks to full and as many back, so the bar's
  // whole cycle is 2.1 s — the short end of a spoken exchange, deliberately.
  pinballPowerMilli: 8,
  pinballSlideMilli: 22,
  pinballBucketMilli: 620,
  pinballFlightBeats: 24,
  // THE GAUGE's twenty, for the same event and defended no further.
  damagePinball: 20,
  // SNAKE's crash number: a drop has to cost enough that the bucket is real
  // and little enough that the round is not over at the first one.
  damagePinballDrop: 8,
};
