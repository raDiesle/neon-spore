import type { Point } from "../../../../../packages/content/src/index.js";
import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { LostPaint } from "../../../../../packages/render/src/lost-look.js";
import { plates, wordsAt } from "../../../../../packages/render/src/lost-shutters.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { type Shard, shatter } from "../../../../../packages/render/src/shatter.js";

/**
 * The view itself broken, in slabs, from the hole outward.
 *
 * Nothing here runs, drips or falls. `shatter.ts` cuts the screen the way it
 * cuts a body — wedges from an origin, the pieces tiling their subject exactly
 * — and then every piece is left almost where it was, shoved off its
 * neighbours by a few pixels and darkened by how far out of the break it came
 * from. That is the second of the two things a cut can be spent on, and the
 * one `.claude/skills/destruction` says to reach for more often: *permanent
 * damage is read by two people for the rest of a run; a burst is read for half
 * a second.*
 */

/** How many slabs the screen comes apart into. */
const WEDGES = 15;
/**
 * Where each wedge is cut again, and **1 is no second cut at all**.
 *
 * The inner ring is what makes a spall a spall on a *body*, and it is wrong
 * here for a reason that is geometry and not taste: `reachAt` measures to the
 * contour, the contour is the phone, so the ring is a scaled copy of the
 * phone — a rectangle. At 0.4 it drew a window frame across the middle of the
 * picture and at 0.16 it drew a small lit box round the hole, and both read as
 * something laid over the game rather than as the game breaking. Fifteen
 * wedges and no ring is the honest cut of a rectangle.
 */
const INNER_AT = 1;
/**
 * How far a slab is shoved off its neighbours, in tiles.
 *
 * A crack here has two lips and both of them are lit, so this number is the
 * one that decides whether the pair read as one seam or as a rail with the
 * game running between. Nineteen wedges at 0.4 was tried and is worse in the
 * other direction: dense straight radii out of one point stop being cracks
 * and become a sunburst badge with the ship behind it. Fifteen at 0.6 is
 * where it was left, and it is the honest place for the owner to argue with.
 */
const SHOVE = 0.6;
/** Seconds the break takes to open to its full width. */
const OPEN = 0.9;
/** How dark the far edge of the screen goes. The wound's own slab stays clear. */
const DIM = 0.95;

const HUE = PALETTE.red;
const DARK = PALETTE.redDark;
/** The wound's light, one radius so one sprite is baked (`glow.ts`). */
const CORE = 30;

/**
 * The cut, kept for as long as the screen it was cut from is the same screen.
 *
 * `shatter` walks fifteen wedges and five samples of contour each, and the cut
 * does not change from frame to frame — only how far the pieces have been
 * shoved apart does. Deterministic in every argument and holding no clock, so
 * this is a memo and not state: the same screen broken twice is the same break
 * (`restart.test.ts`'s rule is about things that outlive a frame *and* change).
 */
let cached: { key: string; shards: Shard[] } | null = null;

function screenShards(p: LostPaint, ox: number, oy: number, seed: number): Shard[] {
  const key = `${p.l.width}x${p.l.height}@${Math.round(ox)},${Math.round(oy)}#${seed}`;
  if (cached?.key === key) return cached.shards;
  const shards = shatter(frame(p.l.width, p.l.height), {
    ox,
    oy,
    wedges: WEDGES,
    innerAt: INNER_AT,
    speed: 1,
    spin: 0,
    seed,
  });
  cached = { key, shards };
  return shards;
}

/**
 * The screen as a closed contour, with its sides sampled.
 *
 * Four corners would be enough for a rectangle and are not enough for this:
 * `reachAt` casts a ray from the break and takes the nearest crossing, so a
 * wedge whose two rays land on one long unsampled side gets a chord across the
 * corner rather than the corner. Five to a side is the same fidelity per piece
 * the cut already uses along a body's own outline.
 */
function frame(w: number, h: number): Point[] {
  const pts: Point[] = [];
  const side = (x0: number, y0: number, x1: number, y1: number) => {
    for (let i = 0; i < 5; i++) {
      const t = i / 5;
      pts.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t });
    }
  };
  side(0, 0, w, 0);
  side(w, 0, w, h);
  side(w, h, 0, h);
  side(0, h, 0, 0);
  return pts;
}

