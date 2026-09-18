/**
 * THE MIRROR's tuning: the last round on its own ship, and the pin that
 * brings it down (`mirror-hand.ts`, `MIRROR_GESTURES` in `simon.ts`).
 *
 * What is *not* here is the choreography of a round — the count-in, the
 * beats a step is shown for, how long the pair has to answer. Those are the
 * fight, not a difficulty, and they stay constants in `simon.ts` and
 * `mirror.ts` for the reason those files give. These three are the thumb's
 * side: how far a carry has to go before it is a carry, and how long the
 * pin is held.
 */
export interface MirrorConfig {
  /** Thousandths of a tile a thumb must carry the mirror's lobe before the lift is a carry and not a tap. */
  mirrorCarryMilli: number;
  /** Beats both thumbs stay on the mirror's two lobes before it falls. */
  mirrorHoldBeats: number;
  /** Beats the mirror waits at no hull for the pin; past it, silence is the wrong answer. */
  mirrorHoldWindowBeats: number;
}

export const MIRROR_DEFAULTS: MirrorConfig = {
  mirrorCarryMilli: 500,
  mirrorHoldBeats: 4,
  mirrorHoldWindowBeats: 12,
};
