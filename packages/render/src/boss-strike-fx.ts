import type { BossKind, SimConfig } from "@neon-spore/sim";
import { strikeFrom, strikeLook } from "./boss-strike-look.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **A boss's blow at the hull, from the breach to the withdrawal.**
 *
 * The render half of `sim/boss-strike.ts`. A `breach` that names its boss
 * (`by`) is not a rock, so `ingestBreach` hands it here instead of to
 * `rock-impact.ts`, and this holds it for the fraction of a second the blow
 * takes to reach the hull: the sparks, and the crack the scar draws
 * (`arrivals.ts`), wait for it to land exactly as they waited for the rock.
 * What it looks like is `boss-strike-look.ts`.
 *
 * Drawn over the finished hull (`frame-on-ship.ts`), where the other bosses'
 * hull shocks are: the blow strikes the ship, so it is in front of it.
 */

interface Strike {
  by: BossKind;
  /** Which of the boss's blows, when it has more than one. */
  blow: string | undefined;
  col: number;
  age: number;
  /** Seconds out to the hull, then seconds pulling back. */
  out: number;
  back: number;
  arrive: ((x: number, y: number) => void) | null;
}

/** A blow reaches the hull in half a beat and never slower than this. */
const OUT_MAX = 0.24;
/** And withdraws over this long once it has. */
const BACK = 0.4;

export class BossStrikeFx {
  private strikes: Strike[] = [];

  spawn(
    by: BossKind,
    col: number,
    beatSeconds: number,
    arrive: (x: number, y: number) => void,
    blow?: string,
  ): void {
    const out = Math.min(OUT_MAX, beatSeconds * 0.5);
    this.strikes.push({ by, blow, col, age: 0, out, back: BACK, arrive });
  }

  update(dt: number, l: Layout): void {
    for (const s of this.strikes) {
      s.age += dt;
      if (s.arrive && s.age >= s.out) {
        s.arrive(tileCX(l, s.col), l.hullY);
        s.arrive = null;
      }
    }
    this.strikes = this.strikes.filter((s) => s.age < s.out + s.back);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    cfg: SimConfig,
    surfaceY: (x: number) => number,
    time: number,
  ): void {
    for (const s of this.strikes) {
      const x = tileCX(l, s.col);
      strikeLook(s.by)(ctx, {
        l,
        blow: s.blow,
        from: strikeFrom(l, cfg, s.by),
        to: { x, y: surfaceY(x) },
        reach: Math.min(1, s.age / s.out),
        after: Math.max(0, Math.min(1, (s.age - s.out) / s.back)),
        tile: l.tile,
        time,
      });
    }
  }

  /** Whether a blow is still on screen, for the tests. */
  get active(): number {
    return this.strikes.length;
  }

  clear(): void {
    this.strikes = [];
  }
}
