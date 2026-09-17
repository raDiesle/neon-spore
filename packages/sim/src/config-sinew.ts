/**
 * THE SINEW's numbers — how many fibres the tendon has, how deep a hand may
 * pull, how wide the strain zone is and how it narrows, how long the sum has
 * to be held there, what a snap-back costs, where the mass hangs and how far
 * it falls, when the tendon starts going slack, and how far the pair has to
 * walk the falling mass to be clear of the ship (`sinew.ts`,
 * `docs/spec/bosses-choreographed.md` §8).
 *
 * Its own file for `config-gorge.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.sinewHoldBeats`, and the
 * split is about how much of one file a reader has to hold at once.
 *
 * **Every number here is a scalar the pair says aloud.** The strain band is
 * the sum of two pulls, and the first thing this game has ever asked two
 * people to say to each other is *how hard* — not which column, not which
 * colour. Player 1 sees where the zone sits on the band and player 2 sees
 * where the sum is, so the whole fight is one of them saying *more* and
 * *less* and the other saying *that is where we are*.
 */
export interface SinewConfig {
  /** Fibres in the tendon. Each one parted lowers the mass a row; the last drops it. */
  sinewFibres: number;
  /** How far down one hand can pull its handle, in thousandths of a tile. The band is twice this. */
  sinewReachMilli: number;
  /** Width of the strain zone on the band with every fibre whole, in thousandths. */
  sinewZoneMilli: number;
  /** Width the zone loses per fibre parted, in thousandths — and the narrowest it gets. */
  sinewZoneNarrowMilli: number;
  /** The lowest the zone's bottom is ever rolled, in thousandths: a zone under this is no pull at all. */
  sinewZoneLowMilli: number;
  /** Beats the sum has to sit inside the zone before a fibre parts. */
  sinewHoldBeats: number;
  /** Beats after a snap-back in which no hand can take hold: the handles are swinging. */
  sinewSnapBeats: number;
  /** Rocks a snap-back shakes out of the mass. */
  sinewSnapRocks: number;
  /** Rocks the snap-back on the last fibre shakes out — a mass that low, whipped, sheds more. */
  sinewSnapRocksLast: number;
  /** Row the mass hangs at with every fibre whole. A fibre parted is a row lower. */
  sinewMassRow: number;
  /** Columns the mass spans, centred on `midCol`: where its rocks come from. */
  sinewMassCols: number;
  /** Fibres parted after which the tendon starts going slack under a hand. */
  sinewDecayFibres: number;
  /** Slack the tendon gains per beat with a hand on it, in thousandths, once it decays. */
  sinewDecayMilli: number;
  /** Beats a fibre's parting is watched at a third rate (THE SLOW). */
  sinewPartSlowBeats: number;
  /** Beats the mass falls after the last fibre parts, before it lands. */
  sinewFallBeats: number;
  /** Sideways pull past which a hand steers the falling mass, in thousandths. */
  sinewSwayMilli: number;
  /** Columns from `midCol` the mass has to be walked to land at the wall and not on the ship. */
  sinewClearCols: number;
  /** Beats the boss stands after the mass lands clear, before the wave may end. */
  sinewOutBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: six fibres, a band of two thousand, a zone 480 wide that
 * narrows by 80 a fibre until the last is the 80 just under the band's top —
 * one hand at the limit and the other all but, and the top itself a snap. Four beats held parts one; a snap costs two
 * beats and a rock, three on the last. The mass starts on row 5 and is on
 * row 10 by the last fibre, four rows over the hull; when it falls it has
 * four beats to be walked three columns.
 */
export const SINEW_DEFAULTS: SinewConfig = {
  sinewFibres: 6,
  sinewReachMilli: 1000,
  sinewZoneMilli: 480,
  sinewZoneNarrowMilli: 80,
  sinewZoneLowMilli: 600,
  sinewHoldBeats: 4,
  sinewSnapBeats: 2,
  sinewSnapRocks: 1,
  sinewSnapRocksLast: 3,
  sinewMassRow: 5,
  sinewMassCols: 3,
  sinewDecayFibres: 4,
  sinewDecayMilli: 60,
  sinewPartSlowBeats: 2,
  sinewFallBeats: 4,
  sinewSwayMilli: 300,
  sinewClearCols: 3,
  sinewOutBeats: 2,
};
