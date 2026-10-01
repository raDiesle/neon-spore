import { beatSeconds, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { Arrivals } from "./arrivals.js";
import { ingestBreach } from "./effects-breach.js";
import type { Layout } from "./layout.js";
import { RockImpactFx } from "./rock-impact.js";
import { Sparks } from "./sparks.js";

/**
 * **The rock a whole-picture round brings down on its own hull** when its
 * window runs out (`roundStrikesHull`, `sim/boss-strike.ts`).
 *
 * The round's frame returns before `canvas2d.ts` ingests anything
 * (`canvas2d-takeover.ts`), so the field never saw that breach — and the field
 * never draws it later either: a round holds its picture until the next wave,
 * and the wave changing is what wipes `Effects` (`render-state.ts`). So the
 * round draws it, on the real hull it already draws, with the field's own
 * pieces: the same fall replay, the same sparks off the crater's rim, and the
 * scar and crack held back until the rock is down, as the field holds them
 * (`frame-ship.ts`). The fall starts from row 0 and takes its 1.5 s at
 * `meteorFastest`; the verdict holds the picture longer than that, so it lands
 * in view.
 *
 * `pending` is every crack this round's hits will open, and `arrivals` the ones
 * whose rock is down; a crack from before the round is in neither and shows.
 * Fed from the takeover only — the rehearsal's seat strikes no hull.
 */
export class RoundHit {
  readonly rock = new RockImpactFx();
  readonly sparks = new Sparks();
  readonly arrivals = new Arrivals();
  readonly pending = new Arrivals();

  ingest(events: readonly SimEvent[], l: Layout, time: number, cfg: SimConfig): void {
    for (const e of events) {
      if (e.type !== "breach" || e.round === undefined) continue;
      this.pending.mark(Math.round(e.col - (e.span - 1) / 2), e.span, e.beat);
      ingestBreach(e, l, time, beatSeconds(cfg), {
        burst: (x, y, n, hex) => this.sparks.burst(x, y, n, hex),
        rockImpactFx: this.rock,
        arrivals: this.arrivals,
      });
    }
  }

  update(dt: number, l: Layout): void {
    this.rock.update(dt, l);
    this.sparks.update(dt);
  }

  /** `drawHull`'s `craterVisible`: no hole under a rock still in the air. */
  craterShown(l: Layout): (x: number) => boolean {
    return (x) => !this.rock.coversCrater(x, l.tile);
  }

  /** `drawHull`'s `crackArrived`: a crack of this round's waits for its rock. */
  crackShown(): (col: number, beat: number) => boolean {
    return (col, beat) => !this.pending.has(col, beat) || this.arrivals.has(col, beat);
  }

  /** Over the hull: the rock on the skin it lands in, then its sparks. */
  draw(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    time: number,
    skinAt: (x: number) => number,
  ): void {
    this.rock.draw(ctx, l, time, skinAt);
    this.sparks.draw(ctx);
  }

  clear(): void {
    this.rock.clear();
    this.sparks.clear();
    this.arrivals.clear();
    this.pending.clear();
  }
}
