import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { ClaspBreakFx } from "./clasp-break.js";
import type { Layout } from "./layout.js";
import { LureVanishFx } from "./lure-vanish.js";

/**
 * The transients that belong to **one body** and outlive it by less than a
 * beat: a lure folding to a point, a clasp's shield blinking out.
 *
 * Split out of `effects.ts` when the second one arrived and that file went
 * over its 250-line limit — the same reason `effects-spark.ts` and
 * `effects-breach.ts` sit beside it. The seam is not merely a place to cut:
 * everything else `Effects` holds is either a property of the ship (the maw's
 * echo, the guard's banner), a property of a boss, or a particle system shared
 * by the whole field. These two are neither. Each is a short picture of one
 * creature's last moment, spawned from one event, drawn under the hull, and
 * dropped on a restart — four verbs the pair of them agree on completely,
 * which is what makes one object out of two.
 *
 * Both are *pure render*: the simulation has already finished with the body by
 * the time either of these starts, so nothing here is ever read back into a
 * world, and nothing in a world can be recovered from it.
 */
export class BodyTransients {
  private lureVanish = new LureVanishFx();
  private claspBreak = new ClaspBreakFx();

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, beatSeconds: number): void {
    this.lureVanish.ingest(events, l);
    this.claspBreak.ingest(events, l, cfg, beatSeconds);
  }

  update(dt: number): void {
    this.lureVanish.update(dt);
    this.claspBreak.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.lureVanish.draw(ctx);
    this.claspBreak.draw(ctx);
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
  }
}
