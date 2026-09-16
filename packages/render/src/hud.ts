import { clockText, playSeconds, retriesText, type World } from "@neon-spore/sim";
import { drawBalanceSheet } from "./balance.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { headerTop } from "./round-header.js";

/**
 * Readouts over the field: the run's line and the guard balance.
 *
 * The four beat dots that stepped off `world.beat % 4` at the top left are
 * gone, at the owner's word on 13 September 2026: the top row is the siren's
 * now (`siren.ts`), and the beat is already on the shield's ring, on the wisp
 * waves' grid, and in the ear (`beat.tick`, `beat.accent`).
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
export function runLineBox(
  l: Layout,
  clearTop?: number,
): { x: number; y: number; w: number; h: number } {
  // Under the band on a page of film, for the reason the guard row below
  // already drops: the band is opaque and is drawn after the field, so a row
  // left where it was is a readout nobody can see — and a caption anchored on
  // it would be pointing at a covered word. `clearTop` is the band's foot
  // (`ViewState.clearTop`, set from `GUIDE_LOOK.bandFoot`); absent everywhere
  // else, which is the live game, the director and every frame test.
  const y = clearTop === undefined ? 11 : clearTop + 6;
  return { x: 10, y, w: Math.min(120, l.width * 0.4), h: 12 };
}

/**
 * The run's clock and its retries, as the corner reads them: `3:42`, and
 * `3:42 · 2 RETRIES` once a wave has been gone again — and not before: the
 * count goes up when the failed wave opens again, so the lost screen reads
 * the retries taken, not the one it is offering (`sim/wave-start.ts`). What
 * the pair is measured by since 12 September 2026, in place of the points
 * (`wave-fail.ts`).
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

  const line = runLineBox(l, view.clearTop);
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(runLine(world), line.x, line.y + line.h - 3);

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
