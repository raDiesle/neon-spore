import type { CreatureKind } from "@neon-spore/sim";
import type { OwnMotion } from "./own-motion.js";
import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * **How the body answered by two hands is drawn.**
 *
 * Cut out of `living-look.ts` when THE WEIGHT's row took that table over its
 * 250-line limit. THE WEIGHT went on 18 October 2026 — two hands held together
 * is a setting on THE BLISTER now — and the file stays as the family
 * `creatures-handed.ts` and `mechanics-handed.ts` already name.
 *
 * **THE BALLOON is `null` because it changes shape as it is played.** A blob
 * contour is one radius sampled all the way round, so two hands stretching it
 * apart would come out as a body growing evenly. `render/balloon.ts` draws it
 * off the pulls themselves.
 */
export const HANDED_LOOK = {
  balloon: null,
} as const satisfies Record<
  Extract<CreatureKind, "balloon">,
  { shape: CreatureSilhouette; motion: OwnMotion } | null
>;
