import { type SimConfig, type SimEvent, SPOOL_RIBS } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { GripVerdicts } from "./grip-verdict.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { spoolStoryBurst } from "./spool-fx-story.js";
import { type SpoolPose, spoolHome, spoolRibX, spoolSide } from "./spool-shape.js";

/**
 * What THE SPOOL leaves behind a frame: the **shudder** of the casing when the
 * line slips its zone, the **jolt** of the axle dropping as a rib lets its
 * band go, the **glare** of the whole winding coming loose at once, and the
 * bursts its receipts throw.
 *
 * Everything else — how fast the line runs, how deep the thumb has the brake,
 * where the line is against its zone, how many ribs are left — is read off
 * the boss every frame (`spool-draw.ts`, `spool-pose.ts`). These three are
 * here for `gimbal-fx.ts`' reason: a slip is one tick in the simulation, and
 * a spool that simply went on turning the next frame would be a rule being
 * enforced rather than a line snatched short.
 *
 * **The events of this family are read here, above the loop**, the way THE
 * GIMBAL's are, rather than as rows in a spark table at its limit
 * (`effects-spark-silent-boss-b.ts` keeps the rows, for the reason written
 * over them). The grip and the let-go throw no burst: the brake's own knob
 * lights under the thumb, and a burst over the casing would say more than a
 * hand. Everything is cleared in `Effects.reset()` (`restart.test.ts`).
 *
 * **The knob is judged like every mark** (`grip-verdict.ts`): the grip washes
 * it green, the navigator's refused press red (`spoolRefuse`). One mark, so one
 * key (`spool-brake.ts`).
 *
 * **A rib eased is a sequence landed** — a whole movement held in its zone —
 * and so is the last, so both deal the body the blow every boss takes
 * (`boss-hurt.ts`). A leg is only a part of one, and deals nothing.
 */

const SHUDDER_DECAY = 6;
const JOLT_TILES = 0.2;
const JOLT_DECAY = 8;
const GLARE_DECAY = 3;

/** The one key the brake's verdict is kept under. */
export const SPOOL_BRAKE_MARK = 0;

/** The spool at rest, for placing a burst: where it hangs, side on. */
function rest(l: Layout, cfg: SimConfig): SpoolPose {
  return { at: spoolHome(l, cfg), turn: 0, wound: 1 };
}

export class SpoolFx {
  private shudderNow = 0;
  private joltNow = 0;
  private glareNow = 0;
  /** The blow a rib eased deals the casing. */
  readonly hurt = new BossHurt();
  /** Was the last touch on the brake right. */
  readonly verdicts = new GripVerdicts();

  /** How hard the casing is shaking after a slip, 0..1. */
  get shudder(): number {
    return this.shudderNow;
  }

  /** How far the axle is thrown down right now, in tiles. */
  get jolt(): number {
    return this.joltNow;
  }

  /** How much the loosed winding is washing the frame, 0..1. */
  get glare(): number {
    return this.glareNow;
  }

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, burst: Burst): void {
    const pose = rest(l, cfg);
    const at = pose.at;
    for (const e of events) {
      switch (e.type) {
        case "spoolGrip":
          this.verdicts.mark(SPOOL_BRAKE_MARK, true);
          break;
        case "spoolRefuse":
          this.verdicts.mark(SPOOL_BRAKE_MARK, false);
          break;
        case "spoolEnter":
          burst(at.x, at.y, 14, PALETTE.rock);
          break;
        // A new movement and a new leg are the quietest of them all: both
        // are the navigator's to call, and a burst is on both screens.
        case "spoolZone":
        case "spoolLeg":
          burst(at.x, at.y, 4, PALETTE.rock);
          break;
        case "spoolSlip":
          burst(at.x, at.y, 10, PALETTE.rockDark);
          this.shudderNow = 1;
          break;
        // The rock falls down the pilot's own column, and the column is the
        // meteor's to show: this is only the casing spitting it out.
        case "spoolRock":
          burst(at.x, at.y, 6, PALETTE.rock);
          break;
        // A rib eases where it stood, and the event says which: the count left
        // after it went.
        case "spoolRib": {
          const i = Math.min(SPOOL_RIBS - 1, Math.max(0, SPOOL_RIBS - e.ribs - 1));
          burst(spoolRibX(l, pose, spoolSide(l, cfg), i), at.y, 14, PALETTE.wispRim);
          this.joltNow = JOLT_TILES;
          this.hurt.hit();
          break;
        }
        case "spoolSlack":
          burst(at.x, at.y, 28, PALETTE.hull);
          this.joltNow = JOLT_TILES * 1.6;
          this.glareNow = 1;
          this.hurt.hit();
          break;
        case "spoolDrift":
          burst(at.x, at.y, 8, PALETTE.wisp);
          break;
        case "spoolOut":
          burst(at.x, tileCY(l, 0), 16, PALETTE.wisp);
          break;
        // The story between the ribs (`spool-fx-story.ts`): an answer is a
        // step landed, a run-out a blow that shakes the casing it came off.
        default: {
          const blow = spoolStoryBurst(e, l, cfg, pose, burst);
          if (blow === "landed") this.hurt.hit();
          else if (blow === "struck") this.shudderNow = 1;
          break;
        }
      }
    }
  }

  /** The casing stilled, the axle settled, the loosing gone off the frame. */
  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.shudderNow = Math.max(0, this.shudderNow - this.shudderNow * SHUDDER_DECAY * step);
    if (this.shudderNow < 0.002) this.shudderNow = 0;
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * step);
    if (this.joltNow < 0.002) this.joltNow = 0;
    this.glareNow = Math.max(0, this.glareNow - this.glareNow * GLARE_DECAY * step);
    if (this.glareNow < 0.002) this.glareNow = 0;
    this.hurt.update(step);
    this.verdicts.update(dt);
  }

  clear(): void {
    this.shudderNow = 0;
    this.joltNow = 0;
    this.glareNow = 0;
    this.hurt.clear();
    this.verdicts.clear();
  }
}
