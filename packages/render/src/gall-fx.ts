import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { gallPointAt, gallRootAt } from "./gall-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE GALL leaves behind a frame (§11.55): the **flare** of a pinch come
 * shut — the nodule's rim lit white; the **shudder** of a shut pinch let slip;
 * the **puff** of a close — a ghost of the nodule left on the point it jumped
 * off, rising and gone; the **bulge** of a close window run out, the gall
 * swelling back; the **tear** of the seam's lips as the root is bared, the
 * fibres across the split snapping back; the root's **flash** on a hit, wider
 * for every hit; and the bursts its eleven receipts throw.
 *
 * Everything else — the point, the gap, the beats kept shut, the lobes, the
 * part — is read off the boss every frame (`gall-draw.ts`, `gall-pose.ts`).
 *
 * **Both screens are thrown the same**, like the drawing. A close and a hit
 * are a step landed, so each deals the gall the blow every boss takes
 * (`boss-hurt.ts`); a pinch come shut is only a part of one. The root's
 * colour is the lit step's and not in `gallHit`, so the drawer tells it every
 * frame (`tell`). Cleared in `Effects.reset()`.
 */

/** How fast a pinch's flare fades, a slip's shudder, a swell's bulge and a close's puff, per second. */
const FLARE_DECAY = 4;
const SHUDDER_DECAY = 3;
const BULGE_DECAY = 2.5;
const PUFF_DECAY = 1.8;
/** How fast the torn fibres snap back, and a hit's flash fades, per second. */
const TEAR_DECAY = 1.2;
const FLASH_DECAY = 3;
/** How far a slip shudders the nodule either way, in tiles, and how fast, in radians a second. */
const SHUDDER_TILES = 0.1;
const SHUDDER_RATE = 38;

export class GallFx {
  private flareNow = 0;
  private shudderNow = 0;
  private bulgeNow = 0;
  private puffNow = 0;
  private puffPoint = 0;
  private puffCloses = 0;
  private tearNow = 0;
  private flashNow = 0;
  private flashHits = 0;
  private rootHex: string = PALETTE.hullRim;
  /** The blow a close and a hit deal the gall. */
  readonly hurt = new BossHurt();

  /** How bright the nodule's rim still flares for a pinch come shut, 0..1. */
  get flare(): number {
    return this.flareNow;
  }

  /** The nodule's sideways shudder this frame for a pinch let slip, in pixels. */
  shudderX(time: number, tile: number): number {
    return this.shudderNow * SHUDDER_TILES * tile * Math.sin(time * SHUDDER_RATE);
  }

  /** How far the nodule still bulges for a window run out, 0..1. */
  get bulge(): number {
    return this.bulgeNow;
  }

  /** The ghost left on the point a close jumped off: how much is left of it, where, and how many closes it had. */
  get puff(): { now: number; point: number; closes: number } {
    return { now: this.puffNow, point: this.puffPoint, closes: this.puffCloses };
  }

  /** How far the torn fibres across the split still reach, 1 as it tears and 0 gone. */
  get tear(): number {
    return this.tearNow;
  }

  /** The root hit's flash: how bright it still is, 0..1, and the hit it was. */
  get flash(): { now: number; hits: number } {
    return { now: this.flashNow, hits: this.flashHits };
  }

  /** The drawer's word for the colour the root is lit, which `gallHit` does not carry. */
  tell(rootHex: string): void {
    this.rootHex = rootHex;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    _beatSeconds: number,
    burst: Burst,
  ): void {
    for (const e of events) {
      if (!e.type.startsWith("gall")) continue;
      const root = gallRootAt(l, cfg);
      switch (e.type) {
        case "gallEnter": {
          const at = gallPointAt(l, cfg, e.point);
          burst(at.x, at.y, 10, PALETTE.gallSeam);
          break;
        }
        case "gallPinch": {
          const at = gallPointAt(l, cfg, e.point);
          burst(at.x, at.y, 5, PALETTE.hullRim);
          this.flareNow = 1;
          break;
        }
        case "gallSlip": {
          const at = gallPointAt(l, cfg, e.point);
          burst(at.x, at.y, 4, PALETTE.gallFlesh);
          this.shudderNow = 1;
          this.flareNow = 0;
          break;
        }
        case "gallClose": {
          const from = gallPointAt(l, cfg, e.from);
          burst(from.x, from.y, 10, PALETTE.gallFlesh);
          this.puffNow = 1;
          this.puffPoint = e.from;
          this.puffCloses = e.closes - 1;
          this.flareNow = 0;
          this.hurt.hit();
          break;
        }
        case "gallSwell": {
          const at = gallPointAt(l, cfg, e.point);
          burst(at.x, at.y, 6, PALETTE.gallFlesh);
          this.bulgeNow = 1;
          break;
        }
        case "gallBare":
          burst(root.x, root.y, 14, PALETTE.gallFleshDark);
          this.tearNow = 1;
          break;
        case "gallHit":
          burst(root.x, root.y, 8 + 6 * e.hits, this.rootHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hurt.hit();
          break;
        case "gallMiss":
          burst(root.x, root.y, 8, PALETTE.gallFleshDark);
          break;
        case "gallFlat":
          burst(root.x, root.y, 16, PALETTE.gallSeam);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.flareNow = Math.max(0, this.flareNow - FLARE_DECAY * step);
    this.shudderNow = Math.max(0, this.shudderNow - SHUDDER_DECAY * step);
    this.bulgeNow = Math.max(0, this.bulgeNow - BULGE_DECAY * step);
    this.puffNow = Math.max(0, this.puffNow - PUFF_DECAY * step);
    this.tearNow = Math.max(0, this.tearNow - TEAR_DECAY * step);
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.hurt.update(dt);
  }

  clear(): void {
    this.flareNow = 0;
    this.shudderNow = 0;
    this.bulgeNow = 0;
    this.puffNow = 0;
    this.puffPoint = 0;
    this.puffCloses = 0;
    this.tearNow = 0;
    this.flashNow = 0;
    this.flashHits = 0;
    this.rootHex = PALETTE.hullRim;
    this.hurt.clear();
  }
}
