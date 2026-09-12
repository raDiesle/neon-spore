import type { CreatureKind } from "@neon-spore/sim";
import { RUMBLE } from "./motions.js";
import type { OwnMotion } from "./own-motion.js";
import type { CreatureSilhouette } from "./silhouettes.js";
import { WEIGHT } from "./silhouettes-weight.js";

/**
 * **How the bodies answered by two hands are drawn**, which is three different
 * answers to one question and the reason they are worth one file.
 *
 * Cut out of `living-look.ts` when THE WEIGHT's row took that table over its
 * 250-line limit — the table grows by a row per creature and the file was exactly
 * at the wall, so the next creature was always going to be the one cutting it.
 * The seam is the family `creatures-handed.ts` and `mechanics-handed.ts` already
 * name, said a third time, and `creatures-table.ts` is the pattern for spreading
 * it back in.
 *
 * The three answers, and none of them is an accident of who wrote them:
 *
 * - **THE BALLOON is `null` because it changes shape as it is played.** A blob
 *   contour is one radius sampled all the way round, so two hands stretching it
 *   apart would come out as a body growing evenly. `render/balloon.ts` draws it
 *   off the pulls themselves.
 * - **THE GUM is `null` because it is two pictures**, a sac in the air and a
 *   smear on the plating, and `render/gum.ts` draws both.
 * - **THE WEIGHT has a contour**, because the hands do nothing to its shape until
 *   the tick it gives: what a thumb changes is how brightly it is drawn and on
 *   whose screen (`render/weight.ts`), and the pressure that closes on it is an
 *   overlay rather than a body deformed. So the ordinary machinery draws it, and
 *   what it draws is the hanging draft THE GUM did not take — a sac with one
 *   shoulder fallen in (`silhouettes-weight.ts`) — swaying on `RUMBLE`, the one
 *   motion on the bank that reads as mass rather than buoyancy.
 */
export const HANDED_LOOK = {
  balloon: null,
  gum: null,
  weight: { shape: WEIGHT, motion: RUMBLE },
} as const satisfies Record<
  Extract<CreatureKind, "balloon" | "gum" | "weight">,
  { shape: CreatureSilhouette; motion: OwnMotion } | null
>;
