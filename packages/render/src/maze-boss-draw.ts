import type { MazeState, World } from "@neon-spore/sim";
import type { Effects } from "./effects.js";
import type { Layout } from "./layout.js";
import { drawMaze } from "./maze-draw.js";
import { drawMazeFuse } from "./maze-fuse.js";
import type { ViewState } from "./renderer.js";

/**
 * THE MAZE's whole pass over the boss layer, in the order the eye reads it:
 * the drum (`maze-draw.ts`); the navigator's thumb landing on the heart or
 * leaving it, thrown off it over everything the drum drew, and the verdicts
 * on both parts (`maze-grip-fx.ts`, `maze-marks.ts`); and last, how long the
 * pair has, on the fuse every boss wears (`maze-fuse.ts`). Its own file so
 * `boss-draw.ts` stays one call a boss.
 */
export function drawMazeBoss(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  boss: MazeState,
  view: ViewState,
  effects: Effects,
): void {
  drawMaze(ctx, l, world.cfg, boss, view.role, world.beat, view.beatPhase, view.time);
  effects.boss.maze.draw(ctx, l, world.cfg, boss);
  drawMazeFuse(ctx, l, world, boss, view.beatPhase);
}
