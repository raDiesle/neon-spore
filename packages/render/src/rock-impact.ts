import { type CreatureKind, fallTilesPerBeat } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTorchRock, drawTorchTail, rockRadius, torchRotation } from "./torch.js";

/** How long a missed rock sits sunk into the hull before it starts to drift off. */
const STICK_LIFE = 2;
/** How long the torch's tail lasts once it is in the hull — long enough not
 * to blink out between two frames, short enough that it is gone by the time
 * anyone reads the crater: a rock lodged in the skin with a trail still
 * hanging off it reads as still falling, and there is no falling left to do. */
const TAIL_LIFE = 0.15;
/**
 * How long the *start* of the drift takes to reach its cruising height and
 * speed — the thing that used to jump instantly to a new height and speed
 * the moment it stopped being stuck. Everything about letting go eases
 * against this, so the liftoff is a beat, not the whole drift, which never
 * eases back down again — it simply keeps accelerating off the edge of the
 * field (`update`'s `offscreen`).
 */
const RISE_TIME = 0.5;
/** How fast it is already moving sideways the instant it lets go, in px/s.
 * Not zero: a rock accelerating up from a standstill spends its first half
 * second barely moving and barely turning, which reads as the hull letting
 * go reluctantly. With real speed it rolls out of its hole from frame one. */
const DRIFT_SPEED = 30;
/** Sideways acceleration once it lets go, in px/s² — on top of `DRIFT_SPEED`,
 * so it leaves at a believable pace and keeps gathering. */
const DRIFT_ACCEL = 28;

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

interface Impact {
  kind: CreatureKind;
  /**
   * Sinks into the hull and drifts off once it arrives (a miss), or simply
   * fires `onArrive` and is gone (a deflect, which bounces away by its own
   * animation, `DeflectFx`, and must not also embed here).
   */
  embed: boolean;
  /** Screen x at impact — fixed; the drift is computed fresh from it every
   * frame (`currentX`), never accumulated, so there is no running velocity
   * state to jump when the acceleration curve changes phase. */
  x0: number;
  /** Screen y the replayed last fall step starts from — the sim's own
   * `fromRow` the beat the miss happened, the exact row render/ last drew
   * this creature at. */
  y0: number;
  /** px/s — the same speed every earlier beat of the fall had. */
  fallSpeed: number;
  r: number;
  dir: -1 | 1;
  rotation0: number;
  /** Clock reading at impact — a stuck rock holds this still shape rather than visibly wobbling. */
  spawnTime: number;
  /**
   * How long the replay takes: `y0` down to the hull's real skin over
   * `fallSpeed`. 0 until the first `draw` frame, because the skin's height is
   * only known there — speed is fixed, duration is whatever it takes.
   */
  fallLife: number;
  t: number;
  /** Fires once, the frame the replay reaches the hull's skin. */
  onArrive: (x: number, y: number) => void;
  arrived: boolean;
}

/** When the stuck hold ends and drift-off begins, in `im.t` — meaningless for
 * a non-embedding impact, which is gone the moment it lands. */
function stickStart(im: Impact): number {
  return im.fallLife + (im.embed ? STICK_LIFE : 0);
}

/** How far it has rolled from where it landed, in px — 0 until it lets go.
 * A pure function of elapsed time, not accumulated state. */
function travelled(im: Impact): number {
  const floatT = Math.max(0, im.t - stickStart(im));
  return DRIFT_SPEED * floatT + 0.5 * DRIFT_ACCEL * floatT * floatT;
}

/** Screen x right now. */
function currentX(im: Impact): number {
  return im.x0 + im.dir * travelled(im);
}

/**
 * The last, biggest step of a rock's fall, replayed here at the speed every
 * earlier beat of the fall had: the sim removes a creature the same tick the
 * beat's motion is computed, so `creatures.ts` never gets a frame to glide it
 * through that final step (`fallTilesPerBeat`, sim/types.ts) — without this,
 * a fast rock vanishes mid-air and reappears at the hull, and the faster it
 * fell the further that gap is. `onArrive` (the spark burst, the deflect
 * bounce) fires only once this replay actually reaches the hull's skin,
 * instead of at the instant the sim resolved the impact.
 *
 * Every rock kind that misses — not just the torch — sinks in and drifts off
 * afterwards, sized by its own radius (`rockRadius`); see `stickStart`. A
 * deflected rock never embeds: `onArrive` fires its bounce (`DeflectFx`) and
 * this impact is simply gone the same frame.
 *
 * While stuck it rides the hull's own breathing motion via `skinAt`
 * (`craters.ts` uses the same query), not a fixed height above `Layout.hullY`.
 */
export class RockImpactFx {
  private impacts: Impact[] = [];

