/**
 * THE MALFUNCTION's numbers: how often a broken control acts by itself, and how
 * long THE CODEX holds a key.
 *
 * Its own file, the way every mechanic with numbers of its own has one. The
 * seam is the same one `config-fence.ts` and `config-recoil.ts` were cut
 * along: `config.ts` holds what the *ship* is — the hull, the grid, the beat —
 * and a rule that only exists while one particular thing is on the panel holds
 * its own figures beside it.
 *
 * Every one of them is in **beats** rather than milliseconds, and that is the
 * decision this file is really making. A window nobody counts is measured in
 * time (`guardWindowMs`, `intakeWindowMs`); a window the pair has to *plan a
 * crossing inside of* is measured in the thing they are already counting out
 * loud. "Two beats" is a sentence one of them can say to the other. "Twelve
 * hundred milliseconds" is not.
 */
export interface MalfunctionConfig {
  /**
   * Beats between two automatic actions of a broken control.
   *
   * One, and the whole feel of the mechanic is in that number: the fault does
   * exactly what the metronome does, so the pair already knows when the next
   * one is coming. A fault that fired on some other clock would be a thing to
   * watch rather than a thing to count, and watching is what this game spends
   * its attention on elsewhere.
   */
  malfunctionEveryBeats: number;
  /**
   * Beats THE CODEX holds one key before turning it over.
   *
   * Four, which is a bar: long enough that the pair can take a shot inside it
   * and short enough that nobody plans a whole wave around one reading. It is
   * the number that decides whether the fault is a sentence said once — *they
   * are swapped* — or a thing one of them keeps saying, and the second is the
   * mechanic. A hold of one would be unplayable across a voice delay: the call
   * would land after the key had already turned (`docs/spec/latency.md`).
   *
   * In beats for this file's own reason. "Every bar" is a thing one of them can
   * say to the other; 2500 ms is not.
   */
  codexHoldBeats: number;
}

export const MALFUNCTION_DEFAULTS: MalfunctionConfig = {
  malfunctionEveryBeats: 1,
  codexHoldBeats: 4,
};
