import type { Point } from "@neon-spore/content";
import { PALETTE, smoothstep } from "@neon-spore/render";
import { bodyPath, drop, type GooBody, paintBody } from "./body.js";
import { ARRIVE, RETURN } from "./moment.js";
import { clamp01, settle } from "./noise.js";
import type { Scene } from "./scene.js";
import { remains } from "./strand.js";

/**
 * **How a count ends** — what tells one GOO look from another. The owner, 10
 * October 2026: *the success end animation is very bad, because it does not
 * look connected … give me alternative endings i can choose and decide from
 * … no falling down.* Every ending plays the one drop the hand had: into the
 * place while the hand is still on it (`arrive`), and from the place back to
 * the start after the lift (`back`), arriving whole, where the next pull
 * takes it. Green is the count, as everywhere in the game.
 */
export interface Ending {
  readonly name: string;
  readonly sentence: string;
  /** `a` of the way into the place, 0..1, and `hold` seconds held there after. */
  arrive(s: Scene, a: number, hold: number): void;
  /** `b` of the way home, 0..1 over `RETURN`, past 1 while it waits at the start. */
  back(s: Scene, b: number): void;
}

export function paintEnding(s: Scene, ending: Ending): void {
  const { m } = s;
  const run = { t: s.t, origin: s.origin, at: m.from.at, off: m.from.off };
  remains(s.ctx, run, s.r, 1 - clamp01(m.age / 0.9));
  if (m.back !== null && m.back > 0) ending.back(s, m.back / RETURN);
  else ending.arrive(s, clamp01(m.age / ARRIVE), Math.max(0, m.age - ARRIVE));
}

/** Where the drop is `a` of the way from where the count found it into the place. */
export function intoPlace(s: Scene, a: number): Point {
  const e = smoothstep(a);
  return { x: s.from.x + (s.place.x - s.from.x) * e, y: s.from.y + (s.place.y - s.from.y) * e };
}

/** The drop, green by `green`. */
export function paintDrop(s: Scene, b: GooBody, green: number, alpha = 1): void {
  paintBody(s.ctx, b, s.style, s.time, { red: 0, green, alpha });
}

/** Home and wobbling still, `since` seconds after it got there. */
export function landed(s: Scene, since: number, green = 0): void {
  const sq = 1 + 0.4 * s.style.jiggle * settle(Math.max(0, since), 6, 18);
  paintDrop(s, drop(s.home, s.r, { squash: sq }), green);
}

/** A green ring rolling out of `at`, `u` 0..1 of its life. */
export function wave(s: Scene, at: Point, u: number, reach = 2): void {
  if (u <= 0 || u >= 1) return;
  const out = 1 - (1 - u) ** 2;
  const { ctx, r } = s;
  ctx.save();
  ctx.strokeStyle = PALETTE.good;
  ctx.globalAlpha = 0.85 * (1 - u);
  ctx.lineWidth = r * 0.16 * (1 - u) + 0.3;
  ctx.stroke(bodyPath({ at, r: r * (1.1 + reach * out), seed: 41 }, s.style, s.time));
  ctx.restore();
}

/** A soft green light under `at`. */
export function halo(s: Scene, at: Point, rr: number, alpha: number): void {
  if (alpha <= 0) return;
  const { ctx } = s;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(at.x, at.y, rr * 0.3, at.x, at.y, rr);
  g.addColorStop(0, PALETTE.good);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(at.x, at.y, rr, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
