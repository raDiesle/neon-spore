import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import type { Point } from "./swindle-shape.js";
import { SWINDLE_CORE, SWINDLE_FLESH } from "./swindle-tint.js";

/**
 * **THE SWINDLE's arms**: a strand of her from her belly down to each hood's
 * crown, thick where it leaves her and thin where it holds the hood, bowed
 * and swaying — the dealer's hand on each cup. On every beat a bead of her
 * runs down each one, so she is plainly alive and plainly holding on. Beaten,
 * there are no hoods and so no arms.
 */

export interface Arm {
  root: Point;
  crown: Point;
}

/** Points along an arm. */
const N = 12;
/** Its width at her and at the hood, in tiles. */
const ROOT_TILES = 0.26;
const TIP_TILES = 0.07;

export function drawSwindleArms(
  ctx: CanvasRenderingContext2D,
  arms: readonly Arm[],
  tile: number,
  beatPhase: number,
  time: number,
): void {
  ctx.save();
  arms.forEach(({ root, crown }, k) => {
    const sway = Math.sin(time * 1.9 + k * 2.1) * tile * 0.22;
    const mid = { x: (root.x + crown.x) / 2 + sway, y: (root.y + crown.y) / 2 };
    const at = (t: number): Point => ({
      x: (1 - t) * (1 - t) * root.x + 2 * (1 - t) * t * mid.x + t * t * crown.x,
      y: (1 - t) * (1 - t) * root.y + 2 * (1 - t) * t * mid.y + t * t * crown.y,
    });
    const left: Point[] = [];
    const right: Point[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const p = at(t);
      const q = at(Math.min(1, t + 0.01));
      const o = at(Math.max(0, t - 0.01));
      const dx = q.x - o.x;
      const dy = q.y - o.y;
      const d = Math.max(1e-6, Math.hypot(dx, dy));
      const w = (tile * (ROOT_TILES + (TIP_TILES - ROOT_TILES) * t)) / 2;
      left.push({ x: p.x - (dy / d) * w, y: p.y + (dx / d) * w });
      right.push({ x: p.x + (dy / d) * w, y: p.y - (dx / d) * w });
    }
    const path = new Path2D();
    path.moveTo(left[0]?.x ?? root.x, left[0]?.y ?? root.y);
    for (const p of left) path.lineTo(p.x, p.y);
    for (const p of right.reverse()) path.lineTo(p.x, p.y);
    path.closePath();
    const g = ctx.createLinearGradient(root.x, root.y, crown.x, crown.y);
    g.addColorStop(0, rgba(SWINDLE_CORE, 0.95));
    g.addColorStop(1, rgba(SWINDLE_FLESH, 0.85));
    ctx.fillStyle = g;
    ctx.fill(path);
    // The bead, running down on the beat.
    const t = (beatPhase + k * 0.17) % 1;
    const bead = at(t);
    ctx.fillStyle = rgba(PALETTE.organRim, 0.55 * Math.sin(Math.PI * t));
    ctx.beginPath();
    ctx.arc(bead.x, bead.y, tile * (0.1 - 0.05 * t), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}
