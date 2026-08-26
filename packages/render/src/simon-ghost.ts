import type { SimConfig } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCX } from "./layout.js";
import { mirrorHullY } from "./mirror.js";

/**
 * The shots THE MIRROR drops while it is demonstrating a sequence.
 *
 * They are appearance and nothing else: they hit nothing, they are not in the
 * world, and they stop at the hull rather than reaching it. What they are for
 * is making a performed `fireRed` read as the mirror *firing* — a lobe that
 * flashes and produces nothing looks like the picture missed a frame.
 */

/** How fast one falls, in tiles per second. */
const TILES_PER_SECOND = 9;
/** How long one lives before it is forgotten, whether or not it left the field. */
const LIFE = 2;

interface Ghost {
  col: number;
  hex: string;
  t: number;
}

export class GhostShots {
  private shots: Ghost[] = [];

  spawn(col: number, hex: string): void {
    this.shots.push({ col, hex, t: 0 });
  }

  update(dt: number): void {
    const alive: Ghost[] = [];
    for (const g of this.shots) {
      g.t += dt;
      if (g.t < LIFE) alive.push(g);
    }
    this.shots = alive;
  }

  clear(): void {
    this.shots = [];
  }

  /** Drawn under the hull, like every other shot in the game. */
  draw(ctx: CanvasRenderingContext2D, l: Layout, cfg: SimConfig): void {
    const from = mirrorHullY(l, cfg);
    for (const g of this.shots) {
      const y = from + g.t * TILES_PER_SECOND * l.tile;
      if (y > l.hullY) continue;
      const x = tileCX(l, g.col);
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - g.t / LIFE) * 0.7;
      halo(ctx, x, y, l.tile * 0.5, g.hex, 0.5);
      ctx.fillStyle = g.hex;
      ctx.beginPath();
      ctx.arc(x, y, l.tile * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
