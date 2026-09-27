import { blobRadiusMul } from "@neon-spore/content";
import { midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE BURGEE's geometry**: where the spindle stands, where the boom hangs
 * and the paths the three are made of.
 *
 * **The spindle is SLICK · REVERB stood on end**
 * (`tools/shape-sheet/src/drafts/offered.ts`): three even swells at a modest
 * depth, turned upright so they stack, the turned wood of a masthead truck.
 * REVERB's own objection — plain reads as unfinished — is answered by the
 * swells being the spindle's health: each is lit in a cannon's colour while
 * a shot is owed and goes dark when it is taken.
 *
 * **The flag is SLICK · COMMA laid along a bent line** (the same file): one
 * deep lobe and a drawn-out tail, the fat end the hoist at the boom's tip and
 * the tail the fly. COMMA's objection — THE DART owns a point — does not
 * reach a flag: it is never the size of a creature and never on the grid.
 *
 * **The boom is a plain rod hanging down from the spindle's foot**, a
 * pendulum, where THE DAVIT's boom stands up and THE VANE's spar tapers on a
 * bearing. Its tip is over the column the flag is over, exactly: the angle
 * is whatever puts it there. Paths are laid in field pixels.
 */

export interface Point {
  x: number;
  y: number;
}

/** The spindle's middle, in tiles below the grid's top. */
const SPINDLE_ROW = 1.05;
/** REVERB stood on end: half its height and half its width, in tiles. */
const SPINDLE_TALL = 0.62;
const SPINDLE_WIDE = 0.34;
const REVERB = { lobes: 3, depth: 0.24, wobble: 0.06, seed: 6.1 } as const;
/** The boom's length from the spindle's foot to its tip, in tiles. */
const BOOM = 2.5;
/** COMMA: one lobe this deep, this much wobble, its height as a share of its length. */
const COMMA = { lobes: 1, depth: 0.42, wobble: 0.05, seed: 0, tall: 54 / 64 } as const;
/** How far COMMA's outline reaches along its axis either side, at rest: 1 ± depth. */
const HEAD = 1 + COMMA.depth;
const TAIL = 1 - COMMA.depth;
/** The flag's length from hoist to fly, and its half-width at the hoist, in tiles. */
const FLAG_LONG = 1.5;
const FLAG_WIDE = 0.48;
/** Samples round each outline. */
const N = 48;

/** The spindle's middle: over the middle column, near the top of the field. */
export function burgeeSpindleAt(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + SPINDLE_ROW * l.tile };
}

/** Where the boom hangs from: the spindle's foot. */
export function burgeePivot(l: Layout, cfg: SimConfig): Point {
  const at = burgeeSpindleAt(l, cfg);
  return { x: at.x, y: at.y + SPINDLE_TALL * l.tile };
}

/** Pixels across one column, signed the way the field is turned. */
export function burgeeColumnPx(l: Layout, cfg: SimConfig): number {
  const mid = midCol(cfg);
  return fieldX(l, mid + 1) - fieldX(l, mid);
}

/**
 * The boom's tip for a flag `swingMilli` thousandths of a column off the
 * middle, and the boom's angle off hanging straight down: the tip is over
 * that column's centre, however long the boom.
 */
export function burgeeTip(
  l: Layout,
  cfg: SimConfig,
  swingMilli: number,
): Point & { angle: number } {
  const pivot = burgeePivot(l, cfg);
  const long = BOOM * l.tile;
  const dx = (swingMilli / 1000) * burgeeColumnPx(l, cfg);
  const angle = Math.asin(Math.max(-1, Math.min(1, dx / long)));
  return { x: pivot.x + dx, y: pivot.y + Math.cos(angle) * long, angle };
}

/** The flag's length from hoist to fly, in pixels. */
export function burgeeFlagLong(l: Layout): number {
  return FLAG_LONG * l.tile;
}

/** The spindle's half-height, in pixels: how far each swell is from the next. */
export function burgeeSpindleTall(l: Layout): number {
  return SPINDLE_TALL * l.tile;
}

/** REVERB on end round the spindle's middle, `size` of its full width. */
export function burgeeSpindlePath(l: Layout, time: number, size: number): Path2D {
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = blobRadiusMul(a, REVERB.lobes, REVERB.depth, REVERB.wobble, time, REVERB.seed);
    // Stood on end: the draft's long axis is the spindle's height.
    pts.push({
      x: Math.sin(a) * SPINDLE_WIDE * l.tile * m * size,
      y: Math.cos(a) * SPINDLE_TALL * l.tile * m,
    });
  }
  return splinePath(pts, true);
}

/** How the flag is laid this frame, read off the pose (`burgee-pose.ts`). */
export interface FlagLay {
  /** Its angle off hanging straight down: toward screen right above nought. */
  angle: number;
  /** How wide it opens, 0..1: a limp flag hangs folded narrow. */
  open: number;
  /** The ripple along it, in tiles at the fly, and where the wave is. */
  ripple: number;
  wave: number;
  time: number;
}

/**
 * COMMA from `tip`, streaming at `lay.angle`: each point of the draft's
 * outline is carried to its place along the flag — how far from the hoist
 * by how far it is along the draft's axis, how far off the line by how far
 * it is across — and the line itself bent by the ripple, more toward the
 * fly, so the tail flutters and the hoist stays on the boom.
 */
export function burgeeFlagPath(l: Layout, tip: Point, lay: FlagLay): Path2D {
  const dx = Math.sin(lay.angle);
  const dy = Math.cos(lay.angle);
  // Across the flag, a quarter-turn round from along it.
  const nx = -dy;
  const ny = dx;
  const long = FLAG_LONG * l.tile;
  const wide = FLAG_WIDE * l.tile * (0.6 + 0.4 * lay.open);
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = blobRadiusMul(a, COMMA.lobes, COMMA.depth, COMMA.wobble, lay.time, COMMA.seed);
    const u = (HEAD - Math.cos(a) * m) / (HEAD + TAIL);
    const v = Math.sin(a) * m * COMMA.tall;
    // The wobble can carry the hoist's edge a hair past nought; the ripple is none there.
    const bend = lay.ripple * l.tile * Math.max(0, u) ** 1.5 * Math.sin(u * 5 - lay.wave);
    const along = u * long;
    const across = v * wide + bend;
    pts.push({ x: tip.x + dx * along + nx * across, y: tip.y + dy * along + ny * across });
  }
  return splinePath(pts, true);
}
