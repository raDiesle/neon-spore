import { ticksPerBeat, type World } from "@neon-spore/sim";
import { choirRubCircle, RUB_DROP, showsChoirRub } from "./choir-rub.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawRubMark } from "./rub-mark.js";

/**
 * **THE CHOIR's rub, drawn** — the mark in the middle of the field
 * (`choir-rub.ts`), on both screens, read off the world alone and keeping
 * nothing of its own, so a restart or a seek can never leave a stale light on.
 *
 * - **The mark is the game's one rub mark** (`rub-mark.ts`): the red line and
 *   the two arrows sliding in at it from the sides, in a socket the size of
 *   the grab circle — the owner, *we will reuse the "rub" control*.
 * - **A row of pips under it** is the turns asked (`choirRubTurns`), lit as
 *   many as the pair has made together (`choirRubbed`).
 * - **Two seat lights**, one each side, are lit while that seat is rubbing —
 *   turned inside `choirTogetherBeats` — so a thumb going alone sees at once
 *   that the other light is dark, and why nothing is counting.
 * - **The word** says the half that cannot be drawn: *together*.
 *
 * The breathing is on the wall clock, which render is free to use.
 */
export function drawChoirRub(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  if (!showsChoirRub(world.creatures)) return;
  const { x, y, r } = choirRubCircle(l);
  const drop = r * RUB_DROP;
  const near = world.cfg.choirTogetherBeats * ticksPerBeat(world.cfg);
  const rubbing = (at: number): boolean => world.tick - at <= near;
  const one = rubbing(world.choirTurnTick1);
  const two = rubbing(world.choirTurnTick2);
  const both = one && two;

  ctx.save();
  if (both) halo(ctx, x, y, r * 1.8, PALETTE.red, 0.22);
  ctx.beginPath();
  ctx.arc(x, y, drop, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(7,4,15,.62)";
  ctx.fill();
  ctx.strokeStyle = PALETTE.red;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = Math.max(1.5, drop * 0.06);
  ctx.stroke();
  ctx.globalAlpha = 1;
  drawRubMark(ctx, x, y, drop * 0.62, time);

  seatLight(ctx, x - drop * 1.3, y, drop * 0.14, one, "1");
  seatLight(ctx, x + drop * 1.3, y, drop * 0.14, two, "2");
  pips(ctx, x, y + drop * 1.28, drop, world.cfg.choirRubTurns, world.choirRubbed);

  ctx.font = '700 11px "Courier New",monospace';
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.redRim;
  ctx.globalAlpha = 0.9;
  ctx.fillText("RUB TOGETHER", x, y + drop * 1.28 + 18);
  ctx.restore();
}

/** One seat's light: lit green while that seat's thumb is turning, dim while it is not. */
function seatLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  lit: boolean,
  seat: string,
): void {
  if (lit) halo(ctx, x, y, r * 3.2, PALETTE.good, 0.35);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = lit ? PALETTE.good : "rgba(7,4,15,.8)";
  ctx.fill();
  ctx.strokeStyle = lit ? PALETTE.goodRim : PALETTE.dim;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = '700 10px "Courier New",monospace';
  ctx.textAlign = "center";
  ctx.fillStyle = lit ? PALETTE.goodRim : PALETTE.dim;
  ctx.fillText(seat, x, y + r + 12);
}

/** The turns asked, as a row of pips across the mark's width, `done` of them lit. */
function pips(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  asked: number,
  done: number,
): void {
  const gap = (width * 2) / Math.max(1, asked);
  const pr = Math.min(gap * 0.32, 4);
  for (let i = 0; i < asked; i++) {
    const px = x - width + gap * (i + 0.5);
    ctx.beginPath();
    ctx.arc(px, y, pr, 0, Math.PI * 2);
    ctx.fillStyle = i < done ? PALETTE.red : "rgba(7,4,15,.8)";
    ctx.fill();
    ctx.strokeStyle = i < done ? PALETTE.redRim : PALETTE.dim;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
