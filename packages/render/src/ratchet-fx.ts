import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import type { SurfaceY } from "./hull-frame.js";
import { drawHullShock } from "./hull-shock.js";
import { type Layout, tileCY, type ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { ratchetBarAt, ratchetLock, ratchetPawl, ratchetPawlY, ratchetX } from "./ratchet-shape.js";
import { showsRatchetCatch, showsRatchetPawl } from "./view-role-clocks-c.js";

/**
 * What THE RATCHET leaves behind a frame: the **jolt** of the strut and the
 * **click** along the seam as a clean tooth lands, the **shock** it sends
 * through the hull, and the bursts its twelve receipts throw.
 *
 * Everything else — how far the rack has climbed, how many pins are home,
 * whether the catch is set — is read off the boss every frame
 * (`ratchet-draw.ts`, `ratchet-pose.ts`). The shock is the design's own
 * (§22, *Presentation*): every clean advance is one shudder through
 * `hull-shock.ts`, and a burnt tooth is a flat, unlit non-event — **a burn
 * throws nothing**, on any screen, because nothing should reward a mistake
 * with a picture.
 *
 * **The hands' receipts are split between the seats**, THE HASP's rule: a
 * catch set or let go is thrown on the catch's screens alone — a spark over
 * the rail on his screen the instant she set it would be her `SET` said for
 * her (`view-role-clocks-c.ts`). The rack's receipts burst on both.
 *
 * Read above the loop like THE HASP's. Everything is cleared in
 * `Effects.reset()` (`restart.test.ts`).
 *
 * **A clean tooth is a sequence landed** — her catch set and his press in
 * the window — and so is the lock giving, so both deal the rack the blow
 * every boss takes (`boss-hurt.ts`). Setting the catch alone deals nothing.
 */

const JOLT_TILES = 0.16;
const JOLT_DECAY = 9;
const CLICK_DECAY = 7;
/** The hull's shudder, in beats. */
const SHOCK_BEATS = 1;

export class RatchetFx {
  private joltNow = 0;
  private clickNow = 0;
  private shockLeft = 0;
  private shockLife = 1;
  /** The blow a clean tooth deals the rack. */
  readonly hurt = new BossHurt();

  /** How far the strut is thrown down in its mounting right now, in tiles. */
  get jolt(): number {
    return this.joltNow;
  }

  /** How bright the seam is from a clean tooth landing, 0..1. */
  get click(): number {
    return this.clickNow;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    role: ViewRole,
    burst: Burst,
  ): void {
    const hand = showsRatchetCatch(role);
    const pad = showsRatchetPawl(role);
    for (const e of events) {
      switch (e.type) {
        case "ratchetEnter": {
          const lock = ratchetLock(l, cfg);
          burst(lock.x, lock.y, 14, PALETTE.rock);
          break;
        }
        case "ratchetLit":
          if (pad) {
            const pawl = ratchetPawl(l, cfg);
            burst(pawl.x, pawl.y, 4, PALETTE.rock);
          }
          break;
        // Her two: the catch set under her hand, and let go.
        case "ratchetSet":
          if (hand) {
            const bar = ratchetBarAt(l, cfg, cfg.ratchetGripMilli);
            burst(bar.x, bar.y, 5, PALETTE.pod);
          }
          break;
        case "ratchetLet":
          if (hand) {
            const bar = ratchetBarAt(l, cfg, 0);
            burst(bar.x, bar.y, 3, PALETTE.rockDark);
          }
          break;
        // The rack's, on both: a clean tooth, the bolt, and the two ends.
        case "ratchetClick":
          burst(ratchetX(l, cfg), ratchetPawlY(l), 12, PALETTE.rock);
          this.joltNow = JOLT_TILES;
          this.clickNow = 1;
          this.shock(beatSeconds);
          this.hurt.hit();
          break;
        case "ratchetBolt": {
          const lock = ratchetLock(l, cfg);
          burst(fieldX(l, e.col), lock.y + lock.half, 10, PALETTE.hullRim);
          break;
        }
        case "ratchetBoltOut":
          burst(fieldX(l, e.col), ratchetPawlY(l), 12, PALETTE.hullRim);
          break;
        case "ratchetBoltHit":
          burst(fieldX(l, e.col), tileCY(l, cfg.rows - 1), 20, PALETTE.red);
          this.joltNow = JOLT_TILES;
          break;
        case "ratchetOpen": {
          const lock = ratchetLock(l, cfg);
          burst(lock.x, lock.y, 30, PALETTE.rock);
          this.shock(beatSeconds);
          this.hurt.hit();
          break;
        }
        case "ratchetJam":
          burst(ratchetX(l, cfg), tileCY(l, cfg.rows - 1), 26, PALETTE.red);
          this.joltNow = JOLT_TILES * 2;
          this.shock(beatSeconds);
          break;
        case "ratchetOut": {
          const lock = ratchetLock(l, cfg);
          burst(lock.x, lock.y, 18, PALETTE.rockDark);
          break;
        }
        default:
          break;
      }
    }
  }

  private shock(beatSeconds: number): void {
    this.shockLife = SHOCK_BEATS * beatSeconds;
    this.shockLeft = this.shockLife;
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * step);
    if (this.joltNow < 0.002) this.joltNow = 0;
    this.clickNow = Math.max(0, this.clickNow - this.clickNow * CLICK_DECAY * step);
    if (this.clickNow < 0.002) this.clickNow = 0;
    this.shockLeft = Math.max(0, this.shockLeft - dt);
    this.hurt.update(dt);
  }

  /** The shudder down the plating as a clean tooth lands, on the finished ship (`frame-on-ship.ts`). */
  drawShock(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY, time: number): void {
    if (this.shockLeft <= 0) return;
    drawHullShock(ctx, l, surfaceY, time, this.shockLeft / this.shockLife);
  }

  clear(): void {
    this.joltNow = 0;
    this.clickNow = 0;
    this.shockLeft = 0;
    this.shockLife = 1;
    this.hurt.clear();
  }
}
