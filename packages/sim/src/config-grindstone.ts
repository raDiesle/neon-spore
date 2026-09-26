/**
 * THE GRINDSTONE's tuning: the rests around its steps, what a reversal
 * shaves and a beat regrits, the film a second pass starts from, and the
 * grace a clamp is given (`docs/spec/bosses-choreographed.md` §33).
 *
 * What is **not** here is the script — which step asks what, in which colour,
 * for how many beats: that is the wave's, authored on its entry.
 */
export interface GrindstoneConfig {
  /** Beats the wheel settles into frame before the first step lights. */
  grindstoneStillBeats: number;
  /** Beats the wheel rests after a step before the next lights. */
  grindstoneRestBeats: number;
  /** Beats the freed wheel spins away before the wave may end. */
  grindstoneFreeBeats: number;
  /** Grit one reversal of a grinding thumb shaves off the lit flat, in thousandths of its face. */
  grindstoneShaveMilli: number;
  /** Grit a lit flat nobody rubbed grows back in a beat, in thousandths of its face. */
  grindstoneRegrowMilli: number;
  /** The film a flat's second pass starts from, in thousandths of its face. */
  grindstoneFilmMilli: number;
  /** Beats a clamp step is lit past its own count, for thumbs to find the jaws. */
  grindstoneGraceBeats: number;
}

export const GRINDSTONE_DEFAULTS: GrindstoneConfig = {
  grindstoneStillBeats: 2,
  grindstoneRestBeats: 1,
  grindstoneFreeBeats: 2,
  grindstoneShaveMilli: 125,
  grindstoneRegrowMilli: 150,
  grindstoneFilmMilli: 500,
  grindstoneGraceBeats: 2,
};
