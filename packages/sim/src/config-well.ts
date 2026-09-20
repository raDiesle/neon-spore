/**
 * THE WELL's numbers — how long the face stands still, how far it slips a
 * beat, how far it slips before it stops, and how many beats a thumb on the
 * seam can buy back (`well.ts`, `docs/spec/bosses.md` §11.12).
 *
 * Its own file for `config-scuttle.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.wellRollMilli`.
 *
 * **One number is the whole fight and it is `wellRollSectors`.** It is how far
 * from twelve the seam is allowed to walk, which is how wrong the pilot's
 * hours are allowed to get, which is how much of the wave the pair have to
 * spend saying numbers to each other. Everything else is pace.
 */
export interface WellConfig {
  /** Beats the face stands still before it starts to slip: the rest, and the wave's first lesson. */
  wellStillBeats: number;
  /** Thousandths of a sector the face turns a beat while it is slipping. */
  wellRollMilli: number;
  /** Sectors it slips before it stops and waits to be turned back. */
  wellRollSectors: number;
  /** Beats a thumb held on the seam can hold the slip still, once per round of the cycle. */
  wellHoldBeats: number;
}

/**
 * Six beats of rest, a quarter of a sector a beat, three sectors, four beats
 * of hold.
 *
 * A quarter of a sector a beat is one hour every four beats, which is slow
 * enough that the pair see it happen and fast enough that ignoring it costs
 * them a number inside a count they can say. Three sectors is a quarter of the
 * clock: far enough that no hour is where it was, near enough that every
 * numeral is still on the screen it started on. Four beats of hold is THE
 * CAIRN's number, and for its reason — a budget long enough to finish a
 * sentence and short enough that it cannot be sat on.
 */
export const WELL_DEFAULTS: WellConfig = {
  wellStillBeats: 6,
  wellRollMilli: 250,
  wellRollSectors: 3,
  wellHoldBeats: 4,
};
