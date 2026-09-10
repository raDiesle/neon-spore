import {
  hullPercent,
  TELL_LEAD_BEATS,
  type TellState,
  tellCurrent,
  tellThrows,
  tellWindow,
} from "@neon-spore/sim";
import { drawBand } from "./band.js";
import { drawBackground, drawGrid } from "./field.js";
import { drawHud } from "./hud.js";
import { drawHull } from "./hull.js";
import { frame } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";
import { drawShipAir } from "./ship-air.js";
import { drawTellBody, TELL_TITLE_Y, tellLift } from "./tell-body.js";
import { drawTellScene } from "./tell-scene.js";

/**
 * THE TELL over the whole stage.
 *
 * **The field looks like the field, and this file is where that is settled.**
 * The owner asked for it in the message that started the boss — *the playing
 * field should look like the normal playing field again* — and it is the same
 * correction he made to THE PULSE one round earlier. So: the same water, the
 * same ship with its own scars, the same band under it, the same HUD, and a
 * body at the top where a boss always stands.
 *
 * **The grid is drawn and the columns are not.** That is his answer to the one
 * place his wish and a round's first condition touch (`docs/spec/interludes.md`:
 * a round may keep the ship and the panel and may never keep the eleven
 * columns). The lattice is there, faint, with no coordinates on it and nothing
 * falling down it — it is the room the pair is standing in rather than a
 * vocabulary they are being invited to use. `drawGrid`'s last argument is the
 * one that puts numbers on it, and it is nought here on purpose.
 *
 * The body and its ring are `tell-body.ts`, the nine reveal scenes are
 * `tell-scene.ts`, and this composes the screen around them.
 */

/** How faint the lattice is here against a wave that is using it. */
const GRID_ALPHA = 0.55;

/**
 * The ship stands still through the round and both swellings stand where the
 * wave left them — `pulse-round.ts`'s `stillPose` and its argument: a round
 * has no `FieldPose` of its own and should not grow one, because an ease is
 * state that outlives a frame and a restart reads that as its own.
 */
function stillPose(view: ViewState) {
  return {
    at: {
      cannon: view.world.cannonCol,
      shield: [{ col: view.world.shieldCol, weight: 1, halfMul: 1 }],
    },
    mood: { armed: 0, intake: 0, chew: 0, charge: 0 },
  };
}

export function drawTellRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "tell") return;
  const world = view.world;
  const skin = seatSkin(view.role);
  const { at, mood } = stillPose(view);
  const f = frame(l, view.time, mood, at);

  drawBackground(ctx, l, world.wave, view.time);
  ctx.globalAlpha = GRID_ALPHA;
  drawGrid(ctx, l, world.cannonCol, 0, view.beatPhase, 0);
  ctx.globalAlpha = 1;
  drawShipAir(ctx, l, view.time, skin);

  ctx.textAlign = "center";
  // One column from the name down to the count, and under a rehearsal's
  // plate the whole of it drops together (`tellLift`).
  const lift = tellLift(l, view);
  drawTitle(ctx, l, boss, l.playHeight * TELL_TITLE_Y + lift);
  drawLadder(ctx, l, boss, lift);
  drawTellBody(ctx, l, view, boss);
  drawTellScene(ctx, l, view, boss);
  if (boss.phase === "lead") drawCount(ctx, l, view, boss, lift);

  drawHull(
    ctx,
    l,
    world.scars,
    view.time,
    mood,
    hullPercent(world),
    at,
    () => true,
    () => true,
    skin.hull,
    { x: 0, y: 0 },
    f,
  );

  drawBand(ctx, l, world, false, false, view.time, view.controls);
  drawHud(ctx, l, view);
  ctx.textAlign = "center";
  if (boss.phase === "verdict" || boss.phase === "spent") drawVerdict(ctx, l, boss, lift);
  ctx.textAlign = "left";
}

/**
 * The name, and how long this window is under it.
 *
 * **The last rung says which throw of three it is on**, and that line is drawn
 * nowhere else in the round because no rung before it has more than one. A
 * pair asked for three words in a row has to know which word it is on: the
 * window looks identical from the first to the third, and the count is the
 * only thing on screen that says the sentence is not over. It replaces
 * nothing — a rung of three had never been played until this commit — so it is
 * paint that goes straight onto the field rather than a candidate
 * (`CLAUDE.md`, the second exemption).
 */
function drawTitle(ctx: CanvasRenderingContext2D, l: Layout, boss: TellState, top: number): void {
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("THE TELL", l.width / 2, top);
  if (boss.phase !== "tell") return;
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '13px "Courier New",monospace';
  const beats = tellWindow(tellCurrent(boss), boss.shorten);
  const of = tellThrows(tellCurrent(boss));
  const window = `${beats} BEAT${beats === 1 ? "" : "S"}`;
  const line = of > 1 ? `${window}  ·  ${boss.at + 1} OF ${of}` : window;
  ctx.fillText(line, l.width / 2, top + l.playHeight * 0.035);
}

/**
 * The ladder: one pip a rung, filled up to where the pair has climbed.
 *
 * It is the only tally in the round and it is deliberately not a score — it is
 * *how far up*, which is the one number a lost rung takes away. A pair that
 * has lost three ladders sees the same five pips they saw at the start, which
 * is the honest picture of a boss whose whole rule is starting again.
 */
function drawLadder(ctx: CanvasRenderingContext2D, l: Layout, boss: TellState, lift: number): void {
  const n = boss.rungs.length;
  const gap = Math.min(l.width * 0.05, l.playHeight * 0.03);
  const r = gap * 0.22;
  const y = l.playHeight * 0.135 + lift;
  for (let i = 0; i < n; i++) {
    const x = l.width / 2 + (i - (n - 1) / 2) * gap;
    const done = i < boss.rung || (boss.passed && boss.phase !== "tell");
    ctx.fillStyle = done ? PALETTE.good : PALETTE.dim;
    ctx.globalAlpha = done ? 1 : 0.45;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/** The lead-in, on the beat, so the pair start together. THE PULSE's count. */
function drawCount(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: TellState,
  lift: number,
): void {
  const left = TELL_LEAD_BEATS - (view.world.beat - boss.phaseBeat);
  const swell = (1 - view.beatPhase) ** 2;
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.3 + 0.6 * swell;
  ctx.font = `600 ${Math.round(46 + 16 * swell)}px "Courier New",monospace`;
  ctx.fillText(String(Math.max(1, left)), l.width / 2, l.playHeight * 0.62 + lift);
  ctx.globalAlpha = 1;
}

/** How the ladder went, and what it cost on the way. */
function drawVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  boss: TellState,
  lift: number,
): void {
  ctx.fillStyle = boss.passed ? PALETTE.good : PALETTE.red;
  ctx.font = '600 26px "Courier New",monospace';
  ctx.fillText(boss.passed ? "CLIMBED" : "OUT OF TIME", l.width / 2, l.playHeight * 0.62 + lift);
  if (boss.lost === 0) return;
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '13px "Courier New",monospace';
  ctx.fillText(
    `${boss.lost} RUNG${boss.lost === 1 ? "" : "S"} LOST`,
    l.width / 2,
    l.playHeight * 0.66 + lift,
  );
}
