import { INTERLUDE_LEAD_BEATS, type InterludeState } from "@neon-spore/sim";
import { drawGauge, drawGaugeTitle } from "./gauge.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";

/**
 * A round that is not the field, drawn over the whole stage.
 *
 * `canvas2d.ts` hands the frame over and draws nothing else — no grid, no
 * hull, no band. That is the category's first condition: the field is gone,
 * not dimmed and not re-skinned (`docs/spec/interludes.md`). A round that
 * borrowed the eleven columns would be a wave in a costume.
 *
 * The two screens are **not** the same picture, and the difference is the
 * round. `showsGaugeMarks` decides who can read the target and
 * `showsGaugeValve` who has a control to answer it with, and neither is
 * derived from anything in the band — an interlude has its own controls, or
 * the pair is playing the field with a different sprite on it.
 */

/** The navigator reads the marks. The pilot's dial is the same dial without them. */
export const showsGaugeMarks = (role: ViewRole): boolean => role !== "p1";
/** The pilot turns it. Nobody else has a valve drawn at all. */
export const showsGaugeValve = (role: ViewRole): boolean => role !== "p2";

/** One of the round's own buttons: a slab, not a lobe. */
export interface Slab {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface InterludeControls {
  down: Slab | null;
  up: Slab | null;
  call: Slab | null;
}

/**
 * Where the round's buttons are — shared by the draw and by the hit test in
 * `apps/game`, so a control is never drawn in one place and answered in
 * another. The same contract `layout.ts` has for the band.
 */
export function interludeControls(l: Layout, role: ViewRole): InterludeControls {
  const pad = Math.max(6, l.width * 0.03);
  // Not the whole band. A slab as tall as the control strip reads as an empty
  // column rather than as a button, and the round has three of them side by
  // side — so they are squared off against the width and centred in what is
  // left, which is still a target far bigger than anything on the field.
  const h = Math.max(1, Math.min(l.bandHeight - pad * 2, l.width * 0.42));
  const y = l.bandTop + (l.bandHeight - h) / 2;
  const valve = showsGaugeValve(role);
  const call = showsGaugeMarks(role);
  const cells = (valve ? 2 : 0) + (call ? 1 : 0);
  const w = Math.max(1, (l.width - pad * (cells + 1)) / cells);
  const slab = (index: number, label: string): Slab => ({
    x: pad + index * (w + pad),
    y,
    w,
    h,
    label,
  });
  return {
    down: valve ? slab(0, "LEFT") : null,
    up: valve ? slab(1, "RIGHT") : null,
    call: call ? slab(valve ? 2 : 0, "CALL") : null,
  };
}

export function hitSlab(slab: Slab, x: number, y: number): boolean {
  return x >= slab.x && x <= slab.x + slab.w && y >= slab.y && y <= slab.y + slab.h;
}

export function drawInterlude(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const round = view.world.interlude;
  if (round === null) return;

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
  drawGauge(ctx, dial, view.world.cfg, round, {
    showMarks: showsGaugeMarks(view.role),
    beat: view.world.beat,
    beatPhase: view.beatPhase,
  });
  drawTally(ctx, l, view, round);
  drawControls(ctx, l, view, round);
  if (round.phase === "lead") drawLead(ctx, l, view, round);
  if (round.phase === "verdict") drawVerdict(ctx, l, view, round);
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
 * there is: the round ends when the beats run out, and time is the whole of
 * what failing costs, so a pair who cannot see it spending are being charged
 * for something nobody showed them.
 */
function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: InterludeState,
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
  round: InterludeState,
): void {
  const live = round.phase === "play";
  const controls = interludeControls(l, view.role);
  const held = [round.valve < 0, round.valve > 0, false];
  for (const [i, slab] of [controls.down, controls.up, controls.call].entries()) {
    if (slab === null) continue;
    const on = live && held[i] === true;
    ctx.fillStyle = on ? "rgba(192,92,255,.28)" : "rgba(16,11,34,.9)";
    ctx.fillRect(slab.x, slab.y, slab.w, slab.h);
    ctx.strokeStyle = live ? PALETTE.hull : PALETTE.grid;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(slab.x + 0.5, slab.y + 0.5, Math.max(1, slab.w - 1), Math.max(1, slab.h - 1));
    ctx.fillStyle = live ? PALETTE.hullRim : PALETTE.dim;
    ctx.font = '600 13px "Courier New",monospace';
    ctx.fillText(slab.label, slab.x + slab.w / 2, slab.y + slab.h / 2 + 5);
  }
}

/** The count-in, so the round does not begin on a beat nobody was watching. */
function drawLead(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: InterludeState,
): void {
  const left = INTERLUDE_LEAD_BEATS - (view.world.beat - round.phaseBeat);
  ctx.fillStyle = PALETTE.hullRim;
  ctx.font = '600 34px "Courier New",monospace';
  ctx.fillText(String(Math.max(1, left)), l.width / 2, l.playHeight * 0.42);
}

/**
 * How it went, over the dial for a few beats. Losing says so in the plainest
 * available words and takes nothing — no hull, no score, no scar. The category
 * only works while that stays true, so the screen that announces it is the one
 * place a future interlude would be tempted to add a punishment.
 */
function drawVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: InterludeState,
): void {
  const y = l.playHeight * 0.42;
  ctx.fillStyle = "rgba(5,4,11,.78)";
  ctx.fillRect(0, y - 46, l.width, 96);
  ctx.fillStyle = round.passed ? PALETTE.good : PALETTE.dim;
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillText(round.passed ? "HELD" : "OUT OF TIME", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(`${round.marks} of ${view.world.cfg.gaugeMarks}`, l.width / 2, y + 20);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText("costs you nothing — the field is next", l.width / 2, y + 38);
}
