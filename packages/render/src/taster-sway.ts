import { beatSeconds, type SimConfig, type TasterPhase } from "@neon-spore/sim";
import { IDLE_DRIFT } from "./idle-drift.js";
import { OUTLINE_DRIFT, OUTLINE_SEED } from "./outline-drift.js";
import { noise1 } from "./solid-motion.js";

/**
 * **THE TASTER's fan sways like a field of wheat** (`docs/spec/living-bosses.md`
 * §1, the outline tier). One gust runs across the blades, each tip swinging a
 * moment after the one before it, so the fan ripples from one end to the
 * other. A tip swings by more than half a tile, which is seen (*Big enough to
 * be seen*, `docs/looks.md`), and two neighbours never differ by enough to
 * cross, because crossed blades are how the fan says *closed*.
 *
 * The tier's pose about one root would lean eleven columns about the middle,
 * small at the root and huge at the ends. Each blade already has its own
 * joint, its root in the crest, and a lean that slides its tip
 * (`bladePath`), so the sway is that lean and nothing else.
 *
 * **Nothing aimed at or pressed moves.** The pin and the pry stand at a
 * blade's root and the wipe in a column with no blade (`taster-grip.ts`), and
 * a shot is judged by column. The tip carries the lit edge, and the edge is
 * still over its column's root.
 *
 * **Only while the fan is being fed.** In `closed` the lean is the interlock
 * and says so on its own; in `out` it is the fan thrown open. A blade still
 * growing sways as far as it has grown.
 */

/** How far a full blade's tip swings across at the widest, in tiles. */
export const TASTER_SWAY = 0.7;
/** How long the gust takes from one blade to the next, in seconds. */
const GUST_LAG = 0.3;

/** How far blade `i`'s tip is swung at `beat` and `beatPhase` in `phase`, in tiles, for a full blade. */
export function tasterSway(
  cfg: SimConfig,
  phase: TasterPhase,
  i: number,
  beat: number,
  beatPhase: number,
): number {
  const k = OUTLINE_DRIFT.taster;
  if (k <= 0 || phase === "closed" || phase === "out") return 0;
  const seconds = (beat + beatPhase) * beatSeconds(cfg) - i * GUST_LAG;
  return k * TASTER_SWAY * noise1((seconds * 2) / IDLE_DRIFT.roll.period, OUTLINE_SEED.taster);
}
