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
  /**
   * The table's height, in tiles. Portrait, and taller than the field — but
   * only just: the space below the lowest piece is the ball's way home and
   * nothing else, so a table much taller than its boards is a round spent
   * watching a ball fall through nothing.
   */
  pinballRows: number;
  /** The ball's radius, in thousandths of a tile. */
  pinballBallMilli: number;
  /** A peg's radius, in thousandths of a tile. Every peg is this size. */
  pinballPegMilli: number;
  /** What the ball gains downward on a tick gravity is applied, in thousandths
   * of a tile per tick. */
  pinballGravityMilli: number;
  /**
   * Gravity is applied on one tick in this many, counted from the launch
   * (`PinBall.ageTicks`). The way to a fall slower than a gravity of 1 without
   * a unit finer than a thousandth: 1 every 2 ticks is half a thousandth a
   * tick, which with the launch and the cap halved is the same flight as
   * before at half the speed.
   */
  pinballGravityTicks: number;
  /** The fastest it may ever travel, in thousandths of a tile per tick. */
  pinballSpeedCapMilli: number;
  /** How much speed survives a bounce off a piece, in thousandths. */
  pinballBouncePermille: number;
  /** How much survives a bounce off a wall. Deader than a peg, on purpose. */
  pinballWallPermille: number;
  /** The speed a ball leaves the bucket at on a full-power launch. */
  pinballLaunchMilli: number;
  /**
   * The weakest launch, as a fraction of the full one, in thousandths.
   *
   * 600 since the clear band above the ship (`pinballClearMilli`): it was 450,
   * which rose three tiles and now meets nothing, so the bottom of the bar was
   * a shot that could not reach the board. At 600 the weakest reading climbs
   * to the lowest row a board may hold, and every reading on the bar is a shot.
   */
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
  /**
   * Half the cannon's catch, in thousandths of a tile.
   *
   * It is also how high above the floor a ball rests and how deep the clear
   * lane above the ship is, which is why it is one number rather than three:
   * the mouth a ball comes out of is the mouth it has to come back into.
   * How wide the cannon *takes* a ball is `pinballCatchReachMilli`.
   */
  pinballCatchMilli: number;
  /**
   * How far across from the cannon's middle a ball coming down is still
   * taken, in thousandths of a tile (`pinCaught`).
   *
   * Its own number since 30 September 2026, when the owner asked for a wider
   * catch: widening `pinballCatchMilli` would have raised the launch lane and
   * cost every board a row. It was a column and a tenth either side until
   * 1 October 2026, when the owner, looking at a frame of the funnel drawn that
   * wide, said: *it should still be possible that ball is hitting the hull
   * ship, otherwise it's too easy* — the cup covered most of the gap the side
   * funnels leave. Half a column now: the cannon takes the ball only from the
   * column it is falling into, so a pilot a column off loses it.
   */
  pinballCatchReachMilli: number;
  /**
   * How much air above the ship a board must leave empty, in thousandths of a
   * tile (`pinLaneFloorMilli`).
   *
   * The owner, 1 October 2026: *near the ship hull there are no obstacles,
   * only with more distance.* A piece a tile above the cannon sent a falling
   * ball sideways in the last instant before it reached the ship, which no
   * call could answer; five tiles is the ball's whole last second of fall,
   * clear, so the cannon has the time to get under it.
   */
  pinballClearMilli: number;
  /**
   * How high up each side wall the two funnels start, in thousandths of a tile
   * (`pinball-funnel.ts`). Each runs from there down to the floor a third of
   * the way in, so a falling ball reaches the ship only across its middle
   * third. The owner, 1 October 2026: *easier to catch the ball again.* Three
   * tiles is a slope of about 39°, steep enough that a ball never rests on it
   * and low enough to stay under the five clear tiles of `pinballClearMilli`.
   */
  pinballFunnelMilli: number;
  /**
   * How much of the speed *into* a funnel's slope comes back out, in
   * thousandths. Only that part: what runs along the slope is kept, so a ball
   * lands, rolls and leaves towards the middle rather than bouncing high.
   */
  pinballFunnelPermille: number;
  /** Beats one shot may stay in the air before the table gives it back. */
  pinballFlightBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * `pinballGravityMilli: 2` dropped a ball the height of the table in about a
 * second and a tenth, which is Peggle's fall. On 30 September 2026 the owner
 * found it *too hard to follow* and asked for it slower, so the whole flight
 * runs at half speed: a gravity of 1 on every second tick, and the launch, the
 * cap and the nudge halved with it — the same arcs, drawn twice as slowly.
 *
 * `pinballNeedleMilli: 122` sweeps the needle across its whole arc in about
 * six and a half seconds. That number is the round: a spoken exchange in this game
 * takes 2.1–3.6 s (`docs/spec/latency.md`), so a sweep this slow is one a pair
 * can talk *during* — "further… further… now" lands while the needle is still
 * short of where it was called. THE GAUGE's needle crosses in 2.8 s and is
 * meant to be fought with a thumb; this one is meant to be talked over, and
 * the two numbers are three times apart for that reason alone.
 *
 * `pinballBouncePermille: 600` is a ball off a rubber post: a cluster still
 * passes it along, and a ball that met a piece comes away slower than it
 * arrived. It was 880, a steel ball on a hard peg, and on 1 October 2026 the
 * owner asked for the bounce off a piece to cost more — and the bounce off
 * the cabinet's walls left as it was, so `pinballWallPermille` is untouched.
 */
export const PINBALL_DEFAULTS: PinballConfig = {
  pinballCols: 11,
  pinballRows: 14,
  pinballBallMilli: 240,
  pinballPegMilli: 200,
  pinballGravityMilli: 1,
  pinballGravityTicks: 2,
  // Below `pinballBallMilli` plus `PIN_THIN_MILLI` — see the header.
  pinballSpeedCapMilli: 150,
  pinballBouncePermille: 600,
  pinballWallPermille: 820,
  pinballLaunchMilli: 125,
  pinballWeakPermille: 600,
  // Forty-eight degrees either side of straight up. It was seventy-five, and
  // an arc that wide spent most of its sweep pointing at a side wall a tile
  // away — the two ends of it were the same shot twice and the pair could say
  // nothing useful about either. Narrowed on the owner's call: the needle now
  // covers the board rather than the cabinet, and every degree of it is a
  // different answer.
  pinballSweepMilli: 48_000,
  // Narrowed with the arc, so the sweep still takes the same six and a half
  // seconds to cross: 122 over ±48° is 190 over ±75°. The arc is what got
  // smaller; the sentence the pair say over it is not.
  pinballNeedleMilli: 122,
  // Two hundred and fifty ticks to full and as many back, so the bar's whole
  // cycle is 4.2 s. It was 2.1 s, the short end of a spoken exchange, and on
  // 1 October 2026 the owner asked for it slower: "now" has to land on a bar
  // that is still where it was when the word was started.
  pinballPowerMilli: 4,
  pinballCatchMilli: 620,
  pinballCatchReachMilli: 500,
  pinballClearMilli: 5000,
  pinballFunnelMilli: 3000,
  pinballFunnelPermille: 400,
  // Twice the 24 it was, with the flight at half speed.
  pinballFlightBeats: 48,
};
