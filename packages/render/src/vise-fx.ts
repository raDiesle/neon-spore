import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import type { SurfaceY } from "./hull-frame.js";
import { drawHullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { viseCentre, viseKernel, viseLift, viseRadius } from "./vise-shape.js";

/**
 * What THE VISE leaves behind a frame (§28, *Presentation*): the **dry thud**
 * of a seam cracking — the case pressed down a touch and a soft shudder down
 * the plating; the **spring** of a pinch run out, the lobe thrown open past
 * where it rests and settling back; the **flash** of a kernel hit, wider for
 * every hit it has taken; the split's own flash; and the bursts its twelve
 * receipts throw.
 *
 * Everything else — how far each lobe stands open, how pinched, which seams
 * are cracked, how small the kernel is — is read off the boss every frame
 * (`vise-draw.ts`, `vise-pose.ts`).
 *
 * **Both screens are thrown the same**, like the drawing: a pinch is one
 * seat's, but the other has to see it land.
 *
 * **A crack is a pinch landed**, and a kernel hit a shot landed, so both deal
 * the case the blow every boss takes (`boss-hurt.ts`). A step lighting, a
 * pinch slipping or springing, the lobes held off and the lobes closing back
 * over the kernel deal nothing.
 *
 * A missed kernel throws nothing here: the hull it breaks is the boss's own
 * blow, drawn by `boss-strike-fx.ts` for every boss that strikes.
 *
 * The kernel's colour is the lit step's and not in `viseHit`, so the drawer
 * tells it every frame (`tell`), THE OCULUS's way. Everything is cleared in
 * `Effects.reset()` (`restart.test.ts`).
 */

/** How far the case is pressed down by a crack, in tiles. */
const THUD_TILES = 0.08;
const THUD_DECAY = 9;
/** How strong the plating's shudder is for a crack, and how long, in beats. */
const THUD_FORCE = 0.45;
const THUD_BEATS = 0.6;
/** How far past its rest a sprung lobe is thrown, in radians, and how fast it settles, per second. */
const SPRING_RADIANS = 0.22;
const SPRING_DECAY = 3.5;
/** How fast a kernel flash and the split's fade, per second. */
const FLASH_DECAY = 3;

export class ViseFx {
  private thudNow = 0;
  private readonly springNow: [number, number] = [0, 0];
  private flashNow = 0;
  private flashHits = 0;
  private splitNow = 0;
  private shockLeft = 0;
  private shockLife = 1;
  private shockForce = 0;
  private kernelHex: string = PALETTE.hullRim;
  /** The blow a crack and a kernel hit deal the case. */
  readonly hurt = new BossHurt();

  /** How far the whole case is pressed down right now, in tiles. */
  get thud(): number {
    return this.thudNow;
  }

  /**
   * How far lobe `side` is thrown open past its rest right now, in radians: a
   * spring that rings down, so it swings out, back through its rest and out a
   * little again as it settles.
   */
  spring(side: 0 | 1): number {
    const k = this.springNow[side];
    return k <= 0 ? 0 : SPRING_RADIANS * k * Math.cos((1 - k) * Math.PI * 3);
  }

  /** The kernel hit's flash: how bright it still is, 0..1, and the hit it was (1, 2, 3). */
  get flash(): { now: number; hits: number } {
    return { now: this.flashNow, hits: this.flashHits };
  }

  /** How bright the split's flash still is, 0..1. */
  get split(): number {
    return this.splitNow;
  }

  /** The drawer's word for the colour the kernel is lit, which `viseHit` does not carry. */
  tell(kernelHex: string): void {
    this.kernelHex = kernelHex;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    for (const e of events) {
      if (!e.type.startsWith("vise")) continue;
      const mid = viseCentre(l, cfg);
      const { rx } = viseRadius(l);
      const k = viseKernel(l);
      switch (e.type) {
        case "viseEnter":
          burst(mid.x, mid.y - viseLift(l, 0), 12, PALETTE.viseCase);
          break;
        case "viseLight":
          burst(mid.x, mid.y, 4, PALETTE.hullRim);
          break;
        case "viseSlip":
          burst(mid.x + lobeX(e.side, rx), mid.y, 5, PALETTE.viseCase);
          break;
        case "viseCrack":
          // Dry husk dust off the seam that gave, the case pressed down, the plating thudding.
          burst(mid.x + lobeX(e.side, rx), mid.y, 10, PALETTE.viseCrack);
          this.thudNow = Math.max(this.thudNow, THUD_TILES);
          this.shock(beatSeconds * THUD_BEATS, THUD_FORCE);
          this.hurt.hit();
          break;
        case "viseSpring":
          burst(mid.x + lobeX(e.side, rx) * 1.4, mid.y + rx * 0.5, 6, PALETTE.viseCase);
          this.springNow[e.side] = 1;
          break;
        case "viseBare":
          burst(mid.x + k.x, mid.y + k.y, 10, PALETTE.viseCrack);
          break;
        case "viseBrace":
          burst(mid.x - rx * 0.5, mid.y + k.y, 4, PALETTE.hullRim);
          burst(mid.x + rx * 0.5, mid.y + k.y, 4, PALETTE.hullRim);
          break;
        case "viseCover":
          burst(mid.x + k.x, mid.y + k.y, 8, PALETTE.viseCaseDark);
          break;
        case "viseHit":
          burst(mid.x + k.x, mid.y + k.y, 8 + 6 * e.hits, this.kernelHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hurt.hit();
          break;
        case "viseSplit":
          burst(mid.x, mid.y, 24, PALETTE.viseCrack);
          this.splitNow = 1;
          break;
        default:
          break;
      }
    }
  }

  private shock(life: number, force: number): void {
    this.shockLife = Math.max(1e-6, life);
    this.shockLeft = this.shockLife;
    this.shockForce = force;
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.thudNow = Math.max(0, this.thudNow - this.thudNow * THUD_DECAY * step);
    if (this.thudNow < 0.002) this.thudNow = 0;
    for (const side of [0, 1] as const) {
      this.springNow[side] = Math.max(0, this.springNow[side] - SPRING_DECAY * step);
    }
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.splitNow = Math.max(0, this.splitNow - FLASH_DECAY * step);
    this.shockLeft = Math.max(0, this.shockLeft - dt);
    if (this.shockLeft === 0) this.shockForce = 0;
    this.hurt.update(dt);
  }

  /** The shudder down the plating as a seam cracks (`frame-on-ship.ts`). */
  drawShock(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY, time: number): void {
    if (this.shockLeft <= 0) return;
    drawHullShock(ctx, l, surfaceY, time, this.shockForce * (this.shockLeft / this.shockLife));
  }

  clear(): void {
    this.thudNow = 0;
    this.springNow[0] = 0;
    this.springNow[1] = 0;
    this.flashNow = 0;
    this.flashHits = 0;
    this.splitNow = 0;
    this.shockLeft = 0;
    this.shockLife = 1;
    this.shockForce = 0;
    this.kernelHex = PALETTE.hullRim;
    this.hurt.clear();
  }
}

/** Where lobe `side` stands off the spine, in pixels: the pilot's to the left. */
function lobeX(side: 0 | 1, rx: number): number {
  return (side === 0 ? -1 : 1) * rx * 0.55;
}
