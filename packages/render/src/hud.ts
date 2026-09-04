import { hullPercent } from "@neon-spore/sim";
import { drawBalanceSheet } from "./balance.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";

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
 * The hull bar, top right — where it is, rather than what it says.
 *
 * Exported because a guide's rehearsal points a caption at it (`AND THE HULL
 * TAKES IT`, `guide-caption.ts`), and a caption placed from a second copy of
 * these four numbers is a caption that ends up beside the bar rather than on
 * it the first time anybody moves the readout.
 */
export function hullBarBox(l: Layout): { x: number; y: number; w: number; h: number } {
  const w = l.width * 0.42;
  return { x: l.width - w - 10, y: 14, w, h: 6 };
}

export function drawHud(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const { world } = view;
  ctx.font = '10px "Courier New",monospace';
  ctx.textAlign = "left";

  const { x: bx, y: by, w: bw, h: bh } = hullBarBox(l);
  ctx.fillStyle = "#2A1F4E";
  ctx.fillRect(bx, by, bw, bh);
  const hp = hullPercent(world) / 100;
  ctx.fillStyle = hp > 0.5 ? PALETTE.cyan : hp > 0.25 ? PALETTE.hull : PALETTE.red;
  ctx.fillRect(bx, by, bw * hp, bh);
  drawHeart(ctx, bx - 9, by + bh / 2, 6, PALETTE.pod);

  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(`${world.score} P`, 10, 20);

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
    ctx.fillText(`Guard ${world.guard.deflected}/${world.guard.tries}${late}`, 10, 48);
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

/** A small filled heart, for labelling the hull bar as what a `mend` pod feeds. */
function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  hex: string,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.15);
  ctx.quadraticCurveTo(-r * 0.3, -r * 0.5, -r * 0.55, -r * 0.1);
  ctx.quadraticCurveTo(-r * 0.55, r * 0.3, 0, r * 0.55);
  ctx.quadraticCurveTo(r * 0.55, r * 0.3, r * 0.55, -r * 0.1);
  ctx.quadraticCurveTo(r * 0.3, -r * 0.5, 0, -r * 0.15);
  ctx.fillStyle = hex;
  ctx.fill();
  ctx.restore();
}
