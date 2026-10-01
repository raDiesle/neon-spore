import { beatSeconds, type SimConfig } from "@neon-spore/sim";
import { subSeed } from "./idle-drift.js";
import { OUTLINE_SEED, type OutlinePose, outlinePose } from "./outline-drift.js";
import { LOBE_TILES } from "./undertow-shape.js";

/**
 * **THE UNDERTOW leans where it comes up through the plating** — the outline
 * tier's pose (`outline-drift.ts`) about the point where each lobe
 * crosses the hull's skin. What is under the skin is hidden by the
 * hull, so the root is the one place a lean cannot be seen to come from.
 * The top of a lobe leans by more than half a tile, which is seen (*Big
 * enough to be seen*, `docs/looks.md`).
 *
 * **Each lobe on its own seed**, from its column, so a row of them sways
 * like weed rather than in step. A lobe still rising leans as far as it has
 * risen: the cap is a distance, and a lobe a tenth of a tile tall taking the
 * whole of it would fold flat.
 *
 * **The tap on a tall lobe is judged by column**, not on the outline
 * (`handles.ts`): a lobe four tiles tall leaning a tile to the side is still
 * the column it stands in, and a thumb that lands on the lean's far edge
 * lands on the column. So the lean touches the drawing and nothing else.
 */

/** A lobe's pose at `beat` and `beatPhase`, standing `tiles` tall in `col`, `tile` pixels a tile. */
export function lobePose(
  cfg: SimConfig,
  col: number,
  tiles: number,
  tile: number,
  beat: number,
  beatPhase: number,
): OutlinePose | null {
  const grown = Math.min(1, tiles / LOBE_TILES);
  const seed = subSeed(OUTLINE_SEED.undertow, col);
  return outlinePose("undertow", seconds(cfg, beat, beatPhase), grown, tiles * tile, tile, seed);
}

function seconds(cfg: SimConfig, beat: number, beatPhase: number): number {
  return (beat + beatPhase) * beatSeconds(cfg);
}
