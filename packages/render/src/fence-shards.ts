import type { SimEvent } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The wall coming apart where a bolt cut it.**
 *
 * A burnt column used to be a doorway that simply existed from one frame to
 * the next: the run of wire stopped a tile short, two posts appeared, and
 * nothing had happened. The owner asked for the moment — *when hit, we see the
 * splinters of the wall as destroying visual* — and a wire is a thing that
 * comes apart in **pieces of wire**, so that is what is thrown: short lengths
 * of the line itself, spinning away from the cut with the charge still in
 * them, rather than the round particles every other impact spends.
 *
 * It is a shard rather than a spark for the same reason a crawler's goo is a
 * shape rather than a spray (`crawler-fx.ts`): what the pair should read is
 * *what broke*, and a shower of dots says only *something did*.
 *
 * **They are thrown across the whole width of the cut**, not from its middle.
 * The column is a tile wide and the wire was continuous across it, so pieces
 * leave from everywhere along it — a burst from one point would read as an
 * explosion put next to a wall rather than as the wall itself failing.
 *
 * Everything here is drawn under the hull with the field pass, because that is
 * where the wall is. `RenderState` holds it for `effects.ts`'s reason: that
 * file is at its 250-line limit and the fix goes the long way round.
 */

/** Pieces one cut throws. */
const COUNT = 14;

/** Seconds a piece lasts. Long enough to be seen leaving, short enough to be
 * gone before the wall it came off reaches the ship. */
const LIFE = 0.62;

/** How long a piece is, as a share of a tile — the shortest and the longest. */
const LEN_MIN = 0.1;
const LEN_MAX = 0.26;

/** How fast a piece leaves, in tiles a second, sideways and up. Sideways is
 * the wire's own direction and carries most of it: a cut line springs apart
 * along itself before it falls. */
const SPEED_X = 5.2;
const SPEED_Y = 2.6;
/** Downward pull, in tiles a second a second. */
const GRAVITY = 7;
/** Turns a second, at most. */
const SPIN = 3.4;

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Half length, in pixels — fixed at spawn off the tile it was cut on. */
  half: number;
  angle: number;
  spin: number;
  life: number;
}

export class FenceShards {
  private list: Shard[] = [];
  /** Advances per piece, seeding the scatter — rewound by `clear`, so the next
   * cut throws what a fresh instance would (`Sparks` keeps its seed the same
   * way and for the same reason). */
  private seed = 0;

  /** One frame's events: a bolt cutting a wall is the only thing that makes
   * one of these. */
  ingest(events: readonly SimEvent[], l: Layout): void {
    for (const e of events) {
      if (e.type === "fenceBurn") this.cut(l, e.col, e.row);
    }
  }

  /** A column cut open: pieces from everywhere along the tile that was there. */
  cut(l: Layout, col: number, row: number): void {
    const cx = tileCX(l, col);
    const cy = tileCY(l, row);
    for (let i = 0; i < COUNT; i++) {
      const along = signedHash(this.seed++, 1);
      const away = along >= 0 ? 1 : -1;
      this.list.push({
        x: cx + along * l.tile * 0.5,
        y: cy + signedHash(this.seed++, 2) * l.tile * 0.16,
        vx: away * l.tile * SPEED_X * (0.35 + 0.65 * Math.abs(signedHash(this.seed++, 3))),
        vy: signedHash(this.seed++, 4) * l.tile * SPEED_Y,
        half: (l.tile * (LEN_MIN + (LEN_MAX - LEN_MIN) * Math.abs(signedHash(this.seed++, 5)))) / 2,
        angle: signedHash(this.seed++, 6) * Math.PI,
        spin: signedHash(this.seed++, 7) * SPIN * Math.PI * 2,
        life: LIFE,
      });
    }
  }

  update(dt: number, l: Layout): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const s = this.list[i]!;
      s.life -= dt;
      if (s.life <= 0) {
        this.list.splice(i, 1);
        continue;
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += l.tile * GRAVITY * dt;
      s.angle += s.spin * dt;
    }
  }

  clear(): void {
    this.list.length = 0;
    this.seed = 0;
  }

  /** Every piece still in the air. Called from the field pass, under the hull. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.list.length === 0) return;
    ctx.save();
    for (const s of this.list) {
      const left = s.life / LIFE;
      const dx = Math.cos(s.angle) * s.half;
      const dy = Math.sin(s.angle) * s.half;
      const path = new Path2D();
      path.moveTo(s.x - dx, s.y - dy);
      path.lineTo(s.x + dx, s.y + dy);
      // Fading as it cools, and the white core goes first: a piece of wire
      // with the charge running out of it, which is what the pair watched
      // happen to the column it came from.
      ctx.globalAlpha = left;
      strokeGlow(ctx, path, PALETTE.arc, Math.max(1.4, l.tile * 0.05), 1.4 * left);
      ctx.globalAlpha = left * left;
      ctx.strokeStyle = PALETTE.arcRim;
      ctx.lineWidth = Math.max(1, l.tile * 0.022);
      ctx.stroke(path);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
