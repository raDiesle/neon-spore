import { walkedSilhouette } from "./body-form.js";
import type { CreatureSilhouette } from "./silhouettes.js";
import { SAC_SKIN, sacPoints } from "./silhouettes-gum.js";

/**
 * **THE CHOKE in the air: TENDRIL's sac**, taken off the shape sheet whole.
 *
 * `tools/shape-sheet/src/drafts/creatures.ts` offers TENDRIL — "long,
 * hanging, boneless" — as the sheet's sac at a shallow sag on a body nearly
 * three times taller than it is wide, drawn for the Colony's root. A choke
 * is that before anything else: a length of something boneless coming down
 * to wrap round the first thing it reaches. So the body is the draft's own
 * contour rather than a new one, at the draft's own three numbers, and it is
 * not THE GUM's: the gum is THE WEIGHT's sac, wider than it is tall at the
 * bottom and sagging nearly half its height, a drop; this is a strand. The
 * two are never on one wave, and at 26 px a drop and a strand are two words.
 *
 * What it becomes on the ship is not a contour at all — it is wound round
 * the cannon's swelling, and `render/choke.ts` draws that off the world.
 */

/** TENDRIL's three numbers: a shallow sag on a body tall and narrow. */
const CHOKE_BIAS = 0.34;
const CHOKE_RX = 24;
const CHOKE_RY = 66;

/** Lifted the way the gum is, so the strand hangs about its row rather than
 * a third of a tile under it (`silhouettes-gum.ts`). */
const CHOKE_LIFT = CHOKE_BIAS * CHOKE_RY;

export const CHOKE: CreatureSilhouette = walkedSilhouette({ ...SAC_SKIN }, (t) =>
  sacPoints(t, CHOKE_BIAS, CHOKE_RX, CHOKE_RY).map((p) => ({ x: p.x, y: p.y - CHOKE_LIFT })),
);
