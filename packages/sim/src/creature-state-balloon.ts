import type { CrossDir } from "./cross.js";

/**
 * **THE BALLOON's six**, and the eighth group carried out of
 * `creature-state.ts` along the seam that file's own header describes.
 *
 * What holds them together is that they are the whole of one creature: where
 * it is going, how fast, how long it has been growing, how many times it still
 * comes apart, and what each of the two hands on it has done. Nothing else in
 * the game carries a field a *second* seat writes — THE LID's cord is the
 * pilot's alone, THE MAZE's string and THE WARDEN's rope likewise — so the two
 * pulls at the bottom of this list are the first pair of fields in `Creature`
 * that two people can be writing at the same instant, which is the creature.
 *
 * **Absent is a value here, always**, and none of these may be read directly:
 * `balloonHeading`, `balloonRiseRows`, `balloonSplitsLeft`, `balloonIsSwelling`
 * and `balloonPull` are the rules (`balloon.ts`, `balloon-pull.ts`), and a
 * second spelling of a fallback is how the picture and the step come to
 * disagree about one body.
 */
export interface BalloonState {
  /**
   * How many times this balloon still comes apart before a rub finishes it.
   * Absent on every other kind, and zero on a small one — which is the only
   * state in which a rub pops rather than splits.
   *
   * Read it through `balloonSplitsLeft`: the count is what the rub, the worth
   * and the size render draws all read, and a second spelling of the fallback
   * is how the picture and the score come to disagree about which generation a
   * body belongs to.
   */
  balloonSplits?: number;
  /**
   * The beat this balloon came into being — the arrival's own, or the beat the
   * rub that made it landed on. Absent on every other kind.
   *
   * A moment and not a countdown, `echoBeat`'s rule and for its reason: a
   * stored countdown is a second copy of `balloonSwellBeats` that can disagree
   * with the config it came from, and render would then draw a body still
   * swelling that the simulation had already set climbing.
   */
  balloonBeat?: number;
  /**
   * Which way across the field the diagonal leans (`-1` left, `1` right), and
   * absent on every other kind. It is also which of the two side walls the
   * body is about to turn at.
   *
   * Read it through `balloonHeading`, never directly — the step, the lean
   * render draws and the wall it is heading for are three readings of one
   * number.
   */
  balloonDir?: CrossDir;
  /**
   * Rows this balloon climbs a beat, and columns it takes on the same beat.
   * Absent on a balloon the wave left at the shipped speed, which is what
   * `balloonRiseRows` answers — so a wave that authors nothing produces the
   * world it always did.
   */
  balloonRise?: number;
  /**
   * Thousandths of a tile the **pilot** has carried this balloon's left handle,
   * signed the way the field is (negative is left). Absent is the whole of "no
   * hand": a grab reports zero, so a balloon being held at rest still has a
   * field and one nobody has hold of has none.
   *
   * Read it through `balloonPull` and `balloonSideTaut`, never directly: the
   * stretch render draws on that side and the rub the simulation allows are
   * one number, and the pair's only readout of a partner's thumb is the
   * picture of it.
   */
  balloonPullP1?: number;
  /** The same for the **navigator** and this balloon's right handle. Its own
   * field rather than a share of one, because the whole creature is that the
   * two are held at the same instant by two different people: a single field
   * could not be taut twice. */
  balloonPullP2?: number;
}
