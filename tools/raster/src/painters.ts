import type { StripName } from "@neon-spore/render";
import { drawPlumbSettleFrame } from "./plumb-settle-art.js";
import type { StripPainter } from "./render-strip.js";
import { drawRimeClearFrame } from "./rime-clear-art.js";
import { drawTrivetPlantFrame } from "./trivet-plant-art.js";
import { drawViseCrackFrame } from "./vise-crack-art.js";

/**
 * The painter of every row in `PAINTED_STRIPS`, by the row's name. Typed on
 * every name, so a row without a painter is a type error before it is a
 * strip `bun run raster` cannot bake. Its own file for `spec.ts`'s reason:
 * importing it from `run.ts` would bake every asset to ask a question.
 */
export const PAINTERS: Record<StripName, StripPainter> = {
  "vise-crack": drawViseCrackFrame,
  "rime-clear": drawRimeClearFrame,
  "trivet-plant": drawTrivetPlantFrame,
  "plumb-settle": drawPlumbSettleFrame,
};
