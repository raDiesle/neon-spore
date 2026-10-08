/**
 * THE BASTION's tuning: the beats around its shells, how far a plate is
 * pulled before it tears, the rim the moon is turned by and how near the
 * front a gun must come, and how long a node charges.
 *
 * What is **not** here is the script — which shells, in what order, the
 * ring's colours, where the nodes and the ports stand and how long each shell
 * may take: that is the wave's, authored on its entry.
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
  /** How far out a plate is pulled before it tears off, thousandths of a tile. */
  bastionPullMilli: number;
  /** The least pull a let-go is said for: a plate snapping back, not a thumb brushing it. */
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
  bastionPullMilli: 1800,
  bastionSnapMilli: 300,
  bastionRimMilli: 3100,
  bastionFrontMilli: 20000,
  bastionChargeBeats: 4,
  bastionGapBeats: 2,
};
