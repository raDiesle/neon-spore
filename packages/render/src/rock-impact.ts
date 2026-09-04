import { type CreatureKind, fallTilesPerBeat } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import {
  currentX,
  driftedOffscreen,
  floatSeconds,
  liftoffRise,
  stickStart,
  travelled,
} from "./rock-drift.js";
import { drawTorchRock, drawTorchTail, rockRadius, torchRotation } from "./torch.js";

/**
 * **The last step of a rock's fall, and what becomes of the rock after it.**
 * The simulation removes a body the same tick the beat's motion is computed,
 * so render/ never gets a frame to glide it through that final step; this
 * replays it at the speed every earlier beat had. A miss then sinks into the
 * skin and rolls off the field, a deflect hands its point to `DeflectFx` and
 * is gone. How it rolls off is `rock-drift.ts`.
 */

/** How long the torch's tail lasts once it is in the hull — long enough not
 * to blink out between two frames, short enough that it is gone by the time
 * anyone reads the crater: a rock lodged in the skin with a trail still
 * hanging off it reads as still falling, and there is no falling left to do. */
const TAIL_LIFE = 0.15;

interface Impact {
  kind: CreatureKind;
  /** Sinks in and drifts off once it arrives (a miss), or simply fires
   * `onArrive` and is gone (a deflect, which bounces by its own animation,
   * `DeflectFx`, and must not also embed here). */
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

/**
 * The last, biggest step of a rock's fall, replayed at the speed every
 * earlier beat had: the sim removes a creature the same tick its motion is
 * computed, so `creatures.ts` never gets a frame to glide it through that
 * final step (`fallTilesPerBeat`, sim/types.ts) — without this a fast rock
 * vanishes mid-air and reappears at the hull. `onArrive` fires only once the
 * replay actually reaches the hull's skin, not at the instant of impact.
 *
 * Every rock that misses sinks in and drifts off afterwards, sized by the
 * `span` it is handed (`rockRadius`); a deflected one never embeds — `onArrive`
 * fires its bounce (`DeflectFx`) and the impact is gone the same frame. While
 * stuck it rides the hull's own breathing motion via `skinAt` (`craters.ts`
 * uses the same query), not a fixed height above `Layout.hullY`.
 */
export class RockImpactFx {
  private impacts: Impact[] = [];

  /** Drop every impact still falling, stuck or rolling — for a restart,
   * else one would land on the new run's hull. See `Effects.reset`. */
  clear(): void {
    this.impacts.length = 0;
  }

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
    span: number,
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
      r: rockRadius(l, span),
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
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      const im = this.impacts[i]!;
      im.t += dt;
      // A drifting rock keeps drifting — accelerating the whole way
      // (`rock-drift.ts`) — until it is actually gone from view, not for some
      // fixed time regardless of where that leaves it. A non-embedding
      // impact (a deflect) has nothing left to draw once it has arrived.
      const done = !im.embed && im.arrived;
      if (done || driftedOffscreen(l, currentX(im))) this.impacts.splice(i, 1);
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
      // A deflected rock never sinks: the rule turns it at `shieldRow`, a
      // whole tile above the plating, and that is where its bounce starts.
      // Never *above* where the replay began, though — a rock the shield
      // answers on the last beat of all is already standing on the ship
      // (`hull.ts`), and a bounce a tile higher than the rock the player is
      // looking at is a jump, not a deflection.
      const arriveY = im.embed ? stuckY : Math.max(im.y0, surfaceY - l.tile);
      if (im.fallLife === 0) im.fallLife = Math.max(0.001, (arriveY - im.y0) / im.fallSpeed);
      const stuckAt = stickStart(im);

      // Still falling: the last step the sim never got to render, replayed
      // at the same speed so it reads as the same fall finishing.
      const falling = im.t < im.fallLife;
      if (!falling && !im.arrived) {
        im.arrived = true;
        // A miss reports the skin it broke — that is where its sparks and its
        // crater belong. A deflect reports where the rock actually stopped,
        // which is what `DeflectFx` bounces from.
        im.onArrive(x, im.embed ? surfaceY : arriveY);
      }

      const floating = im.t > stuckAt;
      const floatT = floatSeconds(im);
      const rise = liftoffRise(im);
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
      // The ember ring only for the one rock that carries a flame. Every tier
      // shares this body, and a grey meteor that grew an orange outline for
      // the last moments of its fall was this call handing the torch's ring
      // to all of them (`drawTorchRock`).
      drawTorchRock(ctx, im.r, falling || floating ? time : im.spawnTime, im.kind === "torch");
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
