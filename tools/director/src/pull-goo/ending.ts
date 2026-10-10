import type { Point } from "@neon-spore/content";
import { PALETTE, smoothstep } from "@neon-spore/render";
import { bodyPath, drop, type GooBody } from "./body.js";
import { paintGoo } from "./drop-look.js";
import { ENDING, GREEN, SPAWN } from "./moment.js";
import { clamp01, settle } from "./noise.js";
import { homeward, type Scene } from "./scene.js";
import { paintTail, specks, tailPath } from "./strand.js";

/**
 * **How a count ends** — what tells one GOO look from another. The owner, 10
 * October 2026, on SINK: *give me more variants of animation when reaching
 * success. i am looking more for a short green success animation and then
 * some quick removal animation at this position, maybe like fluid flowing
 * away in drain strainer.* So every ending is the same two beats where the
 * drop was counted — green for `GREEN` seconds, then gone by `ENDING` — and
 * none of them carries it home: a fresh drop wells up at the start once the
 * old one is gone and the hand is off (`welling`).
 */
export interface Ending {
  readonly name: string;
  readonly sentence: string;
  /** `e` seconds since the count, 0..`ENDING`. */
  play(s: Scene, e: number): void;
}

export function paintEnding(s: Scene, ending: Ending): void {
  const { m } = s;
  const e = m.age;
  // The tail is drawn up into the drop, the specks fade where they fell.
  const run = { t: s.t, origin: s.origin, at: m.from.at, off: m.from.off };
  specks(s.ctx, run, s.r, 1 - clamp01(e / 0.6));
  const pull = smoothstep(clamp01(e / 0.22));
  if (pull < 1) {
    const short = { ...run, origin: s.origin + (m.from.at - s.origin) * pull };
    paintTail(s.ctx, tailPath(short, s.r, s.time, 0.3 * pull), PALETTE.good, 0, 1 - 0.5 * pull);
  }
  if (e < ENDING) ending.play(s, e);
  if (m.fresh !== null) welling(s, m.fresh);
}

/** The removal's share, 0 while the green is shown and 1 when the drop is gone. */
export const gone = (e: number): number => clamp01((e - GREEN) / (ENDING - GREEN));

/** How green the drop is `e` seconds after the count: at once, and stays. */
export const greenAt = (e: number): number => 0.9 * smoothstep(clamp01(e / 0.12));

/** Where the drop is `e` seconds after the count: from where it was found into the place. */
export function intoPlace(s: Scene, e: number): Point {
  const k = smoothstep(clamp01(e / 0.12));
  return { x: s.from.x + (s.place.x - s.from.x) * k, y: s.from.y + (s.place.y - s.from.y) * k };
}

/** The way the pull went, at the place: the way a ball in it rolls. */
export function onward(s: Scene): Point {
  const q = homeward(s, 0);
  return { x: -q.dx, y: -q.dy };
}

/** The drop, green by `green`, as the bar has it (flat or a ball). */
export function paintDrop(s: Scene, b: GooBody, green: number, alpha = 1): void {
  paintGoo(s.ctx, b, s.style, s.time, { red: 0, green, alpha }, onward(s));
}

/**
 * The short green every ending opens with: the drop in the place, pressed
 * down by the count and springing back, green at once — a soft green light
 * under it and one ring rolling out. Endings that keep the drop longer draw
 * this and then their own removal.
 */
export function cheer(s: Scene, e: number, extra: Partial<GooBody> = {}): void {
  const press = 0.35 * Math.exp(-e * 7) * Math.cos(e * 22);
  halo(s, s.place, s.r * 2.6, 0.5 * (1 - clamp01(e / 0.6)));
  wave(s, s.place, e / 0.55, 1.9);
  paintDrop(s, drop(intoPlace(s, e), s.r, { squash: 1 + press, ...extra }), greenAt(e));
}

/** A fresh drop welling up out of the start, `f` seconds in: from nothing, overshooting, still. */
function welling(s: Scene, f: number): void {
  const u = clamp01(f / SPAWN);
  const grow = smoothstep(u);
  const wobble = 0.3 * s.style.jiggle * settle(Math.max(0, f - SPAWN * 0.6), 7, 18);
  const breathe = u >= 1 ? 0.07 * Math.sin(s.time * 3.4) : 0;
  wave(s, s.home, f / 0.5, 1.2, s.style.neon);
  paintGoo(
    s.ctx,
    drop(s.home, s.r * (0.2 + 0.8 * grow), { squash: 1 + wobble * grow + breathe }),
    s.style,
    s.time,
    { red: 0, alpha: 0.3 + 0.7 * grow },
  );
}

/** A ring rolling out of `at`, `u` 0..1 of its life, green unless told. */
export function wave(
  s: Scene,
  at: Point,
  u: number,
  reach = 2,
  color: string = PALETTE.good,
): void {
  if (u <= 0 || u >= 1) return;
  const out = 1 - (1 - u) ** 2;
  const { ctx, r } = s;
  ctx.save();
  ctx.strokeStyle = color;
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
