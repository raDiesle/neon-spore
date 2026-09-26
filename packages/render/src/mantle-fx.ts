import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { smoothstep } from "./ease.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import type { SurfaceY } from "./hull-frame.js";
import { drawHullShock } from "./hull-shock.js";
import { type Layout, tileCY } from "./layout.js";
import {
  mantleCentre,
  mantleHandleRest,
  mantleReach,
  mantleSparkPoint,
  PLATE_BOUNDS,
  type Point,
  put,
  type ValvePose,
} from "./mantle-shape.js";
import { PALETTE } from "./palette.js";

/**
 * What THE MANTLE leaves behind a frame: the **kick** of the shell as a
 * plate-pair shears, the **flare** of the core as a finishing tap lands, the
 * **shock** a shear sends through the hull, and the bursts its ten receipts
 * throw.
 *
 * Everything else — how far each handle is down, how many plates are left,
 * how wide the split has swung — is read off the boss every frame
 * (`mantle-draw.ts`, `mantle-pose.ts`). The shock is the design's own (§23,
 * *Presentation*): **each shearing pair is one hull-shock pulse**, and no
 * camera moves.
 *
 * **Both screens are thrown the same.** The whole boss is one number both
 * seats can see, so nothing here reads a role — THE RATCHET's split receipts
 * are the opposite case (`ratchet-fx.ts`).
 *
 * **A shear is a sequence landed** — both thumbs past the floor and the sum
 * past the threshold — and so is the last tap that puts the core out, so both
 * deal the shell the blow every boss takes (`boss-hurt.ts`). The handles
 * lighting, and a single finishing tap, deal nothing.
 *
 * The one clock kept here is the spark's: a shot puts it out wherever it had
 * run to, and the event says only the column, so the fuse is timed from the
 * leak on this side too and the burst thrown at the bead's place on it
 * (`mantleSparkPoint`, the drawing's own). Read above the loop like THE
 * RATCHET's; everything is cleared in `Effects.reset()` (`restart.test.ts`).
 */

const KICK_TILES = 0.14;
const KICK_DECAY = 9;
const FLARE_DECAY = 5;
/** How bright a finishing tap lights the core, against the last tap's 1. */
const TAP_FLARE = 0.5;
/** The hull's shudder, in beats. */
const SHOCK_BEATS = 1;
/** A valve at rest, for where the receipts are thrown from. */
const REST: ValvePose = { bow: 0, drop: 0, open: 0 };

export class MantleFx {
  private kickNow = 0;
  private flareNow = 0;
  private shockLeft = 0;
  private shockLife = 1;
  private sparkAge = 0;
  private sparkFuse = 0;
  /** The blow a shear deals the shell. */
  readonly hurt = new BossHurt();

  /** How far the shell is thrown down on its hinge right now, in tiles. */
  get kick(): number {
    return this.kickNow;
  }

  /** How bright the core is from a finishing tap, 0..1. */
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
    for (const e of events) {
      if (!e.type.startsWith("mantle")) continue;
      const at = mantleCentre(l, cfg);
      const { ry } = mantleReach(l);
      switch (e.type) {
        case "mantleEnter":
          burst(at.x, at.y - ry, 12, PALETTE.rock);
          break;
        case "mantleLight":
          for (const side of [-1, 1] as const) {
            const knob = mantleHandleRest(l, at, side, REST);
            burst(knob.x, knob.y, 4, PALETTE.hullRim);
          }
          break;
        // The pair of plates that went: plate `left` of each valve, since the
        // tail's pair goes first and `left` pairs are still on.
        case "mantleShear":
          for (const p of shedPlates(l, at, e.left)) burst(p.x, p.y, 10, PALETTE.rock);
          this.kickNow = KICK_TILES;
          this.shock(beatSeconds);
          this.hurt.hit();
          break;
        case "mantleSplit":
          burst(at.x, at.y - ry, 16, PALETTE.rock);
          burst(at.x, at.y + ry, 16, PALETTE.rock);
          this.kickNow = KICK_TILES * 1.5;
          break;
        case "mantleLeak": {
          const gap = mantleSparkPoint(l, at, e.col, 0);
          burst(gap.x, gap.y, 8, PALETTE.red);
          this.sparkAge = 0;
          this.sparkFuse = Math.max(1, cfg.mantleSparkBeats) * beatSeconds;
          break;
        }
        case "mantleSparkOut": {
          const along = smoothstep(Math.min(1, this.sparkAge / Math.max(1e-6, this.sparkFuse)));
          const bead = mantleSparkPoint(l, at, e.col, along);
          burst(bead.x, bead.y, 12, PALETTE.hullRim);
          this.sparkFuse = 0;
          break;
        }
        case "mantleSparkHit":
          burst(fieldX(l, e.col), tileCY(l, cfg.rows - 1), 20, PALETTE.red);
          this.sparkFuse = 0;
          break;
        case "mantleBeat":
          burst(at.x, at.y + ry * 0.12, 6, PALETTE.red);
          this.flareNow = Math.max(this.flareNow, TAP_FLARE);
          break;
        case "mantleDark":
          burst(at.x, at.y + ry * 0.12, 24, PALETTE.red);
          this.flareNow = 1;
          this.shock(beatSeconds);
          this.hurt.hit();
          break;
        case "mantleOut":
          burst(at.x, at.y, 14, PALETTE.rockDark);
          break;
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
    this.kickNow = Math.max(0, this.kickNow - this.kickNow * KICK_DECAY * step);
    if (this.kickNow < 0.002) this.kickNow = 0;
    this.flareNow = Math.max(0, this.flareNow - this.flareNow * FLARE_DECAY * step);
    if (this.flareNow < 0.002) this.flareNow = 0;
    this.shockLeft = Math.max(0, this.shockLeft - dt);
    if (this.sparkFuse > 0) this.sparkAge += dt;
    this.hurt.update(dt);
  }

  /** The shudder down the plating as a pair shears and as the core goes out (`frame-on-ship.ts`). */
  drawShock(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY, time: number): void {
    if (this.shockLeft <= 0) return;
    drawHullShock(ctx, l, surfaceY, time, this.shockLeft / this.shockLife);
  }

  clear(): void {
    this.kickNow = 0;
    this.flareNow = 0;
    this.shockLeft = 0;
    this.shockLife = 1;
    this.sparkAge = 0;
    this.sparkFuse = 0;
    this.hurt.clear();
  }
}

/** The middle of plate `k` on both valves at rest. */
function shedPlates(l: Layout, at: Point, k: number): Point[] {
  const f = ((PLATE_BOUNDS[k] ?? 0) + (PLATE_BOUNDS[k + 1] ?? 1)) / 2;
  return [put(l, at, -1, REST, f, 0.6), put(l, at, 1, REST, f, 0.6)];
}
