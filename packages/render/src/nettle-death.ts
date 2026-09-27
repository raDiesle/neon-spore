import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import type { Point } from "./instar-place.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE NETTLE's death**: the last step landed and the bell lets go of
 * everything it held. Two rings go out off the bell, the second a beat
 * behind the first — the last pulse a jellyfish gives — and the motes it was
 * made of drift up and out of it and go dark. The body itself sags and fades
 * off the world (`nettle-poses.ts` `BEATEN`, `instarFade`); this is only
 * what leaves it.
 *
 * A transient, because the landing is one tick in the simulation: held in
 * `NettleFx` and cleared with it (`restart.test.ts`).
 */

const SECONDS = 1.6;
const MOTES = 16;
/** When the second ring leaves, as a share of the death. */
const SECOND_RING = 0.25;

export class NettleDeath {
  private now: { bell: Point; r: number; age: number } | null = null;

  /** The body is beaten: the bell at `bell`, `r` its radius in pixels. */
  start(bell: Point, r: number): void {
    this.now = { bell, r, age: 0 };
  }

  get active(): boolean {
    return this.now !== null;
  }

  update(dt: number): void {
    if (this.now === null) return;
    this.now.age += dt;
    if (this.now.age >= SECONDS) this.now = null;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const d = this.now;
    if (d === null) return;
    const t = d.age / SECONDS;
    ctx.save();
    for (const start of [0, SECOND_RING]) {
      const u = (t - start) / (1 - start);
      if (u <= 0 || u >= 1) continue;
      ctx.strokeStyle = rgba(PALETTE.hullRim, 0.8 * (1 - u));
      ctx.lineWidth = STROKE.outline * (1 + 2 * (1 - u));
      ctx.beginPath();
      ctx.ellipse(d.bell.x, d.bell.y, d.r * (1 + 1.2 * u), d.r * (0.82 + u), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = rgba(PALETTE.dim, 0.9 * (1 - t));
    for (let i = 0; i < MOTES; i++) {
      const a = (i / MOTES) * Math.PI * 2 + sinHash(i) * 0.4;
      const out = d.r * (0.4 + 1.1 * t * (0.6 + 0.4 * sinHash(i + 20)));
      const x = d.bell.x + Math.cos(a) * out;
      const y = d.bell.y + Math.sin(a) * out * 0.8 - d.r * 0.6 * t;
      ctx.beginPath();
      ctx.arc(x, y, d.r * 0.03 * (1 + sinHash(i + 7)), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  clear(): void {
    this.now = null;
  }
}
