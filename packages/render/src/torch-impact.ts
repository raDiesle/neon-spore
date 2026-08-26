import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTorchRock, drawTorchTail, torchRadius, torchRotation } from "./torch.js";

/** How long it sits sunk into the hull before it starts to drift off. */
const STICK_LIFE = 2;
/** How long the slow drift away takes to fully fade. */
const FLOAT_LIFE = 1.8;
/**
 * How long the tail it dragged down keeps fading after impact. Fades to
 * nothing exactly as the rock lets go and lifts clear of the hull, so the
 * tail never has to be cut off mid-fade — it just runs out on its own.
 */
const TAIL_LIFE = STICK_LIFE;
/**
 * How long the *start* of the drift takes to reach its cruising height and
 * speed — the thing that used to jump instantly to a new height and speed
 * the moment it stopped being stuck. Everything about letting go eases
 * against this, not against `FLOAT_LIFE`, so the liftoff is a beat, not the
 * whole drift.
 */
const RISE_TIME = 0.5;
/**
 * Sideways acceleration once it lets go, in px/s². A constant acceleration
 * from a standing start is the simplest curve that starts slow and ends
 * faster with no separate easing code of its own — the drift itself *is*
 * the ease.
 */
const DRIFT_ACCEL = 28;

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

interface Impact {
  /**
   * Screen x at the moment of impact — fixed. The drift is computed from it
   * fresh every frame (`currentX`), not accumulated onto it tick by tick, so
   * there is no running velocity state to jump when the acceleration curve
   * changes phase.
   */
  x0: number;
  r: number;
  dir: -1 | 1;
  rotation0: number;
  spin: number;
  /** The clock reading at impact, so the embedded rock holds one still shape
   * while stuck instead of visibly wobbling in place — a fixed rock reads as
   * lodged; a wobbling one reads as still falling. */
  spawnTime: number;
  t: number;
}

/** Screen x right now — a pure function of elapsed time, not accumulated state. */
function currentX(im: Impact): number {
  const floatT = Math.max(0, im.t - STICK_LIFE);
  return im.x0 + im.dir * 0.5 * DRIFT_ACCEL * floatT * floatT;
}

/**
 * What a torch's miss looks like, once it is no longer a creature: it sinks a
 * quarter of its own height into the hull and holds there completely still —
 * two full seconds, so the stick unmistakably reads as a stick — then lifts
 * off and drifts towards the nearer edge of the screen, slow at first and
 * faster as it goes, fading out along the way. The `damageSpan` breach that
 * spawns this fires once, on the torch's own `spanCenterCol`, so there is
 * exactly one of these per torch, not one per column it scarred. The tail it
 * dragged down keeps fading in underneath it, so the fall still reads as a
 * fall for a moment after.
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
      x0: x,
      r: torchRadius(l),
      dir: x < mid ? -1 : 1,
      rotation0: torchRotation(x),
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
      const x = currentX(im);
      const offscreen = x < left || x > right;
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
      const x = currentX(im);
      const surfaceY = skinAt(x);

      // Anchored to `surfaceY`, the hull's own skin line — once it lets go
      // and rises clear of that line, a tail still drawn down to it reads as
      // a stray mark still touching the crater, not as the rock's own trail.
      // `TAIL_LIFE` reaches 0 exactly at `STICK_LIFE`, so it is already gone
      // by the time floating starts, with no cutoff pop of its own.
      const tailAlpha = Math.max(0, 1 - im.t / TAIL_LIFE);
      if (tailAlpha > 0) drawTorchTail(ctx, l, x, surfaceY, im.r, tailAlpha);

      const floating = im.t > STICK_LIFE;
      const floatT = Math.max(0, im.t - STICK_LIFE);
      // 0 the instant it lets go, 1 once the liftoff has run its course —
      // everything about leaving the hull eases in against this, so there is
      // no frame where height or spin visibly jumps to a new value.
      const rise = smoothstep(floatT / RISE_TIME);
      const rotation = im.rotation0 + im.spin * 0.5 * floatT * floatT;

      // Sunk a quarter of its own height (half its radius) into the hull —
      // exactly the crater's own depth, so it sits in the hole it made
      // rather than hovering over it — and riding the same surface point,
      // so the ship's own motion carries it while it is stuck. Letting go,
      // it eases up to clear of the line rather than jumping there, and only
      // bobs once it has actually risen.
      const bob = floating ? Math.sin(floatT * 2.4) * im.r * 0.12 * rise : 0;
      const stuckY = surfaceY - im.r * 0.5;
      const y = floating ? stuckY + (surfaceY - im.r * 1.1 - stuckY) * rise + bob : stuckY;
      const alpha = floating ? Math.max(0, 1 - floatT / FLOAT_LIFE) : 1;
      if (alpha <= 0) continue;

      // While it is still stuck, a low ember glow sells the "melted into the
      // skin" contact rather than a rock merely floating in front of it.
      if (!floating) halo(ctx, x, surfaceY, im.r * 1.1, PALETTE.ember, 0.22);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      drawTorchRock(ctx, im.r, floating ? time : im.spawnTime);
      ctx.restore();
    }
  }
}
