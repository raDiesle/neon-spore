import { controlSetForWave } from "@neon-spore/content";
import { PINBALL_MORPH_BEATS, type PinballState, pinTargetsLeft } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import {
  drawPinBall,
  drawPinBucket,
  drawPinCase,
  drawPinPieces,
  pinAt,
  pinTable,
  type Table,
} from "./pinball-table.js";
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
 * rather than an omission: the coupling here is in the *verbs* — three presses
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
    if (showsPinPieces(view.role)) drawPinPieces(ctx, table, boss);
    drawAim(ctx, table, view, boss);
    if (boss.shot === "flight") drawPinBall(ctx, table, boss, cfg.pinballBallMilli);
  }
  drawPinBucket(ctx, table, boss, cfg.pinballBucketMilli, dropFlash(view, boss));
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

/**
 * The dotted ray out of the bucket: where the ball will set off, and — once
 * the needle is latched — how hard.
 *
 * A straight line and never a predicted bounce. Drawing the trajectory would
 * answer the question the pair are supposed to be arguing about, and it is
 * also the one thing on this screen that would have to agree with the
 * simulation tick for tick to be worth anything.
 */
function drawAim(
  ctx: CanvasRenderingContext2D,
  t: Table,
  view: ViewState,
  boss: PinballState,
): void {
  if (boss.shot === "flight") return;
  const cfg = view.world.cfg;
  const from = pinAt(t, boss.bucketMilli, t.rows * 1000 - cfg.pinballBucketMilli);
  const angle = (boss.angleMilli / 1000) * (Math.PI / 180);
  // During the sweep it is a fixed stub — the angle is the only thing being
  // decided. Once it is latched the line breathes with the bar, which is the
  // strength being decided in the one channel the pair are already watching.
  const reach =
    boss.shot === "aim" ? t.tile * 3 : t.tile * (2.5 + (boss.powerMilli / 1000) * (t.rows * 0.62));
  const to = {
    x: from.x + Math.sin(angle) * reach,
    y: from.y - Math.cos(angle) * reach,
  };
  ctx.save();
  ctx.strokeStyle = boss.armed ? PALETTE.pod : PALETTE.sparkDim;
  ctx.lineWidth = Math.max(1.5, t.tile * 0.07);
  ctx.setLineDash([t.tile * 0.22, t.tile * 0.24]);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.setLineDash([]);
  if (boss.shot === "power") {
    ctx.fillStyle = PALETTE.podRim;
    ctx.beginPath();
    ctx.arc(to.x, to.y, t.tile * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
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
  ctx.fillText("PINBALL", l.width / 2, l.playHeight * 0.055);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '13px "Courier New",monospace';
  ctx.fillText(waiting(role, boss), l.width / 2, l.playHeight * 0.095);
}

/**
 * Whose turn it is, said on both screens. The one thing that differs between
 * them is whether it says "you" or "them", which is not an information split —
 * it is the same fact, addressed.
 */
function waiting(role: ViewRole, boss: PinballState): string {
  if (boss.phase === "morph") return "the ship is folding into the bucket";
  if (boss.shot === "flight") return "get under it";
  const mine = boss.shot === "power" ? role !== "p1" : boss.armed ? role !== "p2" : role !== "p1";
  const who = mine ? "you" : "they";
  if (boss.shot === "power") return `${who} pick the strength`;
  return boss.armed ? `${who} stop the needle` : `${who} open the sweep`;
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
