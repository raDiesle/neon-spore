import { drawBossCue } from "./boss-cue-draw.js";
import { drawGaugeRound } from "./gauge-round.js";
import type { Layout } from "./layout.js";
import { drawPinballRound } from "./pinball-round.js";
import { drawPulseRound } from "./pulse-round.js";
import type { ViewState } from "./renderer.js";
import { drawScoutRound } from "./scout-round.js";
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
  pulse: drawPulseRound,
  scout: drawScoutRound,
};

/**
 * **A round's picture, and the one word it is asking for** — `true` when this
 * boss is a round and the whole stage has been drawn, `false` when it is a
 * boss standing over the ordinary field and the caller should go on.
 *
 * The cue lives here rather than at the two call sites because there are two:
 * the game (`canvas2d-takeover.ts`) and a rehearsal of the same round
 * (`guide-seat.ts`), and a round whose cue appeared in one and not the other
 * would be a film teaching a screen the game does not draw. The field's own
 * pass calls `drawBossCue` at the same point for the same reason
 * (`frame-field.ts`) — over the boss, under nothing.
 *
 * `skinY` is the flat hull: a round has no plating for a lobe to come up
 * through, which is the one thing that argument is for (`undertow-lobe.ts`).
 */
export function drawRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): boolean {
  const round = ROUND_DRAWS[view.world.boss?.kind ?? ""];
  if (round === undefined) return false;
  round(ctx, l, view);
  drawBossCue(ctx, l, view.world, view.beatPhase, view.time, () => l.hullY);
  return true;
}
