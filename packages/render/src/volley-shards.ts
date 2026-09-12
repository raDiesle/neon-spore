import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { stream } from "./hash.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { volleyBallRadius } from "./volley.js";
import { CORE_MUL } from "./volley-core.js";
import { STONE_FILL } from "./volley-stone.js";

/**
 * The pieces of THE VOLLEY's shell, in the air.
 *
 * A ward used to answer with a spray of squares in the shield's colour and
 * the hatch with squares in the rock's, and neither said what had come apart
 * — the owner, 12 September 2026: *improve the graphics of the broken
 * pieces.* These are pieces of the ball: curved fragments cut from the sector
 * the ward took (`volleyReturn`), and from everything still on when the last
 * plate goes (`volleyHatch`). Each is an arc of the shell's rind or a wedge
 * of the stone under it, at the shell's own radius, so the pieces put back
 * together are the ball again — `shatter.ts`'s argument, made here for a
 * round body because that cutter wants a contour about its own middle.
 *
 * A ward's pieces come off the face that met the shield — the underside —
 * and are thrown out and *up* by it before they fall, some carrying a length
 * of seam lit in the shield's colour. By the hatch there is no shell left:
 * the third ward took the last sector, and what climbed the last beat was
 * the core alone (`volley-core.ts`). So a hatch throws the *core's* skin — a
 * ring of its own colour, at its own radius, every piece edged in its glow —
 * and the plain body the simulation made of it falls out of the ring. They
 * all fall on the ship's skin and stop.
 *
 * Nothing is random: the jitter is `stream`, seeded off the column, the row
 * and the count, so both phones watch the same pieces leave. Kept in
 * `Effects`, cleared on restart.
 */

/** Angular pieces a sector is cut into, and where the rind ends. */
const CUTS = 3;
const RIND_AT = 0.6;
/** Flight: tiles a second outward and up off a ward, the pull down in tiles
 * a second squared, seconds in the air and the share spent fading. */
const SPEED = 1.6;
const LIFT = 3.4;
const GRAVITY = 8;
const LIFE = 1.0;
const FADE = 0.45;
/** Turn rate before jitter, radians a second. */
const SPIN = 5;

interface Point {
  x: number;
  y: number;
}

interface Piece {
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

interface Fall {
  pieces: Piece[];
  x: number;
  y: number;
  floor: number;
  /** One tile in pixels, for the pull down. */
  tile: number;
  /** What a piece is made of: the rind's fill and edge, the stone's under it,
   * and the light on a broken seam. */
  fill: [string, string];
  edge: [string, string];
  glow: string;
  age: number;
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

export class VolleyShardsFx {
  private falls: Fall[] = [];

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig): void {
    for (const e of events) {
      if (e.type !== "volleyReturn" && e.type !== "volleyHatch") continue;
      const total = Math.max(1, cfg.volleyPlates);
      const sweep = (Math.PI * 2) / total;
      // The break faces down — the face that met the shield — and sectors are
      // laid from it round (`volley.ts`, `remaining`), so the sector a ward
      // took is the next one along, and a hatch takes all that were left.
      const lead = Math.PI / 2;
      const ward = e.type === "volleyReturn";
      const left = ward ? e.left : 0;
      const from = ward ? lead + sweep * (total - left - 1) : lead;
      const span = ward ? sweep : Math.PI * 2;
      const r = volleyBallRadius(l, cfg, 1, e.row) * (ward ? 1 : CORE_MUL);
      const rnd = stream((e.col + 1) * 7919 + (e.row + 1) * 104729 + left * 31);
      // What burns on a broken seam: the shield's own light on a face the
      // shield just struck, and the body's colour on its own skin — the same
      // two colours the sparks over it use, for the same reasons.
      const cyan = !ward && e.color === "cyan";
      const glow = ward ? PALETTE.shieldRim : cyan ? PALETTE.cyan : PALETTE.red;
      const skin = cyan ? PALETTE.cyanDark : PALETTE.redDark;
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
          const speed = SPEED * l.tile * (0.7 + rnd() * 0.6) * (face === 1 ? 1 : 0.75);
          let vx = Math.cos(mid) * speed;
          let vy = Math.sin(mid) * speed;
          if (ward) {
            // Off the shield: out sideways and up, never down into the ship.
            vx *= 1.4;
            vy = -LIFT * l.tile * (0.6 + rnd() * 0.8);
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
      this.falls.push({
        pieces,
        x: tileCX(l, e.col),
        y: tileCY(l, e.row),
        floor: l.hullY - tileCY(l, e.row) - 2,
        tile: l.tile,
        fill: ward ? [STONE_FILL, PALETTE.rockDark] : [skin, skin],
        edge: ward ? [PALETTE.rock, PALETTE.sparkDim] : [glow, skin],
        glow,
        age: 0,
      });
    }
  }

  update(dt: number): void {
    for (const f of this.falls) {
      f.age += dt;
      for (const p of f.pieces) {
        p.vy += GRAVITY * f.tile * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.a += p.spin * dt;
        if (p.y >= f.floor) {
          p.y = f.floor;
          p.vy = 0;
          p.vx *= 0.2;
          p.spin *= 0.2;
        }
      }
    }
    this.falls = this.falls.filter((f) => f.age < LIFE);
  }

  clear(): void {
    this.falls = [];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const f of this.falls) {
      const u = f.age / LIFE;
      const alpha = u < 1 - FADE ? 1 : (1 - u) / FADE;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.globalAlpha = alpha;
      for (const p of f.pieces) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.beginPath();
        for (let i = 0; i < p.pts.length; i++) {
          const q = p.pts[i] as Point;
          if (i === 0) ctx.moveTo(q.x, q.y);
          else ctx.lineTo(q.x, q.y);
        }
        ctx.closePath();
        ctx.fillStyle = p.face === 1 ? f.fill[0] : f.fill[1];
        ctx.fill();
        ctx.strokeStyle = p.face === 1 ? f.edge[0] : f.edge[1];
        ctx.lineWidth = 1;
        ctx.stroke();
        if (p.ember) {
          const [i0, i1] = p.ember;
          ctx.beginPath();
          for (let i = i0; i <= i1; i++) {
            const q = p.pts[i] as Point;
            if (i === i0) ctx.moveTo(q.x, q.y);
            else ctx.lineTo(q.x, q.y);
          }
          ctx.strokeStyle = f.glow;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.globalCompositeOperation = "lighter";
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();
    }
  }
}
