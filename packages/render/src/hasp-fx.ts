import { HASP_COUNT, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { GripVerdicts } from "./grip-verdict.js";
import { haspBoltPoint } from "./hasp-bolt.js";
import { haspStoryBurst } from "./hasp-fx-story.js";
import { haspBarAt, haspCentre } from "./hasp-shape.js";
import { HullShock } from "./hull-shock.js";
import { type Layout, tileCY, type ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { showsHaspLatch, showsHaspWheel } from "./view-role-clocks-c.js";

/**
 * What THE HASP leaves behind a frame: the **dim** of a wheel seizing under
 * the navigator's hand, the **flare** of the latch burning the pilot off it,
 * the **jolt** of the row as a hasp gives, the **shock** that opening sends
 * through the hull, and the bursts its fourteen receipts throw — and the
 * story's twelve, off their own page (`hasp-fx-story.ts`).
 *
 * Everything else — which clasps have swung, how far the wheel has come, how
 * hot the latch is — is read off the boss every frame (`hasp-draw.ts`,
 * `hasp-pose.ts`). The dim is the design's own (§20, *Presentation*): a seized
 * wheel is a whole-frame dim for a beat, the way a choked ring on THE THROAT
 * is, and an opened hasp one shudder through `hull-shock.ts`.
 *
 * **This is the one boss whose receipts are themselves split between the
 * seats**, and so the one whose bursts are: a grip, a let-go, a burn and a
 * cooling happen to the latch and are thrown on the latch's screens alone; a
 * seize and a freeing happen to the wheel and are thrown on the wheel's. A
 * spark over the row on her screen the instant he gripped would be the whole
 * fight said for them (`view-role-clocks-c.ts`). What both seats share — the
 * row, the bolt, the hull — bursts on both.
 *
 * Read above the loop like THE SPOOL's, rather than as rows in a spark table
 * at its limit (`effects-spark-silent-boss-b.ts`). Everything is cleared in
 * `Effects.reset()` (`restart.test.ts`).
 *
 * **A hasp wound open is a sequence landed** — latch held, wheel wound — so
 * it deals the row the blow every boss takes (`boss-hurt.ts`), on both
 * screens. A grip is only half of one, and deals nothing.
 *
 * **Each mark's verdict is its own seat's receipt** (`grip-verdict.ts`): the
 * latch washes green on the grip and red on the burn, the wheel green when it
 * comes free under her hand and red when it seizes there. Marked on every
 * screen and drawn only where the mark is (`hasp-marks.ts`), so the split
 * holds without asking the role here.
 */

/** The verdicts' keys: his latch and her working wheel. */
export const HASP_LATCH_MARK = 0;
export const HASP_WHEEL_MARK = 1;

const JOLT_TILES = 0.2;
const JOLT_DECAY = 8;
const FLARE_DECAY = 5;
/** The dim, and the hull's shudder, in beats. */
const DIM_BEATS = 1;
const SHOCK_BEATS = 1;

export class HaspFx {
  private joltNow = 0;
  private flareNow = 0;
  private dimLeft = 0;
  private dimLife = 1;
  /** The shudder down the plating as a hasp gives, on the finished ship (`frame-on-ship.ts`). */
  readonly shock = new HullShock();
  /** The clasp the latest receipt was about, counted from the ship. */
  private at = 0;
  /** The blow a hasp wound open deals the row. */
  readonly hurt = new BossHurt();
  /** Green or red on the mark a touch was answered at. */
  readonly verdicts = new GripVerdicts();

  /** How far the row is thrown down in its mounting right now, in tiles. */
  get jolt(): number {
    return this.joltNow;
  }

  /** How hard the latch is flaring after a burn, 0..1. */
  get flare(): number {
    return this.flareNow;
  }

  /** How dark the frame is from a seize, 0..1 — drawn on the wheel's screens alone. */
  get dim(): number {
    return this.dimLeft / this.dimLife;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    role: ViewRole,
    burst: Burst,
  ): void {
    const latch = showsHaspLatch(role);
    const wheel = showsHaspWheel(role);
    for (const e of events) {
      if (e.type === "haspLit") this.at = HASP_COUNT - e.hasps;
      const hub = haspCentre(l, cfg, this.at);
      const bar = haspBarAt(l, cfg, this.at, 0);
      switch (e.type) {
        case "haspEnter":
          burst(hub.x, hub.y, 14, PALETTE.rock);
          break;
        // His five: the latch lighting, taken, let go, burnt and cooled.
        case "haspLit":
          if (latch) burst(bar.x, bar.y, 5, PALETTE.rock);
          break;
        case "haspGrip":
          this.verdicts.mark(HASP_LATCH_MARK, true);
          if (latch) burst(bar.x, bar.y, 4, PALETTE.pod);
          break;
        case "haspLet":
          if (latch) burst(bar.x, bar.y, 3, PALETTE.rockDark);
          break;
        case "haspBurn":
          this.verdicts.mark(HASP_LATCH_MARK, false);
          if (latch) {
            burst(bar.x, bar.y, 14, PALETTE.ember);
            this.flareNow = 1;
          }
          break;
        case "haspCool":
          if (latch) burst(bar.x, bar.y, 4, PALETTE.rock);
          break;
        // Her two: the wheel going dead under her hand, and coming back.
        case "haspSeize":
          this.verdicts.mark(HASP_WHEEL_MARK, false);
          if (wheel) {
            burst(hub.x, hub.y, 6, PALETTE.rockDark);
            this.dimLife = DIM_BEATS * beatSeconds;
            this.dimLeft = this.dimLife;
          }
          break;
        case "haspFree":
          this.verdicts.mark(HASP_WHEEL_MARK, true);
          if (wheel) {
            burst(hub.x, hub.y, 5, PALETTE.rock);
            this.dimLeft = 0;
          }
          break;
        // The row's, on both: a hasp giving, the bolt, and the door clearing.
        case "haspOpen": {
          const gave = haspCentre(l, cfg, HASP_COUNT - e.hasps - 1);
          burst(gave.x, gave.y, 18, PALETTE.rock);
          this.joltNow = JOLT_TILES;
          this.shock.strike(SHOCK_BEATS * beatSeconds, 1);
          this.hurt.hit();
          break;
        }
        case "haspBolt":
          burst(fieldX(l, e.col), haspCentre(l, cfg, 1).y, 10, PALETTE.hullRim);
          break;
        case "haspBoltOut": {
          // Where the shot met it on its fall (`haspBoltPoint`, the drawing's own).
          const bolt = haspBoltPoint(l, e.col, e.rowMilli);
          burst(bolt.x, bolt.y, 12, PALETTE.hullRim);
          break;
        }
        case "haspBoltHit":
          burst(fieldX(l, e.col), tileCY(l, cfg.rows - 1), 20, PALETTE.red);
          this.joltNow = JOLT_TILES;
          break;
        case "haspClear":
          burst(hub.x, haspCentre(l, cfg, 1).y, 30, PALETTE.wisp);
          break;
        case "haspOut":
          burst(hub.x, haspCentre(l, cfg, 1).y, 18, PALETTE.wispRim);
          break;
        // The story between the hasps (`hasp-fx-story.ts`).
        default: {
          const blow = haspStoryBurst(e, l, cfg, burst, wheel);
          if (blow === "landed") this.hurt.hit();
          else if (blow === "struck") this.shock.strike(SHOCK_BEATS * beatSeconds, 1);
          break;
        }
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * step);
    if (this.joltNow < 0.002) this.joltNow = 0;
    this.flareNow = Math.max(0, this.flareNow - this.flareNow * FLARE_DECAY * step);
    if (this.flareNow < 0.002) this.flareNow = 0;
    this.dimLeft = Math.max(0, this.dimLeft - dt);
    this.shock.update(dt);
    this.hurt.update(step);
    this.verdicts.update(dt);
  }

  clear(): void {
    this.joltNow = 0;
    this.flareNow = 0;
    this.dimLeft = 0;
    this.dimLife = 1;
    this.shock.clear();
    this.at = 0;
    this.hurt.clear();
    this.verdicts.clear();
  }
}
