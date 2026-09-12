import { clockText, playSeconds, retriesText, type World } from "@neon-spore/sim";
import { drawBalanceSheet } from "./balance.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { headerTop } from "./round-header.js";

/**
 * Readouts over the field: hull, score, the beat, and the guard balance.
 *
 * The balance is the point of the whole HUD. Spec 5.8 counts three numbers, not
 * one: attempts, deflections, and separately the tries that were in the right
 * column at the wrong moment. That third number is the interesting failure —
 * it says the pair agreed on *where* and missed on *when*, which is the thing
 * a voice delay actually breaks.
 */
/**
 * Where the run's line is written — the corner's top row, on the left. The
 * hull bar was the top row's right half until 12 September 2026, and a
 * guide's rehearsal pointed a caption at it (`AND THE HULL TAKES IT`); the
 * captions point here now, at the count going up (`caption-anchor.ts`), and
 * they ask rather than knowing so a moved readout takes them with it.
 */
export function runLineBox(l: Layout): { x: number; y: number; w: number; h: number } {
  return { x: 10, y: 11, w: Math.min(120, l.width * 0.4), h: 12 };
}

/**
 * The run's clock and its retries, as the corner reads them: `3:42`, and
 * `3:42 · 2 RETRIES` once a wave has been gone again. What the pair is
 * measured by since 12 September 2026, in place of the points (`wave-fail.ts`).
 */
export function runLine(world: World): string {
  const clock = clockText(playSeconds(world));
  if (world.retries === 0) return clock;
  return `${clock} · ${retriesText(world.retries)}`;
}

export function drawHud(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const { world } = view;
  ctx.font = '10px "Courier New",monospace';
  ctx.textAlign = "left";

  const line = runLineBox(l);
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(runLine(world), line.x, line.y + line.h - 3);

  // Four dots, the active one lit. The pulse both players share.
  const active = world.beat % 4;
  for (let i = 0; i < 4; i++) {
    const on = i === active;
    ctx.fillStyle = on ? PALETTE.hull : "#3B3163";
    ctx.beginPath();
    ctx.arc(10 + i * 13, 34, on ? 4.5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }

  if (world.guard.tries > 0) {
    ctx.font = '9px "Courier New",monospace';
    ctx.fillStyle = "#6F639F";
    const late = world.guard.mistimed > 0 ? `  (${world.guard.mistimed} late)` : "";
    // The third row of the corner, and the one a rehearsal's plate would
    // otherwise cover: it drops under the plate the way a round's header does.
    ctx.fillText(
      `Guard ${world.guard.deflected}/${world.guard.tries}${late}`,
      10,
      headerTop(view, 48),
    );
  }
}

/** The two end states the prototype has: hull through, and paused. */
export function drawOverlay(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const { world } = view;
  ctx.textAlign = "center";
  if (world.over) {
    // The end of a run is the balance sheet, not a headline. It was three
    // lines of "wave N · score" for as long as nobody had wired up the
    // numbers the world was already counting.
    drawBalanceSheet(ctx, l, view);
  } else if (!view.running) {
    ctx.fillStyle = "rgba(7,4,15,.55)";
    ctx.fillRect(0, 0, l.width, l.height);
    ctx.fillStyle = PALETTE.text;
    ctx.font = '600 16px "Courier New",monospace';
    ctx.fillText("PAUSED", l.width / 2, l.height * 0.46);
    ctx.fillStyle = PALETTE.dim;
    ctx.font = '11px "Courier New",monospace';
    ctx.fillText("P or the button to continue", l.width / 2, l.height * 0.46 + 20);
  }
  ctx.textAlign = "left";
}
