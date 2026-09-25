import { type CreatureKind, fallTilesPerBeat } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCY } from "./layout.js";
import { drawRockBody, wearsRockLook } from "./meteor.js";
import { PALETTE } from "./palette.js";
import {
  currentX,
  driftedOffscreen,
  liftoffRise,
  stickStart,
  sunkIn,
  travelled,
} from "./rock-drift.js";
import { rockFallY } from "./rock-fall.js";
import type { Impact } from "./rock-impact-state.js";
import { RockScuffs, scuffStep } from "./rock-scuffs.js";
import { rockRadius, torchRotation } from "./rock-size.js";
import { drawTorchRock, drawTorchTail } from "./torch.js";

/**
 * **The last step of a rock's fall, and what becomes of the rock after it.**
 * A miss hits, sinks into the skin and rolls off the field; a deflect hands
 * its point to `DeflectFx` and is gone. When it sinks, lets go and how fast it
 * rolls is `rock-drift.ts`; the marks it leaves on the way, `rock-scuffs.ts`.
 */

/** How long the torch's tail lasts once it is in the hull — long enough not
 * to blink out between two frames, short enough that it is gone by the time
 * anyone reads the crater: a rock lodged in the skin with a trail still
 * hanging off it reads as still falling, and there is no falling left to do. */
const TAIL_LIFE = 0.15;

/**
 * The last, biggest step of a rock's fall, replayed at the speed every
 * earlier beat had: the sim removes a creature the same tick its motion is
 * computed, so `creatures.ts` never gets a frame to glide it through that
 * final step (`fallTilesPerBeat`, sim/types.ts) — without this a fast rock
 * vanishes mid-air and reappears at the hull. `onArrive` fires the frame the
 * replay *touches* the hull's skin — the hit, with the hole, the sparks and
 * the crack — and the rock is pressed into its hole after that, not before.
 *
 * Every rock that misses sinks in and drifts off afterwards, sized by the
 * `span` it is handed (`rockRadius`); a deflected one never embeds — `onArrive`
 * fires its bounce (`DeflectFx`) and the impact is gone the same frame. While
 * stuck it rides the hull's own breathing motion via `skinAt` (`craters.ts`
 * uses the same query), not a fixed height above `Layout.hullY`.
 */
export class RockImpactFx {
  private impacts: Impact[] = [];
  private scuffs = new RockScuffs();

  /** Drop every impact still falling, stuck or rolling — for a restart,
   * else one would land on the new run's hull. See `Effects.reset`. */
  clear(): void {
    this.impacts.length = 0;
    this.scuffs.clear();
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
    /** False for a torch that did not fall here but was thrown
     * (`coil-flight.ts`): its streak is that transient's to draw. */
    tail = true,
    seed = 0,
    holes = 0,
  ): void {
    const mid = l.gridLeft + l.gridWidth / 2;
    const fallTiles = fallTilesPerBeat(kind);
    this.impacts.push({
      kind,
      seed,
      holes,
      embed,
      x0: x,
      y0: tileCY(l, fromRow),
      fromRow,
      fallSpeed: (fallTiles * l.tile) / beatSeconds,
      r: rockRadius(l, span),
      dir: x < mid ? -1 : 1,
      rotation0: torchRotation(x),
      spawnTime: time,
      fallLife: 0,
      t: 0,
      onArrive,
      arrived: false,
      tail,
      scuffed: 0,
    });
  }

