import { KEY, type Point } from "@neon-spore/content";
import { rgba } from "@neon-spore/render";
import { centre, type GooBody, rimAt, smoothPath } from "./body.js";
import { mix } from "./noise.js";
import { SHADE } from "./press.js";
import type { SoftDrop, SoftScene } from "./soft.js";
import { PLASTIC, plasticSheen } from "./soft-plastic.js";
import type { GooStyle } from "./style.js";

/**
 * **A crater where the thumb is**, in SOFT PLASTIC — the owner, 11 October
 * 2026: *a crater when pulling — it ideally also follows the rotation and
 * shape of the borders like a fluid thing but some static in it because its
 * pressed*, *in the middle of arrow and shape*, *increase width and height of
 * it so it covers as much as possible from arrow*, and *the visual of crater
 * should not overlap the borders of the button*. So the crater is the drop's
 * own rim drawn smaller: it turns with the rim and has its lumps, but keeps
 * only `CALM` of their size and of the pull's lean, so it moves less than the
 * drop round it. It sits in the middle of the drop as drawn — where the arrow
 * is laid — and is as big as leaves `CLEAR` of the drop between its edge and
 * the rim at every angle, its lip inside that.
 */

/** Points round the crater's edge. */
const N = 40;
/** How much of the rim the crater is with a thumb all the way in; a light touch makes it
 * `LIGHT` of that. */
const SIZE = 0.8;
const LIGHT = 0.6;
/** How much of the rim's lumps, and of the pull's lean, the crater keeps. */
const CALM = 0.5;
/** The least drop left between the crater's edge and the rim, in radii. */
export const CLEAR = 0.2;

/** The crater's edge, its middle, and its mean radius. */
export interface Crater {
  readonly pts: readonly Point[];
  readonly mid: Point;
  readonly r: number;
}

/** The crater in `b` with a thumb `depth` in. */
export function craterOf(b: GooBody, style: GooStyle, time: number, depth: number): Crater {
  const c = centre(b);
  const sq = b.squash ?? 1;
  const calm = { ...b, stretch: (b.stretch ?? 0) * CALM, shake: 0 };
  const calmStyle = { ...style, lumpy: style.lumpy * CALM };
  const full: Point[] = [];
  const quiet: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    full.push(rimAt(b, style, time, a));
    quiet.push(rimAt(calm, calmStyle, time, a));
  }
  const mid = meanOf(full);
  const quietMid = meanOf(quiet);
  const k = SIZE * (LIGHT + (1 - LIGHT) * depth);
  const pts: Point[] = [];
  let sum = 0;
  for (const q of quiet) {
    let x = mid.x + k * (q.x - quietMid.x);
    let y = mid.y + k * (q.y - quietMid.y);
    // The rim straight out from the middle the same way, squash undone to find its angle.
    const rim = rimAt(b, style, time, Math.atan2(y * sq, x / sq));
    const room = Math.hypot(rim.x, rim.y) - CLEAR * b.r;
    const d = Math.hypot(x, y);
    if (d > room) {
      x *= room / d;
      y *= room / d;
    }
    pts.push({ x: c.x + x, y: c.y + y });
    sum += Math.hypot(x - mid.x, y - mid.y);
  }
  return { pts, mid: { x: c.x + mid.x, y: c.y + mid.y }, r: sum / N };
}

function meanOf(pts: readonly Point[]): Point {
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p.x;
    y += p.y;
  }
  return { x: x / pts.length, y: y / pts.length };
}

/** The crater, clipped to the drop by the caller: a lip lit towards the light, a hollow
 * whose wall nearer the light is in shadow and whose far wall is lit, and `rings`
 * ripples drifting slowly out across its floor. */
