import { controlSetForWave } from "@neon-spore/content";
import { SNAKE_MORPH_BEATS, type SnakeState } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { slabPanel } from "./slabs.js";
import { drawSnakeBody } from "./snake-body.js";
import {
  type Arena,
  drawArena,
  drawSnakeItems,
  drawSnakeShot,
  showsSnakeBody,
  showsSnakeFood,
  snakeArena,
} from "./snake-draw.js";
import { drawSnakeMorph, morphBodyAlpha } from "./snake-morph.js";

/**
 * SNAKE over the whole stage.
 *
 * `canvas2d.ts` hands the frame over and draws nothing else — no grid, no
 * hull, no band. That is the round's first condition, and it is the same one
 * THE GAUGE established: the field is *gone*, not dimmed and not re-skinned.
 *
 * The buttons come from the wave's control set through `slabPanel`, which is
 * the same call the game's own hit test makes, so a button is never drawn
 * where it is not answered — the defect THE GAUGE shipped with once and the
 * reason a round's panel is a control set at all.
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
  if (boss.phase === "verdict") drawVerdict(ctx, l, boss);
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
 * Everything inside the wall: the arena's own things on the one screen that
 * gets them, the body, and the shot that has just been taken.
 *
 * During the fold the ship is drawn over the top of all of it, shrinking, and
 * the body comes up underneath as the ship goes (`snake-morph.ts`).
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
  if (showsSnakeFood(view.role)) drawSnakeItems(ctx, arena, round, pulse);
  ctx.save();
  ctx.globalAlpha = morphBodyAlpha(fold);
  drawSnakeBody(ctx, arena, round, showsSnakeBody(view.role), mawOpen(view, round));
  ctx.restore();
  // One beat of afterglow, and no state kept for it: the world says which beat
  // the shot left on, so the fade is that number against this one.
  const since = view.world.beat - round.shotBeat + view.beatPhase;
  if (since < 1.2) drawSnakeShot(ctx, arena, round, 1 - since / 1.2);
  if (fold < 1) drawSnakeMorph(ctx, l, arena, view, round, fold);
}

/** Whether the mouth is standing open this frame — the head is drawn with it. */
function mawOpen(view: ViewState, round: SnakeState): boolean {
  return view.world.tick - round.mawTick < view.world.cfg.snakeMawTicks;
}

/**
 * The name, and the one line that teaches this seat its half. Different on the
 * two screens because the halves are: a pair reading the same sentence would
 * have nothing to tell each other.
 */
function drawTitle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  role: ViewRole,
  round: SnakeState,
): void {
  const y = l.playHeight * 0.09;
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("SNAKE", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(round.phase === "morph" ? folding(role) : taught(role), l.width / 2, y + 20);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(withheld(role), l.width / 2, y + 35);
}

/** While the ship is still becoming it, and there is nothing to do but read. */
function folding(role: ViewRole): string {
  if (role === "p1") return "folding — yours is the shot and the mouth";
  if (role === "p2") return "folding — yours is the whole of the steering";
  return "the ship is folding into the body";
}

/** What this screen can do. */
function taught(role: ViewRole): string {
  if (role === "p1") return "shoot them, and open on the amber";
  if (role === "p2") return "left and right — you cannot see what is there";
  return "one of you drives it, the other works it";
}

/** And what it is not being shown, said out loud rather than merely missing. */
function withheld(role: ViewRole): string {
  if (role === "p1") return "YOU CANNOT STEER, AND YOU SEE ONLY BOTH ENDS";
  if (role === "p2") return "YOU CANNOT SEE WHAT IS IN THE ARENA";
  return "NEITHER HALF IS ENOUGH ON ITS OWN";
}

/**
 * What the arena has left in it, and how long this attempt has.
 *
 * Two rows of pips — enemies and points — because they are two different jobs
 * and the pair says them differently: one is "shoot it" and the other is
 * "open". The bar underneath costs something, since running the beats out
 * breaks the hull, so a pair who cannot see them spending are being charged
 * for a thing nobody showed them.
 */
function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: SnakeState,
): void {
  const target = round.rounds[round.round];
  if (!target) return;
  const y = l.playHeight * 0.9;
  pips(ctx, l, y, target.enemies.length, round.struck.length, PALETTE.ember);
  pips(ctx, l, y + 13, target.points.length, round.taken.length, PALETTE.pod);

  const spent = view.world.beat - round.roundBeat;
  const left01 = Math.max(0, Math.min(1, 1 - spent / target.beats));
  const barW = l.width * 0.5;
  const barX = (l.width - barW) / 2;
  ctx.fillStyle = "#241B4F";
  ctx.fillRect(barX, y + 24, barW, 4);
  if (left01 > 0) {
    ctx.fillStyle = left01 < 0.25 ? PALETTE.ember : PALETTE.hull;
    ctx.fillRect(barX, y + 24, Math.max(1, barW * left01), 4);
  }
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '9px "Courier New",monospace';
  const again = round.repeats > 0 ? ` · ${round.repeats} AGAIN` : "";
  ctx.fillText(`ROUND ${round.round + 1} OF ${round.rounds.length}${again}`, l.width / 2, y + 42);
}

