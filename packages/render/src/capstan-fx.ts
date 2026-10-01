import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { capstanCentre, capstanFaceAt, capstanHornAt, capstanSize } from "./capstan-shape.js";
import { CapstanVerdicts } from "./capstan-verdicts.js";
import type { Burst } from "./effects-boss.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE CAPSTAN leaves behind a frame (§11.54): the **scrub** of a
 * reversal worn into a band — the face flaring bare metal for a moment; the
 * **ring** of a band worn bright for good, thrown off its rim; the **thud** of
 * a window let run — the drum knocked down in its cradle; the **flash** of a
 * core hit, wider for every hit; the cap's **burst** as the drum is spent; and
 * the bursts its fourteen receipts throw.
 *
 * Everything else — the lean, the wear, the cap's creep, which face is bared —
 * is read off the boss every frame (`capstan-draw.ts`, `capstan-pose.ts`).
 *
 * **Both screens are thrown the same**, like the drawing. A band worn bright,
 * a hold made and a core hit are a step landed, so each deals the drum the
 * blow every boss takes (`boss-hurt.ts`); a reversal is only a part of one.
 * The core's colour is the lit step's and not in `capstanHit`, so the drawer
 * tells it every frame (`tell`). Cleared in `Effects.reset()`.
 */

/** How far the drum is knocked down by a window let run, in tiles, and how fast it rises back. */
const THUD_TILES = 0.12;
const THUD_DECAY = 9;
/** How fast a reversal's scrub fades, a bright band's ring, and a flash, per second. */
const SCRUB_DECAY = 5;
const RING_DECAY = 1.6;
const FLASH_DECAY = 3;

export class CapstanFx {
  private thudNow = 0;
  private readonly scrubNow: [number, number] = [0, 0];
  private readonly ringNow: [number, number] = [0, 0];
  private flashNow = 0;
  private flashHits = 0;
  private openNow = 0;
  private coreHex: string = PALETTE.hullRim;
  /** The blow a band worn bright, a hold made and a core hit deal the drum. */
  readonly hurt = new BossHurt();
  /** Whether the last touch on each of the drum's marks was right (`capstan-verdicts.ts`). */
  readonly verdicts = new CapstanVerdicts();

  /** How far the whole drum is knocked down right now, in tiles. */
  get thud(): number {
    return this.thudNow;
  }

  /** How bright face `side`'s last reversal still flares, 0..1. */
  scrub(side: 0 | 1): number {
    return this.scrubNow[side];
  }

  /** How far face `side`'s bright ring has still to go, 1 as it is thrown and 0 gone. */
  ring(side: 0 | 1): number {
    return this.ringNow[side];
  }

  /** The core hit's flash: how bright it still is, 0..1, and the hit it was. */
  get flash(): { now: number; hits: number } {
    return { now: this.flashNow, hits: this.flashHits };
  }

  /** How bright the spent drum's flash still is, 0..1. */
  get open(): number {
    return this.openNow;
  }

  /** The drawer's word for the colour the core is lit, which `capstanHit` does not carry. */
  tell(coreHex: string): void {
    this.coreHex = coreHex;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    _beatSeconds: number,
    burst: Burst,
  ): void {
    this.verdicts.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("capstan")) continue;
      const mid = capstanCentre(l, cfg);
      const { ry } = capstanSize(l);
      switch (e.type) {
        case "capstanEnter":
          burst(mid.x, mid.y, 12, PALETTE.capstanRust);
          break;
        case "capstanRock":
          burst(mid.x + capstanHornAt(l, e.side).x, mid.y, 5, PALETTE.capstanRust);
          break;
        case "capstanWear":
          burst(mid.x + capstanFaceAt(l, e.side, 1).x, mid.y, 6, PALETTE.capstanWorn);
          this.scrubNow[e.side] = 1;
          this.hurt.jab();
          break;
        case "capstanBright":
          burst(mid.x + capstanFaceAt(l, e.side, 1).x, mid.y, 14, PALETTE.capstanWorn);
          this.ringNow[e.side] = 1;
          this.hurt.hit();
          break;
        case "capstanBare":
          burst(mid.x, mid.y, 10, PALETTE.capstanRust);
          break;
        case "capstanKept":
          burst(mid.x, mid.y, 6, PALETTE.hullRim);
          this.hurt.hit();
          break;
        case "capstanStall":
        case "capstanCover":
          burst(mid.x, mid.y + ry, 8, PALETTE.capstanRustDark);
          this.thudNow = Math.max(this.thudNow, THUD_TILES);
          break;
        case "capstanHit":
          burst(mid.x, mid.y, 8 + 6 * e.hits, this.coreHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hurt.hit();
          break;
        case "capstanMiss":
          burst(mid.x, mid.y + ry, 8, PALETTE.capstanRustDark);
          break;
        case "capstanOpen":
          burst(mid.x, mid.y, 24, PALETTE.capstanRust);
          this.openNow = 1;
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.thudNow = Math.max(0, this.thudNow - this.thudNow * THUD_DECAY * step);
    if (this.thudNow < 0.002) this.thudNow = 0;
    for (const side of [0, 1] as const) {
      this.scrubNow[side] = Math.max(0, this.scrubNow[side] - SCRUB_DECAY * step);
      this.ringNow[side] = Math.max(0, this.ringNow[side] - RING_DECAY * step);
    }
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.openNow = Math.max(0, this.openNow - FLASH_DECAY * step);
    this.hurt.update(dt);
    this.verdicts.update(dt);
  }

  clear(): void {
    this.thudNow = 0;
    for (const side of [0, 1] as const) {
      this.scrubNow[side] = 0;
      this.ringNow[side] = 0;
    }
    this.flashNow = 0;
    this.flashHits = 0;
    this.openNow = 0;
    this.coreHex = PALETTE.hullRim;
    this.hurt.clear();
    this.verdicts.clear();
  }
}
