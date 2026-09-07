import type { CaromDir } from "./carom.js";
import type { CoilDir } from "./coil-state.js";
import type { DartDir } from "./dart.js";
import type { GhostDir } from "./ghost.js";
import type { RockCross } from "./rock-cross.js";

/**
 * **The four kinds that carry a heading**: THE DART's two sides and the beat
 * it hangs on, THE GHOST's walk and its laps, THE CAROM's diagonal, THE COIL's
 * crossing and the beat a charge landed on it.
 *
 * Cut out of `creature-state.ts` on purpose rather than under pressure — that
 * file sat at 250 lines exactly and grows by a field for nearly every creature
 * added, so the next lane to add one would have been the lane choosing where
 * the cut went (`docs/queue.md`, 6 September 2026). It is the sixth group
 * carried out along the seam that file's own header describes.
 *
 * What holds these eight together is the question they answer: **which column
 * this body reaches next**, as against the rest of `CreatureState`, which says
 * what a body still is. That is also what makes them the loudest fields in the
 * fingerprint — two devices that disagree about one of them are two devices
 * holding the same body on opposite sides of the field.
 *
 * **Absent is a value here, always**, and none of these may be read directly:
 * `dartHeading`, `ghostCrosses`, `caromHeading` and `coilHeading` are the
 * rules, and a second spelling of a fallback is how the picture and the step
 * come to disagree about one body.
 */
export interface HeadingState {
  /**
   * The dart's three fields, and `dart.ts` is the whole of what they mean.
   * `dartDir` is the side it is concerned with now (`-1` left, `1` right),
   * `dartNext` the side of the move after that — rolled a beat early, which is
   * what lets a path be previewed while the body is still in the air — and
   * `dartFloat` says which beat of the two it is on: true while it hangs.
   *
   * Read the two sides through `dartHeading` and `dartNextHeading`, never
   * directly: the lean, the jet, the arrow and the previewed legs are five
   * pictures of two numbers, and a second copy of the fallback is how they
   * come to disagree.
   */
  dartDir?: DartDir;
  dartFloat?: boolean;
  dartNext?: DartDir;
  /**
   * THE GHOST's two fields, and `ghost.ts` is the whole of what they mean.
   * `ghostDir` is which way along its row a *crossing* ghost is going (`-1`
   * left, `1` right) and its presence is the path itself — absent means this
   * ghost falls like every other body. `ghostLaps` is how many walls it has
   * already turned at, which is how angry it is, and at `ghostChargeLaps` it
   * stops prowling and comes down at the hull.
   *
   * Read them through `ghostCrosses`, `ghostLaps` and `ghostIsCharging`, never
   * directly: the picture that drops the camouflage, the step that decides
   * which way the body moves and the damage the hull takes are three readings
   * of one count, and a second copy of the threshold is how they disagree.
   */
  ghostDir?: GhostDir;
  ghostLaps?: number;
  /**
   * Which way across the field THE CAROM is going (`-1` left, `1` right), and
   * absent on every other kind. It is the only state this creature carries,
   * and it answers two questions at once: which column the diagonal reaches
   * next, and which of the two side walls it is about to turn at.
   *
   * Read it through `caromHeading`, never directly. A rock made out of a carom
   * carries no heading at all — `caromStruck` clears it, because a body that
   * has stopped crossing has no side to be going to — so absent and "straight
   * down" mean the same thing, and a site that spelled the fallback again is a
   * site where the lean render draws and the column the body lands in can
   * disagree.
   */
  caromDir?: CaromDir;
  /**
   * THE COIL's two, and `coil.ts` is the whole of what they mean. `coilDir` is
   * which way across the field this one is crossing (`-1` left, which is where
   * every coil sets off) and `coilLit` is the **beat the charge from another
   * failed dome landed on it** — absent while nothing has been sent its way,
   * which is what makes the field's absence the answer to "is this one about
   * to come open".
   *
   * Read them through `coilHeading`, `coilCharged` and `coilDue`, never directly.
   * The bolt render draws, the beat the dome fails on and the wall the body is
   * heading for are readings of these two numbers, and a second copy of either
   * fallback is how the picture and the step come to disagree about which
   * column the pair should be standing in.
   *
   * `coilLit` is a moment rather than a countdown, and that is load-bearing
   * here rather than tidy: a countdown would be ticked by the same loop that
   * opens the domes, so a body chained by one standing later in
   * `world.creatures` would lose a beat that one standing earlier kept — a
   * creature whose timing depended on array order.
   */
  coilDir?: CoilDir;
  coilLit?: number;
  /**
   * **A plain rock's crossing**, and the one pair of fields here that belongs
   * to a *path* rather than to a kind. `rockDir` is which way along its row
   * this rock is walking (`-1` left, `1` right) and its presence is the path
   * itself — absent means the rock falls and holds its lane, which is every
   * rock authored before crossing existed. `rockRow` is the row it walks
   * along, which is also the row it stops falling at.
   *
   * Read them through `rockCrosses`, `rockHeading` and `rockCrossRow`, never
   * directly (`rock-cross.ts`): the column the shield has to cover, the wall
   * the body is heading for and the beat it starts turning at are readings of
   * these two numbers, and a second copy of either fallback is how the picture
   * and the step come to disagree about which lane the pair should be in.
   */
  rockDir?: RockCross;
  rockRow?: number;
}
