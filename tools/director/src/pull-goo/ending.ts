import type { Point } from "@neon-spore/content";
import { PALETTE, smoothstep } from "@neon-spore/render";
import { arrowSize, paintArrow, splitOf } from "./arrow.js";
import { drop, type GooBody } from "./body.js";
import { paintGoo } from "./drop-look.js";
import { grown } from "./enter.js";
import { ENDING, SPAWN } from "./moment.js";
import { clamp01 } from "./noise.js";
import { paintPath } from "./parts.js";
import { homeward, type Scene } from "./scene.js";
import { paintTail, specks, tailPath } from "./strand.js";

/**
 * **How a count ends** — what tells one GOO look from another. The owner, 10
 * October 2026, on SINK: *i am looking more for a short green success
 * animation and then some quick removal animation at this position*. So an
 * ending plays where the drop was counted, gone by `ENDING`, and never
 * carries it home: a fresh drop comes in at the start, its path with it, once
 * the hand is off (`comingIn`). Of five endings the owner kept one, FIZZ.
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
  if (m.fresh !== null) comingIn(s, m.fresh);
}

/** How green the drop is `e` seconds after the count: at once, and stays. */
export const greenAt = (e: number): number => 0.9 * smoothstep(clamp01(e / 0.12));

/** Where the drop is `e` seconds after the count: from where it was found into the place. */
export function intoPlace(s: Scene, e: number): Point {
  const k = smoothstep(clamp01(e / 0.12));
  return { x: s.from.x + (s.place.x - s.from.x) * k, y: s.from.y + (s.place.y - s.from.y) * k };
}

/** The way the pull went, at the place: the way the arrow in it points. */
export function onward(s: Scene): Point {
  const q = homeward(s, 0);
  return { x: -q.dx, y: -q.dy };
}

/** The drop, green by `green`, as the bar has it; gives back the body drawn. */
export function paintDrop(s: Scene, b: GooBody, green: number, alpha = 1): GooBody {
  return paintGoo(s.ctx, b, s.style, s.time, { red: 0, green, alpha }, s.m);
}

/** A fresh drop coming in at the start, `f` seconds in, and the path with it
 * (`enter.ts`): the dots one after another, the place at the end, and the drop
 * growing with its arrow — while the old one may still be boiling away. */
function comingIn(s: Scene, f: number): void {
  paintPath(s.ctx, s.t, s.r, s.style, {
    origin: s.origin,
    at: s.origin,
    held: false,
    time: s.time,
    enter: f,
  });
  const g = grown(f);
  if (g < 0.02) return;
  const breathe = f >= SPAWN ? 0.07 * Math.sin(s.time * 3.4) : 0;
  const rr = s.r * g;
  const b = drop(s.home, rr, { squash: 1 + breathe });
  const body = paintGoo(s.ctx, b, s.style, s.time, { red: 0 }, s.m);
  const q = homeward(s, 1);
  paintArrow(s.ctx, s.home, arrowSize(s.r, g), s.style, {
    dx: -q.dx,
    dy: -q.dy,
    split: splitOf(s.origin > 0 && s.origin < 1, 0),
    held: false,
    time: s.time,
    body,
  });
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
