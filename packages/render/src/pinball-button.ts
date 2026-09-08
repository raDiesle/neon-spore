import type { ControlId } from "@neon-spore/content";
import { mazeCosMilli, mazeSinMilli, pinballRound, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Circle } from "./layout.js";
import { paintLobe } from "./lobe-shell.js";
import { PALETTE, STROKE } from "./palette.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * PINBALL's two presses, as faces on the band's own lobes.
 *
 * **This round is played on the panel the pair already hold.** It shipped with
 * four flat plates where the band would be, and the owner asked for the
 * opposite in the same words he used on THE PULSE: the buttons should be the
 * standard set's. So SET and FIRE are `lobe` controls now, standing in the
 * socket `band-control.ts` puts every control in, and this file draws only
 * what is *on* the face. The socket, the gloss and the tissue around it are not
 * this file's business and never were.
 *
 * **Each one shows the thing it does, live.** SET carries the needle at the
 * angle the needle is actually at — read off the round, not animated here — so
 * the button under player 1's thumb and the arc up the table are the same fact
 * twice; the moment it is pressed the needle on it stops with the one on the
 * board. FIRE carries the ball leaving a muzzle, and it is dark until the
 * needle has been stopped, because until then it answers nobody
 * (`sim/pinball-controls.ts`) and a button that quietly did nothing would be
 * worse than one visibly not yet theirs.
 *
 * The sine comes off `mazeSinMilli` rather than `Math.sin`, the same call the
 * launch itself is built from — a needle drawn from a second copy of the angle
 * would point somewhere the ball does not go.
 */

/** Whether this control is one of PINBALL's two. */
export function pinLobeOf(id: ControlId): "latch" | "launch" | null {
  if (id === "pinLatch") return "latch";
  if (id === "pinLaunch") return "launch";
  return null;
}

/** How long the needle drawn on SET is, as a share of the button's radius. */
const NEEDLE = 0.68;

export function drawPinLobe(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  which: "latch" | "launch",
  world: World,
  skin: SeatSkin,
): void {
  const { x, y, r } = circle;
  const boss = pinballRound(world);
  const live = boss !== null && boss.phase === "play";
  const stopped = boss !== null && boss.shot !== "aim";
  const on = which === "latch" ? live && !stopped : live && boss?.shot === "power";
  const hex = which === "latch" ? PALETTE.hull : PALETTE.pod;

  if (on) halo(ctx, x, y, r * 1.8, hex, 0.45);
  ctx.fillStyle = on ? hex : skin.dead[0];
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  paintLobe(ctx, x, y, r, "both");

  const ink = on ? (which === "latch" ? "#1B0630" : PALETTE.podDark) : hex;
  if (which === "latch") drawNeedle(ctx, x, y, r, ink, boss?.angleMilli ?? 0, stopped);
  else drawMuzzle(ctx, x, y, r, ink);
}

/**
 * The needle, standing at the angle the round's needle stands at, over the
 * short arc it sweeps.
 *
 * Straight up is zero and positive is to the right, which is the launch's own
 * convention (`sim/pinball-board.ts`); the arc under it is drawn at the same
 * radius so the sweep reads as a range rather than as decoration. Once the
 * needle is latched it gains a bar across its tip: the one thing this button
 * has to say after it has been pressed is that it worked.
 */
function drawNeedle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ink: string,
  angleMilli: number,
  stopped: boolean,
): void {
  const sin = mazeSinMilli(angleMilli) / 1000;
  const cos = mazeCosMilli(angleMilli) / 1000;
  const pivotY = y + r * 0.42;
  const tipX = x + sin * r * NEEDLE;
  const tipY = pivotY - cos * r * NEEDLE;

  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.beginPath();
  ctx.arc(x, pivotY, r * NEEDLE, -Math.PI * 0.78, -Math.PI * 0.22);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.lineWidth = Math.max(1.4, r * 0.14);
  ctx.beginPath();
  ctx.moveTo(x, pivotY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  if (stopped) {
    ctx.lineWidth = Math.max(1, r * 0.1);
    ctx.beginPath();
    ctx.moveTo(tipX - cos * r * 0.2, tipY - sin * r * 0.2);
    ctx.lineTo(tipX + cos * r * 0.2, tipY + sin * r * 0.2);
    ctx.stroke();
  }
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(x, pivotY, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The ball leaving: it, and two chevrons under it pointing the way it went.
 *
 * It has been drawn twice before. A mouth opening upward with the ball above it
 * read, at a lobe's size, as a head over a pair of shoulders; a solid wedge
 * under the same ball read as a body. Two open chevrons cannot be read as a
 * person at all, and "up, fast" is the whole of what this button says.
 */
function drawMuzzle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ink: string,
): void {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // The ball, at the top and already clear.
  ctx.beginPath();
  ctx.arc(x, y - r * 0.46, r * 0.23, 0, Math.PI * 2);
  ctx.fill();

  // Two chevrons under it, the lower one fainter: the way it went, and how
  // fast.
  const half = r * 0.42;
  for (let i = 0; i < 2; i++) {
    const top = y - r * 0.02 + i * r * 0.38;
    ctx.globalAlpha = i === 0 ? 1 : 0.45;
    ctx.lineWidth = Math.max(1.4, r * (i === 0 ? 0.16 : 0.12));
    ctx.beginPath();
    ctx.moveTo(x - half, top + r * 0.24);
    ctx.lineTo(x, top);
    ctx.lineTo(x + half, top + r * 0.24);
    ctx.stroke();
  }
  ctx.restore();
}
