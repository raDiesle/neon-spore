import type { PulseState } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The one meter, the tally under it, and the verdict.
 *
 * **It is one bar because there is one meter.** Both seats feed it and both
 * drain it — the owner's call over two side-by-side scores — and the picture
 * has to say that plainly or the rule is invisible: two bars would be read as
 * "mine and theirs" within a bar of the song. So it is a single vessel across
 * the top of the screen, and the only per-seat thing on it is which end each
 * of them last put something into.
 *
 * It is drawn as something **filled** rather than as a progress bar: a rounded
 * hollow with a level in it that swells at the top the way liquid does against
 * glass, and a rim that runs from red through to the hull's own purple as it
 * rises. A rectangle inside a rectangle would be the one place in the round
 * where the picture stopped being a body.
 */
export function drawPulseMeter(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  boss: PulseState,
  max: number,
): void {
  const w = l.width * 0.72;
  const h = Math.max(10, l.playHeight * 0.022);
  const x = (l.width - w) / 2;
  const y = l.playHeight * 0.135;
  const at = Math.max(0, Math.min(1, boss.meter / max));
  const color = at < 0.25 ? PALETTE.red : at < 0.5 ? PALETTE.pod : PALETTE.hull;

  const shell = new Path2D();
  shell.roundRect(x, y, w, h, h / 2);
  ctx.fillStyle = PALETTE.grid;
  ctx.globalAlpha = 0.55;
  ctx.fill(shell);
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.clip(shell);
  const fill = ctx.createLinearGradient(x, y, x, y + h);
  fill.addColorStop(0, PALETTE.text);
  fill.addColorStop(0.3, color);
  fill.addColorStop(1, PALETTE.background);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w * at, h);
  ctx.restore();

  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1.5;
  ctx.stroke(shell);
  ctx.globalAlpha = 1;
  // The surface of it: the brightest thing on the bar, and the thing an eye
  // finds when it flicks up from the line.
  if (at > 0.01) halo(ctx, x + w * at, y + h / 2, h * 1.6, color, at < 0.25 ? 0.8 : 0.5);
}

/** What the pair have done so far, in the smallest words that carry it. */
export function drawPulseTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  boss: PulseState,
  seat: 1 | 2,
): void {
  const combo = seat === 1 ? boss.combo1 : boss.combo2;
  const left = boss.notes.length - (seat === 1 ? boss.from1 : boss.from2);
  const y = l.playHeight * 0.975;
  ctx.font = '13px "Courier New",monospace';
  ctx.fillStyle = PALETTE.dim;
  ctx.textAlign = "left";
  ctx.fillText(`RUN ${combo}`, l.width * 0.06, y);
  ctx.textAlign = "center";
  ctx.fillText(`STAGE ${boss.stage + 1}/${boss.stages.length}`, l.width / 2, y);
  ctx.textAlign = "right";
  ctx.fillText(`LEFT ${Math.max(0, left)}`, l.width * 0.94, y);
  ctx.textAlign = "center";
}

/** How it went, once it is over. */
export function drawPulseVerdict(ctx: CanvasRenderingContext2D, l: Layout, boss: PulseState): void {
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillStyle = boss.passed ? PALETTE.good : PALETTE.red;
  ctx.fillText(boss.passed ? "STAGE CLEAR" : "FLATLINE", l.width / 2, l.playHeight * 0.5);
}
