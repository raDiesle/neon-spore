import { blobRadiusMul, type Point } from "@neon-spore/content";
import { contraction, type Pulse, squeeze } from "./swim.js";
import type { Site } from "./types.js";

/**
 * Where the base body is, and where its rim is in any direction.
 *
 * Split out of `grown.ts` when the bell arrived and took that file past the
 * length limit, along a seam the file had described in prose for a while:
 * this is **the body underneath**, and what is left there is **how parts are
 * spent on it**. The clamp belongs on this side because it is a question about
 * the rim rather than about the parts — "is this point inside the body, and
 * where is the edge if it is" — and every wrong answer this library has drawn
 * so far has been a wrong answer to exactly that.
 */

export interface BaseOpts {
  rx: number;
  ry: number;
  lobes?: number;
  depth?: number;
  wobble?: number;
  seed?: number;
  /**
   * Cuts the underside flat, turning the blob into a dome: 0 is a body, and
   * about 0.35 is a bell.
   *
   * **A cut and not a taper**, which is the whole difference between a bell
   * and an egg — see `bellCut` below. A truly concave underside is not
   * available at all: a contour marched one radius per angle from the centre
   * cannot have one, because the ray would have to cross the outline twice.
   * What this says instead is a flat underside with the mass carried on top,
   * which is what a bell's silhouette reduces to at the size a card draws it.
   * The hollow, if it is ever wanted, is a second loop and not a bigger number
   * here.
   */
  bell?: number;
  /** Swims: the bell squeezes on the beat and what hangs off it trails. */
  pulse?: Pulse;
}

/** Enough samples that the base reads as grown rather than as a polygon. */
const N = 96;

/**
 * The underside cut flat, which is the whole difference between a bell and an
 * egg.
 *
 * The first version faded the radius out toward the bottom — a smooth tuck,
 * `1 − bell·sin(a)^1.5` — and it drew an egg every time. The reason is worth
 * keeping: fading the radius makes the body *narrowest* at the bottom, and a
 * bell is the opposite shape. Its widest point **is** its bottom rim, and what
 * happens below that is not a curve at all but a straight edge across.
 *
 * So this is a chord, not a taper. Everything below `y = cut` is pulled back
 * along its own ray until it sits on that line, which leaves the sides
 * untouched, keeps the rim as the widest point, and puts a corner where a bell
 * has one. It squeezes with the body, and the contraction lifts it a little
 * further: a bell closing draws its skirt up as well as in.
 */
function bellCut(o: BaseOpts, c: number, s: { y: number }): number {
  return o.ry * s.y * (1 - (o.bell ?? 0) * (1 + 0.22 * c));
}

/** The lobed, squeezed ellipse at one parameter — the bell's cut not yet made. */
export function rimAt(o: BaseOpts, a: number, t: number): { x: number; y: number } {
  const m = blobRadiusMul(a, o.lobes ?? 3, o.depth ?? 0.16, o.wobble ?? 0.05, t, o.seed ?? 1.5);
  const s = squeeze(o.pulse, contraction(o.pulse, t));
  return { x: Math.cos(a) * o.rx * m * s.x, y: Math.sin(a) * o.ry * m * s.y };
}

/** The base body's radius and rim point at one angle and one moment. */
export function siteAt(o: BaseOpts, a: number, t: number): Site {
  const c = contraction(o.pulse, t);
  const s = squeeze(o.pulse, c);
  const p = rimAt(o, a, t);
  let x = p.x;
  let y = p.y;
  if (o.bell) {
    const cut = bellCut(o, c, s);
    if (y > cut) {
      // Along the ray, so the point stays at the same angle and only the
      // radius gives — a rim sampled one radius per angle has to keep its
      // angles or the samples bunch and the edge grows a kink.
      const k = cut / y;
      x *= k;
      y = cut;
    }
  }
  // The outward bearing is taken as the radial one rather than as the true
  // normal. On a body this round the two differ by a few degrees, and the
  // difference costs a derivative per site to remove — while a part rooted a
  // few degrees off its own normal is a part rooted the way a real one is.
  return { x, y, out: Math.atan2(y, x), scale: Math.hypot(x, y) };
}

/**
 * The parameter of the base body that lies in the direction of a point.
 *
 * The base is an ellipse before it is lobed, and an ellipse's point at
 * parameter `a` does not sit at polar angle `a` unless it is a circle. Getting
 * this wrong is invisible on a round body and puts the rim in the wrong place
 * by several degrees on SPINDLE, which is 22 by 40.
 */
function paramTowards(o: BaseOpts, p: Point): number {
  return Math.atan2(p.y * o.rx, p.x * o.ry);
}

/**
 * How far the rim is in the direction of a point.
 *
 * Not `siteAt` of the parameter facing that way, which is what this used to
 * be and what the bell's flat cut quietly broke. The cut moves a point along
 * its own ray, so it changes *which parameter* sits at a given polar angle —
 * and the clamp was then comparing a point's radius against a rim measured
 * somewhere else on the outline. It drew a wedge of filled nothing at the
 * margin of every bell, because parts near the cut were pushed to a radius
 * belonging to a different angle.
 *
 * So the two steps are taken in the order the outline is actually built: the
 * lobed ellipse first, in that direction, and then the chord applied to *that*
 * radius. The first step keeps the same small approximation it always had —
 * the parameter facing a direction is exact for an ellipse and off by the
 * lobing — and the second is exact, which is what matters, because the flat
 * underside is where every part on a jellyfish attaches.
 */
function rimTowards(o: BaseOpts, t: number, x: number, y: number): number {
  const p = rimAt(o, paramTowards(o, { x, y }), t);
  let r = Math.hypot(p.x, p.y);
  if (o.bell) {
    const len = Math.hypot(x, y);
    const sin = y / len;
    const cut = bellCut(o, contraction(o.pulse, t), squeeze(o.pulse, contraction(o.pulse, t)));
    if (sin > 1e-6 && r * sin > cut) r = cut / sin;
  }
  return r;
}

/**
 * Every part point pushed out to the rim if it was inside it.
 *
 * **This is not tidiness, it is the difference between a bump and a hole.**
 * The director fills a card's contour with `fill-rule: evenodd`
 * (`tools/director/src/skins/parts.ts`), which is right for the bodies that
 * carry a mouth or come apart: a second loop inside the first is a hole, and
 * that is what those shapes mean. A part rooted *into* the body means the
 * opposite — it is the same flesh — and drawn under that rule its overlap with
 * the body would come out unfilled, so a BUMP would draw as a bite. Clamping
 * makes the two loops touch instead of cross, and then both fill rules agree
 * on the picture, which is the only version of this that survives somebody
 * drawing these cards a third way.
 *
 * A part that is *supposed* to be inside says so with `under`, and there is
 * exactly one: a vein is under the skin, and drawn as a channel through the
 * fill is what a vein looks like.
 */
export function clampOut(o: BaseOpts, t: number, loop: Point[]): Point[] {
  return loop.map((p) => {
    const r = Math.hypot(p.x, p.y);
    if (r < 1e-6) return p;
    const edge = rimTowards(o, t, p.x, p.y);
    if (r >= edge) return p;
    return { x: (p.x / r) * edge, y: (p.y / r) * edge };
  });
}

/** The base body as one closed loop — the first loop of every grown subject. */
export function baseLoop(o: BaseOpts, t: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const s = siteAt(o, (i / N) * Math.PI * 2, t);
    pts.push({ x: s.x, y: s.y });
  }
  return pts;
}
