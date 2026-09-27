import { beatSeconds, type CurtainState, type SimConfig } from "@neon-spore/sim";
import { curtainHemPull } from "./curtain-grip.js";
import { IDLE_DRIFT, subSeed } from "./idle-drift.js";
import type { Layout } from "./layout.js";
import { OUTLINE_DRIFT, OUTLINE_SEED } from "./outline-drift.js";
import { noise1 } from "./solid-motion.js";

/**
 * **THE CURTAIN sways in a draught** (`docs/spec/living-bosses.md` §1, the
 * outline tier). The rail is held and the hem swings across, the whole
 * sheet sheared about its top edge — what the shove's trail already does
 * (`curtain-draw.ts`), on a wander instead of a push. Its corners swing by
 * more than half a tile, which is seen (*Big enough to be seen*,
 * `docs/looks.md`).
 *
 * The tier's pose about one root, or about each scallop's joint, is the
 * wrong move for this body: seven columns about the middle lean huge at the
 * ends, and a scallop a tile wide and an eighth deep turned about its joint
 * moves nothing anybody sees. A curtain is held at the top and free at the
 * bottom, so that is how it moves.
 *
 * **The beads do not swing.** Each is the lobe a shot up its column breaks
 * (`sim/curtain-shot.ts`), so it stays over that column and the cloth slides
 * under it; the hem's ring stands on the hem's line, which a swing across
 * does not move. Nothing that is aimed at or pressed moves with the sway.
 * **Nor does the cloth uncover anything**: only the edge it swings toward
 * reaches out, and the trailing edge stays over its column
 * (`curtainHem`), so the navigator never sees a covered core poke out
 * from under the cloth and read as a bare one.
 *
 * **It dies as the hem is gathered**, since cloth drawn up to the rail has
 * nothing left to swing, and it is still once the sheet is `out`.
 */

/** How far the hem's corners swing across at the widest, in tiles. */
export const CURTAIN_SWAY = 0.75;

/** How far across the hem is swung at `beat` and `beatPhase`, in pixels. */
export function curtainSway(
  l: Layout,
  cfg: SimConfig,
  c: CurtainState,
  beat: number,
  beatPhase: number,
): number {
  const k = OUTLINE_DRIFT.curtain * (1 - curtainHemPull(cfg, c));
  if (k <= 0 || c.phase === "out") return 0;
  const seconds = (beat + beatPhase) * beatSeconds(cfg);
  const wander = noise1((seconds * 2) / IDLE_DRIFT.roll.period, subSeed(OUTLINE_SEED.curtain, 3));
  return k * l.tile * CURTAIN_SWAY * wander;
}
