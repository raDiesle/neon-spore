import { strokeGlow } from "./glow.js";
import { sinHash } from "./hash.js";
import { PALETTE } from "./palette.js";

/**
 * **THE STARE's charge, burning**: a ring of fire round the core gathering in
 * the shut eye — twenty-six flames, each flickering at its own pace and
 * leaning as it turns, over a lumpy ring of neon. It is PLASMA, the look
 * VERSUS offered for a shot's mark on 6 October 2026; the owner, 9 October
 * 2026, of the `aim:cannon` candidates he did not take for the mark: *I like
 * the other animations … a lot … apply it to some boss visuals … just one
 * animation visual for one boss.*
 *
 * A charge is the one thing on this field that is meant to look like it is
 * about to burn, so the fire is the charge's: it grows with `swell` — short
 * licks as the eye shuts, long and fast ones by the time the beam is due —
 * in the charge's own ember (`stare-charge.ts`), never a fire button's red.
 */

const LICKS = 26;
const LICK_N = 8;
const RING_N = 64;

/** The flames round a core of radius `r` at `(x, y)`, for how far the charge has come. */
export function drawChargeFlames(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  swell: number,
  time: number,
): void {
  if (swell <= 0) return;
  const base = (a: number) =>
    r * (1 + 0.07 * Math.sin(4 * a + 2 * time) + 0.04 * Math.sin(9 * a - 3.3 * time));
  const flames = new Path2D();
  for (let i = 0; i < LICKS; i++) {
    const u = sinHash(i + 9);
    const a = (i / LICKS) * Math.PI * 2 + 0.05 * Math.sin(3 * time + i);
    // Faster and longer as the charge fills.
    const flick = 0.5 + 0.5 * Math.sin(time * (4 + 4 * u) * (0.7 + 0.6 * swell) + i * 1.7);
    const len = r * (0.35 + 0.9 * swell) * (0.3 + 0.8 * flick * (0.5 + 0.5 * u));
    const lean = 0.35 + 0.15 * Math.sin(2 * time + i);
    const wide = r * (0.1 + 0.07 * u);
    const b = base(a);
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    for (let j = 0; j <= LICK_N; j++) {
      const s = j / LICK_N;
      const d = b + len * s;
      const ang = a + (lean * s * s * len) / r;
      const cx = x + Math.cos(ang) * d;
      const cy = y + Math.sin(ang) * d;
      const w = wide * (1 - s) ** 0.8;
      left.push([cx - Math.sin(ang) * w, cy + Math.cos(ang) * w]);
      right.push([cx + Math.sin(ang) * w, cy - Math.cos(ang) * w]);
    }
    const outline = [...left, ...right.reverse()];
    outline.forEach(([px, py], n) => {
      if (n === 0) flames.moveTo(px, py);
      else flames.lineTo(px, py);
    });
    flames.closePath();
  }
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.35 + 0.45 * swell;
  ctx.fillStyle = PALETTE.ember;
  ctx.fill(flames);
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
  strokeGlow(ctx, flames, PALETTE.ember, 0.8, 1.2 * swell, 0.7, 6);
  const core = new Path2D();
  for (let i = 0; i <= RING_N; i++) {
    const a = (i / RING_N) * Math.PI * 2;
    const m = base(a);
    if (i === 0) core.moveTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
    else core.lineTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
  }
  core.closePath();
  strokeGlow(ctx, core, PALETTE.ember, 2.2, 2 * swell, 1, 10);
  ctx.strokeStyle = PALETTE.emberRim;
  ctx.lineWidth = 1;
  ctx.stroke(core);
}
