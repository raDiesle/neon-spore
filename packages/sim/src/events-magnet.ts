import type { Color } from "./types.js";

/**
 * **What THE MAGNET does**, as events: a bolt turned away by the plate slung
 * under the body, and the body coming apart when one got past it.
 *
 * Its own file on `events-fence.ts`'s terms exactly — `events-creature.ts` was
 * at its 250-line limit and this is one arrival taken apart rather than two
 * incidents that happen to share a creature. The seam is the same one four
 * creatures have already been cut along, and it is the honest one: these two
 * are the only answers this body ever gives, and the second is only legible
 * beside the first.
 */
export type MagnetEvent =
  /**
   * A shot climbing too straight met the plate and did nothing at all.
   *
   * Its own event rather than a `reject`, because the ear has to be able to
   * tell *wrong colour* from *wrong bearing*: they are two different mistakes
   * made by two different seats, and a pair that hears one sound for both will
   * keep reloading when what they had to do was move the cannon.
   */
  | { type: "magnetPlate"; col: number; row: number; color: Color }
  /**
   * A magnet came apart. It rides beside the ordinary `destroy` on the same
   * tick rather than in place of it, on `veilTorn`'s terms: the kill is a kill
   * and gets the kill's burst, its sound and its score, and this is the arch
   * breaking on top of it.
   *
   * `color` is the pole that took it and `fromLeft` the side the bolt came in
   * on, because the two halves are thrown the way it was going — a break drawn
   * without the bearing would be the one picture in this creature that says
   * nothing about the thing the pair had to get right.
   */
  | { type: "magnetBreak"; col: number; row: number; color: Color; fromLeft: boolean };
