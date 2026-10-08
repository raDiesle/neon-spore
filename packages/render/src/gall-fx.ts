import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { gallPointAt, gallSeamY } from "./gall-shape.js";
import { GallVerdicts } from "./gall-verdicts.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE GALL leaves behind a frame (§11.55): the **flare** of a tap — its
 * rim lit white; the **shudder** of a hand it refused; the **puff** of a
 * leap — a ghost of it left on the point it jumped off, rising and gone; the
 * **bulge** of a landing; the **flash** of a hit, wider for every hit; and
 * the bursts its receipts throw.
 *
 * Everything else — the point, the taps, the flight, the lobes — is read off
 * the boss every frame (`gall-draw.ts`, `gall-pose.ts`).
 *
 * **Both screens are thrown the same**, like the drawing. A leap and a hit
 * are a step landed, so each deals it the blow every boss takes
 * (`boss-hurt.ts`); a tap is only a part of one. The colour it is lit is the
 * lit step's and not in `gallHit`, so the drawer tells it every frame
 * (`tell`). Cleared in `Effects.reset()`.
 */

/** How fast a tap's flare fades, a refusal's shudder, a landing's bulge and a leap's puff, per second. */
const FLARE_DECAY = 4;
const SHUDDER_DECAY = 3;
const BULGE_DECAY = 2.5;
const PUFF_DECAY = 1.8;
/** How fast a hit's flash fades, per second. */
const FLASH_DECAY = 3;
/** How far a refusal shudders it either way, in tiles, and how fast, in radians a second. */
const SHUDDER_TILES = 0.1;
const SHUDDER_RATE = 38;

export class GallFx {
  private flareNow = 0;
  private shudderNow = 0;
  private bulgeNow = 0;
  private puffNow = 0;
  private puffPoint = 0;
  private puffHits = 0;
  private flashNow = 0;
  private flashHits = 0;
  private hitsSeen = 0;
  private litHex: string = PALETTE.hullRim;
  /** The blow a leap and a hit deal it. */
  readonly hurt = new BossHurt();
  /** Whether the last touch on each of the seam's marks was right (`gall-verdicts.ts`). */
  readonly verdicts = new GallVerdicts();

  /** How bright its rim still flares for a tap, 0..1. */
  get flare(): number {
    return this.flareNow;
  }

  /** Its sideways shudder this frame for a hand it refused, in pixels. */
  shudderX(time: number, tile: number): number {
    return this.shudderNow * SHUDDER_TILES * tile * Math.sin(time * SHUDDER_RATE);
  }

  /** How far it still bulges for a landing, 0..1. */
  get bulge(): number {
    return this.bulgeNow;
  }

  /** The ghost left on the point a leap jumped off: how much is left of it, where, and how many hits it had. */
  get puff(): { now: number; point: number; hits: number } {
    return { now: this.puffNow, point: this.puffPoint, hits: this.puffHits };
  }

  /** A hit's flash: how bright it still is, 0..1, and the hit it was. */
  get flash(): { now: number; hits: number } {
    return { now: this.flashNow, hits: this.flashHits };
  }

  /** The drawer's word for the colour it is lit, which `gallHit` does not carry. */
  tell(litHex: string): void {
    this.litHex = litHex;
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
      if (!e.type.startsWith("gall")) continue;
      switch (e.type) {
        case "gallEnter": {
          const at = gallPointAt(l, cfg, e.point);
          burst(at.x, at.y, 10, PALETTE.gallSeam);
          break;
        }
        case "gallTap": {
          const at = gallPointAt(l, cfg, e.point);
          burst(at.x, at.y, 3 + e.taps, PALETTE.hullRim);
          this.flareNow = 1;
          break;
        }
        case "gallWhiff":
          this.shudderNow = 1;
          this.flareNow = 0;
          break;
        case "gallLeap": {
          const from = gallPointAt(l, cfg, e.from);
          burst(from.x, from.y, 10, PALETTE.gallFlesh);
          this.puffNow = 1;
          this.puffPoint = e.from;
          this.puffHits = this.hitsSeen;
          this.flareNow = 0;
          this.hurt.hit();
          break;
        }
        case "gallLand": {
          const at = gallPointAt(l, cfg, e.point);
          burst(at.x, at.y, 12, PALETTE.gallSeam);
          this.bulgeNow = 1;
          break;
        }
        case "gallHit": {
          const at = gallColAt(l, e.col);
          burst(at.x, at.y, 8 + 6 * e.hits, this.litHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hitsSeen = e.hits;
          this.hurt.hit();
          break;
        }
        case "gallMiss":
        case "gallFlat": {
          const at = gallColAt(l, e.col);
          burst(at.x, at.y, e.type === "gallFlat" ? 16 : 8, PALETTE.gallFleshDark);
          break;
        }
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
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.hurt.update(dt);
    this.verdicts.update(dt);
  }

  clear(): void {
    this.flareNow = 0;
    this.shudderNow = 0;
    this.bulgeNow = 0;
    this.puffNow = 0;
    this.puffPoint = 0;
    this.puffHits = 0;
    this.hitsSeen = 0;
    this.flashNow = 0;
    this.flashHits = 0;
    this.litHex = PALETTE.hullRim;
    this.hurt.clear();
    this.verdicts.clear();
  }
}

/** The seam over column `col`, where a hit or a miss in it bursts. */
function gallColAt(l: Layout, col: number): { x: number; y: number } {
  return { x: fieldX(l, col), y: gallSeamY(l) };
}
