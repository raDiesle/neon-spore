import { fallTilesPerBeat } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTorchRock, drawTorchTail, torchRadius, torchRotation } from "./torch.js";

/**
 * Rows the torch covers in one beat (`fallTilesPerBeat`, sim/types.ts). The
 * sim removes a creature in the same tick the beat's motion is computed, so
 * `creatures.ts` never gets a frame to glide it through that last, biggest
 * step; the fall below re-plays it here, at that same speed, so the drop
 * looks unbroken all the way to the hull instead of vanishing mid-air and
 * reappearing embedded in it.
 */
const FALL_TILES = fallTilesPerBeat("torch");
/** How long it sits sunk into the hull before it starts to drift off. */
const STICK_LIFE = 2;
/** How long the slow drift away takes to fully fade. */
const FLOAT_LIFE = 1.8;
/**
 * How long the tail it dragged down lasts once the rock is in the hull. Long
 * enough not to blink out between two frames, short enough that the streak is
 * gone by the time anyone reads the crater: a rock lodged in the skin with a
 * trail still hanging off it reads as still falling, and there is no falling
 * left to do.
 */
const TAIL_LIFE = 0.15;
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

/**
 * The row the torch stood on for the last frame anybody saw it as a creature:
 * the last multiple of its per-beat step that is still above the hull row
 * (`hullRow` is `rows - 1`). The replay below starts there and nowhere else —
 * a start computed backwards from the hull instead was up to a tile away from
 * it, and a tile of jump at the handoff is exactly the stutter this replay
 * exists to remove.
 */
function lastFallRow(l: Layout): number {
  return Math.floor((l.rows - 2) / FALL_TILES) * FALL_TILES;
}

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
  /** Screen y the replayed last step of the fall starts from: exactly where
   * the creature itself was last drawn (`lastFallRow`). */
  y0: number;
  /** How fast that step falls, in px/s — one beat's worth of tiles per beat,
   * the same speed every earlier beat of the fall had. */
  fallSpeed: number;
  r: number;
  dir: -1 | 1;
  rotation0: number;
  spin: number;
  /** The clock reading at impact, so the embedded rock holds one still shape
   * while stuck instead of visibly wobbling in place — a fixed rock reads as
   * lodged; a wobbling one reads as still falling. */
  spawnTime: number;
  /**
   * How long the replay takes: the distance from `y0` down to the hull's real
   * skin divided by `fallSpeed`. 0 until the first frame, because the skin's
   * height is only known inside `draw` — the constant speed is what is fixed
   * here, the duration is whatever that speed needs to cover the gap.
   */
  fallLife: number;
  t: number;
}

/** When the stuck hold ends and the drift-off begins, in `im.t`. */
function stickStart(im: Impact): number {
  return im.fallLife + STICK_LIFE;
}