/** One row of pips: how many there were, and how many are gone. */
function pips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  total: number,
  done: number,
  lit: string,
): void {
  if (total === 0) return;
  const gap = Math.min(13, (l.width * 0.7) / total);
  const left = l.width / 2 - ((total - 1) * gap) / 2;
  for (let i = 0; i < total; i++) {
    ctx.beginPath();
    ctx.arc(left + i * gap, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = i < done ? "#3B3163" : lit;
    ctx.fill();
  }
}

/**
 * The round's own buttons. The two turns are always player 2's to press and
 * are drawn live throughout; MAW lights while the mouth is actually open,
 * which is the only feedback player 1 has that the press landed, and FIRE dims
 * for the beat it is resting.
 */
function drawControls(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: SnakeState,
): void {
  const live = round.phase === "play";
  // See `ViewState.controls`: `view.world.wave` only indexes the shipped
  // `WAVES` for a host actually playing them, so an explicit `view.controls`
  // wins when one is given.
  const set = view.controls === undefined ? controlSetForWave(view.world.wave) : view.controls;
  const resting = view.world.beat - round.shotBeat < view.world.cfg.snakeFireRestBeats;
  for (const slab of slabPanel(l, set, view.role)) {
    const id = slab.control.id;
    const on =
      live &&
      ((id === "snakeMaw" && mawOpen(view, round)) ||
        (id === "snakeFire" && round.shotHit && resting));
    const dim = !live || (id === "snakeFire" && resting);
    ctx.fillStyle = on ? "rgba(255,194,74,.3)" : "rgba(16,11,34,.9)";
    ctx.fillRect(slab.x, slab.y, slab.w, slab.h);
    ctx.strokeStyle = dim ? PALETTE.grid : PALETTE.hull;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(slab.x + 0.5, slab.y + 0.5, Math.max(1, slab.w - 1), Math.max(1, slab.h - 1));
    ctx.fillStyle = dim ? PALETTE.dim : PALETTE.hullRim;
    ctx.font = '600 13px "Courier New",monospace';
    ctx.fillText(slab.control.label, slab.x + slab.w / 2, slab.y + slab.h / 2 + 5);
  }
}

/** How it went, over the arena for a few beats. */
function drawVerdict(ctx: CanvasRenderingContext2D, l: Layout, round: SnakeState): void {
  const y = l.playHeight * 0.42;
  ctx.fillStyle = "rgba(5,4,11,.78)";
  ctx.fillRect(0, y - 46, l.width, 96);
  ctx.fillStyle = round.passed ? PALETTE.good : PALETTE.ember;
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillText(round.passed ? "CLEARED" : "OUT OF TIME", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(`${round.repeats} started over`, l.width / 2, y + 20);
  ctx.fillStyle = round.passed ? PALETTE.dim : PALETTE.ember;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(round.passed ? "the field is next" : "THE HULL PAID FOR IT", l.width / 2, y + 38);
}
