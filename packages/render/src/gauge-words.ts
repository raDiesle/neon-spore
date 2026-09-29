import { GAUGE_LEAD_BEATS, type GaugeState, gaugeBetweenLevels } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";

/**
 * THE GAUGE's big words over the dial: the count-in, the level that is coming,
 * and the verdict. Out of `gauge-round.ts` when the round gained its levels and
 * that file reached its limit; the three are one kind of thing, a line of text
 * that stands over the picture for a few beats and then goes. Each sets its own
 * alignment: what the dial draws before them leaves it wherever it last was.
 */

/** The count-in, so the round does not begin on a beat nobody was watching. */
export function drawGaugeLead(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: GaugeState,
): void {
  const left = GAUGE_LEAD_BEATS - (view.world.beat - round.phaseBeat);
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.hullRim;
  ctx.font = '600 34px "Courier New",monospace';
  ctx.fillText(String(Math.max(1, left)), l.width / 2, l.playHeight * 0.42);
}

/**
 * The level that is coming, over the bare rim between two of them — the pair
 * has just finished one and needs to hear that it counted, and that the next
 * is harder (`sim/gauge-level.ts`). The same place and weight as the count-in,
 * because it is the same thing: a beat of quiet before play starts again.
 */
export function drawGaugeLevel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: GaugeState,
): void {
  if (round.phase !== "play" || !gaugeBetweenLevels(view.world, round)) return;
  const y = l.playHeight * 0.42;
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.hullRim;
  ctx.font = '600 28px "Courier New",monospace';
  ctx.fillText(`LEVEL ${round.level + 1}`, l.width / 2, y);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText("faster, and narrower", l.width / 2, y + 22);
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
export function drawGaugeVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: GaugeState,
): void {
  const cfg = view.world.cfg;
  const y = l.playHeight * 0.42;
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(5,4,11,.78)";
  ctx.fillRect(0, y - 46, l.width, 96);
  ctx.fillStyle = round.passed ? PALETTE.good : PALETTE.ember;
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillText(round.passed ? "HELD" : "OUT OF TIME", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  const line = round.passed
    ? `all ${cfg.gaugeLevels} levels`
    : `level ${round.level + 1} of ${cfg.gaugeLevels}`;
  ctx.fillText(line, l.width / 2, y + 20);
  ctx.fillStyle = round.passed ? PALETTE.dim : PALETTE.ember;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(
    round.passed ? "the hull is whole — the field is next" : "THE HULL PAID FOR IT",
    l.width / 2,
    y + 38,
  );
}
