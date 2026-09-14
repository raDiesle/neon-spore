/**
 * How THE VOLLEY's shell comes apart: the pieces a sector is cut into, and
 * the speed and turn each leaves with. `volley-shards.ts` decides *which*
 * sector broke and what colours it wears, and throws, drops and draws what
 * this hands back; the argument for curved fragments at the shell's own
 * radius is in its header.
 */

/** Angular pieces a sector is cut into, and where the rind ends. */
const CUTS = 3;
const RIND_AT = 0.6;
/** Tiles a second outward, and up off a ward. */
const SPEED = 1.6;
const LIFT = 3.4;
/** Turn rate before jitter, radians a second. */
const SPIN = 5;

export interface Point {
  x: number;
  y: number;
}

export interface Piece {
  /** Outline about its own centroid, pixels. */
  pts: Point[];
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  spin: number;
  /** 1 for a piece of the rind, less for stone from inside. */
  face: number;
  /** A length of seam on the outer edge, from `ember0` to `ember1` as
   * indices into `pts`, or none. */
  ember: [number, number] | null;
}

/** A closed arc-sector piece between `r0` and `r1`, angles `a0` to `a1`. */
function sector(r0: number, r1: number, a0: number, a1: number): Point[] {
  const pts: Point[] = [];
  const n = 4;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push({ x: Math.cos(a) * r1, y: Math.sin(a) * r1 });
  }
  for (let i = n; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push({ x: Math.cos(a) * r0, y: Math.sin(a) * r0 });
  }
  return pts;
}

function centred(pts: Point[]): { pts: Point[]; cx: number; cy: number } {
  let cx = 0;
  let cy = 0;
  for (const p of pts) {
    cx += p.x;
    cy += p.y;
  }
  cx /= pts.length;
  cy /= pts.length;
  return { pts: pts.map((p) => ({ x: p.x - cx, y: p.y - cy })), cx, cy };
}

/**
 * The pieces of one break: the sector from `from` over `span` — a ward's
 * one sector of `sweep`, or a hatch's whole ring — cut `CUTS` a sector
 * into rind and stone at radius `r`, each given its flight off `rnd`.
 */
export function cutShell(
  from: number,
  span: number,
  sweep: number,
  r: number,
  ward: boolean,
  tile: number,
  rnd: () => number,
): Piece[] {
  const pieces: Piece[] = [];
  const cuts = Math.max(CUTS, Math.round((span / sweep) * CUTS));
  for (let i = 0; i < cuts; i++) {
    const a0 = from + (span * i) / cuts;
    const a1 = from + (span * (i + 1)) / cuts;
    const mid = (a0 + a1) / 2;
    for (const [r0, r1, face] of [
      [r * RIND_AT, r, 1],
      [r * 0.12, r * RIND_AT, 0.55],
    ] as const) {
      const c = centred(sector(r0, r1, a0, a1));
      const speed = SPEED * tile * (0.7 + rnd() * 0.6) * (face === 1 ? 1 : 0.75);
      let vx = Math.cos(mid) * speed;
      let vy = Math.sin(mid) * speed;
      if (ward) {
        // Off the shield: out sideways and up, never down into the ship.
        vx *= 1.4;
        vy = -LIFT * tile * (0.6 + rnd() * 0.8);
      }
      pieces.push({
        pts: c.pts,
        x: c.cx,
        y: c.cy,
        vx,
        vy,
        a: 0,
        spin: (rnd() - 0.5) * 2 * SPIN,
        face,
        // The outer arc is the first five points; a rind piece that had a
        // seam over it keeps a burning length of it. Ward pieces and hatch
        // pieces alike, in `glow`.
        ember: face === 1 && (!ward || rnd() < 0.5) ? [1, 3] : null,
      });
    }
  }
  return pieces;
}
