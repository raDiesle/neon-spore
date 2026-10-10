import type { Point } from "@neon-spore/content";
import { PALETTE, smoothstep } from "@neon-spore/render";
import { bodyPath, drop } from "./body.js";
import { cheer, type Ending, gone, greenAt, halo, intoPlace, paintDrop, wave } from "./ending.js";
import { GREEN } from "./moment.js";
import { clamp01, hash, mix } from "./noise.js";
import type { Scene } from "./scene.js";

/**
 * Two GOO endings that drain the drop away where it was counted, flat on
 * the field: SINK, the owner's pick, melting into a pool that swirls down
 * its middle, and STRAINER, through a grate. VORTEX is `endings-whirl.ts`.
 */

/** A green pool in the place, `size` of its widest, its lumps turned by `spin`. */
function pool(s: Scene, size: number, alpha: number, spin: number): void {
  if (size <= 0.02 || alpha <= 0) return;
  const { ctx, r } = s;
  const p = bodyPath({ at: s.place, r: r * 1.45 * size, seed: 23, spin }, s.style, s.time * 0.7);
  ctx.save();
  ctx.fillStyle = PALETTE.good;
  ctx.globalAlpha = 0.32 * alpha;
  ctx.fill(p);
  ctx.strokeStyle = PALETTE.good;
  ctx.globalAlpha = 0.9 * alpha;
  ctx.lineWidth = r * 0.12;
  ctx.stroke(p);
  ctx.strokeStyle = PALETTE.goodRim;
  ctx.globalAlpha = 0.6 * alpha;
  ctx.lineWidth = r * 0.04;
  ctx.stroke(p);
  ctx.restore();
}

/** Bright streaks in a pool, `n` of them, turned to `turn` and `rr` out. */
function swirl(s: Scene, rr: number, turn: number, alpha: number, n = 3): void {
  if (rr <= 0.5 || alpha <= 0) return;
  const { ctx } = s;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = mix(PALETTE.good, "#FFFFFF", 0.5);
  for (let i = 0; i < n; i++) {
    const a = turn + (i / n) * Math.PI * 2;
    ctx.globalAlpha = alpha * (0.5 + 0.3 * hash(i * 2.3));
    ctx.lineWidth = Math.max(0.4, rr * 0.12);
    ctx.beginPath();
    ctx.arc(s.place.x, s.place.y, rr * (0.45 + 0.25 * hash(i * 4.1)), a, a + 1.6);
    ctx.stroke();
  }
  ctx.restore();
}

