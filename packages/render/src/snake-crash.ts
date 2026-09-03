import type { SnakeState } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";
import { type Arena, arenaX, arenaY } from "./snake-draw.js";
import { drawSnakeHead } from "./snake-head.js";
import { drawJointRibbon } from "./snake-ribbon.js";

/**
 * The pause between two attempts, as a picture.
 *
 * The attempt used to start over on the tick it ended: the body was in one
 * place, and on the next frame it was three tiles long at the bottom of the
 * arena with everything standing again. Neither seat could say what had
 * happened, which in a round whose whole content is two people saying what is
 * happening is the one thing it could not afford.
 *
 * So the simulation holds the arena still for `snakeStunTicks` and keeps the
 * body as it stood on the tick it went wrong (`SnakeState.ghost`), and this
 * file spends that pause on three separate things, in order:
 *
 * 1. **The bump.** The head drives its nose into whatever stopped it and comes
 *    back off it, and the body behind it folds up like an accordion — the
 *    segments crowd together and throw a zigzag out sideways, which is what a
 *    long thing does when the front of it stops and the back of it does not.
 *    The head is the same head as ever, drawn shut and with the tongue in:
 *    what is being said is that the animal ran into something, and an animal
 *    that ran into something is not tasting the air.
 * 2. **The dotted outline**, tile by tile, of where the body was. It is the
 *    placeholder the arena is left holding: the shape is gone and the mark it
 *    made is still there for a moment.
 * 3. **The return.** The body is drawn back in at the starting square, growing
 *    out of a ring the way it grew out of the ship at the top of the round.
 *
 * Stateless like everything else here: the whole of it is `world.tick` against
 * the round's own `repeatTick`, so two devices are at the same point of the
 * same crash and a restart has nothing to carry over.
 */

/** Where the bump ends and the outline is all that is left. */
const BUMP_END = 0.36;
/** Where the outline is gone and the body starts coming back. */
const RETURN_START = 0.6;

/**
 * How far through the pause this tick is, 0 to 1, or `null` when there is no
 * pause running — before the first crash, and after the body has set off.
 */
export function crash01(snake: SnakeState, tick: number, stunTicks: number): number | null {
  if (stunTicks <= 0 || snake.ghost.length === 0) return null;
  const age = tick - snake.repeatTick;
  if (age < 0 || age >= stunTicks) return null;
  return age / stunTicks;
}

/**
 * How much of the returning body to draw, 0 to 1. Called by the round so the
 * body it already knows how to draw can be faded in rather than drawn twice.
 */
export function crashReturn(crash: number): number {
  return Math.max(0, Math.min(1, (crash - RETURN_START) / (1 - RETURN_START)));
}

/** The bump and the mark it leaves. The returning body is the round's own. */
export function drawSnakeCrash(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  snake: SnakeState,
  showBody: boolean,
  crash: number,
): void {
  if (crash < BUMP_END) {
    const fade = crash < BUMP_END * 0.7 ? 1 : 1 - (crash - BUMP_END * 0.7) / (BUMP_END * 0.3);
    const joints = foldedJoints(arena, snake, crash / BUMP_END);
    const head = joints[0];
    ctx.save();
    ctx.globalAlpha = Math.max(0, fade);
    drawJointRibbon(ctx, arena, joints, showBody);
    // Shut, and with no tongue out: `drawSnakeHead` takes a gape and a flick,
    // and both are zero here on purpose.
    if (head) drawSnakeHead(ctx, arena, head, snake.ghostDirCol, snake.ghostDirRow, 0, 0);
    ctx.restore();
    knock(ctx, arena, snake, crash / BUMP_END);
  }
  if (crash < RETURN_START) {
    const fade = crash < BUMP_END ? 1 : 1 - (crash - BUMP_END) / (RETURN_START - BUMP_END);
    outline(ctx, arena, snake, Math.max(0, fade));
  }
  const back = crashReturn(crash);
  if (back > 0) ring(ctx, arena, snake, back);
}

/**
 * The ghost body, squeezed.
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
  const dx = snake.ghostDirCol;
  const dy = snake.ghostDirRow;
  const nose = arena.tile * 0.3 * Math.sin(Math.min(1, t / 0.35) * Math.PI);
  return snake.ghost.map((tile, i) => {
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
  const a = Math.atan2(snake.ghostDirRow, snake.ghostDirCol);
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

/**
 * The placeholder: one dashed square a tile, on every tile the body was
 * standing on. Dashed rather than filled, because what it says is "there was
 * something here", which is the one thing a solid shape cannot say.
 */
function outline(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  snake: SnakeState,
  fade: number,
): void {
  if (fade <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = fade * 0.7;
  ctx.strokeStyle = PALETTE.shieldRim;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([arena.tile * 0.16, arena.tile * 0.12]);
  const pad = arena.tile * 0.18;
  for (const tile of snake.ghost) {
    ctx.strokeRect(
      arenaX(arena, tile.col) + pad,
      arenaY(arena, tile.row) + pad,
      arena.tile - pad * 2,
      arena.tile - pad * 2,
    );
  }
  ctx.setLineDash([]);
  ctx.restore();
}

/**
 * The seam the body comes back through: a ring on the starting square that
 * tightens as the body arrives. The morph's own mark, one round along — a
 * shape that only fades in reads as a shape appearing, and something has to
 * say *here*.
 */
function ring(ctx: CanvasRenderingContext2D, arena: Arena, snake: SnakeState, back: number): void {
  const head = snake.body[0];
  if (!head || back >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - back;
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(
    arenaX(arena, head.col) + arena.tile / 2,
    arenaY(arena, head.row) + arena.tile / 2,
    arena.tile * (1.1 - 0.6 * back),
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.restore();
}
