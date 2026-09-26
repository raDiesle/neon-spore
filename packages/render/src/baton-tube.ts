import {
  catmullRomSegments,
  type Point,
  type Ring,
  SIDE,
  seeTube,
  tubeFrames,
  type View,
  view,
} from "@neon-spore/content";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";
import { drawContact } from "./solid-haze.js";
import { breath, chainAt } from "./solid-motion.js";
import { drawTube, rimTube } from "./solid-tube-draw.js";

/**
 * **THE BATON's arm, as a tube of the rig** (`solid-tube.ts`): the tendon is
 * a cord of flesh with a round back, lit across its width, with a rim on the
 * edge turned from the key, and a soft cool dark on it where it goes into
 * each knuckle, so a knuckle is threaded *on* the arm rather than pasted over
 * a line.
 *
 * **It swings in depth.** A breath at the root (`solid-motion.ts`) runs down
 * the arm a little later at each ring (`chainAt`), toward the player and
 * away. That moves nothing on the screen — every centre is where the spline
 * put it, the lens divided back out — so the bead's flight, the sockets and
 * the columns under them stay exactly where the fight says they are. Only the
 * arm's girth and its light know how near it is.
 *
 * **The knuckles do not swell with it.** How many are lit and how big each is
 * is the health bar, so the lens is on the tube's girth alone.
 *
 * Nothing here keeps state: the swing is a breath of the clock, so a restart
 * starts it again.
 */

/** Rings sampled along each span of the spline between two joints. */
const PER_SPAN = 5;
/** The tube's half-girth, in spine widths: a shade under the old sheath's. */
const GIRTH = 0.62;
/** How far the arm's foot swings toward the player and away, in tiles, and how often. */
const DEPTH = 0.7;
const PERIOD = 4.8;
/** Seconds the foot is behind the root, dealt out per ring. */
const LAG = 0.05;
/** How far off the eye is, in tiles. */
const LENS = 6;
/** The contact where the arm goes into a knuckle, in tiles. */
const CONTACT = 0.6;

const SKIN = {
  base: mixHex(PALETTE.sheenDeep, PALETTE.rockDark, 0.55),
  lift: mixHex(PALETTE.rockDark, PALETTE.rock, 0.35),
  sheen: PALETTE.rock,
};
const W_OF = new Map<number, View>();

/**
 * The arm through `pts` — its root first, then a point at each joint that is
 * out — as a lit tube `width` wide. `joints` says whether the points after
 * the first are knuckles, which take a contact where the arm goes into them.
 */
export function drawArmTube(
  ctx: CanvasRenderingContext2D,
  pts: readonly Point[],
  width: number,
  tile: number,
  time: number,
  joints = true,
): void {
  if (pts.length < 2) return;
  const root = pts[0] as Point;
  const along = sample(pts);
  const lens = tile * LENS;
  const sway = (t: number) => breath(t, PERIOD, 0.35, 31);
  const n = along.length - 1 || 1;
  const rings: Ring[] = along.map((p, i) => {
    const u = i / n;
    const z = chainAt(sway, time, i, LAG, 1) * DEPTH * tile * u;
    const s = lens / (lens - z);
    return { c: { x: (p.x - root.x) / s, y: (p.y - root.y) / s, z }, r: width * GIRTH };
  });
  const seen = seeTube(rings, tubeFrames(rings), lensView(lens));
  ctx.save();
  ctx.translate(root.x, root.y);
  const hide = drawTube(ctx, seen, SKIN);
  if (joints)
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i] as Point;
      drawContact(ctx, hide, p.x - root.x, p.y - root.y, tile * CONTACT);
    }
  rimTube(ctx, hide, PALETTE.sheenCold, Math.max(1, tile * 0.025));
  ctx.restore();
}

/** The spline through `pts`, `PER_SPAN` points to a span, its ends included. */
function sample(pts: readonly Point[]): Point[] {
  const seg = catmullRomSegments(pts, false);
  const out: Point[] = [pts[0] as Point];
  let x0 = (pts[0] as Point).x;
  let y0 = (pts[0] as Point).y;
  for (let i = 0; i < seg.length; i += 6) {
    const [x1, y1, x2, y2, x3, y3] = seg.slice(i, i + 6) as [
      number,
      number,
      number,
      number,
      number,
      number,
    ];
    for (let k = 1; k <= PER_SPAN; k++) {
      const t = k / PER_SPAN;
      const v = 1 - t;
      const a = v * v * v;
      const b = 3 * v * v * t;
      const c = 3 * v * t * t;
      const d = t * t * t;
      out.push({ x: a * x0 + b * x1 + c * x2 + d * x3, y: a * y0 + b * y1 + c * y2 + d * y3 });
    }
    x0 = x3;
    y0 = y3;
  }
  return out;
}

/** The side view at the arm's lens, one per tile size the field has been drawn at. */
function lensView(lens: number): View {
  const key = Math.round(lens);
  let w = W_OF.get(key);
  if (!w) {
    if (W_OF.size > 8) W_OF.clear();
    w = view(SIDE, 0, key);
    W_OF.set(key, w);
  }
  return w;
}
