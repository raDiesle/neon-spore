import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * What comes out of THE SPLICE's eater (`splice-eater.ts` says when): the
 * tongue it snaps with, the lump of a swallowed number going down inside the
 * wall, and the venom its back end pours onto the hull — the owner's *peeing
 * out of its back, poisoning the ship*, 25 September 2026.
 *
 * The venom is `PALETTE.venom`, the one colour in the game that is nobody's
 * ammunition and no part of the ship, so a stream of it on the hull reads as
 * something done *to* the ship.
 */

type Pt = { x: number; y: number };

/** A snap: out in the first sixth of its cycle, back slowly over the rest. */
export function snap(phase: number): number {
  const f = ((phase % 1) + 1) % 1;
  return f < 0.16 ? f / 0.16 : (1 - (f - 0.16) / 0.84) ** 2;
}

export function drawTongue(ctx: CanvasRenderingContext2D, t: number, from: Pt, to: Pt): void {
  const d = Math.hypot(to.x - from.x, to.y - from.y);
  if (d < t * 0.1) return;
  const cx = (from.x + to.x) / 2;
  const cy = Math.max(from.y, to.y) + d * 0.25;
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.redRim;
  ctx.lineWidth = Math.max(1.5, t * 0.12);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(cx, cy, to.x, to.y);
  ctx.stroke();
  // The sticky tip, split in two.
  ctx.fillStyle = PALETTE.redRim;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(to.x, to.y + side * t * 0.08, t * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** The swallowed number, a glow going down inside the wall. */
export function drawLump(ctx: CanvasRenderingContext2D, t: number, x: number, y: number): void {
  const lump = ctx.createRadialGradient(x, y, 0, x, y, t * 0.45);
  lump.addColorStop(0, rgba(PALETTE.venom, 0.75));
  lump.addColorStop(1, rgba(PALETTE.venom, 0));
  ctx.fillStyle = lump;
  ctx.beginPath();
  ctx.arc(x, y, t * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * The stream from the vent to the hull, its front `q` of the way there: shot
 * out leftward and falling, so it lands in an arc rather than a line. It
 * splashes on the beat it arrives.
 */
export function drawVenom(
  ctx: CanvasRenderingContext2D,
  t: number,
  from: Pt,
  to: Pt,
  q: number,
  b: number,
): void {
  const at = (u: number): Pt => ({
    x: from.x + (to.x - from.x) * (1 - (1 - u) ** 2),
    y: from.y + (to.y - from.y) * u * u - t * 0.6 * 4 * u * (1 - u),
  });
  const steps = 18;
  const n = Math.max(1, Math.round(steps * q));
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [hex, w, a] of [
    [PALETTE.venomDeep, 0.32, 0.9],
    [PALETTE.venom, 0.22, 0.95],
    [PALETTE.venomRim, 0.06, 0.7],
  ] as const) {
    ctx.strokeStyle = rgba(hex, a);
    ctx.lineWidth = Math.max(1, t * w);
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = at((i / n) * q);
      const wob = Math.sin(b * 9 + i * 1.3) * t * 0.03;
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x + wob, p.y);
    }
    ctx.stroke();
  }
  // Drops thrown off the stream.
  ctx.fillStyle = rgba(PALETTE.venom, 0.85);
  for (let i = 1; i < 5; i++) {
    const u = q * (i / 5);
    const p = at(u);
    const off = Math.sin(b * 5 + i * 2.1) * t * 0.14;
    ctx.beginPath();
    ctx.arc(p.x + off, p.y + t * 0.12, t * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
  if (q < 0.85) return;
  // The splash where it lands, spreading.
  const s = (q - 0.85) / 0.15;
  ctx.fillStyle = rgba(PALETTE.venom, 0.8);
  ctx.beginPath();
  ctx.ellipse(to.x, to.y, t * (0.2 + 0.35 * s), t * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const dx of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(to.x + dx * t * 0.4 * s, to.y - t * 0.3 * s * (1 - s), t * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
}
