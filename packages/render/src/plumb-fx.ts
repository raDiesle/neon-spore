import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { plumbCoreAt, plumbGlass, plumbHook } from "./plumb-shape.js";

/**
 * What THE PLUMB leaves behind a frame: a weight's **settle** ringing its
 * glass, a **drift**'s jolt through it, the core's **hit** flash and the
 * **free** swing's release, and the bursts its four silent receipts throw.
 *
 * Everything else — the beam's skew, each ball's rest, the sac's turn and the
 * core's own size and brightness — is read off the boss every frame
 * (`plumb-draw.ts`, `plumb-pose.ts`).
 *
 * **A weight settling true and a shot landing are sequences landed**, so both
 * deal the bob the blow every boss takes (`boss-hurt.ts`). A drift, a swing
 * run out and the free release deal nothing — they are not a blow, they are
 * the window closing.
 *
 * The core's colour is the lit step's and not in `plumbHit`, so the drawer
 * tells it every frame (`tell`), THE VISE's way. Nothing here shakes the hull
 * plating: only `plumbMiss` strikes the hull (`plumb-step.ts`), already given
 * its own look (`plumb-blow.ts`). Everything is cleared in `Effects.reset()`
 * (`restart.test.ts`).
 */

const SETTLE_DECAY = 3;
const DRIFT_DECAY = 7;
const HIT_DECAY = 3;
const FREE_DECAY = 1.5;

export class PlumbFx {
  private readonly settleNow: [number, number] = [0, 0];
  private readonly driftNow: [number, number] = [0, 0];
  private hitNow = 0;
  private freeNow = 0;
  private coreHex: string = PALETTE.plumbGlass;
  /** The blow a weight settling true or a shot landing deals the bob. */
  readonly hurt = new BossHurt();

  /** How bright glass `side`'s settle ring still is, 0..1. */
  settle(side: 0 | 1): number {
    return this.settleNow[side];
  }

  /** How hard glass `side` is still jolted by a drift, 0..1. */
  drift(side: 0 | 1): number {
    return this.driftNow[side];
  }

  /** The core hit's flash, still bright, 0..1. */
  get hit(): number {
    return this.hitNow;
  }

  /** The free swing's release, still bright, 0..1. */
  get free(): number {
    return this.freeNow;
  }

  /** The drawer's word for the colour the core is lit, which `plumbHit` does not carry. */
  tell(coreHex: string): void {
    this.coreHex = coreHex;
  }

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, burst: Burst): void {
    const hook = plumbHook(l, cfg);
    const core = plumbCoreAt(l, hook, 0);
    for (const e of events) {
      if (!e.type.startsWith("plumb")) continue;
      switch (e.type) {
        case "plumbSettle": {
          const g = plumbGlass(l, e.side);
          burst(hook.x + g.x, hook.y + g.y, 6 + 3 * e.level, PALETTE.plumbGlass);
          this.settleNow[e.side] = 1;
          this.hurt.hit();
          break;
        }
        case "plumbDrift": {
          const g = plumbGlass(l, e.side);
          burst(hook.x + g.x, hook.y + g.y, 5, PALETTE.plumbBronze);
          this.driftNow[e.side] = 1;
          break;
        }
        case "plumbHit":
          burst(core.x, core.y, 8 + 6 * e.hits, this.coreHex);
          this.hitNow = 1;
          this.hurt.hit();
          break;
        case "plumbFree":
          burst(core.x, core.y, 16, PALETTE.plumbBronze);
          this.freeNow = 1;
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    for (const side of [0, 1] as const) {
      this.settleNow[side] = Math.max(0, this.settleNow[side] - SETTLE_DECAY * step);
      this.driftNow[side] = Math.max(0, this.driftNow[side] - DRIFT_DECAY * step);
    }
    this.hitNow = Math.max(0, this.hitNow - HIT_DECAY * step);
    this.freeNow = Math.max(0, this.freeNow - FREE_DECAY * step);
    this.hurt.update(dt);
  }

  clear(): void {
    this.settleNow[0] = 0;
    this.settleNow[1] = 0;
    this.driftNow[0] = 0;
    this.driftNow[1] = 0;
    this.hitNow = 0;
    this.freeNow = 0;
    this.coreHex = PALETTE.plumbGlass;
    this.hurt.clear();
  }
}
