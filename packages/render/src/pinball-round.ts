import { controlSetForWave } from "@neon-spore/content";
import { PINBALL_MORPH_BEATS, type PinballState, pinTargetsLeft } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawAim, drawPowerBar } from "./pinball-aim.js";
import { drawPinBucket, drawPinLoaded } from "./pinball-bucket.js";
import { drawPinPieces } from "./pinball-piece.js";
import { drawPinBall, drawPinCase, pinTable } from "./pinball-table.js";
import type { ViewState } from "./renderer.js";
import { slabPanel } from "./slabs.js";

/**
 * PINBALL over the whole stage.
 *
 * `canvas2d.ts` hands the frame over and draws nothing else — no grid, no
 * hull, no band. That is the round's first condition and it is the one THE
 * GAUGE established: the field is *gone*, not dimmed and not re-skinned.
 *
 * **Both seats are shown the same table**, which is the one place this round
 * differs from every other one in the game, and it was the owner's decision
 * rather than an omission: the coupling here is in the *verbs* — two presses
 * that have to arrive from alternating seats in one order — rather than in
 * what each screen knows. `showsPinPieces` below is the seam that would change
 * that, and it is written as a role predicate for exactly that reason: making
 * the board one-sided later is a line here, not a rewrite.
 *
 * The buttons come from the wave's control set through `slabPanel`, the same
 * call the game's own hit test makes, so a button is never drawn where it is
 * not answered.
 */

/**
 * Which seat can see the pieces. Both, today.
 *
 * A predicate rather than a fact, because the question is live: this round is
 * the only built one whose two screens are the same, and every argument in
 * `docs/spec/interludes.md` says a round wants them different. If the pair
 * find the aim too easy to agree on, the first thing to try is `role !== "p2"`
 * here — the seat holding the bucket keeps the map and the seat opening the
 * sweep is talked onto it.
 */
export const showsPinPieces = (_role: ViewRole): boolean => true;

export function drawPinballRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "pinball") return;
  const cfg = view.world.cfg;

  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, l.width, l.height);
  ctx.textAlign = "center";

  const table = pinTable(l, cfg);
  drawTitle(ctx, l, view.role, boss);
  drawPinCase(ctx, table);
  if (boss.phase !== "morph") {
    if (showsPinPieces(view.role)) drawPinPieces(ctx, table, boss, view.time);
    drawAim(ctx, table, view, boss);
    if (boss.shot === "flight") drawPinBall(ctx, table, boss, cfg.pinballBallMilli);
  }
  drawPinBucket(ctx, table, boss, cfg.pinballBucketMilli, dropFlash(view, boss));
  if (boss.phase === "play" && boss.shot !== "flight") {
    drawPinLoaded(ctx, table, boss, cfg.pinballBucketMilli, cfg.pinballBallMilli);
  }
  drawPowerBar(ctx, l, table, boss);
  drawTally(ctx, l, view, boss);
  drawControls(ctx, l, view);
  if (boss.phase === "verdict") drawVerdict(ctx, l, boss);
  ctx.textAlign = "left";
}

/** How red the bucket still is after a ball went past it. Fades over a beat. */
function dropFlash(view: ViewState, boss: PinballState): number {
  if (boss.dropBeat < 0) return 0;
  return Math.max(0, 1 - (view.world.beat - boss.dropBeat + view.beatPhase));
}

/** The name, and the one line that says whose press the round is waiting for. */
function drawTitle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  role: ViewRole,
  boss: PinballState,
): void {
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("PINBALL", l.width / 2, l.playHeight * 0.09);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '13px "Courier New",monospace';
  ctx.fillText(waiting(role, boss), l.width / 2, l.playHeight * 0.128);
}

/**
 * Whose turn it is, said on both screens. The one thing that differs between
 * them is whether it says "you" or "them", which is not an information split —
 * it is the same fact, addressed.
 *
 * Two states rather than three, since the sweep is no longer opened by a press
 * (`packages/sim/src/pinball-controls.ts`): the needle is player 1's to stop
 * and the bar is player 2's to fire on.
 */
function waiting(role: ViewRole, boss: PinballState): string {
  if (boss.phase === "morph") return "the ship is folding into the bucket";
  if (boss.shot === "flight") return "get under it";
  const mine = boss.shot === "power" ? role !== "p1" : role !== "p2";
  const who = mine ? "you" : "they";
  if (boss.shot === "power") return `${who} fire on the bar`;
  return `${who} stop the needle`;
}

/** Targets left, the clock, and what the drops have cost so far. */
function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: PinballState,
): void {
  const left = pinTargetsLeft(boss);
  const round = boss.rounds[Math.min(boss.round, boss.rounds.length - 1)];
  const beats = Math.max(0, (round?.beats ?? 0) - (view.world.beat - boss.roundBeat));
  const y = l.playHeight * 0.975;
  ctx.font = '13px "Courier New",monospace';
  ctx.fillStyle = PALETTE.pod;
  ctx.textAlign = "left";
  ctx.fillText(`LIT ${left}`, l.width * 0.06, y);
  ctx.fillStyle = beats < 8 ? PALETTE.red : PALETTE.dim;
  ctx.textAlign = "center";
  ctx.fillText(`TABLE ${boss.round + 1}/${boss.rounds.length}`, l.width / 2, y);
  ctx.textAlign = "right";
  ctx.fillStyle = boss.drops > 0 ? PALETTE.red : PALETTE.dim;
  ctx.fillText(`DROPPED ${boss.drops}   ${beats}`, l.width * 0.94, y);
  ctx.textAlign = "center";
}

/** The round's own buttons, in the seat each belongs to. */
function drawControls(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const slabs = slabPanel(l, controlSetForWave(view.world.wave), view.role);
  ctx.font = '600 15px "Courier New",monospace';
  for (const slab of slabs) {
    ctx.fillStyle = PALETTE.background;
    ctx.strokeStyle = PALETTE.hull;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(slab.x, slab.y, slab.w, slab.h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(slab.control.label, slab.x + slab.w / 2, slab.y + slab.h / 2 + 5);
  }
}

/** How it went, once it is over. */
function drawVerdict(ctx: CanvasRenderingContext2D, l: Layout, boss: PinballState): void {
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillStyle = boss.passed ? PALETTE.good : PALETTE.red;
  ctx.fillText(boss.passed ? "TABLE CLEAR" : "OUT OF TIME", l.width / 2, l.playHeight * 0.5);
}

/** The fold, as a number, for a picture that has not been drawn yet. */
export function pinMorph01(view: ViewState, boss: PinballState): number {
  if (boss.phase !== "morph") return 1;
  const beats = view.world.beat - boss.phaseBeat + view.beatPhase;
  return Math.max(0, Math.min(1, beats / PINBALL_MORPH_BEATS));
}
