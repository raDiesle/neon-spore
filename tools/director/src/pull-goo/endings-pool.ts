import type { Point } from "@neon-spore/content";
import { PALETTE, smoothstep } from "@neon-spore/render";
import { bodyPath, drop } from "./body.js";
import { type Ending, halo, intoPlace, landed, paintDrop, wave } from "./ending.js";
import { ARRIVE, RETURN } from "./moment.js";
import { clamp01, hash } from "./noise.js";
import { homeward, type Scene } from "./scene.js";
import { paintTail, tailPath } from "./strand.js";

/**
 * Two GOO endings in which the drop comes apart in the place and gathers
 * itself again at the start: SINK, a pool it melts into and drains out of,
 * and SCATTER, droplets it bursts into and that crawl home one by one.
 */

/** The green pool a sunk drop leaves in the place, `size` of its widest. */
function pool(s: Scene, size: number, alpha: number): void {
  if (size <= 0.02 || alpha <= 0) return;
  const { ctx, r } = s;
  const p = bodyPath({ at: s.place, r: r * 1.45 * size, seed: 23 }, s.style, s.time * 0.7);
  ctx.save();
  ctx.fillStyle = PALETTE.good;
  ctx.globalAlpha = 0.3 * alpha;
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

export const SINK: Ending = {
  name: "sink",
  sentence:
    "counted, the drop melts into the place and spreads a green pool with a ripple through it; let go, the pool drains out as a slug that slides back to the start and rounds into the drop again",
  arrive(s, a, hold) {
    const e = smoothstep(a);
    const breathe = 0.04 * Math.sin(hold * 5) * Math.min(1, hold * 3);
    pool(s, e + breathe, 1);
    halo(s, s.place, s.r * 2.4, 0.3 * e);
    wave(s, s.place, (s.m.age - ARRIVE * 0.6) / 0.8, 1.8);
    paintDrop(s, drop(intoPlace(s, a), s.r * (1 - 0.5 * e), { shake: 0.2 * e }), 0.8 * e);
  },
  back(s, b) {
    const sec = b * RETURN;
    const v = smoothstep(clamp01(b / 0.85));
    pool(s, 1 - clamp01(b / 0.55), 1 - clamp01(b / 0.7));
    if (b >= 0.85) return landed(s, sec - 0.85 * RETURN, 0.2 * (1 - clamp01((b - 0.85) * 4)));
    const q = homeward(s, v);
    const rr = s.r * (0.5 + 0.5 * v);
    if (v < 0.6) {
      const run = {
        t: s.t,
        origin: s.goal,
        at: s.goal + (s.origin - s.goal) * v,
        off: { x: 0, y: 0 },
      };
      paintTail(s.ctx, tailPath(run, rr, s.time, 0.3), s.style, 0, 1 - v / 0.6);
    }
    const slide = Math.sin(Math.PI * v);
    paintDrop(
      s,
      drop(q, rr, { lean: { x: -q.dx, y: -q.dy }, stretch: 0.9 * slide, squash: 1 + 0.2 * slide }),
      0.8 * (1 - v),
    );
  },
};

const DROPLETS = 7;

/** Where droplet `i` hovers round the place once burst, bobbing. */
function hover(s: Scene, i: number, out: number): Point {
  const a = (i / DROPLETS) * Math.PI * 2 + hash(i * 3.1) * 0.6;
  const d = s.r * (1.45 + 0.35 * hash(i * 5.7)) * out;
  const bob = s.r * 0.08 * Math.sin(s.time * 3 + i * 1.7);
  return { x: s.place.x + Math.cos(a) * (d + bob), y: s.place.y + Math.sin(a) * (d + bob) };
}

export const SCATTER: Ending = {
  name: "scatter",
  sentence:
    "counted, the drop bursts in the place into seven green droplets that hang round it, bobbing; let go, they crawl back along the path one after another and gather at the start into the drop again",
  arrive(s, a) {
    const burst = smoothstep(clamp01((s.m.age - 0.12) / 0.35));
    if (burst <= 0) {
      paintDrop(s, drop(intoPlace(s, a), s.r, { squash: 1 + 0.6 * a }), 0.8 * a);
      return;
    }
    halo(s, s.place, s.r * 2.6, 0.35 * (1 - burst * 0.5));
    wave(s, s.place, (s.m.age - 0.12) / 0.6, 2.2);
    for (let i = 0; i < DROPLETS; i++)
      paintDrop(
        s,
        drop(hover(s, i, burst), s.r * (0.38 + 0.6 * (1 - burst)), { seed: 50 + i }),
        0.85,
      );
  },
  back(s, b) {
    const sec = b * RETURN;
    const lag = 0.07;
    const trip = 1 - lag * (DROPLETS - 1);
    let home = 0;
    let last = 0;
    for (let i = 0; i < DROPLETS; i++) {
      const v = smoothstep(clamp01((b - i * lag) / trip));
      if (v >= 1) {
        home++;
        last = Math.max(last, i * lag + trip);
        continue;
      }
      const from = hover(s, i, 1);
      const q = homeward(s, v);
      const spread = (1 - v) ** 2;
      const at = { x: q.x + (from.x - s.place.x) * spread, y: q.y + (from.y - s.place.y) * spread };
      const crawl = Math.sin(Math.PI * v);
      const body = drop(at, s.r * 0.38, {
        seed: 50 + i,
        lean: { x: -q.dx, y: -q.dy },
        stretch: 0.7 * crawl,
      });
      paintDrop(s, body, 0.85 * (1 - 0.6 * v));
    }
    if (home === DROPLETS) return landed(s, sec - last * RETURN, 0.15);
    if (home > 0) paintDrop(s, drop(s.home, s.r * Math.sqrt(home / DROPLETS)), 0.5);
  },
};
