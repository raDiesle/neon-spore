import {
  blisterGestureOf,
  blisterIsUp,
  blisterWayOf,
  type Creature,
  type SimEvent,
  type World,
} from "@neon-spore/sim";
import { drawBlisterRisen, poreY } from "./blister.js";
import { BLISTER_DEATH, type BlisterDeathPlay, type BlisterDying } from "./blister-death.js";
import { BLISTER_WAY, drawBlisterHelpOf } from "./blister-help.js";
import type { Body } from "./creature-body-in.js";
import { flatCenter, flatRadius } from "./creature-place.js";
import { depthScale, nearness } from "./depth.js";
import type { Layout } from "./layout.js";
import { killSeed } from "./tile-seed.js";

/**
 * **A blister's death, played out on the body it was** (`blister-death.ts`).
 *
 * The blow that knocks a blister out takes it off the field on the same tick,
 * so on the frame the `destroy` arrives there is no body left to draw. Every
 * frame therefore keeps each blister that is up — the creature itself, which
 * the simulation lets go of and never touches again, and where it stood — and
 * a kill whose control has a death of its own takes that record and draws it
 * through the death for its `life`. Keyed by id and emptied with every other
 * transient on a restart, when ids start again (`restart.test.ts`).
 *
 * On the shipped field every record's `play` is null, so nothing is kept
 * playing and this draws nothing: what it costs there is one map entry per
 * blister up.
 */
export class BlisterDeathFx {
  private readonly seen = new Map<number, Seen>();
  private dying: Dying[] = [];
  /** The wall clock, counted here: a body's wobble keeps going while it dies. */
  private time = 0;
  private frame = 0;

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type !== "destroy" || e.kind !== "blister" || e.id === undefined) continue;
      const play = e.gesture ? BLISTER_DEATH[e.gesture].play : null;
      const seen = this.seen.get(e.id);
      if (!play || !seen) continue;
      this.seen.delete(e.id);
      this.dying.push({ ...seen, play, age: 0, seed: killSeed(e) });
    }
  }

  update(dt: number): void {
    this.time += dt;
    for (const d of this.dying) d.age += dt;
    this.dying = this.dying.filter((d) => d.age < d.play.life);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    this.remember(l, world, beatPhase);
    for (const d of this.dying) d.play.draw(this.dyingOf(ctx, l, world, beatPhase, d));
  }

  clear(): void {
    this.seen.clear();
    this.dying = [];
    this.time = 0;
    this.frame = 0;
  }

  /** Every blister up this frame, kept where it stands; one gone under is let go. */
  private remember(l: Layout, world: World, beatPhase: number): void {
    const frame = ++this.frame;
    for (const c of world.creatures) {
      if (c.kind !== "blister" || !blisterIsUp(c)) continue;
      const { x, y } = flatCenter(l, c, beatPhase);
      this.seen.set(c.id, {
        c,
        x,
        y,
        r: flatRadius(l, world.cfg, c, beatPhase),
        k: depthScale(world.cfg, l, c.row),
        near: nearness(l, c.row),
        frame,
      });
    }
    for (const [id, s] of this.seen) if (s.frame !== frame) this.seen.delete(id);
  }

  private dyingOf(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    world: World,
    beatPhase: number,
    d: Dying,
  ): BlisterDying {
    const { c, x, y, r, k } = d;
    const time = this.time;
    const b: Body = {
      ...{ ctx, l, world, c, x, y, time, beatPhase, near: d.near },
      beats: world.beat + beatPhase,
      blocked: NONE_BLOCKED,
      turn: 1,
    };
    return {
      ctx,
      x,
      y,
      r: r * k,
      poreY: poreY(y, r * k),
      gesture: blisterGestureOf(c),
      way: BLISTER_WAY[blisterWayOf(c)],
      spin: c.blisterWay === "ccw" ? -1 : 1,
      age: d.age,
      at: Math.min(1, d.age / d.play.life),
      seed: d.seed,
      tile: l.tile,
      time,
      body: (h, bend) => {
        // In the perspective transform the field draws a body in, about its
        // middle (`creatures.ts`); the bend inside it, and never on the pore.
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(k, k);
        ctx.translate(-x, -y);
        drawBlisterRisen(b, r, h, bend ?? still);
        ctx.restore();
      },
      control: (alpha, bend) => {
        if (alpha <= 0) return;
        ctx.save();
        bend?.(ctx);
        drawBlisterHelpOf(ctx, l, world, c, beatPhase, time, Math.min(1, alpha));
        ctx.restore();
      },
    };
  }
}

/** A blister up on the last frame drawn, and where. */
interface Seen {
  readonly c: Creature;
  readonly x: number;
  readonly y: number;
  readonly r: number;
  /** The depth scale its row was drawn at, and its nearness. */
  readonly k: number;
  readonly near: number;
  readonly frame: number;
}

interface Dying extends Seen {
  readonly play: BlisterDeathPlay;
  readonly seed: number;
  age: number;
}

const NONE_BLOCKED: ReadonlyMap<number, number> = new Map();

/** No bend: a body drawn as it stood, and never through a glance — the glance
 * a living body turns by went with it (`forgetGlances`). */
function still(): void {}
