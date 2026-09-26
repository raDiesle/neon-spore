import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { stream } from "./hash.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { rockFallY } from "./rock-fall.js";
import { volleyBallRadius } from "./volley.js";
import { CORE_MUL } from "./volley-core.js";
import { cutShell, type Piece, type Point } from "./volley-pieces.js";
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
 * `Effects`, cleared on restart. The cutting itself is `volley-pieces.ts`; this
 * file throws what it cuts, lets it fall and draws it.
 *
 * **A ward or a hatch on THE VOLLEY's last six rows breaks it where it is
 * drawn, not where its row's centre is.** The ball is bent onto the skin the
 * same way a rock is (`rock-fall.ts`, `landing.ts`), so a shell taken apart a
 * tile above its own row's centre used to throw its pieces from that centre
 * — up to about a tile under the ball the pair were looking at. `rockFallY`
 * places the break the same way the field pass places the ball.
 */

/** Flight: the pull down in tiles a second squared, seconds in the air and
 * the share spent fading. */
const GRAVITY = 8;
const LIFE = 1.0;
const FADE = 0.45;

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

export class VolleyShardsFx {
  private falls: Fall[] = [];

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    skinY: SurfaceY | undefined,
  ): void {
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
      const x = tileCX(l, e.col);
      const flat = tileCY(l, e.row);
      const y = rockFallY(l, e.row, flat, (skinY ? skinY(x) : l.hullY) - r);
      this.falls.push({
        pieces: cutShell(from, span, sweep, r, ward, l.tile, rnd),
        x,
        y,
        floor: l.hullY - flat - 2,
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
