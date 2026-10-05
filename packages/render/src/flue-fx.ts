import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { flueCentre } from "./flue-shape.js";
import { FlueVerdicts } from "./flue-verdicts.js";
import { HullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE FLUE leaves behind a frame: the **flash** at the sight as the
 * ember is met, the **flare** of the level's stud lighting, a scuff of grit
 * where a shot was spent on the flue, the plating's shudder as the flue goes
 * cold, and the bursts its other receipts throw.
 *
 * Everything else — where the ember is, which studs are lit, how many shots
 * are left — is read off the boss every frame (`flue-draw.ts`).
 *
 * **Both screens are thrown the same**: the pilot calls and the navigator
 * fires, and each has to see the shot land or not. The burst of a hit is at
 * the sight, where the ember was met; it says nothing the navigator's screen
 * should not know, since the sight is where every hit is.
 *
 * **A level cleared is a step landed**, and deals the flue the blow every
 * boss takes (`boss-hurt.ts`). A shot spent deals nothing to it; the third
 * one's blow at the hull is the boss's own (`flue-blow.ts`). Which shot was
 * right is `verdicts` (`flue-verdicts.ts`). Everything is cleared in
 * `Effects.reset()` (`restart.test.ts`).
 */

/** How strong the plating's shudder is as the flue goes cold, and how long, in beats. */
const SPENT_FORCE = 0.8;
const SPENT_BEATS = 1.2;
/** How fast a hit's flash and a stud's flare fade, per second. */
const FLASH_DECAY = 3;
const FLARE_DECAY = 2;

export class FlueFx {
  private flashNow = 0;
  private flareNow = 0;
  /** The shudder down the plating as the flue is spent. */
  readonly shock = new HullShock();
  /** The blow a level cleared deals the flue. */
  readonly hurt = new BossHurt();
  /** Was the last shot at the sight right (`flue-verdicts.ts`). */
  readonly verdicts = new FlueVerdicts();

  /** How bright the flash at the sight a hit left still is, 0..1. */
  get flash(): number {
    return this.flashNow;
  }

  /** How bright the flare on the stud of the level just cleared still is, 0..1. */
  get flare(): number {
    return this.flareNow;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    this.verdicts.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("flue")) continue;
      const mid = flueCentre(l, cfg);
      switch (e.type) {
        case "flueEnter":
          burst(mid.x, mid.y, 12, PALETTE.flueSoot);
          break;
        case "flueLight":
          burst(mid.x, mid.y, 4, PALETTE.hullRim);
          break;
        case "flueHit":
          burst(fieldX(l, e.col), mid.y, 16, PALETTE.hullRim);
          this.flashNow = 1;
          this.flareNow = 1;
          this.hurt.hit();
          break;
        case "flueMiss":
          // The shot spent on the flue's underside: a scuff of grit, nothing more.
          burst(fieldX(l, e.col), mid.y + 0.4 * l.tile, 5, PALETTE.rockDark);
          break;
        case "flueSpent":
          burst(mid.x, mid.y, 24, PALETTE.flueSoot);
          burst(mid.x, mid.y, 10, PALETTE.hullRim);
          this.shock.strike(beatSeconds * SPENT_BEATS, SPENT_FORCE);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    this.flareNow = Math.max(0, this.flareNow - FLARE_DECAY * step);
    this.shock.update(dt);
    this.hurt.update(dt);
    this.verdicts.update(dt);
  }

  clear(): void {
    this.flashNow = 0;
    this.flareNow = 0;
    this.shock.clear();
    this.hurt.clear();
    this.verdicts.clear();
  }
}
