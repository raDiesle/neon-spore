import { hash01 } from "./backdrop.js";

/**
 * Sparks: the small square particles every impact in the game throws.
 *
 * Their own file because they are the one effect that is not tied to a single
 * event — a hit, a crater, a breach, a deflection and a swallowed pod all
 * spend them, and each one only has to say how many, what colour, and which
 * way. Pure appearance: nothing here is ever read back into a world.
 *
 * The scatter is `hash01` of a per-instance counter, not `Math.random`: two
 * devices ingesting the same event must throw the same particles, or two
 * phones looking at the same burst see different pictures of it.
 */

export interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hex: string;
  /** Downward pull. Zero for anything the ship is drawing *in*. */
  g: number;
}

export const SPARK_LIFE = 0.4;

export class Sparks {
  private list: Spark[] = [];
  /** Advances on every particle spawned, seeding `hash01` — see `clear`. */
  private seed = 0;

  /** Drop every spark still in the air, and rewind the seed so the next burst
   * throws the same particles a fresh instance would. For a restart — see
   * `Effects.reset`. */
  clear(): void {
    this.list.length = 0;
    this.seed = 0;
  }

  /** Thrown outwards from a point: something came apart here. */
  burst(x: number, y: number, n: number, hex: string): void {
    for (let k = 0; k < n; k++) {
      this.list.push({
        x,
        y,
        vx: (hash01(this.seed++) - 0.5) * 150,
        vy: (hash01(this.seed++) - 0.5) * 150,
        life: SPARK_LIFE,
        hex,
        g: 200,
      });
    }
  }

  /**
   * The mirror of `burst`: spawned on a ring and aimed at the middle of it,
   * with no gravity, so they arrive together. The ship taking something in.
   */
  implode(x: number, y: number, n: number, hex: string, radius: number): void {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + hash01(this.seed++) * 0.3;
      const d = radius * (0.6 + hash01(this.seed++) * 0.6);
      const speed = d / SPARK_LIFE;
      this.list.push({
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d * 0.7,
        vx: -Math.cos(a) * speed,
        vy: -Math.sin(a) * speed * 0.7,
        life: SPARK_LIFE,
        hex,
        g: 0,
      });
    }
  }

  update(dt: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const s = this.list[i]!;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += s.g * dt;
      s.life -= dt;
      if (s.life <= 0) this.list.splice(i, 1);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const s of this.list) {
      ctx.globalAlpha = Math.max(0, s.life / SPARK_LIFE);
      ctx.fillStyle = s.hex;
      ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;
  }
}
