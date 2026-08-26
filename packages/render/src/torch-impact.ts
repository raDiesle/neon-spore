import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTorchRock, drawTorchTail, torchRadius, torchRotation } from "./torch.js";

/** How long it sits sunk into the hull before it starts to drift off. */
const STICK_LIFE = 2;
/** How long the slow drift away takes to fully fade. */
const FLOAT_LIFE = 1.8;
/** A drift, not a flight — the whole point is that it no longer looks reflected. */
const FLOAT_SPEED = 22;
/** How long the tail it dragged down keeps fading in after impact. */
const TAIL_LIFE = STICK_LIFE + 0.6;

interface Impact {
  x: number;
  r: number;
  dir: -1 | 1;
  rotation: number;
  spin: number;
  /** The clock reading at impact, so the embedded rock holds one still shape
   * while stuck instead of visibly wobbling in place — a fixed rock reads as
   * lodged; a wobbling one reads as still falling. */
  spawnTime: number;
  t: number;
}

/**
 * What a torch's miss looks like, once it is no longer a creature: it sinks a
 * quarter of its own height into the hull and holds there completely still —
 * two full seconds, so the stick unmistakably reads as a stick — then drifts
 * slowly off towards the nearer edge of the screen and fades, rather than
 * being flung. The `damageSpan` breach that spawns this fires once, on the
 * torch's own `spanCenterCol`, so there is exactly one of these per torch,
 * not one per column it scarred. The tail it dragged down keeps fading in
 * underneath it, so the fall still reads as a fall for a moment after.
 *
 * While it is stuck it has to sit exactly in its own crater and ride the
 * hull's own motion, not hang at a fixed height above `Layout.hullY` — that
 * is a flat approximation of a surface that breathes and lifts under its
 * lobes, so a rock anchored to it instead of to the real, curved skin
 * visibly floats free of both the hull and the dent it supposedly made. The
 * `skinAt` callback is the same query `hull.ts`'s `drawTorchImpactMarks`
 * dent already positions itself with, so the two agree frame to frame.
 *
 * The permanent trace is separate: `drawTorchImpactMarks` in scars.ts sinks
 * the exact overlap of this same shape, at the same orientation
 * (`torchRotation`), into the hull's skin — so the two agree on where it hit
 * and the dent reads as this rock's dent.
 */
export class TorchImpactFx {
  private impacts: Impact[] = [];

  spawn(x: number, l: Layout, time: number): void {
    const mid = l.gridLeft + l.gridWidth / 2;
    this.impacts.push({
      x,
      r: torchRadius(l),
      dir: x < mid ? -1 : 1,
      rotation: torchRotation(x),
      spin: 0.4 + (x % 1) * 0.3,
      spawnTime: time,
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
        im.x += im.dir * FLOAT_SPEED * dt;
        im.rotation += im.spin * dt;
      }
      const offscreen = im.x < left || im.x > right;
      if (im.t > STICK_LIFE + FLOAT_LIFE || offscreen) this.impacts.splice(i, 1);
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    time: number,
    skinAt: (x: number) => number,
  ): void {
    for (const im of this.impacts) {
      const surfaceY = skinAt(im.x);

      const tailAlpha = Math.max(0, 1 - im.t / TAIL_LIFE);
      if (tailAlpha > 0) drawTorchTail(ctx, l, im.x, surfaceY, im.r, tailAlpha);

      const floating = im.t > STICK_LIFE;
      // Sunk a quarter of its own height (half its radius) into the hull —
      // exactly the crater's own depth, so it sits in the hole it made
      // rather than hovering over it — and riding the same surface point,
      // so the ship's own motion carries it while it is stuck. Floating
      // off, it rises clear of the line and bobs, the way something loose
      // and weightless drifts rather than falls.
      const bob = floating ? Math.sin((im.t - STICK_LIFE) * 2.4) * im.r * 0.12 : 0;
      const y = floating ? surfaceY - im.r * 1.1 + bob : surfaceY - im.r * 0.5;
      const alpha = floating ? Math.max(0, 1 - (im.t - STICK_LIFE) / FLOAT_LIFE) : 1;
      if (alpha <= 0) continue;

      // While it is still stuck, a low ember glow sells the "melted into the
      // skin" contact rather than a rock merely floating in front of it.
      if (!floating) halo(ctx, im.x, surfaceY, im.r * 1.1, PALETTE.ember, 0.22);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(im.x, y);
      ctx.rotate(im.rotation);
      drawTorchRock(ctx, im.r, floating ? time : im.spawnTime);
      ctx.restore();
    }
  }
}
