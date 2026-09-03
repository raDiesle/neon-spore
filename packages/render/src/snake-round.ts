import { SNAKE_MORPH_BEATS, type SnakeState } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { drawSnakeBody, snakeSlide } from "./snake-body.js";
import { crash01, crashReturn, drawSnakeCrash } from "./snake-crash.js";
import {
  type Arena,
  drawArena,
  drawSnakeItems,
  drawSnakeRocks,
  showsSnakeBody,
  showsSnakeFood,
  snakeArena,
} from "./snake-draw.js";
import { drawSnakeMorph, morphBodyGrowth } from "./snake-morph.js";
import { drawControls, drawTally, drawTitle, drawVerdict } from "./snake-panel.js";
import { drawSnakeShot } from "./snake-shot.js";

/**
 * SNAKE over the whole stage.
 *
 * `canvas2d.ts` hands the frame over and draws nothing else — no grid, no
 * hull, no band. That is the round's first condition, and it is the same one
 * THE GAUGE established: the field is *gone*, not dimmed and not re-skinned.
 *
 * This file is the arena: what is standing in it, the body in it, and the fold
 * that puts the body there. Everything *around* it — the two lines under the
 * name, the clock, the buttons and the verdict — is `snake-panel.ts`, which is
 * the half that says which screen this is.
 */

export function drawSnakeRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "snake") return;

  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, l.width, l.height);
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(6.5, 6.5, Math.max(1, l.width - 13), Math.max(1, l.height - 13));

  ctx.textAlign = "center";
  drawTitle(ctx, l, view.role, boss);
  const arena = snakeArena(l, view.world.cfg);
  drawArena(ctx, arena);
  drawBodies(ctx, l, arena, view, boss);
  drawTally(ctx, l, view, boss);
  drawControls(ctx, l, view, boss);
  // The verdict stands through `spent` too: the round is over and holding
  // its own picture until the next wave arrives (`sim/wave-end.ts`).
  if (boss.phase === "verdict" || boss.phase === "spent") drawVerdict(ctx, l, boss);
  ctx.textAlign = "left";
}

/**
 * The fold, as a number: 0 the moment the ship starts becoming the snake and 1
 * the moment the body sets off. Derived from the round's own phase beat and
 * nothing else, so a restart cannot carry half a fold into the next run.
 */
function morph01(view: ViewState, round: SnakeState): number {
  if (round.phase !== "morph") return 1;
  const beats = view.world.beat - round.phaseBeat + view.beatPhase;
  return Math.max(0, Math.min(1, beats / SNAKE_MORPH_BEATS));
}

/**
 * Everything inside the wall: the meteors both screens carry, the arena's own
 * things on the one screen that gets them, the body, and the shot that has
 * just been taken.
 *
 * During the fold the ship is drawn over the top of all of it, and the body
 * grows out from under it (`snake-morph.ts`).
 */
function drawBodies(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  arena: Arena,
  view: ViewState,
  round: SnakeState,
): void {
  const fold = morph01(view, round);
  const pulse = Math.abs(0.5 - view.beatPhase) * 2;
  const shows = showsSnakeBody(view.role);
  drawSnakeRocks(ctx, arena, round);
  if (showsSnakeFood(view.role)) drawSnakeItems(ctx, arena, round, pulse);
  // The pause after a crash. While it runs the body on the world is standing
  // at the start doing nothing, so what is drawn is the one that crashed
  // folding up, and the one at the start only once it is time for it to come
  // back (`snake-crash.ts`).
  const crash = crash01(round, view.world.tick, view.world.cfg.snakeStunTicks);
  if (crash !== null) drawSnakeCrash(ctx, arena, round, shows, crash);
  const grown = morphBodyGrowth(fold) * (crash === null ? 1 : crashReturn(crash));
  if (grown > 0) {
    ctx.save();
    // The body is extruded, not faded: while the fold runs, only the part of
    // it that has come out of the ship is drawn at all. The return from a
    // crash borrows the same ramp, which is what makes the two arrivals one
    // picture rather than two.
    ctx.globalAlpha = Math.min(1, grown * 1.6);
    drawSnakeBody(
      ctx,
      arena,
      round,
      shows,
      snakeSlide(round, view.world.tick),
      gape(view, round),
      flick(view.world.tick),
    );
    ctx.restore();
  }
  // One beat of afterglow, and no state kept for it: the world says which beat
  // the shot left on, so the fade is that number against this one.
  const since = view.world.beat - round.shotBeat + view.beatPhase;
  if (since < 1.2) {
    drawSnakeShot(ctx, arena, round, 1 - since / 1.2, snakeSlide(round, view.world.tick));
  }
  if (fold < 1) drawSnakeMorph(ctx, l, arena, view, round, fold);
}

/**
 * How far through one flick of the tongue this tick is, 0 to 1.
 *
 * A whole cycle in `FLICK_TICKS` — the dart out, the pause and the wait — read
 * straight off the tick counter and nothing else. It belongs here beside
 * `gape` for the same reason `gape` is here: both are the world reduced to one
 * number for the drawing, so `snake-head.ts` is handed a phase rather than
 * left to invent one out of a clock it must not have.
 */
export function flick(tick: number): number {
  return (((tick % FLICK_TICKS) + FLICK_TICKS) % FLICK_TICKS) / FLICK_TICKS;
}

/** Ticks in one flick of the tongue: a little under a second at sixty. */
const FLICK_TICKS = 52;

/**
 * How wide the mouth is standing open, 0 to 1.
 *
 * Read off the world's own window and eased at both ends, so the jaws *swing*:
 * a mouth that snapped to full gape and back would be a light going on and off
 * where what the pair has to read is a movement. The window itself is the
 * simulation's (`snakeMawTicks`), so what is drawn open is exactly what would
 * swallow a point.
 */
export function gape(view: ViewState, round: SnakeState): number {
  const span = view.world.cfg.snakeMawTicks;
  const age = view.world.tick - round.mawTick;
  if (age < 0 || age >= span) return 0;
  const t = age / span;
  // Snaps open over the first eighth, **stands open for three quarters of the
  // window**, and swings shut over what is left. The owner asked for a mouth
  // that stays open longer, and there were two ways to give it: the window
  // itself is longer now (`snakeMawTicks`), and the share of it spent wide
  // open went from under half to three quarters. The jaws used to start
  // closing about as soon as they had finished opening, which read as a
  // twitch rather than as a mouth held open for something to be driven into.
  if (t < 0.12) return t / 0.12;
  if (t < 0.86) return 1;
  return 1 - (t - 0.86) / 0.14;
}
