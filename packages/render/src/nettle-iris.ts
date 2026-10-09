import { halo, strokeGlow } from "./glow.js";
import { sinHash } from "./hash.js";
import { PALETTE } from "./palette.js";

/**
 * **THE NETTLE's iris, a mouth of hooked teeth.** The underside's iris was a
 * dark hole with an ember rim; it is IRIS now, the look VERSUS offered for a
 * shot's mark on 6 October 2026 — seven hooked teeth round the hole, no two
 * the same size, each opening and biting in on its own beat, on a rim that
 * breathes. The owner, 9 October 2026, of the `aim:cannon` candidates he did
 * not take for the mark: *I like the other animations … a lot … apply it to
 * some boss visuals … just one animation visual for one boss.*
 *
 * It is the fight's own picture: the pair wind this iris shut and it forces
 * itself open again (`content/nettle-script.ts`), so the teeth open with it —
 * `open` is the figure's `mouth` — and turn a little as it winds. The ember
 * is the hole's own, and the eye-spot's: the bell has no fire-button colour
 * in it, and a red or cyan here would be read as a shot to fire.
 */

const TEETH = 7;
const TOOTH_N = 10;
const RIM_N = 64;
/** The teeth's root, in the hole's radius: just inside the rim. */
const ROOT = 0.97;

/** A solid of neon: a soft dark shadow, its glow, its body, a hot edge — every pass at `alpha`. */
function glowFill(ctx: CanvasRenderingContext2D, p: Path2D, alpha: number): void {
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.35 * alpha;
  ctx.stroke(p);
  strokeGlow(ctx, p, PALETTE.ember, 0.8, 2, 0.9 * alpha, 9);
  ctx.globalAlpha = 0.9 * alpha;
  ctx.fillStyle = PALETTE.ember;
  ctx.fill(p);
  ctx.globalAlpha = 0.7 * alpha;
  ctx.strokeStyle = PALETTE.emberRim;
  ctx.lineWidth = 0.6;
  ctx.stroke(p);
  ctx.globalAlpha = 1;
}

/**
 * The iris at `(x, y)`, its hole `m` across at its widest, open by `open`
 * (0..1), at `alpha` for the body's turn.
 */
export function drawNettleIris(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  m: number,
  open: number,
  time: number,
  alpha: number,
): void {
  const hole = m * open;
  if (hole < 1) return;
  // The rim breathes, and turns a little as the seats wind it.
  const turn = 0.3 * (1 - open) + 0.12 * Math.sin(0.6 * time);
  const rim = new Path2D();
  for (let i = 0; i <= RIM_N; i++) {
    const a = (i / RIM_N) * Math.PI * 2;
    const k =
      hole * (1 + 0.05 * Math.sin(TEETH * a - turn * TEETH) + 0.03 * Math.sin(4 * a + 1.9 * time));
    if (i === 0) rim.moveTo(x + Math.cos(a) * k, y + Math.sin(a) * k);
    else rim.lineTo(x + Math.cos(a) * k, y + Math.sin(a) * k);
  }
  rim.closePath();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PALETTE.background;
  ctx.fill(rim);
  ctx.globalAlpha = 1;
  halo(ctx, x, y, hole * 1.6, PALETTE.ember, 0.18 * alpha);
  strokeGlow(ctx, rim, PALETTE.emberRim, 1.4, 1.6, alpha, 8);

  const teeth = new Path2D();
  for (let i = 0; i < TEETH; i++) {
    const u = sinHash(i + 3);
    const a = (i / TEETH) * Math.PI * 2 + turn;
    // Each tooth bites on its own beat: open, then in.
    const bite = 0.5 + 0.5 * Math.sin(2.4 * time + i * 0.7);
    const base = hole * ROOT;
    const tip = hole * (0.4 + 0.2 * bite) * (0.9 + 0.25 * u);
    const hook = 0.9 + 0.4 * u;
    const wide = hole * (0.12 + 0.06 * u);
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    for (let j = 0; j <= TOOTH_N; j++) {
      const s = j / TOOTH_N;
      const d = base + (tip - base) * s;
      const ang = a + hook * s * s;
      const cx = x + Math.cos(ang) * d;
      const cy = y + Math.sin(ang) * d;
      const w = wide * Math.sin(Math.PI * Math.min(1, 0.15 + s * 0.85)) * (1 - s * 0.6);
      left.push([cx - Math.sin(ang) * w, cy + Math.cos(ang) * w]);
      right.push([cx + Math.sin(ang) * w, cy - Math.cos(ang) * w]);
    }
    const outline = [...left, ...right.reverse()];
    outline.forEach(([px, py], n) => {
      if (n === 0) teeth.moveTo(px, py);
      else teeth.lineTo(px, py);
    });
    teeth.closePath();
  }
  glowFill(ctx, teeth, alpha);
}
