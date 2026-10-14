import {
  bastionPlateWay,
  bastionTrackAt,
  type ChrysalisSkin,
  type ChrysalisState,
  chrysalisSkinOn,
  chrysalisTrackOf,
  midCol,
  type SimConfig,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";

/**
 * **THE CHRYSALIS's geometry**: where the cocoon hangs, how far out each of
 * its skins stands, and where its pieces sit on it. It hangs over the middle
 * column, as THE BASTION's moon does, and it is smaller for every skin
 * peeled — so its size is read off the skin lit, never kept.
 *
 * The cocoon is a teardrop taller than it is wide (`CHRYSALIS_TALL`), its
 * lower half drawn in to a blunt point: a living pod, not a ball. Each skin
 * reaches half a column past the columns a bolt meets it in
 * (`CHRYSALIS_SPAN`), so a bolt stops on what it is seen to hit.
 */

/** The row the cocoon's centre hangs on, in rows: under the seat switcher, with the field below it. */
export const CHRYSALIS_ROW = 4.2;

/** How far out each skin stands from the centre across, in tiles, outermost first. */
export const CHRYSALIS_SKIN_TILES: Record<ChrysalisSkin, number> = {
  slime: 3.5,
  quills: 3.2,
  sacs: 2.8,
  heart: 2.5,
};

/** The grub under the last skin, in tiles. */
export const CHRYSALIS_GRUB_TILES = 1.0;

/** How tall the cocoon stands against how wide it is. */
export const CHRYSALIS_TALL = 1.1;

/**
 * Where a quill's knob rests and its root and tip, in tiles from the centre
 * along its way. The knob rests where THE BASTION's slab knob does, so the
 * tracks `render/test/bastion-track-fit.test.ts` fits there fit the quills.
 */
export const QUILL_KNOB = 2.95;
export const QUILL_ROOT = 2.4;
export const QUILL_TIP = 4.3;

/** A point on the screen. */
export interface At {
  x: number;
  y: number;
}

/** The cocoon's centre on the screen, hung where it stands once in. */
export function chrysalisCentre(l: Layout, cfg: SimConfig): At {
  return { x: fieldX(l, midCol(cfg)), y: tileCY(l, CHRYSALIS_ROW) };
}

/**
 * How far the cocoon reaches across from its centre now, in pixels: the
 * outermost skin still on — the lit one, or the next to light — or the grub.
 */
export function chrysalisReach(l: Layout, s: ChrysalisState): number {
  const on = chrysalisSkinOn(s);
  const tiles = on === null ? CHRYSALIS_GRUB_TILES : CHRYSALIS_SKIN_TILES[on];
  return tiles * l.tile;
}

/** How the hide is held this frame: its breath, its belly, its squeeze and the clock its lobes ripple on. */
export interface HideShape {
  /** Across, in pixels. */
  r: number;
  /** -1..1, the slow breath. */
  breathe: number;
  /** 0..1, the lower half swollen: the sacs' stance. */
  bloat: number;
  /** 0..1, drawn in round the middle: the heart's beat. */
  squeeze: number;
  /** Seconds, for the lobes' ripple. */
  time: number;
}

/** The contour's points, the angle from straight up, clockwise. */
const SIDES = 40;

/** The hide's outline at `c`: a lobed teardrop, its lower half drawn in to a blunt point. */
export function chrysalisHidePath(c: At, h: HideShape): Path2D {
  const pts: At[] = [];
  for (let k = 0; k < SIDES; k++) {
    const a = (k / SIDES) * Math.PI * 2;
    const lower = Math.max(0, -Math.cos(a));
    const rx = h.r * (1 - 0.3 * lower * lower + 0.2 * h.bloat * lower - 0.08 * h.squeeze);
    const ry = h.r * CHRYSALIS_TALL * (1 + 0.16 * lower ** 3 + 0.04 * h.squeeze);
    const lobe = 1 + 0.03 * Math.sin(5 * a + h.time * 0.7) + 0.015 * Math.sin(9 * a - h.time * 1.1);
    const breath = 1 + 0.025 * h.breathe;
    pts.push({
      x: c.x + Math.sin(a) * rx * lobe * breath,
      y: c.y - Math.cos(a) * ry * lobe * breath,
    });
  }
  return smoothClosed(pts);
}

/** A closed curve through the midpoints of `pts`, each point a control. */
export function smoothClosed(pts: readonly At[]): Path2D {
  const p = new Path2D();
  const n = pts.length;
  const mid = (i: number): At => {
    const a = pts[i % n] as At;
    const b = pts[(i + 1) % n] as At;
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };
  const start = mid(n - 1);
  p.moveTo(start.x, start.y);
  for (let i = 0; i < n; i++) {
    const ctl = pts[i] as At;
    const to = mid(i);
    p.quadraticCurveTo(ctl.x, ctl.y, to.x, to.y);
  }
  p.closePath();
  return p;
}

/** Quill `i`'s way out, a unit vector on the screen: THE BASTION's plate ways. */
export function quillWay(i: number): At {
  const [wx, wy] = bastionPlateWay(i);
  return { x: wx / 1000, y: wy / 1000 };
}

/** The point `tiles` out along quill `i`'s way from the centre. */
export function quillAt(l: Layout, c: At, i: number, tiles: number): At {
  const w = quillWay(i);
  return { x: c.x + w.x * tiles * l.tile, y: c.y + w.y * tiles * l.tile };
}

/** How far quill `i`, `pulled` along its track, stands from where it rests, thousandths of a tile. */
export function chrysalisPulledOut(
  cfg: SimConfig,
  s: ChrysalisState,
  i: number,
  pulled: number,
): At {
  return bastionTrackAt(cfg, chrysalisTrackOf(s, i), i, pulled);
}

/**
 * A sac `offset` columns from the middle: over its own column, low on the
 * cocoon's belly where its spores fall straight down that column.
 */
export function chrysalisSacAt(l: Layout, cfg: SimConfig, c: At, offset: number): At {
  const x = fieldX(l, midCol(cfg) + offset);
  const r = CHRYSALIS_SKIN_TILES.sacs * l.tile;
  const across = Math.min(1, Math.abs(x - c.x) / r);
  return { x, y: c.y + r * CHRYSALIS_TALL * (0.36 + 0.36 * Math.sqrt(1 - across * across)) };
}

/** A pore in the heart's skin `offset` columns from the middle: over its column, just under the waist. */
export function chrysalisPoreAt(l: Layout, cfg: SimConfig, c: At, offset: number): At {
  const x = fieldX(l, midCol(cfg) + offset);
  return { x, y: c.y + CHRYSALIS_SKIN_TILES.heart * l.tile * 0.3 };
}