  /** `beatSeconds` is how long one beat takes at the tempo the miss happened
   * at (`60 / cfg.bpm`) — the pace the replayed last step of the fall has to
   * match to read as a continuation of it, not a new, different fall.
   * `fromRow` is the sim's own row for this creature the beat it missed.
   * `embed` is false for a deflect — see the class doc. */
  spawn(
    x: number,
    l: Layout,
    time: number,
    beatSeconds: number,
    kind: CreatureKind,
    fromRow: number,
    embed: boolean,
    onArrive: (x: number, y: number) => void,
  ): void {
    const mid = l.gridLeft + l.gridWidth / 2;
    const fallTiles = fallTilesPerBeat(kind);
    this.impacts.push({
      kind,
      embed,
      x0: x,
      y0: tileCY(l, fromRow),
      fallSpeed: (fallTiles * l.tile) / beatSeconds,
      r: rockRadius(l, kind),
      dir: x < mid ? -1 : 1,
      rotation0: torchRotation(x),
      spawnTime: time,
      fallLife: 0,
      t: 0,
      onArrive,
      arrived: false,
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
      // A drifting rock keeps drifting — accelerating the whole way, per
      // `DRIFT_ACCEL` — until it is actually gone from view, not for some
      // fixed time regardless of where that leaves it. A non-embedding
      // impact (a deflect) has nothing left to draw once it has arrived.
      const done = !im.embed && im.arrived;
      if (done || offscreen) this.impacts.splice(i, 1);
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
      // Duration of the replayed step, fixed on its first drawn frame:
      // whatever the fall's own speed needs to close the gap. Speed is the
      // thing held constant, never the time.
      if (im.fallLife === 0) im.fallLife = Math.max(0.001, (stuckY - im.y0) / im.fallSpeed);
      const stuckAt = stickStart(im);

      // Still falling: the last step the sim itself never got to render,
      // replayed here at the same speed and with no easing — matching the
      // plain, even glide every earlier beat of the fall had — so it reads
      // as the same fall finishing, not a new one starting.
      const falling = im.t < im.fallLife;
      if (!falling && !im.arrived) {
        im.arrived = true;
        im.onArrive(x, surfaceY);
      }

      const floating = im.t > stuckAt;
      const floatT = Math.max(0, im.t - stuckAt);
      // 0 the instant it lets go, 1 once the liftoff has run its course —
      // everything about leaving the hull eases in against this, so there is
      // no frame where the height visibly jumps to a new value.
      const rise = smoothstep(floatT / RISE_TIME);
      // It came down without turning (`drawTorch`) and lands the same way up
      // it fell. Leaving, it *rolls*: the turn is its travel over its own
      // radius — the arc a wheel that size covers going that far — and since
      // it leaves at `DRIFT_SPEED`, not from a standstill, the roll starts
      // the same instant the drift does.
      const rotation = im.rotation0 + (im.dir * travelled(im)) / im.r;

      // Sunk half its radius into the hull — exactly the crater's own depth,
      // so it sits in the hole it made — and riding the same surface point,
      // so the ship's motion carries it while stuck. Letting go, it eases up
      // clear of the line rather than jumping, and only bobs once risen.
      const bob = floating ? Math.sin(floatT * 2.4) * im.r * 0.12 * rise : 0;
      const y = falling
        ? im.y0 + im.fallSpeed * im.t
        : floating
          ? stuckY + (surfaceY - im.r * 1.1 - stuckY) * rise + bob
          : stuckY;

      if (!im.embed && !falling) continue;

      // Only the torch drags a tail (`drawTorch`) — a plain meteor tier
      // falls slowly enough on its own not to need one.
      if (im.kind === "torch") {
        const tailAlpha = falling ? 1 : Math.max(0, 1 - (im.t - im.fallLife) / TAIL_LIFE);
        if (tailAlpha > 0) drawTorchTail(ctx, l, x, y, im.r, tailAlpha);
      }

      // While it is still stuck, a low ember glow sells the "melted into the
      // skin" contact rather than a rock merely floating in front of it.
      if (!falling && !floating) halo(ctx, x, surfaceY, im.r * 1.1, PALETTE.ember, 0.22);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      drawTorchRock(ctx, im.r, falling || floating ? time : im.spawnTime);
      ctx.restore();
    }
  }

  /**
   * Whether a rock is still falling into, or lodged in, its crater at this x
   * — any embedding kind, sized by its own radius; a deflect never embeds, so
   * it never has a dent waiting on it. The hull draws a rock's dent only once
   * this goes false (`hull.ts`): the sim scars the columns half a second
   * before the rock is visibly there, and a hole that opens first reads as
   * the ship breaking by itself.
   */
  coversCrater(x: number, tile: number): boolean {
    for (const im of this.impacts) {
      if (!im.embed || im.t > stickStart(im)) continue;
      if (Math.abs(x - im.x0) < Math.max(im.r, tile * 0.6)) return true;
    }
    return false;
  }
}
