import type { SimConfig, SimEvent, World } from "@neon-spore/sim";
import { ClaspBreakFx } from "./clasp-break.js";
import { ClaspStrikeFx } from "./clasp-strike.js";
import { GhostReleaseFx } from "./ghost-release.js";
import type { Layout } from "./layout.js";
import { LureVanishFx } from "./lure-vanish.js";
import { VeilTearFx } from "./veil-tear.js";

/**
 * The transients that belong to **one body** and outlive it by less than a
 * beat: a lure folding to a point, the ward's bolts reaching up a column, a
 * clasp's shield blinking out, a veil's cloud tearing open on the body inside
 * it, a ghost letting go and climbing out of the top of the field.
 *
 * Split out of `effects.ts` when the second one arrived and that file went
 * over its 250-line limit — the same reason `effects-spark.ts` and
 * `effects-breach.ts` sit beside it. The seam is not merely a place to cut:
 * everything else `Effects` holds is either a property of the ship (the maw's
 * echo, the guard's banner), a property of a boss, or a particle system shared
 * by the whole field. These are none of those. Each is a short picture of one
 * creature's last moment, spawned from one event, drawn under the hull, and
 * dropped on a restart — four verbs they agree on completely, which is what
 * makes one object out of four.
 *
 * **Two draw calls, not one.** A lure is gone, so its picture is frozen at the
 * place it was and needs nothing but a canvas — and so is a torn veil, for the
 * same reason and by the same test. The two clasp transients are
 * about a body that is still falling and have to be redrawn around wherever it
 * is this frame, so they take the layout, the world and the beat phase. That
 * is the seam, and it is the reason the split is a signature difference rather
 * than a filing preference.
 *
 * All four are *pure render*: the simulation has already finished with the
 * body by the time any of them starts, so nothing here is ever read back into
 * a world, and nothing in a world can be recovered from it.
 */
export class BodyTransients {
  private lureVanish = new LureVanishFx();
  private claspBreak = new ClaspBreakFx();
  private claspStrike = new ClaspStrikeFx();
  private veilTear = new VeilTearFx();
  private ghostRelease = new GhostReleaseFx();

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, beatSeconds: number): void {
    this.lureVanish.ingest(events, l);
    this.claspBreak.ingest(events, cfg, beatSeconds);
    this.claspStrike.ingest(events);
    this.veilTear.ingest(events, l);
    this.ghostRelease.ingest(events, l);
  }

  update(dt: number): void {
    this.lureVanish.update(dt);
    this.claspBreak.update(dt);
    this.claspStrike.update(dt);
    this.veilTear.update(dt);
    this.ghostRelease.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.lureVanish.draw(ctx);
    // A cloud tearing open, frozen where it happened for the same reason the
    // lure's fold is: the body is gone from the world by the time this draws,
    // so there is nothing left to redraw it around.
    this.veilTear.draw(ctx);
    // A ghost climbing out of the top of the field, frozen to nothing but a
    // canvas for the same reason: the body is gone from the world by the time
    // this draws, and where it is going is the picture rather than the world.
    this.ghostRelease.draw(ctx);
  }

  /** The two that are drawn around a body the world still has. */
  drawOnBodies(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    // The strike first, the shell coming apart over it: the bolt arrives and
    // then the thing it hit fails, which is the order the pair caused.
    this.claspStrike.draw(ctx, l, world, beatPhase);
    this.claspBreak.draw(ctx, l, world, beatPhase);
  }

  /**
   * For a restart. `world.nextId` starts again at 0 with a new world, so a
   * transient left standing here would be read by the next run as its own
   * body's — the rule `Effects.reset()` exists for, and which
   * `restart.test.ts` fails on if a new field is added and not cleared.
   */
  clear(): void {
    this.lureVanish.clear();
    this.claspBreak.clear();
    this.claspStrike.clear();
    this.veilTear.clear();
    this.ghostRelease.clear();
  }
}
