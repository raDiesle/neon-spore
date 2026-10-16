import { blobRadiusMul } from "@neon-spore/content";
import { broodBelly, type SacBox } from "./brood-place.js";

/**
 * **THE BROOD's outline**: BULB · PEBBLE, from the shape sheet's drafts
 * (`offered.ts`) — a soft round body under a wobble larger than its lobes —
 * taken wide over the field with its belly flattened (`broodBelly`), and
 * along its top **one round lobe for every bud still to pop**.
 *
 * PEBBLE's own lobes are so shallow they are barely there, which is its
 * argument and no use to a boss whose health has to be read off its rim: a
 * pair has to count what is left from across a table. So its six are let go
 * and the body carries a row of swellings instead, each a circle sat on the
 * upper arc, fused into the skin — a ray from the middle takes whichever is
 * farther, the body or a lobe — so the rim stays one contour. A bud popped,
 * a swelling goes; the last one popped, the top is the pebble alone.
 */

/** Where along the top the lobes run, as the outline's angle from the right. */
const ARC_FROM = -Math.PI + 0.45;
const ARC_TO = -0.45;
/** A lobe's radius, in tiles, and how far into the body its middle sits. */
const LOBE_TILES = 0.55;
const SINK = 0.3;
/** PEBBLE's wobble, and its seed. */
const WOBBLE = 0.17;
const SEED = 7.4;
/** Points round the outline. */
const N = 120;

interface Point {
  x: number;
  y: number;
}

/** The middles of the lobes still on the rim, with their radii. */
function lobesOf(
  sac: SacBox,
  lobes: number,
  tile: number,
  time: number,
): (Point & { r: number })[] {
  const out: (Point & { r: number })[] = [];
  for (let i = 0; i < lobes; i++) {
    const a = lobes === 1 ? -Math.PI / 2 : ARC_FROM + ((ARC_TO - ARC_FROM) * i) / (lobes - 1);
    const p = broodBelly(sac, a);
    const r = LOBE_TILES * tile * (1 + 0.06 * Math.sin(time * 2.1 + i * 1.9));
    out.push({ x: p.x - Math.cos(a) * r * SINK, y: p.y - Math.sin(a) * r * SINK, r });
  }
  return out;
}

/** How far along `dir` from `c` a ray leaves the circle, or 0 if it misses it. */
function rayOut(c: Point, dir: Point, q: Point & { r: number }): number {
  const qx = q.x - c.x;
  const qy = q.y - c.y;
  const along = qx * dir.x + qy * dir.y;
  const off = qx * qx + qy * qy - along * along;
  const d = q.r * q.r - off;
  return d < 0 ? 0 : along + Math.sqrt(d);
}

export function broodOutline(sac: SacBox, lobes: number, tile: number, time: number): Point[] {
  const c = { x: sac.x, y: sac.y };
  const swell = lobesOf(sac, lobes, tile, time);
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    // The pebble's own soft wobble, kept off the belly a bolt is met on.
    const m = Math.sin(a) > 0.3 ? 1 : blobRadiusMul(a, 6, 0, WOBBLE * 0.25, time * 0.5, SEED);
    const p = broodBelly(sac, a, m);
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const len = Math.hypot(dx, dy) || 1;
    const dir = { x: dx / len, y: dy / len };
    let r = len;
    for (const q of swell) r = Math.max(r, rayOut(c, dir, q));
    pts.push({ x: c.x + dir.x * r, y: c.y + dir.y * r });
  }
  return pts;
}
