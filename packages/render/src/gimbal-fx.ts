import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { gimbalCentre } from "./gimbal-shape.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE GIMBAL leaves behind a frame: the **kick** of the whole cradle as
 * a tooth shears off it, the **shake** of a ring that had true and lost it,
 * the **glare** of the seam letting go into the hull, and the bursts its ten
 * receipts throw.
 *
 * Everything else — where each ring stands, which teeth are left, how far the
 * hatch has swung — is read off the boss every frame (`gimbal-draw.ts`).
 * These are here for THE FILAMENT's reason: a shear is one tick in the
 * simulation, and a rim that simply had one tooth fewer on the next frame
 * would be a bookkeeping entry rather than something coming off under load.
 *
 * **The events of this family are read here, above the loop**, the way THE
 * INSTAR's and THE FILAMENT's are, rather than as rows in a spark table at
 * its limit (`effects-spark-silent-boss-b.ts` keeps the rows, for the reason
 * written over them). Everything is cleared in `Effects.reset()`
 * (`restart.test.ts`).
 *
 * **A tooth pair sheared is a sequence landed** — both rings held true for
 * the count — and so is the hatch, so both deal the drum the blow every boss
 * takes (`boss-hurt.ts`). Coming true deals nothing.
 */

const KICK_TILES = 0.2;
const KICK_DECAY = 9;
const SHAKE_DECAY = 5;
const GLARE_DECAY = 4;

export class GimbalFx {
  private kickNow = 0;
  private shakeNow = 0;
  private glareNow = 0;
  /** The blow a tooth pair sheared deals the drum. */
  readonly hurt = new BossHurt();

  /** How far the cradle is thrown right now, in tiles. */
  get kick(): number {
    return this.kickNow;
  }

  /** How hard the rings are rocking after a slip, 0..1. */
  get shake(): number {
    return this.shakeNow;
  }

  /** How much the seam's own light is washing the frame, 0..1. */
  get glare(): number {
    return this.glareNow;
  }

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, burst: Burst): void {
    const at = gimbalCentre(l, cfg);
    for (const e of events) {
      switch (e.type) {
        case "gimbalEnter":
          burst(at.x, at.y, 14, PALETTE.rock);
          break;
        // An alignment lighting is the quietest of the ten on purpose: the
        // marks are drawn, and a burst over them would be a second thing
        // saying the same at the moment the pair has to start talking.
        case "gimbalMarks":
          burst(at.x, at.y, 4, PALETTE.hullRim);
          break;
        case "gimbalTrue":
          burst(at.x, at.y, 8, PALETTE.hullRim);
          break;
        case "gimbalSlip":
          burst(at.x, at.y, 5, PALETTE.rockDark);
          this.shakeNow = 1;
          break;
        case "gimbalShear":
          burst(at.x, at.y, 16, PALETTE.hullRim);
          this.kickNow = KICK_TILES;
          this.hurt.hit();
          break;
        case "gimbalLeak":
          burst(at.x, at.y, 10, PALETTE.red);
          break;
        // The seam's own two: it leaves the drum at the drum, and it arrives
        // at the hull in the column it has been running down all along.
        case "gimbalSeamOut":
          burst(at.x, at.y, 8, PALETTE.cyan);
          break;
        case "gimbalSeamHit":
          burst(tileCX(l, e.col), tileCY(l, cfg.rows - 1), 20, PALETTE.red);
          this.glareNow = 1;
          break;
        case "gimbalHatch":
          burst(at.x, at.y, 26, PALETTE.wispRim);
          this.kickNow = KICK_TILES * 1.6;
          this.hurt.hit();
          break;
        case "gimbalOut":
          burst(at.x, at.y, 30, PALETTE.wisp);
          break;
        default:
          break;
      }
    }
  }

  /** The kick settled, the rocking stilled, the glare gone off the frame. */
  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.kickNow = Math.max(0, this.kickNow - this.kickNow * KICK_DECAY * step);
    if (this.kickNow < 0.002) this.kickNow = 0;
    this.shakeNow = Math.max(0, this.shakeNow - this.shakeNow * SHAKE_DECAY * step);
    if (this.shakeNow < 0.002) this.shakeNow = 0;
    this.glareNow = Math.max(0, this.glareNow - this.glareNow * GLARE_DECAY * step);
    if (this.glareNow < 0.002) this.glareNow = 0;
    this.hurt.update(dt);
  }

  clear(): void {
    this.kickNow = 0;
    this.shakeNow = 0;
    this.glareNow = 0;
    this.hurt.clear();
  }
}
