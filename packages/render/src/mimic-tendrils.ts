import { halo, strokeGlowFaded } from "./glow.js";
import { sinHash } from "./hash.js";
import { PALETTE } from "./palette.js";

/**
 * **THE MIMIC's arms curling in at its own heart.** When the mantle splits on
 * its core, six tendrils of its skin reach out from under the two halves and
 * curl in at the core — a wave running down each, the tip curling to a bud —
 * the way an animal cut open closes round what it is protecting. It is
 * TENDRILS, the look VERSUS offered for a shot's mark on 6 October 2026; the
 * owner, 9 October 2026, of the `aim:cannon` candidates he did not take for
 * the mark: *I like the other animations … a lot … apply it to some boss
 * visuals … just one animation visual for one boss.*
 *
 * Drawn over the halves (`mimic-draw.ts`), each rooted at a cut edge, so the
 * arms are seen leaving the skin; under them the gap was too narrow to show
 * anything but their tips. In the
 * mantle's own greens with its sign's pale line for an edge: the core stays
 * the only lit fill on the body (`palette-creatures-late.ts`).
 */

/** Each arm's heading, out from the core: three a side, each from the half on its side. */
const ARMS = [Math.PI - 0.55, Math.PI + 0.05, Math.PI + 0.6, -0.5, 0.1, 0.6] as const;
const ARM_N = 16;
/** Where an arm's root is, and how close its tip comes, in the core's radius. */
const ROOT = 2.1;
const TIP = 1.08;

/**
 * The tendrils round a core of radius `r` at `(x, y)`, squashed by `squash`
 * as the core is, reaching in by `open` (0..1, the mantle's split).
 */
export function drawMimicTendrils(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  squash: number,
  open: number,
  time: number,
): void {
  if (open <= 0) return;
  const arms = new Path2D();
  const buds: [number, number][] = [];
  ARMS.forEach((a0, i) => {
    const u = sinHash(i + 5);
    const root = r * (ROOT + 0.25 * u);
    // Reaching in as the mantle parts, and breathing once there.
    const tip = r * (TIP + (1 - open) * 1.2 + 0.12 * Math.sin(1.7 * time + i));
    const wide = r * (0.3 + 0.08 * u);
    const curl = (i % 2 === 0 ? 1 : -1) * (0.25 + 0.15 * u);
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    const cap: [number, number][] = [];
    let ex = 0;
    let ey = 0;
    for (let j = 0; j <= ARM_N; j++) {
      const s = j / ARM_N;
      const d = root + (tip - root) * s;
      // A wave runs down the arm, and the tip curls in.
      const ang = a0 + 0.16 * Math.sin(2.3 * time + i * 1.3 - s * 4) * s + curl * s ** 3 * 0.6;
      const cx = x + Math.cos(ang) * d;
      const cy = y + Math.sin(ang) * d * squash;
      const w = wide * (1 - 0.75 * s) * Math.min(1, 6 * (1 - s) + 0.15);
      left.push([cx - Math.sin(ang) * w, cy + Math.cos(ang) * w]);
      right.push([cx + Math.sin(ang) * w, cy - Math.cos(ang) * w]);
      // The root is round, as if the arm grows out of the skin under it.
      if (j === 0)
        for (let k = 1; k < 6; k++) {
          const c = ang - Math.PI / 2 + (k * Math.PI) / 6;
          cap.push([cx + Math.cos(c) * w, cy + Math.sin(c) * w]);
        }
      ex = cx;
      ey = cy;
    }
    buds.push([ex, ey]);
    [...left, ...right.reverse(), ...cap].forEach(([px, py], n) => {
      if (n === 0) arms.moveTo(px, py);
      else arms.lineTo(px, py);
    });
    arms.closePath();
  });
  ctx.fillStyle = PALETTE.mimicMottle;
  ctx.fill(arms);
  strokeGlowFaded(ctx, arms, PALETTE.mimicSign, 1, 0.8 * open, 0.75, 6);
  const bud = new Path2D();
  for (const [bx, by] of buds) {
    halo(ctx, bx, by, r * 0.5, PALETTE.mimicSign, 0.35 * open);
    bud.moveTo(bx + r * 0.1, by);
    bud.arc(bx, by, r * 0.1, 0, Math.PI * 2);
  }
  ctx.fillStyle = PALETTE.mimicSign;
  ctx.fill(bud);
}
