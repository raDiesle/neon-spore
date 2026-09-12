import { walkedSilhouette } from "./body-form.js";
import type { CreatureSilhouette } from "./silhouettes.js";
import { SAC_SKIN, sacPoints } from "./silhouettes-gum.js";

/**
 * **THE WEIGHT: the slumped sac**, the louder of the two hanging drafts, taken
 * off the shape sheet whole.
 *
 * `tools/shape-sheet/src/forms/hanging.ts` draws the pair — `sac`, a blob with
 * its mass pulled to the bottom, and `slumped`, the same sag with one shoulder
 * fallen in. THE GUM took the first (`silhouettes-gum.ts`), so this is the
 * second, and the choice is the one CLAUDE.md asks for: a new body is never a
 * shape the game already draws, and it comes off the drafts rather than out of
 * nothing.
 *
 * **The dent is the whole reason it is legible at arm's length.** A sac moves
 * mass and changes no landmark, so the difference between one and a pod is a
 * proportion — and the sheet's own note says an eye has nothing to point at. A
 * fallen shoulder cuts a landmark, which is far easier to see on a phone at the
 * top of the field, and it says the right thing about this body besides: a mass
 * that has *already* partly given way is a mass two hands can finish.
 *
 * Wider than it is tall, which is the other half of telling it from the gum:
 * a gum is a drop, taller than wide and about to land on something; a weight is
 * a load, spread across its lane and coming down on the pair.
 */

/**
 * How far the shoulder has fallen in, as a fraction of the radius — **the
 * deepest dent this body can carry and still be nameable**.
 *
 * The shape sheet's loud husk is 0.35, and a card on a page can afford it. A
 * body cannot: at 0.30 the dent reads as a third lobe on some frames of the own-
 * motion and two on others, so `nameability.test.ts` opens the lobe span to
 * [2, 3] and the creature has no lobe count at all — one on some frames and
 * another on the rest, which is worse than either. 0.25 is the last value that
 * holds the span to a point, so the dent is as loud as the rule allows and not a
 * thousandth louder.
 */
const WEIGHT_CROWN = 0.25;
/** The sag. A little under the gum's, because a body this wide reads as heavy
 * from its width and a deeper pull would make it a teardrop again. */
const WEIGHT_BIAS = 0.4;
const WEIGHT_RX = 92;
const WEIGHT_RY = 80;

/** A sac's mass hangs below its origin by `bias * ry`, and the field draws a
 * body about its cell's centre — so the contour is lifted by that much and the
 * load sits on its row rather than a third of a tile under it (`GUM_LIFT`). */
const WEIGHT_LIFT = WEIGHT_BIAS * WEIGHT_RY;

export const WEIGHT: CreatureSilhouette = walkedSilhouette({ ...SAC_SKIN }, (t) =>
  sacPoints(t, WEIGHT_BIAS, WEIGHT_RX, WEIGHT_RY, SAC_SKIN, 64, WEIGHT_CROWN).map((p) => ({
    x: p.x,
    y: p.y - WEIGHT_LIFT,
  })),
);
