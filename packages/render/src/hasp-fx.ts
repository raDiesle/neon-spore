import { HASP_COUNT, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { haspBarAt, haspCentre } from "./hasp-shape.js";
import type { SurfaceY } from "./hull-frame.js";
import { drawHullShock } from "./hull-shock.js";
import { type Layout, tileCY, type ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { showsHaspLatch, showsHaspWheel } from "./view-role-clocks-c.js";

/**
 * What THE HASP leaves behind a frame: the **dim** of a wheel seizing under
 * the navigator's hand, the **flare** of the latch burning the pilot off it,
 * the **jolt** of the row as a hasp gives, the **shock** that opening sends
 * through the hull, and the bursts its fourteen receipts throw.
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
 */

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
  private shockLeft = 0;
  private shockLife = 1;
  /** The clasp the latest receipt was about, counted from the ship. */
  private at = 0;
  /** The blow a hasp wound open deals the row. */
  readonly hurt = new BossHurt();

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
          if (latch) burst(bar.x, bar.y, 4, PALETTE.pod);
          break;
        case "haspLet":
          if (latch) burst(bar.x, bar.y, 3, PALETTE.rockDark);
          break;
        case "haspBurn":
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
          if (wheel) {
            burst(hub.x, hub.y, 6, PALETTE.rockDark);
            this.dimLife = DIM_BEATS * beatSeconds;
            this.dimLeft = this.dimLife;
          }
          break;
        case "haspFree":
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
          this.shockLife = SHOCK_BEATS * beatSeconds;
          this.shockLeft = this.shockLife;
          this.hurt.hit();
          break;
        }
        case "haspBolt":
          burst(fieldX(l, e.col), haspCentre(l, cfg, 1).y, 10, PALETTE.hullRim);
          break;
        case "haspBoltOut":
          burst(fieldX(l, e.col), haspCentre(l, cfg, 0).y, 12, PALETTE.hullRim);
          break;
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
        default:
          break;
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
    this.shockLeft = Math.max(0, this.shockLeft - dt);
    this.hurt.update(step);
  }

  /** The shudder down the plating as a hasp gives, on the finished ship (`frame-on-ship.ts`). */
  drawShock(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY, time: number): void {
    if (this.shockLeft <= 0) return;
    drawHullShock(ctx, l, surfaceY, time, this.shockLeft / this.shockLife);
  }

  clear(): void {
    this.joltNow = 0;
    this.flareNow = 0;
    this.dimLeft = 0;
    this.dimLife = 1;
    this.shockLeft = 0;
    this.shockLife = 1;
    this.at = 0;
    this.hurt.clear();
  }
}
