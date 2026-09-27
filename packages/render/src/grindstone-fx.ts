import { GRINDSTONE_PASSES_PER_FLAT, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import {
  grindstoneBolt,
  grindstoneCentre,
  grindstoneCut,
  grindstonePadAt,
} from "./grindstone-shape.js";
import { HullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE GRINDSTONE leaves behind a frame (§33, *Presentation*): **grit**
 * shaved off a flat at every reversal; the **flash** along a flat's face as a
 * pass comes clean; the caliper's **flare** as it bites or a clamp is held
 * home, with a thud of the wheel pressed down and a shudder down the plating;
 * the **flash** of an axle hit, wider for every hit; the pale flash and the
 * harder shudder of the wheel snapping free; and the bursts its other
 * receipts throw.
 *
 * Everything else — how deep each flat is cut, how much of it is clean, how
 * far the caliper is shut, how bright the axle is — is read off the boss
 * every frame (`grindstone-draw.ts`, `grindstone-pose.ts`).
 *
 * **Both screens are thrown the same**, like the drawing: a flat and a jaw
 * are one seat's, but the other has to see it land.
 *
 * **A pass ground clean is a step landed**, and an axle hit a shot landed, so
 * both deal the wheel the blow every boss takes (`boss-hurt.ts`) — the passes
 * and the hits are its health together (§11.50). A shave, a step lighting, a
 * regrit, a slip, the bite, a clamp and the caliper springing loose deal
 * nothing.
 *
 * A fire step run out throws nothing here: the hull it breaks is the boss's
 * own blow (`boss-strike-fx.ts`). The axle's colour is the lit step's and not
 * in `grindstoneHit`, so the drawer tells it every frame (`tell`), THE VISE's
 * way. Everything is cleared in `Effects.reset()` (`restart.test.ts`).
 */

/** How far the wheel is pressed down by the caliper biting, in tiles, and how fast it rises back. */
const THUD_TILES = 0.06;
const THUD_DECAY = 9;
/** How strong the plating's shudder is for a bite and for the snap free, and how long, in beats. */
const BITE_FORCE = 0.35;
const BITE_BEATS = 0.5;
const FREE_FORCE = 0.8;
const FREE_BEATS = 1.2;
/** How fast a flat's flash, the caliper's flare and a hit's flash fade, per second. */
const CLEAN_DECAY = 3;
const FLARE_DECAY = 4;
const FLASH_DECAY = 3;

export class GrindstoneFx {
  private thudNow = 0;
  private readonly cleanNow: [number, number] = [0, 0];
  private flareNow = 0;
  private flashNow = 0;
  private flashHits = 0;
  private freeNow = 0;
  private axleHex: string = PALETTE.hullRim;
  /** The shudder down the plating as the caliper bites or the wheel snaps free. */
  readonly shock = new HullShock();
  /** The blow a clean pass and an axle hit deal the wheel. */
  readonly hurt = new BossHurt();

  /** How far the whole wheel is pressed down right now, in tiles. */
  get thud(): number {
    return this.thudNow;
  }

  /** How bright the flash along flat `side`'s face still is, 0..1. */
  clean(side: 0 | 1): number {
    return this.cleanNow[side];
  }

  /** How bright the flare along both jaws still is, 0..1. */
  get flare(): number {
    return this.flareNow;
  }

  /** The axle hit's flash: how bright it still is, 0..1, and the hit it was (1, 2, 3). */
  get flash(): { now: number; hits: number } {
    return { now: this.flashNow, hits: this.flashHits };
  }

  /** How bright the snap free's flash still is, 0..1. */
  get free(): number {
    return this.freeNow;
  }

  /** The drawer's word for the colour the axle is lit, which `grindstoneHit` does not carry. */
  tell(axleHex: string): void {
    this.axleHex = axleHex;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    for (const e of events) {
      if (!e.type.startsWith("grindstone")) continue;
      const mid = grindstoneCentre(l, cfg);
      switch (e.type) {
        case "grindstoneEnter":
          burst(mid.x, mid.y, 12, PALETTE.grindstoneStone);
          break;
        case "grindstoneLight":
          burst(mid.x, mid.y, 4, PALETTE.hullRim);
          break;
        case "grindstoneShave":
          // A pinch of grit off the face under the thumb, every reversal.
          burst(...flatAt(l, mid, e.side, 0.5), 3, PALETTE.grindstoneStoneDark);
          this.hurt.jab();
          break;
        case "grindstoneClear":
          burst(
            ...flatAt(l, mid, e.side, e.passes / GRINDSTONE_PASSES_PER_FLAT),
            10,
            PALETTE.grindstoneFlat,
          );
          this.cleanNow[e.side] = 1;
          this.hurt.hit();
          break;
        case "grindstoneRegrit":
          burst(...flatAt(l, mid, e.side, 0.5), 6, PALETTE.grindstoneStoneDark);
          break;
        case "grindstoneSlip":
          burst(...padsAt(l, mid, e.side), 4, PALETTE.hullRim);
          break;
        case "grindstoneBite":
        case "grindstoneClamp": {
          // The caliper snapping home on the wheel: a flare along both jaws, the stone pressed down.
          const bolt = grindstoneBolt(l, 1);
          burst(mid.x + bolt.x, mid.y + bolt.y, 10, PALETTE.rock);
          this.flareNow = 1;
          this.thudNow = Math.max(this.thudNow, THUD_TILES);
          this.shock.strike(beatSeconds * BITE_BEATS, BITE_FORCE);
          break;
        }
        case "grindstoneLoose":
          burst(...padsAt(l, mid, 0), 4, PALETTE.rockDark);
          burst(...padsAt(l, mid, 1), 4, PALETTE.rockDark);
          break;
        case "grindstoneHit":
          burst(mid.x, mid.y, 8 + 6 * e.hits, this.axleHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hurt.hit();
          break;
        case "grindstoneFree":
          burst(mid.x, mid.y, 24, PALETTE.grindstoneFlat);
          this.freeNow = 1;
          this.shock.strike(beatSeconds * FREE_BEATS, FREE_FORCE);
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
      this.cleanNow[side] = Math.max(0, this.cleanNow[side] - CLEAN_DECAY * step);
    }
    this.flareNow = Math.max(0, this.flareNow - FLARE_DECAY * step);
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.freeNow = Math.max(0, this.freeNow - FLASH_DECAY * step);
    this.shock.update(dt);
    this.hurt.update(dt);
  }

  clear(): void {
    this.thudNow = 0;
    this.cleanNow[0] = 0;
    this.cleanNow[1] = 0;
    this.flareNow = 0;
    this.flashNow = 0;
    this.flashHits = 0;
    this.freeNow = 0;
    this.shock.clear();
    this.axleHex = PALETTE.hullRim;
    this.hurt.clear();
  }
}

/** The middle of flat `side`'s face, cut `depth` of the way, in pixels: the pilot's to the left. */
function flatAt(
  l: Layout,
  mid: { x: number; y: number },
  side: 0 | 1,
  depth: number,
): [number, number] {
  const cut = grindstoneCut(l, depth);
  return [mid.x + (side === 0 ? -cut : cut), mid.y];
}

/** Between jaw `side`'s two pads, shut, in pixels. */
function padsAt(l: Layout, mid: { x: number; y: number }, side: 0 | 1): [number, number] {
  const a = grindstonePadAt(l, side, 0, 1);
  const b = grindstonePadAt(l, side, 1, 1);
  return [mid.x + (a.x + b.x) / 2, mid.y + (a.y + b.y) / 2];
}
