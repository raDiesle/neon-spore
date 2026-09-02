import { drawGaugeRound } from "./gauge-round.js";
import type { Layout } from "./layout.js";
import { drawPinballRound } from "./pinball-round.js";
import type { ViewState } from "./renderer.js";
import { drawSnakeRound } from "./snake-round.js";

/**
 * Which bosses replace the whole picture, and what draws each.
 *
 * A boss absent from this table is one drawn *over* the field in the ordinary
 * way; a boss in it is a **round**, whose first condition is that the field is
 * gone rather than dimmed (`docs/spec/interludes.md`). `canvas2d.ts` reads it
 * once and returns, so none of the field's passes run at all.
 *
 * A table rather than a branch each, and its own file rather than a const at
 * the top of a renderer: the three differ in what they draw and in nothing
 * else, there are nine more rounds designed, and a fourth added here cannot
 * forget the `restore` or the wave's opening the way a fourth branch could.
 */
export const ROUND_DRAWS: Record<
  string,
  (ctx: CanvasRenderingContext2D, l: Layout, view: ViewState) => void
> = {
  gauge: drawGaugeRound,
  snake: drawSnakeRound,
  pinball: drawPinballRound,
};
