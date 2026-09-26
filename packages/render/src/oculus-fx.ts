import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import type { SurfaceY } from "./hull-frame.js";
import { drawHullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { oculusCentre, oculusLift, oculusRadius } from "./oculus-shape.js";
import { PALETTE } from "./palette.js";

/**
 * What THE OCULUS leaves behind a frame (§27, *Presentation*): the **thud** a
 * pair of leaves makes as it is held shut — a soft shudder down the plating
 * and the lens pressed down a touch — the same, quieter, for a reseal; the
 * **flash** of a core hit, wider and brighter for every hit it has taken; the
 * shatter's own flash; and the bursts its twelve receipts throw.
 *
 * Everything else — how shut each leaf is, how far the socket stands open,
 * how small the core is — is read off the boss every frame (`oculus-draw.ts`,
 * `oculus-pose.ts`).
 *
 * **Both screens are thrown the same**, like the drawing: a hold asks both
 * seats at once, and both have to see the pair land.
 *
 * **A pair held shut is a sequence landed**, and so is a core hit, so both
 * deal the lens the blow every boss takes (`boss-hurt.ts`). A reseal keeps
 * the socket open rather than hurting anything, so it thuds and deals
 * nothing; a step lighting, a thumb slipping and a pair springing open deal
 * nothing either.
 *
 * A missed core throws nothing here: the hull it breaks is the boss's own
 * blow, drawn by `boss-strike-fx.ts` for every boss that strikes.
 *
 * The core's colour is the lit step's and not in `oculusHit`, so the drawer
 * tells it every frame (`tell`), THE KEEL's way. Everything is cleared in
 * `Effects.reset()` (`restart.test.ts`).
 */

/** How far the lens is pressed down by a shut pair, and by a reseal, in tiles. */
const THUD_TILES = 0.1;
const RESEAL_TILES = 0.05;
const THUD_DECAY = 9;
/** How strong the plating's shudder is for a shut pair, and for a reseal. */
const THUD_FORCE = 0.6;
const RESEAL_FORCE = 0.3;
/** The hull's shudder, in beats. */
const THUD_BEATS = 0.75;
/** How fast a core flash and the shatter's fade, per second. */
const FLASH_DECAY = 3;

export class OculusFx {
  private thudNow = 0;
  private flashNow = 0;
  private flashHits = 0;
  private shatterNow = 0;
  private shockLeft = 0;
  private shockLife = 1;
  private shockForce = 0;
  private coreHex: string = PALETTE.hullRim;
  /** The blow a shut pair and a core hit deal the lens. */
  readonly hurt = new BossHurt();

  /** How far the whole lens is pressed down right now, in tiles. */
  get thud(): number {
    return this.thudNow;
  }

  /** The core hit's flash: how bright it still is, 0..1, and the hit it was (1, 2, 3). */
  get flash(): { now: number; hits: number } {
    return { now: this.flashNow, hits: this.flashHits };
  }

  /** How bright the shatter's flash still is, 0..1. */
  get shatter(): number {
    return this.shatterNow;
  }

  /** The drawer's word for the colour the core is lit, which `oculusHit` does not carry. */
  tell(coreHex: string): void {
    this.coreHex = coreHex;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    for (const e of events) {
      if (!e.type.startsWith("oculus")) continue;
      const mid = oculusCentre(l, cfg);
      const rim = oculusRadius(l).rim;
      switch (e.type) {
        case "oculusEnter":
          burst(mid.x, mid.y - oculusLift(l, 0), 12, PALETTE.rock);
          break;
        case "oculusLight":
          burst(mid.x, mid.y, 4, PALETTE.hullRim);
          break;
        case "oculusSlip":
          burst(mid.x, mid.y, 5, PALETTE.rock);
          break;
        case "oculusShut":
          burst(mid.x, mid.y, 10, PALETTE.hullRim);
          this.thudNow = Math.max(this.thudNow, THUD_TILES);
          this.shock(beatSeconds * THUD_BEATS, THUD_FORCE);
          this.hurt.hit();
          break;
        case "oculusReseal":
          burst(mid.x, mid.y, 6, PALETTE.hullRim);
          this.thudNow = Math.max(this.thudNow, RESEAL_TILES);
          this.shock(beatSeconds * THUD_BEATS, RESEAL_FORCE);
          break;
        case "oculusSpring":
          burst(mid.x, mid.y - rim * 0.5, 6, PALETTE.rock);
          burst(mid.x, mid.y + rim * 0.5, 6, PALETTE.rock);
          break;
        case "oculusBreak":
          burst(mid.x, mid.y, 12, PALETTE.hullRim);
          break;
        case "oculusHit":
          burst(mid.x, mid.y, 8 + 6 * e.hits, this.coreHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hurt.hit();
          break;
        case "oculusSwallow":
          burst(mid.x, mid.y, 8, PALETTE.rockDark);
          break;
        case "oculusShatter":
          burst(mid.x, mid.y, 24, PALETTE.hullRim);
          this.shatterNow = 1;
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
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.shatterNow = Math.max(0, this.shatterNow - FLASH_DECAY * step);
    this.shockLeft = Math.max(0, this.shockLeft - dt);
    if (this.shockLeft === 0) this.shockForce = 0;
    this.hurt.update(dt);
  }

  /** The shudder down the plating as a pair thuds shut or reseals (`frame-on-ship.ts`). */
  drawShock(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY, time: number): void {
    if (this.shockLeft <= 0) return;
    drawHullShock(ctx, l, surfaceY, time, this.shockForce * (this.shockLeft / this.shockLife));
  }

  clear(): void {
    this.thudNow = 0;
    this.flashNow = 0;
    this.flashHits = 0;
    this.shatterNow = 0;
    this.shockLeft = 0;
    this.shockLife = 1;
    this.shockForce = 0;
    this.coreHex = PALETTE.hullRim;
    this.hurt.clear();
  }
}
