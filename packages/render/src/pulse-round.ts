import { controlSetForWave } from "@neon-spore/content";
import { PULSE_COUNT_BEATS, type PulseState, pulseCurrent } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawArrows, drawReceptors, laneApproach, slabLook } from "./pulse-fall.js";
import { drawPulseLanes, drawPulseLine, type PulseField, pulseField } from "./pulse-lane.js";
import { drawPulseMeter, drawPulseTally, drawPulseVerdict } from "./pulse-meter.js";
import { drawPulsePanel } from "./pulse-panel.js";
import type { ViewState } from "./renderer.js";

/**
 * THE PULSE over the whole stage.
 *
 * `canvas2d.ts` hands the frame over and draws nothing else — no grid, no hull,
 * no band. That is the round's first condition and it is the one THE GAUGE
 * established: the field is *gone*, not dimmed and not re-skinned.
 *
 * **Each screen draws its own chart.** The two seats are playing the same
 * notes, but an arrow leaves a screen the moment *that* seat has resolved it —
 * so a player who is a bar behind sees a bar they are behind on, which is the
 * only honest picture. What the two screens genuinely disagree about is the
 * veil: an arrow this seat cannot read falls in the middle with its heading
 * cycling, and the same arrow on the other screen falls in its lane wearing a
 * light (`pulse-arrow.ts`).
 *
 * **The partner is on the screen and their misses are the reason.** The strip
 * under the line carries the other seat's last judgement and their run, and it
 * is the one thing here that is about somebody else — the owner asked for it
 * by name, and without it a pair have no idea whether the meter is falling
 * because of them.
 *
 * This file composes the screen. What is *falling* down it — the arrows, the
 * receptors and what they say the buttons should be doing — is
 * `pulse-fall.ts`.
 */

/** How long a judgement word stands before it fades, in ticks. */
const WORD_TICKS = 45;

/** The words, indexed by `PULSE_JUDGES`. */
const WORDS = ["", "PERFECT", "GOOD", "MISS", "—"];
const WORD_COLORS = [PALETTE.dim, PALETTE.good, PALETTE.cyan, PALETTE.red, PALETTE.pod];

export function drawPulseRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "pulse") return;
  const cfg = view.world.cfg;
  // See `ViewState.controls`: `view.world.wave` only indexes the shipped
  // `WAVES` for a host actually playing them, so an explicit `view.controls`
  // wins when one is given.
  const set = view.controls === undefined ? controlSetForWave(view.world.wave) : view.controls;
  const seat: 1 | 2 = view.role === "p2" ? 2 : 1;
  const other: 1 | 2 = seat === 1 ? 2 : 1;
  const field = pulseField(l, set, view.role);

  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, l.width, l.height);
  ctx.textAlign = "center";

  drawPulseLanes(ctx, field, view.time);
  drawTitle(ctx, l, boss);
  drawPulseMeter(ctx, l, boss, cfg.pulseMeterMaxMilli);

  const near = laneApproach(view, boss);
  if (boss.phase === "count") drawCount(ctx, l, view, boss);
  if (boss.phase === "play" || boss.phase === "count") drawArrows(ctx, view, boss, field, seat);
  drawPulseLine(ctx, l, field, view.beatPhase);
  drawReceptors(ctx, view, boss, field, seat);
  drawWord(ctx, l, field, view, boss, seat, other);
  drawPulseTally(ctx, l, boss, seat);
  drawPulsePanel(ctx, l, set, view.role, (id) => slabLook(id, seat, near, view, boss), view.time);
  if (boss.phase === "verdict" || boss.phase === "spent") drawPulseVerdict(ctx, l, boss);
  ctx.textAlign = "left";
}

/** The name, and the stage under it. */
function drawTitle(ctx: CanvasRenderingContext2D, l: Layout, boss: PulseState): void {
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("THE PULSE", l.width / 2, l.playHeight * 0.07);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '13px "Courier New",monospace';
  ctx.fillText(pulseCurrent(boss).name, l.width / 2, l.playHeight * 0.105);
}

/** The count-in, on the beat, so the pair start together. */
function drawCount(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: PulseState,
): void {
  const left = PULSE_COUNT_BEATS - (view.world.beat - boss.phaseBeat);
  const swell = (1 - view.beatPhase) ** 2;
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.3 + 0.6 * swell;
  ctx.font = `600 ${Math.round(46 + 16 * swell)}px "Courier New",monospace`;
  ctx.fillText(String(Math.max(1, left)), l.width / 2, l.playHeight * 0.45);
  ctx.globalAlpha = 1;
}

/** This seat's last judgement over the line, and the partner's under it. */
function drawWord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  field: PulseField,
  view: ViewState,
  boss: PulseState,
  seat: 1 | 2,
  other: 1 | 2,
): void {
  say(ctx, l, view, boss, seat, field.lineY - l.playHeight * 0.1, "", 17);
  say(ctx, l, view, boss, other, field.lineY - l.playHeight * 0.045, "THEM ", 13);
}

function say(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: PulseState,
  who: 1 | 2,
  y: number,
  prefix: string,
  size: number,
): void {
  const last = who === 1 ? boss.last1 : boss.last2;
  const at = who === 1 ? boss.lastTick1 : boss.lastTick2;
  const combo = who === 1 ? boss.combo1 : boss.combo2;
  if (at < 0 || last === 0) return;
  const fade = Math.max(0, 1 - (view.world.tick - at) / WORD_TICKS);
  if (fade <= 0) return;
  ctx.globalAlpha = fade;
  ctx.fillStyle = WORD_COLORS[last] ?? PALETTE.dim;
  ctx.font = `600 ${size}px "Courier New",monospace`;
  const run = combo > 3 ? `  ×${combo}` : "";
  ctx.fillText(`${prefix}${WORDS[last] ?? ""}${run}`, l.width / 2, y);
  ctx.globalAlpha = 1;
}
