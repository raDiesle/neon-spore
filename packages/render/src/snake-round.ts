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
  showsSnakeBody,
  showsSnakeFood,
  snakeArena,
} from "./snake-draw.js";

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
  drawBodies(ctx, arena, view, boss);
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

/** The body, and — on the one screen that gets it — what there is to eat. */
function drawBodies(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  view: ViewState,
  round: SnakeState,
): void {
  const fold = morph01(view, round);
  if (showsSnakeFood(view.role) && round.phase !== "morph") {
    drawSnakeItems(ctx, arena, round, Math.abs(0.5 - view.beatPhase) * 2);
  }
  drawSnakeBody(ctx, arena, round, showsSnakeBody(view.role), fold);
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
  if (role === "p1") return "folding — yours is left and right";
  if (role === "p2") return "folding — yours is up and down";
  return "the ship is folding into the body";
}

/** What this screen can do. */
function taught(role: ViewRole): string {
  if (role === "p1") return "left and right — say where the food is";
  if (role === "p2") return "up and down — say what is in the way";
  return "one turns it sideways, the other up and down";
}

/** And what it is not being shown, said out loud rather than merely missing. */
function withheld(role: ViewRole): string {
  if (role === "p1") return "YOU CANNOT SEE THE BODY, ONLY ITS ENDS";
  if (role === "p2") return "YOU CANNOT SEE THE FOOD";
  return "NEITHER HALF IS ENOUGH ON ITS OWN";
}

/**
 * Points as pips, the round as a number, and the beats left as a bar that
 * empties. The bar costs something — the beats running out break the hull — so
 * a pair who cannot see them spending are being charged for a thing nobody
 * showed them.
 */
function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: SnakeState,
): void {
  const target = round.rounds[round.round];
  if (!target) return;
  const y = l.playHeight * 0.92;
  const gap = Math.min(15, (l.width * 0.7) / Math.max(1, target.points));
  const left = l.width / 2 - ((target.points - 1) * gap) / 2;
  for (let i = 0; i < target.points; i++) {
    ctx.beginPath();
    ctx.arc(left + i * gap, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = i < round.points ? PALETTE.pod : "#3B3163";
    ctx.fill();
  }

  const spent = view.world.beat - round.roundBeat;
  const left01 = Math.max(0, Math.min(1, 1 - spent / target.beats));
  const barW = l.width * 0.5;
  const barX = (l.width - barW) / 2;
  ctx.fillStyle = "#241B4F";
  ctx.fillRect(barX, y + 18, barW, 4);
  if (left01 > 0) {
    ctx.fillStyle = left01 < 0.25 ? PALETTE.ember : PALETTE.hull;
    ctx.fillRect(barX, y + 18, Math.max(1, barW * left01), 4);
  }
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(
    `ROUND ${round.round + 1} OF ${round.rounds.length}${round.crashes > 0 ? ` · ${round.crashes} CRASHED` : ""}`,
    l.width / 2,
    y + 36,
  );
}

/** The round's own buttons, lit while the axis they steer is this seat's. */
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
  const sideways = round.dirCol !== 0;
  for (const slab of slabPanel(l, set, view.role)) {
    const id = slab.control.id;
    const steers =
      (id === "snakeLeft" || id === "snakeRight") && !sideways
        ? true
        : (id === "snakeUp" || id === "snakeDown") && sideways;
    ctx.fillStyle = live && steers ? "rgba(192,92,255,.28)" : "rgba(16,11,34,.9)";
    ctx.fillRect(slab.x, slab.y, slab.w, slab.h);
    ctx.strokeStyle = live ? PALETTE.hull : PALETTE.grid;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(slab.x + 0.5, slab.y + 0.5, Math.max(1, slab.w - 1), Math.max(1, slab.h - 1));
    ctx.fillStyle = live ? PALETTE.hullRim : PALETTE.dim;
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
  ctx.fillText(round.passed ? "FED" : "OUT OF TIME", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(`${round.crashes} crashed`, l.width / 2, y + 20);
  ctx.fillStyle = round.passed ? PALETTE.dim : PALETTE.ember;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(round.passed ? "the field is next" : "THE HULL PAID FOR IT", l.width / 2, y + 38);
}