/**
 * The plates, a red light behind everything, and the screen in slabs over it.
 *
 * **The gaps are the picture.** The wash goes down whole and the slabs go over
 * it, so what reads as a lit crack is simply the place two slabs are no longer
 * touching — the light is not drawn along the cracks, it is what the cracks
 * are letting through. And the darkening runs with `depth`, which is 0 at the
 * break and 1 at the edge of the phone, so the far corners are nearly out and
 * the hull around the hole is the one part of the screen still clear.
 * `lost-look.ts`'s rule, answered by the geometry rather than by an exception.
 */
export function spallVeil(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  plates(ctx, p);

  const ox = p.breachX ?? p.l.width / 2;
  const oy = p.surfaceY(ox);
  const open = smoothstep(Math.min(1, p.age / OPEN));

  // The lights out first, so a slab is a dark thing over a dark screen and the
  // only bright part of the picture is what comes through the cracks.
  ctx.fillStyle = rgba(PALETTE.background, 0.5);
  ctx.fillRect(0, 0, p.l.width, p.l.height);

  const far = Math.hypot(p.l.width, p.l.height);
  // **Both of these are one gradient about the hole, not fifteen alphas.**
  // `Shard.depth` is the obvious way to darken a slab by how far out of the
  // break it came from, and it cannot be used here: with one ring per wedge
  // every piece carries the contour, so every depth is 1 and the screen
  // darkens flat. Worse, the two-ring cut that *would* vary it is what draws
  // the rectangle. So the falloff is a fact about the screen rather than about
  // a piece, the slabs are filled and stroked with it, and the picture no
  // longer depends on how the cut happened to be made.
  const dark = ctx.createRadialGradient(ox, oy, 0, ox, oy, far * 0.9);
  dark.addColorStop(0, rgba(DARK, 0.05));
  dark.addColorStop(0.22, rgba(DARK, 0.5));
  dark.addColorStop(1, rgba(DARK, DIM));
  const crack = ctx.createRadialGradient(ox, oy, 0, ox, oy, far * 0.5);
  crack.addColorStop(0, rgba(PALETTE.redRim, 0.7 * open));
  crack.addColorStop(0.3, rgba(HUE, 0.55 * open));
  crack.addColorStop(1, rgba(HUE, 0));
  const wide = ctx.createRadialGradient(ox, oy, 0, ox, oy, far * 0.5);
  wide.addColorStop(0, rgba(HUE, 0.3 * open));
  wide.addColorStop(1, rgba(HUE, 0));

  const shove = SHOVE * p.l.tile * open;
  ctx.lineJoin = "round";
  for (const s of screenShards(p, ox, oy, p.breach?.seed ?? 0)) {
    const len = Math.hypot(s.vx, s.vy) || 1;
    // The slab is shoved by walking its points rather than by translating the
    // canvas: a gradient belongs to the transform it was made in, and these
    // three are the screen's and have to stay the screen's.
    const dx = s.x + (s.vx / len) * shove;
    const dy = s.y + (s.vy / len) * shove;
    ctx.beginPath();
    const first = s.points[0] as Point;
    ctx.moveTo(first.x + dx, first.y + dy);
    for (let i = 1; i < s.points.length; i++) {
      const q = s.points[i] as Point;
      ctx.lineTo(q.x + dx, q.y + dy);
    }
    ctx.closePath();
    ctx.fillStyle = dark;
    ctx.fill();
    // The cut faces, twice: a wide soft pass and a thin hot one, which is a
    // glow spelled out rather than `strokeGlow`'s six passes on fifteen paths.
    ctx.strokeStyle = wide;
    ctx.lineWidth = Math.max(2, p.l.tile * 0.22);
    ctx.stroke();
    ctx.strokeStyle = crack;
    ctx.lineWidth = Math.max(0.8, p.l.tile * 0.04);
    ctx.stroke();
  }

  // The hole, last: the one thing on a screen this dark that is still burning.
  halo(ctx, ox, oy, CORE, PALETTE.redRim, 0.55);
  halo(ctx, ox, oy, CORE, HUE, 0.75);
}

/** Lower down the plate, as the owner asked. Nothing else about them changes. */
export function spallWords(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  wordsAt(ctx, p, 0.26);
}
