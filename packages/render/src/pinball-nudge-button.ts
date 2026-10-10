import { pinballRound, pinTableAsks, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Circle } from "./layout.js";
import { paintLobe } from "./lobe-shell.js";
import { PALETTE, STROKE } from "./palette.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * **PINBALL's nudge, ◀ and ▶ either side of SET and of FIRE**, so both seats
 * have it on both sides of their panel. The owner, 10 October 2026: the
 * shove was a ring on the table that showed up only in flight, and he asked
 * for a press, there all the time, in the look every other press on the band
 * has. So it is four lobes in the band's own sockets (`pinball-button.ts`
 * says which control is which), lit exactly while `pinTableAsks` says a bump
 * would answer and dead for the rest of the round — the bargain FIRE makes
 * before the needle stops.
 *
 * Under the arrow are the bumps the two of them still have in this flight,
 * from one count they share: three dots, a dot going hollow with each bump,
 * all of them hollow once the table has tilted. The fourth bump tilts it, so
 * the last filled dot is the sentence *not yet — mine* the round is for.
 */

/**
 * A nudge: the ball, an arrow pushing it the way the button goes, and a dot
 * for every bump the pair still has in this flight. Violet, as SET and every
 * turn on the band are — a direction, not a shot.
 */
export function drawNudgeLobe(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  way: -1 | 1,
  world: World,
  skin: SeatSkin,
): void {
  const { x, y, r } = circle;
  const boss = pinballRound(world);
  const on = boss !== null && pinTableAsks(boss);
  const hex = PALETTE.hull;
  if (on) halo(ctx, x, y, r * 1.8, hex, 0.45);
  ctx.fillStyle = on ? hex : skin.dead[0];
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  paintLobe(ctx, x, y, r, "both");
  const ink = on ? "#1B0630" : hex;
  const total = world.cfg.pinballNudges;
  const left = boss === null || boss.tilted ? 0 : Math.max(0, total - boss.nudges);
  drawNudge(ctx, x, y - r * 0.12, r, ink, way);
  drawPips(ctx, x, y + r * 0.5, r, ink, total, left);
}

/** The ball on the side it is pushed from, and a chevron past it the way it goes. */
function drawNudge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ink: string,
  way: -1 | 1,
): void {
  ctx.save();
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.arc(x - way * r * 0.24, y, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  const tip = x + way * r * 0.5;
  const back = tip - way * r * 0.22;
  ctx.lineWidth = Math.max(1.4, r * 0.15);
  ctx.beginPath();
  ctx.moveTo(back, y - r * 0.24);
  ctx.lineTo(tip, y);
  ctx.lineTo(back, y + r * 0.24);
  ctx.stroke();
  ctx.restore();
}

/** One dot a bump, filled while it is still in hand and hollow once spent. */
function drawPips(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ink: string,
  total: number,
  left: number,
): void {
  const gap = r * 0.26;
  const first = x - ((total - 1) / 2) * gap;
  ctx.save();
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1, r * 0.05);
  for (let i = 0; i < total; i++) {
    ctx.beginPath();
    ctx.arc(first + i * gap, y, r * 0.075, 0, Math.PI * 2);
    if (i < left) ctx.fill();
    else ctx.stroke();
  }
  ctx.restore();
}
