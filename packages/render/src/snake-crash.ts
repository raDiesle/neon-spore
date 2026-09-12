import { type SnakeState, snakeCrashed } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";
import { drawSnakeHead } from "./snake-head.js";
import { drawJointRibbon } from "./snake-ribbon.js";

/**
 * The crash, as a picture.
 *
 * A crash is the wave lost: the simulation leaves the body exactly as it
 * stood on the tick it went wrong and the field holds from that tick, so the
 * pair sees where it happened before the whole wave is played again
 * (`sim/wave-fail.ts`). What this file spends the first part of that hold on
 * is **the bump** — the head drives its nose into whatever stopped it and
 * comes back off it, and the body behind it folds up like an accordion: the
 * segments crowd together and throw a zigzag out sideways, which is what a
 * long thing does when the front of it stops and the back of it does not. The
 * head is the same head as ever, drawn shut and with the tongue in: what is
 * being said is that the animal ran into something, and an animal that ran
 * into something is not tasting the air. When the bump is spent the round's
 * own body is drawn again, standing where it stopped.
 *
 * It used to go on from there — a dotted outline where the body had been, and
 * the body drawn back in at the starting square — because the round started
 * the attempt over itself. It does not any more, and a body coming back for
 * an attempt that never begins was two arrivals for one failure: the wave's
 * own restart is the one the pair gets.
 *
 * Stateless like everything else here: the whole of it is `world.tick`
 * against the round's own `crashTick`, so two devices are at the same point
 * of the same crash and a restart has nothing to carry over.
 */

/**
 * Ticks the bump takes, from the nose going in to the body standing still
 * again. Under a beat: a fold that took longer read as rubber.
 */
const BUMP_TICKS = 54;

/**
 * How far through the bump this tick is, 0 to 1, or `null` when there is no
 * bump running — before the crash, and once the body has come to rest.
 */
export function crash01(snake: SnakeState, tick: number): number | null {
  if (!snakeCrashed(snake)) return null;
  const age = tick - snake.crashTick;
  if (age < 0 || age >= BUMP_TICKS) return null;
  return age / BUMP_TICKS;
}

/** The bump, in place of the round's own body while it runs. */
export function drawSnakeCrash(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  snake: SnakeState,
  showBody: boolean,
  crash: number,
): void {
  const joints = foldedJoints(arena, snake, crash);
  const head = joints[0];
  drawJointRibbon(ctx, arena, joints, showBody);
  // Shut, and with no tongue out: `drawSnakeHead` takes a gape and a flick,
  // and both are zero here on purpose.
  if (head) drawSnakeHead(ctx, arena, head, snake.dirCol, snake.dirRow, 0, 0);
  knock(ctx, arena, snake, crash);
}

/**
 * The body, squeezed.
 *
 * Two things happen to it at once and both come off the same number. It
 * **compresses**: every joint is pulled towards the head along the line it was
 * travelling, so the segments crowd up behind a nose that has stopped. And it
 * **buckles**: the slack has to go somewhere, so alternate joints are thrown
 * out to alternate sides, which is the accordion the owner asked for. The nose
 * itself goes a little way into what stopped it and comes back out, on one
 * half-cycle of a sine — a bump rather than a bounce, because a body that
 * bounced twice would read as rubber.
 */
function foldedJoints(arena: Arena, snake: SnakeState, t: number): { x: number; y: number }[] {
  // Hard in over the first fifth, then easing back out: the fold is an impact
  // and an impact is not symmetrical.
  const press = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
  const squash = Math.max(0, press);
  const dx = snake.dirCol;
  const dy = snake.dirRow;
  const nose = arena.tile * 0.3 * Math.sin(Math.min(1, t / 0.35) * Math.PI);
  return snake.body.map((tile, i) => {
    const x = arenaX(arena, tile.col) + arena.tile / 2;
    const y = arenaY(arena, tile.row) + arena.tile / 2;
    // Along: towards the head by up to half a tile a segment.
    const pull = arena.tile * 0.5 * squash * i;
    // Across: alternating sides, and nothing at all at the head, which is the
    // end that is held against what it hit.
    const buckle = arena.tile * 0.34 * squash * (i % 2 === 0 ? 1 : -1) * Math.min(1, i / 1.5);
    return {
      x: x + dx * (pull + (i === 0 ? nose : 0)) - dy * buckle,
      y: y + dy * (pull + (i === 0 ? nose : 0)) + dx * buckle,
    };
  });
}

/**
 * The knock itself: two arcs of light running out of what was hit.
 *
 * They are centred on the tile the head *went to*, which for a wall is a tile
 * off the board, and that is on purpose: on the contact face itself they sat
 * squarely under the nose that had just been drawn into it and could not be
 * seen at all. On the struck tile they are past the head, which is where a
 * shock coming off something belongs anyway.
 */
function knock(ctx: CanvasRenderingContext2D, arena: Arena, snake: SnakeState, t: number): void {
  if (t > 0.75) return;
  const x = arenaX(arena, snake.bumpCol) + arena.tile / 2;
  const y = arenaY(arena, snake.bumpRow) + arena.tile / 2;
  const a = Math.atan2(snake.dirRow, snake.dirCol);
  const grow = Math.min(1, t / 0.3);

  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - t / 0.75);
  ctx.translate(x, y);
  ctx.rotate(a);
  // Two arcs running out of the contact point, one behind the other, which is
  // the shape a shock makes. Chips crossing them read as a scratch rather than
  // as an impact, which is what a first try at this looked like.
  ctx.strokeStyle = PALETTE.hullRim;
  for (const [i, spread] of [1.5, 1.15].entries()) {
    const dim = i === 0 ? 1 : 0.55;
    ctx.globalAlpha *= dim;
    ctx.lineWidth = i === 0 ? 2.6 : 1.6;
    ctx.beginPath();
    // Backwards: the near arc leaves first and the far one follows it, so the
    // pair reads as one ripple travelling rather than as two rings.
    ctx.arc(0, 0, arena.tile * (0.18 + 0.5 * grow) * (i === 0 ? 0.66 : 1), -spread, spread);
    ctx.stroke();
    ctx.globalAlpha /= dim;
  }
  ctx.restore();
}
