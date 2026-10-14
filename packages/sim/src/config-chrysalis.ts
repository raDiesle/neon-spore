/**
 * THE CHRYSALIS's tuning: the beats around its skins and how long a sac
 * swells. A quill is pulled along THE BASTION's tracks, so its lengths and
 * its slack are THE BASTION's (`config-bastion.ts`): one pull along a track.
 *
 * What is **not** here is the script — which skins, in what order, how many
 * turns of the rub a half of slime needs, which track each quill is pulled
 * along, where the sacs and the heart stand, the heart's colours and how long
 * each skin may take: that is the wave's, authored on its entry.
 */
export interface ChrysalisConfig {
  /** Beats the cocoon takes to come in over the field before the first skin lights. */
  chrysalisEnterBeats: number;
  /** Beats a skin takes to come off, and the cocoon to shrink, before the next lights. */
  chrysalisShedBeats: number;
  /** Beats a skin run out takes to grow back before it is lit again. */
  chrysalisRegrowBeats: number;
  /** Beats the grub takes to die before the wave may end. */
  chrysalisSpentBeats: number;
  /** Beats a sac swells before it sprays its spores down. */
  chrysalisSwellBeats: number;
  /** Beats between one sac's spray and the next sac swelling. */
  chrysalisGapBeats: number;
}

export const CHRYSALIS_DEFAULTS: ChrysalisConfig = {
  chrysalisEnterBeats: 6,
  chrysalisShedBeats: 4,
  chrysalisRegrowBeats: 3,
  chrysalisSpentBeats: 6,
  chrysalisSwellBeats: 4,
  chrysalisGapBeats: 2,
};
