import { rgba } from "./hex.js";
import type { Point } from "./lamprey-shape.js";

/**
 * **The crumbs THE LAMPREY leaves where it eats** (the owner, 6 October 2026:
 * *it eats them and leaves crumbs*): a spray of specks in the colour of what
 * it ate, thrown out of its mouth where the body was, drifting down and
 * fading over a couple of seconds — longer than a burst, so the place it ate
 * is still marked after the head has moved on.
 *
 * The specks are scattered by a fixed table, not by chance, so two frames of
 * one bite draw the same crumbs. Cleared in `Effects.reset()` through
 * `LampreyFx.clear()`.
 */

/** Specks a bite throws, how long they last in seconds, and how far they fall in that time, in tiles. */
const SPECKS = 9;
const LIFE = 2.4;
const FALL = 1.1;
/** At most this many bites' crumbs at once; the oldest goes first. */
const KEEP = 6;

interface Bite {
  at: Point;
  hex: string;
  age: number;
}

export class LampreyCrumbs {
  private bites: Bite[] = [];

  /** A bite at `at`, its crumbs in `hex`. */
  drop(at: Point, hex: string): void {
    this.bites.push({ at, hex, age: 0 });
    if (this.bites.length > KEEP) this.bites.shift();
  }

  update(dt: number): void {
    for (const b of this.bites) b.age += dt;
    this.bites = this.bites.filter((b) => b.age < LIFE);
  }

  clear(): void {
    this.bites = [];
  }

  /** Every bite's specks: out from where it ate, falling, fading. */
  draw(ctx: CanvasRenderingContext2D, tile: number): void {
    for (const b of this.bites) {
      const k = b.age / LIFE;
      const out = 1 - (1 - Math.min(1, k * 3)) ** 2;
      ctx.fillStyle = rgba(b.hex, 0.9 * (1 - k));
      for (let i = 0; i < SPECKS; i++) {
        const a = (i / SPECKS) * Math.PI * 2 + i * 0.7;
        const reach = (0.35 + ((i * 37) % 10) / 20) * tile * out;
        const x = b.at.x + Math.cos(a) * reach;
        const y = b.at.y + Math.sin(a) * reach * 0.6 + k * k * FALL * tile;
        const r = tile * (0.05 + ((i * 13) % 5) / 100);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x, y + r * 0.8);
        ctx.lineTo(x - r * 0.9, y + r * 0.1);
        ctx.lineTo(x - r * 0.2, y - r);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}
