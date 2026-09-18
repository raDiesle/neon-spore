import type { ControlId } from "@neon-spore/content";
import { mazeCosMilli, mazeSinMilli, scoutMawOpen, scoutRound, type World } from "@neon-spore/sim";
import { drawActionButton } from "./controls.js";
import { halo } from "./glow.js";
import type { Circle } from "./layout.js";
import { paintLobe } from "./lobe-shell.js";
import { PALETTE, STROKE } from "./palette.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * THE SCOUT's four presses, as faces on the band's own lobes.
 *
 * **The round is played on the panel the pair already hold**, which is what
 * its design said before a line of it was drawn: the two turns stand where
 * THE CLAW's crank stands and the burn where its REACH does, and the mouth is
 * the other seat's (`docs/spec/interludes.md`). THE CLAW's panel is the band,
 * so the four are `lobe` controls in the sockets `band-control.ts` puts every
 * control in, and this file draws only what is *on* each face. The socket,
 * the gloss and the tissue around it are not its business.
 *
 * **Player 1's three carry the nose, live.** Each turn shows the heading the
 * little ship is actually pointed at — read off the round, never animated here
 * — with an arc round it saying which way the button swings it; BURN shows the
 * same nose with its wake behind it. So the button under the thumb and the
 * ship out in the dark are the same fact twice, which is PINBALL's needle
 * again: a heading drawn from a second copy of the angle would point where
 * the ship does not go. The pilot is the only seat these three are on, so the
 * heading on them gives the navigator nothing (`showsScoutNose`).
 *
 * **Player 2's one is the mouth**, drawn by the same call the ship's own
 * intake is drawn by and lit for exactly as long as it stands open
 * (`scoutMawOpen`), because it *is* that mouth: a mote comes off the little
 * ship only while this is lit and the ship is home.
 *
 * The sine comes off `mazeSinMilli`, the table the flight itself is built
 * from (`sim/scout-fly.ts`), rather than `Math.sin`.
 */

export type ScoutLobe = "left" | "right" | "burn" | "maw";

/** Which of THE SCOUT's four this control is, if any. */
export function scoutLobeOf(id: ControlId): ScoutLobe | null {
  if (id === "scoutTurnLeft") return "left";
  if (id === "scoutTurnRight") return "right";
  if (id === "scoutBurn") return "burn";
  if (id === "scoutMaw") return "maw";
  return null;
}

/** How long the nose drawn on a button is, as a share of its radius. */
const NOSE = 0.5;

export function drawScoutLobe(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  which: ScoutLobe,
  world: World,
  skin: SeatSkin,
): void {
  const { x, y, r } = circle;
  const round = scoutRound(world);
  const live = round !== null && round.phase === "play";
  if (which === "maw") {
    const open = live && scoutMawOpen(round, world.tick, world.cfg.scoutMawTicks);
    drawActionButton(ctx, x, y, r, open, PALETTE.pod, PALETTE.podDark, "intake", skin.dead[0]);
    return;
  }
  const on =
    live && (which === "burn" ? round.burning : round.turn === (which === "left" ? -1 : 1));
  const hex = PALETTE.hull;
  if (on) halo(ctx, x, y, r * 1.8, hex, 0.45);
  ctx.fillStyle = on ? hex : skin.dead[0];
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  paintLobe(ctx, x, y, r, "both");

  const ink = on ? "#1B0630" : hex;
  const heading = round?.headingMilli ?? 0;
  const sin = mazeSinMilli(heading) / 1000;
  const cos = mazeCosMilli(heading) / 1000;
  drawNose(ctx, x, y, r, ink, sin, cos);
  if (which === "burn") drawWake(ctx, x, y, r, ink, sin, cos);
  else drawSwing(ctx, x, y, r, ink, which === "left" ? -1 : 1);
}

/**
 * The little ship's nose, at the heading the ship is actually at: a line from
 * the button's middle with a short head on it. The heading comes in as its
 * sine and cosine — straight up is zero and clockwise is positive, which is
 * the flight's own convention — so SNAKE's wheel, whose heading is a unit
 * step on a grid, draws the same nose from the same call (`snake-button.ts`).
 */
export function drawNose(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ink: string,
  sin: number,
  cos: number,
): void {
  const tipX = x + sin * r * NOSE;
  const tipY = y - cos * r * NOSE;
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1.4, r * 0.14);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  // The head: two short strokes back from the tip, either side of the line.
  const back = r * 0.22;
  ctx.beginPath();
  ctx.moveTo(tipX - sin * back - cos * back * 0.7, tipY + cos * back - sin * back * 0.7);
  ctx.lineTo(tipX, tipY);
  ctx.lineTo(tipX - sin * back + cos * back * 0.7, tipY + cos * back + sin * back * 0.7);
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The arc a turn swings the nose through, round the outside of the face,
 * with a head on the end it goes towards. Anticlockwise on ◀, clockwise on ▶.
 */
export function drawSwing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ink: string,
  dir: -1 | 1,
): void {
  const rr = r * 0.74;
  // From two o'clock round the bottom to ten, or the mirror of it.
  const from = dir === 1 ? -Math.PI * 0.35 : -Math.PI * 0.65;
  const to = dir === 1 ? Math.PI * 0.55 : Math.PI * 0.45;
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.beginPath();
  ctx.arc(x, y, rr, from, to, dir === -1);
  ctx.stroke();
  // The head, at the far end, pointing the way the arc runs.
  const ex = x + Math.cos(to) * rr;
  const ey = y + Math.sin(to) * rr;
  const tx = -Math.sin(to) * dir;
  const ty = Math.cos(to) * dir;
  const h = r * 0.18;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(ex - tx * h + ty * h * 0.7, ey - ty * h - tx * h * 0.7);
  ctx.lineTo(ex, ey);
  ctx.lineTo(ex - tx * h - ty * h * 0.7, ey - ty * h + tx * h * 0.7);
  ctx.stroke();
  ctx.restore();
}

/**
 * The wake behind a burning nose: two chevrons trailing it, the further one
 * fainter — PINBALL's muzzle turned to face wherever the ship is pointed.
 */
function drawWake(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ink: string,
  sin: number,
  cos: number,
): void {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 2; i++) {
    const back = r * (0.34 + i * 0.24);
    const cx = x - sin * back;
    const cy = y + cos * back;
    const half = r * 0.3;
    const dip = r * 0.16;
    ctx.globalAlpha = i === 0 ? 0.9 : 0.45;
    ctx.lineWidth = Math.max(1.2, r * (i === 0 ? 0.12 : 0.09));
    ctx.beginPath();
    ctx.moveTo(cx - cos * half - sin * dip, cy - sin * half + cos * dip);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + cos * half - sin * dip, cy + sin * half + cos * dip);
    ctx.stroke();
  }
  ctx.restore();
}
