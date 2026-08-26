import type { Layout } from "./layout.js";
import { drawTorchRock, drawTorchTail, torchRadius } from "./torch.js";

/** How long it sits sunk into the hull before it reflects away. */
const STICK_LIFE = 0.16;
/** How long the reflect-away flight takes to fully fade. */
const FLY_LIFE = 0.42;
/** How long the tail it dragged down keeps fading in after impact, total. */
const TAIL_LIFE = 1;

interface Impact {
  x: number;
  hullY: number;
  r: number;
  dir: -1 | 1;
  rotation: number;
  spin: number;
  t: number;
}

/**
 * What a torch's miss looks like, once it is no longer a creature: it sinks a
 * quarter of its own height into the hull, holds there for a beat, then
 * reflects away fast towards the nearer edge of the screen and is gone — the
 * `damageSpan` breach that spawns this fires once, on the torch's own
 * `spanCenterCol`, so there is exactly one of these per torch, not one per
 * column it scarred. The tail it dragged down keeps fading in underneath it,
 * so the fall still reads as a fall for a moment after the impact itself.
 */
export class TorchImpactFx {
  private impacts: Impact[] = [];

  spawn(x: number, l: Layout): void {
    const mid = l.gridLeft + l.gridWidth / 2;
    this.impacts.push({
      x,
      hullY: l.hullY,
      r: torchRadius(l),
      dir: x < mid ? -1 : 1,
      rotation: (x * 0.37) % (Math.PI * 2),
      spin: 3 + (x % 1) * 4,
      t: 0,
    });
  }

  update(dt: number, l: Layout): void {
    const margin = l.gridWidth * 0.3;
    const left = l.gridLeft - margin;
    const right = l.gridLeft + l.gridWidth + margin;
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      const im = this.impacts[i]!;
      im.t += dt;
      if (im.t > STICK_LIFE) {
        const flyT = im.t - STICK_LIFE;
        const speed = 900 + flyT * 2600;
        im.x += im.dir * speed * dt;
        im.rotation += im.spin * dt;
      }
      const offscreen = im.x < left || im.x > right;
      if (im.t > TAIL_LIFE || offscreen) this.impacts.splice(i, 1);
    }
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, time: number): void {
    for (const im of this.impacts) {
      const tailAlpha = Math.max(0, 1 - im.t / TAIL_LIFE);
      if (tailAlpha > 0) drawTorchTail(ctx, l, im.x, im.hullY, im.r, tailAlpha);

      const flying = im.t > STICK_LIFE;
      // Sunk a quarter of its own height (half its radius) into the hull
      // while stuck; once it reflects away it rides fully clear of the line.
      const y = flying ? im.hullY - im.r : im.hullY - im.r * 0.5;
      const alpha = flying ? Math.max(0, 1 - (im.t - STICK_LIFE) / FLY_LIFE) : 1;
      if (alpha <= 0) continue;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(im.x, y);
      ctx.rotate(im.rotation);
      drawTorchRock(ctx, im.r, time);
      ctx.restore();
    }
  }
}