/** The last of it gulped down the middle: a ring drawn in to nothing, `k` 0..1. */
function gulp(s: Scene, k: number): void {
  const { ctx } = s;
  ctx.save();
  ctx.strokeStyle = mix(PALETTE.good, "#FFFFFF", 0.4);
  ctx.globalAlpha = Math.sin(Math.PI * clamp01(k));
  ctx.lineWidth = s.r * 0.1;
  ctx.beginPath();
  ctx.arc(s.place.x, s.place.y, Math.max(0, s.r * 1.1 * (1 - k)), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export const SINK: Ending = {
  name: "sink",
  sentence:
    "counted, the drop flashes green and melts into a green pool round it; the pool turns faster and faster and swirls down its own middle, gone in under a second",
  play(s, e) {
    const melt = smoothstep(clamp01((e - GREEN * 0.6) / 0.2));
    const u = gone(e);
    const spin = s.time + 9 * u * u;
    pool(s, melt * (1 - smoothstep(u)) ** 0.8, 1, spin);
    swirl(s, s.r * 1.45 * melt * (1 - u), spin * 1.6, melt * (1 - u));
    halo(s, s.place, s.r * 2.6, 0.5 * (1 - clamp01(e / 0.6)));
    wave(s, s.place, e / 0.55, 1.9);
    if (u > 0.7) gulp(s, (u - 0.7) / 0.3);
    if (melt < 1) {
      const press = 0.3 * Math.exp(-e * 7) * Math.cos(e * 22);
      const b = drop(intoPlace(s, e), s.r * (1 - 0.6 * melt), {
        squash: 1 + press,
        shake: 0.2 * melt,
      });
      paintDrop(s, b, greenAt(e), 1 - melt * 0.6);
    }
  },
};

/** The grate's holes: one in the middle and a ring of six, as shares of its radius. */
const HOLES: readonly Point[] = [
  { x: 0, y: 0 },
  ...Array.from({ length: 6 }, (_, i) => ({
    x: 0.56 * Math.cos((i / 6) * Math.PI * 2 + 0.3),
    y: 0.56 * Math.sin((i / 6) * Math.PI * 2 + 0.3),
  })),
];

/** A round drain grate set into the field, `R` wide: recessed, lit from the top left. */
function grate(s: Scene, R: number, alpha: number, lit: (i: number) => number): void {
  if (R <= 0.5 || alpha <= 0) return;
  const { ctx } = s;
  const { x, y } = s.place;
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x + R * 0.25, y + R * 0.3, R * 0.1, x, y, R);
  g.addColorStop(0, "#0B1024");
  g.addColorStop(0.8, "#121A33");
  g.addColorStop(1, "#1C2A4A");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  // The bevel: the lip lit where it faces the light, dark where it does not.
  ctx.lineWidth = R * 0.1;
  ctx.strokeStyle = mix(PALETTE.good, "#FFFFFF", 0.3);
  ctx.beginPath();
  ctx.arc(x, y, R, Math.PI * 0.75, Math.PI * 1.75);
  ctx.stroke();
  ctx.strokeStyle = mix(PALETTE.good, "#000000", 0.55);
  ctx.beginPath();
  ctx.arc(x, y, R, -Math.PI * 0.25, Math.PI * 0.75);
  ctx.stroke();
  for (const [i, h] of HOLES.entries()) {
    const hx = x + h.x * R;
    const hy = y + h.y * R;
    const hr = R * 0.16;
    ctx.fillStyle = "#03040A";
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.fill();
    // The far wall of the hole takes the light: a crescent low and right.
    ctx.strokeStyle = mix(PALETTE.good, "#FFFFFF", 0.2);
    ctx.globalAlpha = alpha * 0.55;
    ctx.lineWidth = hr * 0.3;
    ctx.beginPath();
    ctx.arc(hx, hy, hr * 0.8, -Math.PI * 0.1, Math.PI * 0.7);
    ctx.stroke();
    const k = lit(i);
    if (k > 0) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = PALETTE.good;
      ctx.globalAlpha = alpha * k;
      ctx.beginPath();
      ctx.arc(hx, hy, hr * (0.4 + 0.5 * k), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.globalAlpha = alpha;
  }
  ctx.restore();
}

export const STRAINER: Ending = {
  name: "strainer",
  sentence:
    "counted, a round drain grate opens in the field under the drop and the drop flashes green on it; then it spreads over the grate and runs down its seven holes in streams, each hole glowing as the goo goes through, and the grate sinks away",
  play(s, e) {
    const u = gone(e);
    const R =
      s.r * 1.55 * smoothstep(clamp01(e / 0.18)) * (1 - 0.2 * smoothstep(clamp01((u - 0.8) / 0.2)));
    const fade = 1 - smoothstep(clamp01((u - 0.82) / 0.18));
    const lit = (i: number): number =>
      Math.max(0, Math.sin(Math.PI * clamp01((u - i * 0.06) / 0.55))) * 0.8;
    grate(s, R, fade, lit);
    if (e < GREEN) return cheer(s, e, { squash: 1.1 });
    const spread = smoothstep(clamp01(u / 0.2));
    const left = 1 - smoothstep(clamp01((u - 0.1) / 0.7));
    pool(s, (0.6 + 0.45 * spread) * left, 1, s.time);
    // Streams: goo running from the pool's edge into each hole.
    const { ctx } = s;
    ctx.save();
    ctx.fillStyle = mix(PALETTE.good, "#FFFFFF", 0.25);
    for (const [i, h] of HOLES.entries()) {
      for (let j = 0; j < 3; j++) {
        const k = (u * 3 + j / 3 + hash(i * 1.9)) % 1;
        if (u > 0.85 || left <= 0.05) continue;
        const a = Math.atan2(h.y, h.x) + (hash(i + j * 7) - 0.5);
        const from = {
          x: s.place.x + Math.cos(a) * R * 1.05 * left,
          y: s.place.y + Math.sin(a) * R * 1.05 * left,
        };
        const to = { x: s.place.x + h.x * R, y: s.place.y + h.y * R };
        ctx.globalAlpha = 0.8 * (1 - k) * left;
        ctx.beginPath();
        ctx.arc(
          from.x + (to.x - from.x) * k,
          from.y + (to.y - from.y) * k,
          s.r * 0.09 * (1 - k * 0.6),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
    ctx.restore();
    if (spread < 1)
      paintDrop(
        s,
        drop(s.place, s.r * (1 - 0.5 * spread), { squash: 1.1 + 0.5 * spread }),
        0.9,
        1 - spread,
      );
  },
};
