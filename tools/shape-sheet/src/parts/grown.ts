import type { Point } from "@neon-spore/content";
import { linePath, type Subject } from "../contour.js";
import { type BaseOpts, baseLoop, clampOut, siteAt } from "./base.js";
import { place } from "./geometry.js";
import { partById } from "./registry.js";
import { contraction } from "./swim.js";
import type { PartCtx } from "./types.js";

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

export interface GrownOpts extends BaseOpts {
  parts: Attachment[];
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
    const out: Point[][] = [baseLoop(o, t)];
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
          pulse: (lag) => contraction(o.pulse, t, lag),
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
