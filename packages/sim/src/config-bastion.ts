/**
 * THE BASTION's tuning: the beats around its shells, how far a plate is
 * pulled before it tears and how far off a curve a thumb may stray, the rim
 * the moon is turned by and how near the front a gun must come, and how long
 * a node charges.
 *
 * What is **not** here is the script — which shells, in what order, the
 * ring's colours, where the nodes and the ports stand, which track each plate
 * is pulled along and how long each shell may take: that is the wave's,
 * authored on its entry.
 */
export interface BastionConfig {
  /** Beats the moon takes to come in over the field before the first shell lights. */
  bastionEnterBeats: number;
  /** Beats a shell takes to come off, and the moon to shrink, before the next lights. */
  bastionShedBeats: number;
  /** Beats a shell run out takes to grow back before it is lit again. */
  bastionRegrowBeats: number;
  /** Beats the core takes to blow before the wave may end. */
  bastionSpentBeats: number;
  /** How far a plate on a straight track is pulled before it tears off, thousandths of a tile; a curve's is its own length (`bastion-track.ts`). */
  bastionPullMilli: number;
  /** How far off a curved track a thumb may stray before its plate slips and snaps back, thousandths of a tile. */
  bastionSlackMilli: number;
  /** The most one reading may carry a plate along a curve from where it was, thousandths of a tile: no cutting across. */
  bastionStrideMilli: number;
  /** The least a plate is carried along a curve before straying off it slips it, said: under it the plate stays put. A let-go is the generic PULL's (`pull.ts`). */
  bastionSnapMilli: number;
  /** The rim the pilot turns the moon by, thousandths of a tile from its centre. */
  bastionRimMilli: number;
  /** How near the front a gun must be turned to be shot, thousandths of a degree either side. */
  bastionFrontMilli: number;
  /** Beats a node charges before it throws its lightning down. */
  bastionChargeBeats: number;
  /** Beats between one node's lightning and the next node charging. */
  bastionGapBeats: number;
}

export const BASTION_DEFAULTS: BastionConfig = {
  bastionEnterBeats: 6,
  bastionShedBeats: 4,
  bastionRegrowBeats: 3,
  bastionSpentBeats: 6,
  bastionPullMilli: 2400,
  bastionSlackMilli: 600,
  bastionStrideMilli: 1500,
  bastionSnapMilli: 300,
  bastionRimMilli: 3100,
  bastionFrontMilli: 20000,
  bastionChargeBeats: 4,
  bastionGapBeats: 2,
};
