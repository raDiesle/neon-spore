import { controlSetForWave } from "@neon-spore/content";
import { GAUGE_LEAD_BEATS, type GaugeState } from "@neon-spore/sim";
import { drawGauge, drawGaugeTitle, showsGaugeMarks } from "./gauge.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { slabPanel } from "./slabs.js";

/**
 * THE GAUGE over the whole stage.
 *
 * `canvas2d.ts` hands the frame over and draws nothing else — no grid, no
 * hull, no band. That is the round's first condition: the field is gone, not
 * dimmed and not re-skinned. A round that borrowed the eleven columns would be
 * a wave in a costume.
 *
 * It is a boss wave now rather than a category of its own, and this file is
 * what did not change when that happened — which was the point. The two screens
 * are still **not** the same picture, and the difference is still the round.
 *
 * The buttons come from the wave's control set (`slabPanel`), not from
 * geometry invented here. That is the one thing that did change, and it is why
 * the eleven rounds behind this one cost an entry rather than a panel.
 */

export function drawGaugeRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "gauge") return;

  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, l.width, l.height);
  drawEdge(ctx, l);

  ctx.textAlign = "center";
  drawGaugeTitle(ctx, l, view.role);
  const dial = {
    cx: l.width / 2,
    cy: l.playHeight * 0.62,
    r: Math.min(l.width * 0.42, l.playHeight * 0.3),
  };
  drawGauge(ctx, dial, view.world.cfg, boss, {
    showMarks: showsGaugeMarks(view.role),
    beat: view.world.beat,
    beatPhase: view.beatPhase,
  });
  drawTally(ctx, l, view, boss);
  drawControls(ctx, l, view, boss);
  if (boss.phase === "lead") drawLead(ctx, l, view, boss);
  if (boss.phase === "verdict") drawVerdict(ctx, l, view, boss);
  ctx.textAlign = "left";
}

/**
 * A hard rectangle inset from the stage. It replaces the seam `canvas2d.ts`
 * draws around the field, and it does the same job better here: the round has
 * no grid and no hull, so without an edge there is nothing on screen that says
 * where the machine stops and the dark begins.
 */
function drawEdge(ctx: CanvasRenderingContext2D, l: Layout): void {
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(6.5, 6.5, Math.max(1, l.width - 13), Math.max(1, l.height - 13));
}

/**
 * Marks made, as pips, and the time left as a bar that empties.
 *
 * THE FORK refuses a bar on purpose — there is nothing there to count to. Here
 * there is, and the bar now costs something: the beats running out break the
 * hull, so a pair who cannot see them spending are being charged for a thing
 * nobody showed them.
 */
function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: GaugeState,
): void {
  const cfg = view.world.cfg;
  // Low, just above the band. The dial is the subject and the tally is the
  // footnote, and a footnote floating in the middle of the empty half of the
  // screen reads as a second thing to watch.
  const y = l.playHeight * 0.9;
  const gap = 15;
  const left = l.width / 2 - ((cfg.gaugeMarks - 1) * gap) / 2;
  for (let i = 0; i < cfg.gaugeMarks; i++) {
    ctx.beginPath();
    ctx.arc(left + i * gap, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = i < round.marks ? PALETTE.good : "#3B3163";
    ctx.fill();
  }

  const spent = view.world.beat - round.openBeat;
  const left01 = Math.max(0, Math.min(1, 1 - spent / cfg.gaugeRoundBeats));
  const barW = l.width * 0.5;
  const barX = (l.width - barW) / 2;
  ctx.fillStyle = "#241B4F";
  ctx.fillRect(barX, y + 18, barW, 4);
  if (left01 > 0) {
    ctx.fillStyle = left01 < 0.25 ? PALETTE.ember : PALETTE.hull;
    ctx.fillRect(barX, y + 18, Math.max(1, barW * left01), 4);
  }
}

/** The round's own buttons, lit while a thumb is on one. */
function drawControls(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: GaugeState,
): void {
  const live = round.phase === "play";
  // See `ViewState.controls`: `view.world.wave` only indexes the shipped
  // `WAVES` for a host actually playing them, so an explicit `view.controls`
  // wins when one is given. Not `??` — see `band.ts` for why that spelling is
  // reserved for a re-derivation `purity.test.ts` watches for.
  const set = view.controls === undefined ? controlSetForWave(view.world.wave) : view.controls;
  for (const slab of slabPanel(l, set, view.role)) {
    const on =
      live &&
      ((slab.control.id === "gaugeLeft" && round.valve < 0) ||
        (slab.control.id === "gaugeRight" && round.valve > 0));
    ctx.fillStyle = on ? "rgba(192,92,255,.28)" : "rgba(16,11,34,.9)";
    ctx.fillRect(slab.x, slab.y, slab.w, slab.h);
    ctx.strokeStyle = live ? PALETTE.hull : PALETTE.grid;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(slab.x + 0.5, slab.y + 0.5, Math.max(1, slab.w - 1), Math.max(1, slab.h - 1));
    ctx.fillStyle = live ? PALETTE.hullRim : PALETTE.dim;
    ctx.font = '600 13px "Courier New",monospace';
    ctx.fillText(slab.control.label, slab.x + slab.w / 2, slab.y + slab.h / 2 + 5);
  }
}

/** The count-in, so the round does not begin on a beat nobody was watching. */
function drawLead(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: GaugeState,
): void {
  const left = GAUGE_LEAD_BEATS - (view.world.beat - round.phaseBeat);
  ctx.fillStyle = PALETTE.hullRim;
  ctx.font = '600 34px "Courier New",monospace';
  ctx.fillText(String(Math.max(1, left)), l.width / 2, l.playHeight * 0.42);
}

/**
 * How it went, over the dial for a few beats.
 *
 * The line under it used to read "costs you nothing — the field is next", and
 * it was the whole category's promise. The promise is retired: running out of
 * time breaks the hull, so the screen that announces it says what it took. A
 * verdict that still claimed nothing was lost would be the game lying about
 * damage the pair is about to see on the field.
 */
function drawVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: GaugeState,
): void {
  const y = l.playHeight * 0.42;
  ctx.fillStyle = "rgba(5,4,11,.78)";
  ctx.fillRect(0, y - 46, l.width, 96);
  ctx.fillStyle = round.passed ? PALETTE.good : PALETTE.ember;
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillText(round.passed ? "HELD" : "OUT OF TIME", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(`${round.marks} of ${view.world.cfg.gaugeMarks}`, l.width / 2, y + 20);
  ctx.fillStyle = round.passed ? PALETTE.dim : PALETTE.ember;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(
    round.passed ? "the hull is whole — the field is next" : "THE HULL PAID FOR IT",
    l.width / 2,
    y + 38,
  );
}
