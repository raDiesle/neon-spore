import { ticksPerBeat, type World } from "@neon-spore/sim";
import { choirRubCircle, RUB_DROP, showsChoirRub } from "./choir-rub.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawRubDrop } from "./rub-drop.js";

/**
 * **THE CHOIR's rub, drawn** — the mark in the middle of the field
 * (`choir-rub.ts`), on both screens, read off the world alone and keeping
 * nothing of its own, so a restart or a seek can never leave a stale light on.
 *
 * - **The mark is the game's one rub mark** (`rub-drop.ts`): THE RUB LAB's
 *   drop with ZIGZAG on it, the size of the grab circle — the owner, *we will
 *   reuse the "rub" control*. Its strokes are the turns asked
 *   (`choirRubTurns`), lit as many as the pair has made together
 *   (`choirRubbed`); they were a row of pips under a red line until the
 *   owner's *apply "zigzag" … to all usages in game*, 14 October 2026.
 * - **Two seat lights**, under it, clear of the call's swishes either side, are lit while that seat is rubbing —
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
  if (both) halo(ctx, x, y, r * 1.8, PALETTE.good, 0.22);
  const turns = world.cfg.choirRubTurns;
  drawRubDrop(ctx, { x, y }, drop, { time, turns, done: world.choirRubbed, held: one || two });

  const below = y + drop * SEAT_DOWN;
  seatLight(ctx, x - drop * SEAT_OUT, below, drop * 0.14, one, "1");
  seatLight(ctx, x + drop * SEAT_OUT, below, drop * 0.14, two, "2");

  ctx.font = '700 11px "Courier New",monospace';
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.redRim;
  ctx.globalAlpha = 0.9;
  ctx.fillText("RUB TOGETHER", x, below + 30);
  ctx.restore();
}

/** Where a seat's light stands, in the drop's radius: under it, and out to either side. */
const SEAT_DOWN = 1.35;
const SEAT_OUT = 0.8;

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