  update(dt: number, l: Layout): void {
    this.scuffs.update(dt);
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      const im = this.impacts[i]!;
      im.t += dt;
      // A rolling rock is kept until it is out of view, not for a fixed time;
      // a deflect has nothing left to draw once it has arrived.
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
    this.scuffs.draw(ctx, skinAt);
    for (const im of this.impacts) {
      const x = currentX(im);
      const surfaceY = skinAt(x);
      // Touching the skin, and sunk half its radius into it — exactly the
      // crater's own depth, so it sits in the hole it made.
      const contactY = surfaceY - im.r;
      const stuckY = surfaceY - im.r * 0.5;
      // Where the field pass left it, on the bent last rows of its fall
      // (`rock-fall.ts`). A rock that has already landed — the sim breaks the
      // hull on the beat *after* the one it is drawn coming down
      // (`sim/hull.ts`) — is touching the skin, and its replay is then no fall
      // at all: the hole, the sparks and the crack all show on its first frame.
      if (im.fallLife === 0) {
        im.y0 = rockFallY(l, im.fromRow, im.y0, contactY);
        if (im.embed) im.y0 = Math.min(im.y0, contactY);
      }
      // A deflected rock never sinks: the rule turns it at `shieldRow`, a
      // whole tile above the plating, and that is where its bounce starts.
      // Never *above* where the replay began, though — a rock the shield
      // answers on the last beat of all is already standing on the ship
      // (`hull.ts`), and a bounce a tile higher than the rock the player is
      // looking at is a jump, not a deflection.
      const arriveY = im.embed ? contactY : Math.max(im.y0, surfaceY - l.tile);
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

      const rolling = im.t > stuckAt;
      const rise = liftoffRise(im);
      // It came down without turning (`drawTorch`) and lands the same way up
      // it fell. Leaving, it *rolls like a ball*: the turn is its travel over
      // its own radius — the arc a wheel that size covers going that far — so
      // it turns slowly while it is tipping out of its hole and spins up as
      // it runs away (`rock-drift.ts`).
      const roll = (im.dir * travelled(im)) / im.r;

      // Driven into its hole the instant it hits (`sunkIn`), and riding the
      // same surface point, so the ship's motion carries it while stuck.
      // Letting go, it climbs out onto the skin and rolls on it: its centre a
      // radius off the skin along the dome's own normal, touching it at `x`,
      // never hovering over it.
      let cx = x;
      let y = contactY + (stuckY - contactY) * sunkIn(im);
      if (falling) y = im.y0 + im.fallSpeed * im.t;
      else if (rolling) {
        const slope = (skinAt(x + 2) - skinAt(x - 2)) / 4;
        const k = Math.hypot(1, slope);
        cx = x + ((slope * im.r) / k) * rise;
        y = stuckY + (surfaceY - im.r / k - stuckY) * rise;
        // A mark each step of the roll once it is out of its hole — where the
        // step fell on its path, not where the frame happened to catch it.
        const step = scuffStep(im.r);
        while (rise >= 1 && travelled(im) >= (im.scuffed + 1) * step) {
          im.scuffed += 1;
          const tint = im.kind === "torch" ? PALETTE.ember : PALETTE.rock;
          this.scuffs.add(
            im.x0 + im.dir * im.scuffed * step,
            im.dir,
            im.r,
            tint,
            im.seed * 31 + im.scuffed,
          );
        }
      }

      if (!im.embed && !falling) continue;

      // Only the torch drags a tail (`drawTorch`) — a plain meteor tier
      // falls slowly enough on its own not to need one.
      if (im.kind === "torch" && im.tail) {
        const tailAlpha = falling ? 1 : Math.max(0, 1 - (im.t - im.fallLife) / TAIL_LIFE);
        if (tailAlpha > 0) drawTorchTail(ctx, l, x, y, im.r, tailAlpha);
      }

      // While it is still stuck, a low ember glow sells the "melted into the
      // skin" contact rather than a rock merely floating in front of it.
      if (!falling && !rolling) halo(ctx, x, surfaceY, im.r * 1.1, PALETTE.ember, 0.22);

      // Its shape holds still from the moment it lands: the roll turns it
      // from there, and a rock whose facets also wobbled while it rolled
      // would read as melting rather than turning.
      const clock = falling ? time : im.spawnTime + im.fallLife;
      // A plain rock is the same rock it was on the field — `drawRockBody`,
      // by its own seed and craters, spinning as it spun — so nothing changes
      // about it at the hull but where it is. The torch keeps its own draw and
      // its ember ring, which no other tier carries (`drawTorchRock`).
      if (wearsRockLook(im.kind)) {
        drawRockBody(ctx, cx, y, im.r, clock, im.seed, im.holes, undefined, undefined, roll);
        continue;
      }
      ctx.save();
      ctx.translate(cx, y);
      ctx.rotate(im.rotation0 + roll);
      drawTorchRock(ctx, im.r, clock, im.kind === "torch");
      ctx.restore();
    }
  }

  /**
   * Whether a rock is still *falling into* its crater at this x — any
   * embedding kind, sized by its own radius; a deflect never embeds, so it
   * never has a dent waiting on it. The hull draws a rock's dent only once
   * this goes false (`hull.ts`): the sim scars the columns before a rock
   * still in the air is visibly there, and a hole that opens first reads as
   * the ship breaking by itself. It stops covering the frame the rock
   * arrives, not when it lifts off: the hole is what the rock made, so it is
   * seen the instant the rock is seen in it, with the rock drawn over the
   * hull inside it. A hole kept shut under a stuck rock opened only as the
   * rock left, which read as the ship breaking *after* the hit.
   */
  coversCrater(x: number, tile: number): boolean {
    for (const im of this.impacts) {
      if (!im.embed || im.arrived) continue;
      if (Math.abs(x - im.x0) < Math.max(im.r, tile * 0.6)) return true;
    }
    return false;
  }
}
