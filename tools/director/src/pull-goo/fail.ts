import type { Point } from "@neon-spore/content";
import { PALETTE, pullTrackPoint, smoothstep } from "@neon-spore/render";
import { paintArrow, splitOf } from "./arrow.js";
import { drop } from "./body.js";
import { edge } from "./border.js";
import { paintGoo } from "./drop-look.js";
import { FAIL_BACK, FAIL_HOLD, FAIL_SETTLE } from "./moment.js";
import { clamp01, hash, settle } from "./noise.js";
import type { Scene } from "./scene.js";
import { paintTail, type Run, runPoint, tailPath } from "./strand.js";

/**
 * **A failure, short or off the path**: the owner, 10 October 2026, on SHORT
 * · RED — *animation should be cooler to move back*. The drop goes red where
 * it was let go and spits; its own tail, gone taut, slurps it home, the drop
 * thinning and stretched as it is dragged and leaving red drops behind; at
 * the start it pops back to its size and wobbles still as the red drains out.
 */

export function paintFailure(s: Scene): void {
  const { ctx, r, m, style, time } = s;
  const f = m.age;
  const whole: Run = { t: s.t, origin: s.origin, at: m.from.at, off: m.from.off };
  if (m.reach !== null && Math.hypot(m.from.off.x, m.from.off.y) >= m.reach * 0.95)
    edge(ctx, s.t, m.from.at, m.from.off, m.reach, r, 1 - clamp01(f / 0.9), time);
  if (f < FAIL_HOLD) {
    const e = f / FAIL_HOLD;
    paintTail(ctx, tailPath(whole, r, time, 0.6), PALETTE.red, 0, 1);
    spit(ctx, s.from, r, f);
    paintGoo(ctx, drop(s.from, r, { squash: 1.15, shake: 0.35 * (1 - e) }), style, time, {
      red: smoothstep(clamp01(f / 0.08)) * 0.9,
    });
    arrowIn(s, s.from, m.from.at, r);
    return;
  }
  const g = f - FAIL_HOLD;
  if (g < FAIL_BACK) {
    const u = smoothstep(g / FAIL_BACK);
    const run: Run = {
      ...whole,
      at: whole.at + (s.origin - whole.at) * u,
      off: scale(whole.off, 1 - u),
    };
    const at = runPoint(run, 1);
    const behind = runPoint(run, 0.8);
    const w = Math.hypot(behind.x - at.x, behind.y - at.y) || 1;
    const rr = r * (1 - 0.32 * Math.sin(Math.PI * u));
    trail(ctx, whole, r, u, g);
    paintTail(ctx, tailPath(run, rr, time, 0.4), PALETTE.red, 0, 1 - 0.5 * u);
    spit(ctx, s.from, r, f);
    const lean = { x: (behind.x - at.x) / w, y: (behind.y - at.y) / w };
    paintGoo(
      ctx,
      drop(at, rr, { lean, stretch: 0.75 * Math.sin(Math.PI * u), point: 5 }),
      style,
      time,
      { red: 0.9 },
      lean,
    );
    arrowIn(s, at, run.at, rr);
    return;
  }
  const h = g - FAIL_BACK;
  trail(ctx, whole, r, 1, g);
  paintGoo(
    ctx,
    drop(s.home, r, { squash: 1 + 0.45 * style.jiggle * settle(h, 6, 18) }),
    style,
    time,
    {
      red: 0.9 * (1 - clamp01(h / FAIL_SETTLE)),
    },
  );
  arrowIn(s, s.home, s.origin, r);
}

/** The arrow stays in the drop all the way home (`arrow.ts`): the way the pull went at
 * `k` along the track, split again for a two-way pull as it nears its start. */
function arrowIn(s: Scene, at: Point, k: number, rr: number): void {
  const q = pullTrackPoint(s.t, k);
  const sign = s.goal > s.origin ? 1 : -1;
  const twoWay = s.origin > 0 && s.origin < 1;
  const apart = (k - s.origin) / (Math.abs(s.goal - s.origin) || 1);
  paintArrow(s.ctx, at, rr, s.style, {
    dx: q.dx * sign,
    dy: q.dy * sign,
    split: splitOf(twoWay, apart),
    held: false,
    time: s.time,
  });
}

const scale = (p: Point, k: number): Point => ({ x: p.x * k, y: p.y * k });

/** Red goo spat off the drop the moment it fails, flung out and falling away. */
function spit(ctx: CanvasRenderingContext2D, at: Point, r: number, f: number): void {
  const e = f / 0.55;
  if (e >= 1) return;
  const out = 1 - (1 - e) ** 2;
  ctx.save();
  ctx.fillStyle = PALETTE.red;
  for (let i = 0; i < 6; i++) {
    const a = hash(i * 4.1 + 3) * Math.PI * 2;
    const d = r * (1.1 + 1.6 * hash(i * 2.9)) * out;
    const size = r * (0.1 + 0.1 * hash(i * 7.3)) * (1 - e);
    ctx.globalAlpha = 1 - e;
    ctx.beginPath();
    ctx.ellipse(
      at.x + Math.cos(a) * d,
      at.y + Math.sin(a) * d + r * e * e,
      size * 1.4,
      size,
      a,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}

/** Red drops left behind along the way it was dragged, each fading once the drop has passed it. */
function trail(ctx: CanvasRenderingContext2D, run: Run, r: number, u: number, g: number): void {
  ctx.save();
  ctx.fillStyle = PALETTE.red;
  for (let i = 0; i < 6; i++) {
    const v = 0.15 + 0.8 * hash(i * 3.3 + 5);
    if (1 - u > v) continue;
    const since = g - FAIL_BACK * (1 - v);
    if (since < 0) continue;
    const a = 1 - clamp01(since / 0.7);
    if (a <= 0) continue;
    const q = runPoint(run, v);
    const side = (hash(i * 6.1) - 0.5) * r * 0.9;
    const size = r * (0.07 + 0.08 * hash(i * 8.7)) * Math.min(1, since * 10 + 0.2);
    ctx.globalAlpha = 0.75 * a;
    ctx.beginPath();
    ctx.arc(q.x - q.dy * side, q.y + q.dx * side, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
