import { blobRadiusMul, type Point } from "@neon-spore/content";
import { linePath, type Subject } from "../contour.js";
import { place } from "./geometry.js";
import { partById } from "./registry.js";
import type { PartCtx, Site } from "./types.js";

/**
 * A body assembled out of a base contour and a list of parts.
 *
 * This is the whole point of the library: a new silhouette is a base blob and
 * a sentence — *three lashes, a spore cluster and two shards* — rather than a
 * new radius function. Everything else in `forms/` writes one contour per
 * idea, which is right when the idea *is* a contour and expensive when it is
 * a combination.
 *
 * It draws as **loops**, not as one ring, using the machinery `contour.ts`
 * already carries for the bodies that come apart. That has a consequence worth
 * stating: a grown body is not star-shaped about its own centre, so it can
 * carry a tentacle that curls back over itself, which no radius-per-angle
 * sample can. It also means nothing here can cut a bite *out* of the outline —
 * loops are added, never subtracted. A body that has to lose silhouette wants
 * `mawed` or `glyphed` in `forms/radial.ts`, which sample the rim itself.
 */

export interface Attachment {
  /** Which part, by id from the registry. */
  part: string;
  /** Where round the rim, in radians. 0 is to the right, growing clockwise. */
  at: number;
  /** How many, spread evenly across `spread` and centred on `at`. */
  count?: number;
  /** Radians the repeats occupy. Ignored when `count` is 1 or absent. */
  spread?: number;
  /** Multiplier on the part's authored size. */
  size?: number;
  /** Mirrored along the rim. */
  flip?: boolean;
  /** Seconds of offset between one repeat and the next, so they never move together. */
  stagger?: number;
}

export interface GrownOpts {
  rx: number;
  ry: number;
  lobes?: number;
  depth?: number;
  wobble?: number;
  seed?: number;
  parts: Attachment[];
}

/** Enough samples that the base reads as grown rather than as a polygon. */
const N = 96;

/** The base body's radius and rim point at one angle and one moment. */
function siteAt(o: GrownOpts, a: number, t: number): Site {
  const m = blobRadiusMul(a, o.lobes ?? 3, o.depth ?? 0.16, o.wobble ?? 0.05, t, o.seed ?? 1.5);
  const x = Math.cos(a) * o.rx * m;
  const y = Math.sin(a) * o.ry * m;
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
function paramTowards(o: GrownOpts, p: Point): number {
  return Math.atan2(p.y * o.rx, p.x * o.ry);
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
function clampOut(o: GrownOpts, t: number, loop: Point[]): Point[] {
  return loop.map((p) => {
    const r = Math.hypot(p.x, p.y);
    if (r < 1e-6) return p;
    const rim = siteAt(o, paramTowards(o, p), t);
    const edge = Math.hypot(rim.x, rim.y);
    if (r >= edge) return p;
    return { x: (p.x / r) * edge, y: (p.y / r) * edge };
  });
}

/** Twice the signed area of a loop, which is what the shoelace sum gives. */
function twiceArea(loop: Point[]): number {
  let a = 0;
  for (let i = 0; i < loop.length; i++) {
    const p = loop[i] as Point;
    const q = loop[(i + 1) % loop.length] as Point;
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a);
}

/**
 * A part sunk so far into its host that clamping has flattened it onto the rim
 * draws nothing, and is dropped rather than emitted as a sliver.
 *
 * That is a real loss and it is worth knowing where it happens: it means a
 * recipe asked for a feature too small for the body it was put on, and the
 * cure is a bigger `size` rather than a smaller threshold. The alternative —
 * keeping the sliver — puts a hairline crescent on the rim that reads as a
 * rendering fault, which is worse than a feature that is simply not there.
 */
const SLIVER = 16;

/**
 * `pointsAt` is the concatenation `Subject` asks for, and `loopsAt` is what
 * anything drawing this actually reads — see `contourAt`.
 */
export function grown(name: string, note: string, o: GrownOpts): Subject {
  const loops = (t: number): Point[][] => {
    const body: Point[] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const s = siteAt(o, a, t);
      body.push({ x: s.x, y: s.y });
    }
    const out: Point[][] = [body];
    for (const [k, att] of o.parts.entries()) {
      const def = partById(att.part);
      const count = att.count ?? 1;
      const spread = count > 1 ? (att.spread ?? 0.9) : 0;
      for (let i = 0; i < count; i++) {
        const f = count > 1 ? i / (count - 1) - 0.5 : 0;
        const a = att.at + f * spread;
        const ctx: PartCtx = {
          t: t + i * (att.stagger ?? 0),
          site: siteAt(o, a, t),
          size: att.size ?? 1,
          // Phase is derived from where the part is and which attachment it
          // belongs to, never from a counter: two bodies built from the same
          // recipe must draw the same picture, and a shared counter would make
          // the second one depend on the first.
          phase: k * 1.7 + i * 2.3 + a,
          flip: att.flip ? -1 : 1,
        };
        for (const loop of def.build(ctx)) {
          const world = place(ctx, loop);
          if (def.under) {
            out.push(world);
            continue;
          }
          const clamped = clampOut(o, t, world);
          if (twiceArea(clamped) > SLIVER) out.push(clamped);
        }
      }
    }
    return out;
  };

  return {
    name,
    note,
    open: false,
    pointsAt: (t) => loops(t).flat(),
    loopsAt: loops,
    // Corner to corner, not smoothed. The base is sampled finely enough to
    // read as grown at any size a card draws it, and the parts include
    // crystals and plates whose corners are the whole of what they say —
    // Catmull-Rom would round those away, which is the mistake `contour.ts`
    // documents `linePath` as existing to avoid.
    path: linePath,
  };
}
