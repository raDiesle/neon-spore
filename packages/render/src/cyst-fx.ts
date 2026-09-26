import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { cystCentre, cystMarkAt, cystR } from "./cyst-shape.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE CYST leaves behind a frame (§34): the **thud** of a flank cracking —
 * the sac pressed down a touch; the **spring** of a pinch let go too soon, the
 * flank thrown out past its rest and ringing back; the **flash** of a core hit,
 * wider for every hit; the pop of a spore or bud shot down, the split's own
 * flash; and the bursts its seventeen receipts throw.
 *
 * Everything else — how far each flank is pinched, which is shaking, which is
 * cracked, the swell and the spit lobe — is read off the boss every frame
 * (`cyst-draw.ts`, `cyst-pose.ts`).
 *
 * **Both screens are thrown the same**, like the drawing. A crack and a core
 * hit are a step landed, so both deal the sac the blow every boss takes
 * (`boss-hurt.ts`). The core's colour is the lit step's and not in `cystHit`,
 * so the drawer tells it every frame (`tell`). Cleared in `Effects.reset()`.
 */

/** How far the sac is pressed down by a crack, in tiles, and how fast it rises back. */
const THUD_TILES = 0.1;
const THUD_DECAY = 9;
/** How far past its rest a sprung flank is thrown, as a share, and how fast it settles, per second. */
const SPRING_SHARE = 0.16;
const SPRING_DECAY = 3.5;
/** How fast a flash fades, per second. */
const FLASH_DECAY = 3;

export class CystFx {
  private thudNow = 0;
  private readonly springNow: [number, number] = [0, 0];
  private flashNow = 0;
  private flashHits = 0;
  private splitNow = 0;
  private coreHex: string = PALETTE.hullRim;
  /** The blow a crack and a core hit deal the sac. */
  readonly hurt = new BossHurt();

  /** How far the whole sac is pressed down right now, in tiles. */
  get thud(): number {
    return this.thudNow;
  }

  /** How far flank `side` is thrown out past its rest right now, as a share of its radius. */
  spring(side: 0 | 1): number {
    const k = this.springNow[side];
    return k <= 0 ? 0 : SPRING_SHARE * k * Math.cos((1 - k) * Math.PI * 3);
  }

  /** The core hit's flash: how bright it still is, 0..1, and the hit it was. */
  get flash(): { now: number; hits: number } {
    return { now: this.flashNow, hits: this.flashHits };
  }

  /** How bright the split's flash still is, 0..1. */
  get split(): number {
    return this.splitNow;
  }

  /** The drawer's word for the colour the core is lit, which `cystHit` does not carry. */
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
    for (const e of events) {
      if (!e.type.startsWith("cyst")) continue;
      const mid = cystCentre(l, cfg);
      const r = cystR(l);
      switch (e.type) {
        case "cystEnter":
          burst(mid.x, mid.y, 12, PALETTE.cystSac);
          break;
        case "cystStill":
          burst(mid.x + cystMarkAt(l, e.side).x, mid.y, 6, PALETTE.hullRim);
          break;
        case "cystSlip":
          burst(mid.x + flankX(e.side, r), mid.y, 5, PALETTE.cystSac);
          break;
        case "cystCrack":
          burst(mid.x + flankX(e.side, r), mid.y, 12, PALETTE.cystScar);
          this.thudNow = Math.max(this.thudNow, THUD_TILES);
          this.hurt.hit();
          break;
        case "cystSpring":
          burst(mid.x + flankX(e.side, r) * 1.3, mid.y, 6, PALETTE.cystSac);
          this.springNow[e.side] = 1;
          break;
        case "cystBare":
          burst(mid.x, mid.y, 10, PALETTE.cystScar);
          break;
        case "cystHit":
          burst(mid.x, mid.y, 8 + 6 * e.hits, this.coreHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hurt.hit();
          break;
        case "cystPop":
          burst(fieldX(l, e.col), mid.y + r, 10, PALETTE.cystScar);
          break;
        case "cystSeal":
          burst(fieldX(l, e.col), mid.y + r * 2, 8, PALETTE.hullRim);
          break;
        case "cystSplit":
          burst(mid.x, mid.y, 24, PALETTE.cystScar);
          this.splitNow = 1;
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
      this.springNow[side] = Math.max(0, this.springNow[side] - SPRING_DECAY * step);
    }
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.splitNow = Math.max(0, this.splitNow - FLASH_DECAY * step);
    this.hurt.update(dt);
  }

  clear(): void {
    this.thudNow = 0;
    this.springNow[0] = 0;
    this.springNow[1] = 0;
    this.flashNow = 0;
    this.flashHits = 0;
    this.splitNow = 0;
    this.coreHex = PALETTE.hullRim;
    this.hurt.clear();
  }
}

/** Where flank `side`'s lobe stands off the middle, in pixels: the pilot's to the left. */
function flankX(side: 0 | 1, r: number): number {
  return (side === 0 ? -1 : 1) * r;
}
