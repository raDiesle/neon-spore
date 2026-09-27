import { beatSeconds, type SimConfig } from "@neon-spore/sim";
import { subSeed } from "./idle-drift.js";
import { OUTLINE_SEED, type OutlinePose, outlinePose } from "./outline-drift.js";
import { LOBE_TILES } from "./undertow-shape.js";

/**
 * **THE UNDERTOW leans where it comes up through the plating** — the outline
 * tier's pose (`outline-drift.ts`) about the point where each lobe, and once
 * the body, crosses the hull's skin. What is under the skin is hidden by the
 * hull, so the root is the one place a lean cannot be seen to come from.
 * The top of a lobe leans by more than half a tile, which is seen (*Big
 * enough to be seen*, `docs/looks.md`).
 *
 * **Each lobe on its own seed**, from its column, so a row of them sways
 * like weed rather than in step. A lobe still rising leans as far as it has
 * risen: the cap is a distance, and a lobe a tenth of a tile tall taking the
 * whole of it would fold flat.
 *
 * **Nothing is hit-tested on a lobe.** The pin's ring and the free's stand
 * over the column, where a plate would, and are drawn and hit-tested there
 * (`undertow-grip-place.ts`); the cannon's shot is judged by column. So the
 * lean touches the drawing and nothing else. The clock is still the beat,
 * as every lifted boss's is, so a hit test could follow it if one ever
 * lands on a lobe.
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

/** The body's pose, `tiles` tall above its breach. */
export function bodyPose(
  cfg: SimConfig,
  tiles: number,
  tile: number,
  beat: number,
  beatPhase: number,
): OutlinePose | null {
  const grown = Math.min(1, tiles / LOBE_TILES);
  return outlinePose("undertow", seconds(cfg, beat, beatPhase), grown, tiles * tile, tile);
}

function seconds(cfg: SimConfig, beat: number, beatPhase: number): number {
  return (beat + beatPhase) * beatSeconds(cfg);
}