/** Screen x right now — a pure function of elapsed time, not accumulated state. */
function currentX(im: Impact): number {
  const floatT = Math.max(0, im.t - stickStart(im));
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
 * dragged down goes out with the fall itself (`TAIL_LIFE`), not with the
 * rock: a streak still hanging off something already lodged in the hull
 * reads as a fall that never ended.
 *
 * While it is stuck it has to sit exactly in its own crater and ride the
 * hull's own motion, not hang at a fixed height above `Layout.hullY` — that
 * is a flat approximation of a surface that breathes and lifts under its
 * lobes, so a rock anchored to it instead of to the real, curved skin
 * visibly floats free of both the hull and the dent it supposedly made. The
 * `skinAt` callback is the same query `torch-crater.ts`'s dent already
 * positions itself with, so the two agree frame to frame.
 *
 * The permanent trace is separate: `torch-crater.ts` sinks the exact overlap
 * of this same shape, at the same orientation (`torchRotation`), into the
 * hull's skin — so the two agree on where it hit and the dent reads as this
 * rock's dent. It stays hidden until this rock is out of the way; see
 * `coversCrater`.
 */
export class TorchImpactFx {
  private impacts: Impact[] = [];

  /** `beatSeconds` is how long one beat takes at the tempo the miss happened
   * at (`60 / cfg.bpm`) — the pace the replayed last step of the fall has to
   * match to read as a continuation of it, not a new, different fall. */
  spawn(x: number, l: Layout, time: number, beatSeconds: number): void {
    const mid = l.gridLeft + l.gridWidth / 2;
    this.impacts.push({
      x0: x,
      y0: tileCY(l, lastFallRow(l)),
      fallSpeed: (FALL_TILES * l.tile) / beatSeconds,
      r: torchRadius(l),
      dir: x < mid ? -1 : 1,
      rotation0: torchRotation(x),
      spin: 0.4 + (x % 1) * 0.3,
      spawnTime: time,
      fallLife: 0,
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
      if (im.t > stickStart(im) + FLOAT_LIFE || offscreen) this.impacts.splice(i, 1);
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
      const stuckY = surfaceY - im.r * 0.5;
      // The duration of the replayed step, fixed on the first frame it is
      // drawn: whatever the fall's own speed needs to close the gap between
      // where the creature was last drawn and the hull's real skin. Speed is
      // the thing held constant, never the time.
      if (im.fallLife === 0) im.fallLife = Math.max(0.001, (stuckY - im.y0) / im.fallSpeed);
      const stuckAt = stickStart(im);

      // Still falling: the last step the sim itself never got to render (see
      // `FALL_TILES`), replayed here at the same speed and with no easing —
      // matching the plain, even glide every earlier beat of the fall had —
      // so it reads as the same fall finishing, not a new one starting.
      const falling = im.t < im.fallLife;

      // The tail belongs to the fall and to nothing else: full strength on
      // the way down, then `TAIL_LIFE` to leave. It hangs from the rock, not
      // from the hull line — a streak drawn down to a crater the rock is
      // already sitting in is a mark on the ship, not a trail behind a rock.
      const floating = im.t > stuckAt;
      const floatT = Math.max(0, im.t - stuckAt);
      // 0 the instant it lets go, 1 once the liftoff has run its course —
      // everything about leaving the hull eases in against this, so there is
      // no frame where height or spin visibly jumps to a new value.
      const rise = smoothstep(floatT / RISE_TIME);
      // It came down without turning (`drawTorch`) and it lands the same way
      // up it fell — only once it lets go of the hull does it tumble.
      const rotation = im.rotation0 + (floating ? im.spin * 0.5 * floatT * floatT : 0);

      // Sunk a quarter of its own height (half its radius) into the hull —
      // exactly the crater's own depth, so it sits in the hole it made
      // rather than hovering over it — and riding the same surface point,
      // so the ship's own motion carries it while it is stuck. Letting go,
      // it eases up to clear of the line rather than jumping there, and only
      // bobs once it has actually risen.
      const bob = floating ? Math.sin(floatT * 2.4) * im.r * 0.12 * rise : 0;
      const y = falling
        ? im.y0 + im.fallSpeed * im.t
        : floating
          ? stuckY + (surfaceY - im.r * 1.1 - stuckY) * rise + bob
          : stuckY;

      const tailAlpha = falling ? 1 : Math.max(0, 1 - (im.t - im.fallLife) / TAIL_LIFE);
      if (tailAlpha > 0) drawTorchTail(ctx, l, x, y, im.r, tailAlpha);

      const alpha = floating ? Math.max(0, 1 - floatT / FLOAT_LIFE) : 1;
      if (alpha <= 0) continue;

      // While it is still stuck, a low ember glow sells the "melted into the
      // skin" contact rather than a rock merely floating in front of it.
      if (!falling && !floating) halo(ctx, x, surfaceY, im.r * 1.1, PALETTE.ember, 0.22);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      drawTorchRock(ctx, im.r, falling || floating ? time : im.spawnTime);
      ctx.restore();
    }
  }

  /**
   * Whether a rock is still in the crater at this x — still falling into it
   * or still lodged in it. The hull only draws a torch's dent once this goes
   * false (`hull.ts`): the sim scars the columns at the instant of the beat,
   * a good half second before the rock is visibly there, and a hole that
   * opens ahead of the thing that punches it reads as the ship breaking by
   * itself.
   */
  coversCrater(x: number, tile: number): boolean {
    for (const im of this.impacts) {
      if (im.t > stickStart(im)) continue;
      if (Math.abs(x - im.x0) < tile * 0.75) return true;
    }
    return false;
  }
}
