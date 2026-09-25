import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";

/**
 * **The marks a rock leaves rolling off the hull.** The owner asked, 25
 * September 2026, for a rock rolling away over the ship to do some small
 * damage on its way — the crater is where it hit, and this is the track it
 * left leaving. Each mark is a char smudge along the skin, a scratch in the
 * colour of the rock that made it (an impact carries the colour of what hit,
 * never a generic damage red), and a few chips thrown off behind it the
 * instant it is made. None of it is permanent: the scar the sim keeps is the
 * crater, and a track that stayed would cover the columns the pair reads.
 *
 * Positions are the rock's own path — `x0` plus whole steps of its roll — so
 * two phones watching one rock leave see the same marks. Only the age is
 * accumulated, and it is render's alone.
 */

/** How long a mark takes to fade away completely, in seconds. */
const LIFE = 1.6;
/** How long the scratch stays hot before it has cooled to the rock's own
 * dull tone, in seconds. */
const HOT = 0.25;
/** How long the chips fly, in seconds. */
const CHIP_LIFE = 0.3;
/** Two chips a mark: one reads as a speck, three as a spray. */
const CHIPS = 2;
/** The dark of a burnt hole — the same as a scar's crack (`scars.ts`). */
const CHAR = "#150E28";

interface Scuff {
  /** Where on the skin, in screen x. */
  x: number;
  /** Which way the rock was rolling — the chips fly the other way. */
  dir: -1 | 1;
  /** The radius of the rock, which sizes the mark. */
  r: number;
  /** The rock's colour. */
  tint: string;
  /** A number both phones agree on, for the mark's shape and its chips. */
  seed: number;
  age: number;
}

/** How far apart the marks are along a rock's roll, in px. */
export function scuffStep(r: number): number {
  return r * 0.9;
}

export class RockScuffs {
  private marks: Scuff[] = [];

  clear(): void {
    this.marks.length = 0;
  }

  add(x: number, dir: -1 | 1, r: number, tint: string, seed: number): void {
    this.marks.push({ x, dir, r, tint, seed, age: 0 });
  }

  update(dt: number): void {
    for (let i = this.marks.length - 1; i >= 0; i--) {
      const m = this.marks[i]!;
      m.age += dt;
      if (m.age >= LIFE) this.marks.splice(i, 1);
    }
  }

  /** On the skin the rock rolled over, under the rock itself. */
  draw(ctx: CanvasRenderingContext2D, skinAt: (x: number) => number): void {
    if (this.marks.length === 0) return;
    ctx.save();
    ctx.lineCap = "round";
    for (const m of this.marks) {
      const y = skinAt(m.x);
      // Along the skin, not along the screen: the hull is a dome.
      const slope = (skinAt(m.x + 2) - skinAt(m.x - 2)) / 4;
      const k = Math.hypot(1, slope);
      const tx = 1 / k;
      const ty = slope / k;
      const fade = 1 - m.age / LIFE;
      // Each mark its own length, lean and place along the step, so a row of
      // them reads as a rock grinding unevenly over the skin — equal marks at
      // equal gaps read as a dashed line someone drew on the ship.
      const half = scuffStep(m.r) * (0.3 + 0.35 * sinHash(m.seed, 3));
      const along = (sinHash(m.seed, 4) - 0.5) * scuffStep(m.r) * 0.4;
      const lean = (sinHash(m.seed, 5) - 0.5) * 0.5;
      // Pressed a hair into the outline, so it reads as on the skin rather
      // than as a stroke laid over it.
      const cx = m.x + tx * along - ty * 1.5;
      const cy = y + ty * along + tx * 1.5;
      const ux = tx - ty * lean;
      const uy = ty + tx * lean;

      ctx.strokeStyle = rgba(CHAR, 0.7 * fade);
      ctx.lineWidth = Math.max(2, m.r * 0.24);
      ctx.beginPath();
      ctx.moveTo(cx - tx * half, cy - ty * half);
      ctx.lineTo(cx + tx * half, cy + ty * half);
      ctx.stroke();

      // The scratch: bright the instant the rock grinds over it, cooling to
      // the rock's own tone, gone with the smudge. It leans off the smudge a
      // little — a gouge, not an outline of it.
      const heat = Math.max(0, 1 - m.age / HOT);
      ctx.strokeStyle = rgba(m.tint, (0.25 + 0.7 * heat) * fade);
      ctx.lineWidth = 0.8 + heat;
      ctx.beginPath();
      ctx.moveTo(cx - ux * half * 0.9, cy - uy * half * 0.9);
      ctx.lineTo(cx + ux * half * 0.6, cy + uy * half * 0.6);
      ctx.stroke();

      if (m.age < CHIP_LIFE) {
        const a = m.age;
        const s = m.r * 0.5;
        ctx.fillStyle = rgba(m.tint, 1 - a / CHIP_LIFE);
        for (let i = 0; i < CHIPS; i++) {
          const spread = 0.5 + 0.5 * sinHash(m.seed, i, 1);
          const vx = -m.dir * s * (3 + 4 * spread);
          const vy = -s * (4 + 5 * sinHash(m.seed, i, 2));
          const px = m.x + vx * a;
          const py = y + vy * a + s * 40 * a * a;
          ctx.fillRect(px - 1, py - 1, 2, 2);
        }
      }
    }
    ctx.restore();
  }
}
