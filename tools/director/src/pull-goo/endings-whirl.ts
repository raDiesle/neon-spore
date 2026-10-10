import type { Point } from "@neon-spore/content";
import { PALETTE, smoothstep } from "@neon-spore/render";
import { drop } from "./body.js";
import { cheer, type Ending, gone, halo, paintDrop } from "./ending.js";
import { GREEN } from "./moment.js";
import { clamp01, mix } from "./noise.js";
import type { Scene } from "./scene.js";

/**
 * VORTEX, the GOO ending that winds the drop away where it was counted: a
 * whirlpool of three arms, tighter and smaller, into a dark eye.
 */

/** One arm of a whirlpool: a ribbon wound in from `R` to the middle over `turns`, at `phase`. */
function arm(s: Scene, R: number, phase: number, alpha: number): void {
  const { ctx } = s;
  const n = 26;
  const turns = 1.25;
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const a = phase + k * turns * Math.PI * 2;
    const d = R * (1 - k) ** 1.3;
    const w = R * 0.22 * (1 - k) * Math.sin(Math.PI * Math.min(1, k * 4 + 0.15));
    const cx = s.place.x + Math.cos(a) * d;
    const cy = s.place.y + Math.sin(a) * d;
    left.push({ x: cx + Math.cos(a) * w, y: cy + Math.sin(a) * w });
    right.push({ x: cx - Math.cos(a) * w, y: cy - Math.sin(a) * w });
  }
  const p = new Path2D();
  for (const [i, q] of left.entries()) (i === 0 ? p.moveTo : p.lineTo).call(p, q.x, q.y);
  for (let i = right.length - 1; i >= 0; i--)
    p.lineTo((right[i] as Point).x, (right[i] as Point).y);
  p.closePath();
  ctx.save();
  ctx.fillStyle = PALETTE.good;
  ctx.globalAlpha = 0.55 * alpha;
  ctx.fill(p);
  ctx.strokeStyle = mix(PALETTE.good, "#FFFFFF", 0.45);
  ctx.globalAlpha = 0.9 * alpha;
  ctx.lineWidth = 0.7;
  ctx.stroke(p);
  ctx.restore();
}

export const VORTEX: Ending = {
  name: "vortex",
  sentence:
    "counted, the drop flashes green and starts to turn; it spins up into a three-armed whirlpool that winds itself tighter and smaller into a dark eye, and a last green spark marks where it went",
  play(s, e) {
    const u = gone(e);
    if (e < GREEN) return cheer(s, e, { spin: s.time + 6 * e * e });
    const open = smoothstep(clamp01(u / 0.18));
    const R = s.r * (0.9 + 0.6 * open) * (1 - smoothstep(u)) ** 0.7;
    const turn = s.time * 3 + 22 * u * u;
    halo(s, s.place, s.r * 2.2, 0.35 * (1 - u));
    // The dark eye the arms wind into.
    const { ctx } = s;
    ctx.save();
    ctx.fillStyle = "#03040A";
    ctx.globalAlpha = 0.85 * open * (1 - u);
    ctx.beginPath();
    ctx.arc(s.place.x, s.place.y, R * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    for (let i = 0; i < 3; i++) arm(s, R, turn + (i / 3) * Math.PI * 2, open);
    if (open < 1)
      paintDrop(
        s,
        drop(s.place, s.r * (1 - 0.4 * open), { spin: s.time + 6 * e * e }),
        0.9,
        1 - open,
      );
    if (u > 0.85) halo(s, s.place, s.r * 1.2, Math.sin(Math.PI * ((u - 0.85) / 0.15)));
  },
};
