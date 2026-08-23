import { hullPercent } from "@neon-spore/sim";
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
export function drawHud(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const { world } = view;
  ctx.font = '10px "Courier New",monospace';
  ctx.textAlign = "left";

  // Hull bar, top right.
  const bw = l.width * 0.42;
  const bx = l.width - bw - 10;
  const by = 14;
  ctx.fillStyle = "#2A1F4E";
  ctx.fillRect(bx, by, bw, 6);
  const hp = hullPercent(world) / 100;
  ctx.fillStyle = hp > 0.5 ? PALETTE.cyan : hp > 0.25 ? PALETTE.hull : PALETTE.red;
  ctx.fillRect(bx, by, bw * hp, 6);

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

  drawWaveBanner(ctx, l, view);
}

/** Wave name and hint, for the first seconds of a wave. */
function drawWaveBanner(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const b = view.banner;
  if (!b || b.remaining <= 0) return;
  const a = Math.min(1, b.remaining / 0.5);
  ctx.globalAlpha = a;
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 15px "Courier New",monospace';
  ctx.fillText(b.title, l.width / 2, l.playHeight * 0.3);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '11px "Courier New",monospace';
  wrap(ctx, b.hint, l.width / 2, l.playHeight * 0.3 + 20, l.width - 40, 14);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(" ");
  let line = "";
  let row = 0;
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y + row * lineHeight);
      line = w;
      row++;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, y + row * lineHeight);
}

/** The two end states the prototype has: hull through, and paused. */
export function drawOverlay(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const { world } = view;
  ctx.textAlign = "center";
  if (world.over) {
    ctx.fillStyle = "rgba(7,4,15,.8)";
    ctx.fillRect(0, 0, l.width, l.height);
    ctx.fillStyle = PALETTE.red;
    ctx.font = '600 20px "Courier New",monospace';
    ctx.fillText("HULL BREACHED", l.width / 2, l.height * 0.44);
    ctx.fillStyle = PALETTE.dim;
    ctx.font = '12px "Courier New",monospace';
    ctx.fillText(`Wave ${world.wave + 1} · ${world.score} points`, l.width / 2, l.height * 0.44 + 26);
    ctx.fillText("tap to restart", l.width / 2, l.height * 0.44 + 48);
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
