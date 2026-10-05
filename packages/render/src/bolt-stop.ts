import type { Bullet, Color } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";

/**
 * **A bolt stops on what it meets.** The owner, 1 October 2026: "it does not
 * makes sense at all if shot hits a graphic but continues to go through
 * graphics like air."
 *
 * A boss hanging over the field is judged by the simulation only where a bolt
 * leaves row 0 (`sim/shot-out.ts`), and every pixel between the cannon and
 * that row was the bolt passing through the boss's body. The judgement stays
 * where it is; this is where the bolt is *drawn* to end. A boss's drawer says
 * each frame where a bolt in a column, of a colour, first meets its picture
 * and what it meets there (`aim`), and `drawBullets` draws no bolt above that
 * line — bursting it once, the first frame it reaches it.
 *
 * Four meetings, and three pictures. `target` is the part the step asks for,
 * in the colour it asks: a burst in the bolt's colour and a ring opening round
 * it. `wrong` — the right part in the wrong colour, or a part that is not
 * asked for — and `body`, the shell itself, are a scuff of grey grit and
 * nothing more: the owner's "some damage visual but without any effect on the
 * boss". `pass` is a bolt the boss takes on and draws itself from there —
 * THE LEAD's flight, climbing out of the ridge (`lead-stop.ts`) — so it ends
 * with no burst at all.
 */
export type BoltHit = "target" | "wrong" | "body" | "pass";

export interface BoltStop {
  /** Screen y the bolt's head stops at. */
  y: number;
  hit: BoltHit;
}

/** Where a bolt in `col`, drawn at screen `x`, first meets the boss — or `null` for clear air. */
export type Stopper = (col: number, x: number, color: Color) => BoltStop | null;

type Burst = (x: number, y: number, n: number, hex: string) => void;

interface Flash {
  x: number;
  y: number;
  n: number;
  hex: string;
}

interface Ring {
  x: number;
  y: number;
  hex: string;
  age: number;
}

/** How long a target's ring takes to open and fade, in seconds. */
const RING_LIFE = 0.35;
const TARGET_SPARKS = 14;
const SCUFF_SPARKS = 5;

export class BoltStops {
  private stopper: Stopper | null = null;
  /** Every bolt already stopped, so its burst is thrown once. */
  private seen = new Set<number>();
  private rings: Ring[] = [];
  /** Bursts met while the bolts were drawn, thrown into the sparks on the next `update`. */
  private flashes: Flash[] = [];

  /** The boss's answer for this frame; dropped again by `end`. */
  aim(stopper: Stopper | null): void {
    this.stopper = stopper;
  }

  /** What the boss aimed this frame says a bolt in `col` at `x` meets, stopping none: for the tests. */
  meets(col: number, x: number, color: Color): BoltStop | null {
    return this.stopper?.(col, x, color) ?? null;
  }

  /** Whether `b`, its head at (`x`, `y`), has met the boss — bursting it the first frame it has. */
  stopped(b: Bullet, x: number, y: number, hex: string): boolean {
    if (this.seen.has(b.id)) return true;
    if (this.stopper === null) return false;
    const stop = this.stopper(b.col, x, b.color);
    if (stop === null || y > stop.y) return false;
    this.seen.add(b.id);
    if (stop.hit === "target") {
      this.flashes.push({ x, y: stop.y, n: TARGET_SPARKS, hex });
      this.rings.push({ x, y: stop.y, hex, age: 0 });
    } else if (stop.hit !== "pass")
      this.flashes.push({ x, y: stop.y, n: SCUFF_SPARKS, hex: PALETTE.rock });
    return true;
  }

  /** After the bolts: forget the ones the field no longer holds, and the frame's answer. */
  end(bullets: readonly Bullet[]): void {
    if (this.seen.size > 0) {
      const live = new Set(bullets.map((b) => b.id));
      for (const id of this.seen) if (!live.has(id)) this.seen.delete(id);
    }
    this.stopper = null;
  }

  update(dt: number, burst: Burst): void {
    for (const f of this.flashes) burst(f.x, f.y, f.n, f.hex);
    this.flashes = [];
    for (const r of this.rings) r.age += dt;
    this.rings = this.rings.filter((r) => r.age < RING_LIFE);
  }

  draw(ctx: CanvasRenderingContext2D, tile: number): void {
    for (const r of this.rings) {
      const t = r.age / RING_LIFE;
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = r.hex;
      ctx.lineWidth = 3 * (1 - t) + 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, tile * (0.2 + 0.6 * t), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    this.stopper = null;
    this.seen.clear();
    this.rings = [];
    this.flashes = [];
  }
}