export function paintCrater(s: SoftScene, rings: number): void {
  const { ctx, b, press, t, style } = s;
  const k = press.depth * t.alpha;
  if (k < 0.02) return;
  const { pts, mid, r } = craterOf(b, style, s.time, press.depth);
  const path = smoothPath(pts);
  const lit = t.tone(mix(style.core, "#FFFFFF", 0.7));
  const across = (stops: readonly (readonly [number, string])[]): CanvasGradient => {
    const g = ctx.createLinearGradient(
      mid.x + KEY.x * r,
      mid.y + KEY.y * r,
      mid.x - KEY.x * r,
      mid.y - KEY.y * r,
    );
    for (const [at, col] of stops) g.addColorStop(at, col);
    return g;
  };
  ctx.save();
  // The mass pushed out of it stands round it, lit on the side towards the light: a band
  // whose inner half the hollow covers, so it shows outside the edge only, inside `CLEAR`.
  ctx.strokeStyle = across([
    [0, rgba(lit, k)],
    [0.45, rgba(lit, 0)],
    [1, rgba(SHADE, 0.7 * k)],
  ]);
  ctx.lineWidth = b.r * 0.16;
  ctx.stroke(path);
  ctx.fillStyle = across([
    [0, rgba(SHADE, k)],
    [0.5, rgba(SHADE, 0.75 * k)],
    [0.85, rgba(lit, 0.1 * k)],
    [1, rgba(lit, 0.5 * k)],
  ]);
  ctx.fill(path);
  ctx.clip(path);
  // The near wall's shadow on the floor, and the far wall catching the light.
  ctx.strokeStyle = across([
    [0, rgba(SHADE, 0.8 * k)],
    [0.5, rgba(SHADE, 0)],
  ]);
  ctx.lineWidth = r * 0.5;
  ctx.stroke(path);
  ctx.strokeStyle = across([
    [0.55, rgba(lit, 0)],
    [1, rgba(lit, 0.95 * k)],
  ]);
  ctx.lineWidth = r * 0.26;
  ctx.stroke(path);
  for (let i = 0; i < rings; i++)
    ripple(ctx, pts, mid, (s.time * 0.35 + i / rings) % 1, lit, k, b.r);
  ctx.restore();
}

/** One ripple `u` of the way out across the floor of a drop of radius `r`: the crater's
 * edge drawn small about its middle, a dark trough with a lit crest towards the light. */
function ripple(
  ctx: CanvasRenderingContext2D,
  pts: readonly Point[],
  mid: Point,
  u: number,
  lit: string,
  k: number,
  r: number,
): void {
  const f = 0.2 + 0.65 * u;
  const p = smoothPath(
    pts.map((q) => ({ x: mid.x + (q.x - mid.x) * f, y: mid.y + (q.y - mid.y) * f })),
  );
  const a = Math.sin(Math.PI * u) * k;
  ctx.lineWidth = r * 0.05;
  ctx.strokeStyle = rgba(SHADE, 0.7 * a);
  ctx.stroke(p);
  ctx.save();
  ctx.translate(KEY.x * r * 0.04, KEY.y * r * 0.04);
  ctx.lineWidth = r * 0.03;
  ctx.strokeStyle = rgba(lit, 0.5 * a);
  ctx.stroke(p);
  ctx.restore();
}

/** SOFT PLASTIC with the crater in place of its dent and folds; `still` as `SoftDrop` has it. */
function crater(name: string, o: { still?: number; rings: number }): SoftDrop {
  const d: SoftDrop = {
    ...PLASTIC,
    name,
    give: { ...PLASTIC.give, flatten: 0.05 },
    hollow: (s) => paintCrater(s, o.rings),
    top: plasticSheen,
  };
  return o.still === undefined ? d : { ...d, still: o.still };
}

/** The share of its turning RIPPLES · STILL keeps while it is pulled. */
const CRAWL = 0.12;

/** The crater turning with the drop; the same with the drop stopped while pulled; the
 * crater with ripples drifting out across it, the most like a fluid; and the owner's pick
 * of them, 11 October 2026 — *of "drop" variants, i like "ripples" the most … combine it
 * with the "still" that rotation is much slower when touched* — the ripples on a drop that
 * all but stops turning while it is pulled. */
export const CRATER = crater("CRATER", { rings: 0 });
export const CRATER_STILL = crater("CRATER · STILL", { still: 0, rings: 0 });
export const CRATER_RIPPLES = crater("CRATER · RIPPLES", { rings: 2 });
export const RIPPLES_STILL = crater("RIPPLES · STILL", { still: CRAWL, rings: 2 });
