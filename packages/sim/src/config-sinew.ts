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
  /** Fibres in the tendon. Each one parted is a string cut; the last drops the mass. */
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
  /** Beats a snap-back throws the handles about for: a hand on one in these steers, it does not pull. */
  sinewSnapBeats: number;
  /** Sideways pull, in thousandths, each hand needs outward to catch a swinging tendon. */
  sinewCatchMilli: number;
  /** Rocks a snap-back shakes out of the mass. */
  sinewSnapRocks: number;
  /** Rocks the snap-back on the last fibre shakes out — a mass that low, whipped, sheds more. */
  sinewSnapRocksLast: number;
  /** Row the mass hangs at, the whole fight: a fibre parted does not lower it. */
  sinewMassRow: number;
  /** Columns the mass spans, centred on `midCol`: where its rocks come from. */
  sinewMassCols: number;
  /** Fibres parted after which the tendon starts going slack under a hand. */
  sinewDecayFibres: number;
  /** Slack the tendon gains per beat with a hand on it, in thousandths, once it decays. */
  sinewDecayMilli: number;
  /** Beats a fibre's parting is watched at the slow rate (THE SLOW). */
  sinewPartSlowBeats: number;
  /** Beats the mass falls after the last fibre parts, before it lands. */
  sinewFallBeats: number;
  /** Sideways pull past which a hand steers the falling mass, in thousandths. */
  sinewSwayMilli: number;
  /** Columns from `midCol` the mass has to be walked to land at the wall and not on the ship. */
  sinewClearCols: number;
  /** Beats the boss stands after the mass lands clear, before the wave may end. */
  sinewOutBeats: number;
  /**
   * Beats the tendon takes to drop in from above the field and settle, at
   * the start of the fight: a hand may take hold, but nothing pulls yet.
   */
  sinewEnterBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: six fibres, a band of six thousand, a zone 1440 wide that
 * narrows by 240 a fibre until the last is the 240 just under the band's top —
 * one hand at the limit and the other all but, and the top itself a snap. Four beats held parts one; a snap costs two
 * beats and a rock, three on the last, and those two beats are bought back by
 * both hands carried 400 outward — two fifths of a tile, far enough that it
 * is a gesture and not a wobble. The mass hangs on row 9, five rows over the
 * hull, from the first fibre to the last; when it falls it has eight beats
 * to be walked four columns.
 *
 * **Row 9 and still, on the owner's word, 5 October 2026**: the mass used to
 * start on row 5 and come down a row per fibre, and the owner asked for it to
 * hang where it was after the fourth one, all fight long, so that a fibre
 * parting is a string cut and not the boss coming closer.
 *
 * **Doubled on the owner's rule, 24 September 2026** (`docs/spec/
 * choreographed-windows.md`): the fall 4 → 8 beats and the walk 3 → 4
 * columns. Four and not the five that page first asked for: the mass is
 * three wide and kept on an eleven-column field, so its middle stops a
 * column short of either wall and four from `midCol` is as far as it goes.
 * The fall is THE SLOW (`sinew-step.ts`).
 *
 * **The reach tripled on the owner's word, 2 October 2026**: a hand's whole
 * pull was a tile of thumb, and a sum a pair could only say coarsely. Three
 * tiles now, and every width on the band tripled with it — the zone, its
 * narrowing, the slack — so the fight asks the same share of the band and
 * the thumb has three times the travel to find it in. The zone's floor came
 * down to a tenth of the band at the same time: a zone is rolled across the
 * whole height now, a stretch of it each, and the top only once
 * (`rollZone`). The tendon drops in over four beats before anything pulls.
 */
export const SINEW_DEFAULTS: SinewConfig = {
  sinewFibres: 6,
  sinewReachMilli: 3000,
  sinewZoneMilli: 1440,
  sinewZoneNarrowMilli: 240,
  sinewZoneLowMilli: 600,
  sinewHoldBeats: 4,
  sinewSnapBeats: 2,
  sinewCatchMilli: 400,
  sinewSnapRocks: 1,
  sinewSnapRocksLast: 3,
  sinewMassRow: 9,
  sinewMassCols: 3,
  sinewDecayFibres: 4,
  sinewDecayMilli: 180,
  sinewPartSlowBeats: 2,
  sinewFallBeats: 8,
  sinewSwayMilli: 300,
  sinewClearCols: 4,
  sinewOutBeats: 2,
  sinewEnterBeats: 4,
};
