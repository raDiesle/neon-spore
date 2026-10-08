import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { HullShock } from "./hull-shock.js";
import type { Layout } from "./layout.js";
import { PAINTED_STRIPS } from "./painted-strips.js";
import { PALETTE } from "./palette.js";
import { rimeCentre, rimeHalfMiddle, rimeRadius } from "./rime-shape.js";
import { RimeVerdicts } from "./rime-verdicts.js";
import { SpriteBursts } from "./sprite-burst.js";

/**
 * What THE RIME leaves behind a frame (§29, *Presentation*): **flakes** of
 * frost shaved off a half at every reversal of a rubbing thumb, its edge
 * flashing white for each (the owner, 7 October 2026: *visual should change
 * on any rub*), and a flurry
 * of them as the half comes clear, its rim flashing white; the pale **film**
 * flashing over a half that frosts back solid, and over both as a shield step
 * runs out and the lens clouds; the **flash** of a core hit, wider for every
 * hit; the refreeze's cracks flashing white as a wipe or a shield scatters
 * them (`rime-film.ts`); the pale flash of the shatter, with a shudder down the plating; and the
 * bursts its other receipts throw. Behind `?raster=1`, the painted clearing
 * as the core lies bare (`clear`, `docs/raster.md`), which draws nothing until
 * a host installs its atlas.
 *
 * Everything else — how much of each half is clear, which one is lit, how
 * bright the core is, how far the sheets have fallen — is read off the boss
 * every frame (`rime-draw.ts`, `rime-pose.ts`).
 *
 * **Both screens are thrown the same**, like the drawing: a half is one
 * seat's, but the other has to see it come clear.
 *
 * **A half wiped clear is a step landed**, and a core hit a shot landed, so
 * both deal the pane the blow every boss takes (`boss-hurt.ts`); a shave jabs
 * it, THE GRINDSTONE's way. A step lighting, a frost back, a surge turned and
 * the lens clouding deal nothing.
 *
 * A step run out throws nothing here: the hull it breaks is the boss's own
 * blow (`boss-strike-fx.ts`). The core's colour is the lit step's and not in
 * `rimeHit`, so the drawer tells it every frame (`tell`), THE VISE's way.
 * Everything is cleared in `Effects.reset()` (`restart.test.ts`).
 */

/** How wide the painted clearing is drawn, in widths of half the pane. */
const CLEAR_WIDTH = 2.3;
/** How strong the plating's shudder is for the shatter, and how long, in beats. */
const SHATTER_FORCE = 0.8;
const SHATTER_BEATS = 1.2;
/** How fast a half's flash, the film and a hit's flash fade, per second. */
const CLEAN_DECAY = 3;
/** How fast a shave's flash fades, per second: gone before the next reversal at a thumb's pace. */
const SHAVE_DECAY = 5;
const FILM_DECAY = 2.5;
const FLASH_DECAY = 3;
/** How fast the refreeze's scattered cracks stop flashing, per second: inside the beat it adds. */
const SCATTER_DECAY = 2;

export class RimeFx {
  /** The painted clearing `rimeBare` throws over the pane: an offered look, off until installed. */
  readonly clear = new SpriteBursts(PAINTED_STRIPS["rime-clear"]);
  /** The shudder down the plating as the lens shatters. */
  readonly shock = new HullShock();
  /** The blow a half wiped clear and a core hit deal the pane. */
  readonly hurt = new BossHurt();
  /** Each mark's halo, partner's clock and verdict ring (`rime-verdicts.ts`). */
  readonly marks = new RimeVerdicts();
  private readonly cleanNow: [number, number] = [0, 0];
  private readonly filmNow: [number, number] = [0, 0];
  private readonly shaveNow: [number, number] = [0, 0];
  private flashNow = 0;
  private flashHits = 0;
  private shatterNow = 0;
  private scatterNow = 0;
  private coreHex: string = PALETTE.hullRim;

  /** How bright the flash round half `side`'s rim still is, as it came clear, 0..1. */
  cleared(side: 0 | 1): number {
    return this.cleanNow[side];
  }

  /** How bright the last reversal's flash on half `side` still is, 0..1. */
  shaved(side: 0 | 1): number {
    return this.shaveNow[side];
  }

  /** How thick the film flashing back over half `side` still is, 0..1. */
  film(side: 0 | 1): number {
    return this.filmNow[side];
  }

  /** The core hit's flash: how bright it still is, 0..1, and the hit it was (1, 2, 3). */
  get flash(): { now: number; hits: number; hex: string } {
    return { now: this.flashNow, hits: this.flashHits, hex: this.coreHex };
  }

  /** How bright the shatter's flash still is, 0..1. */
  get shattered(): number {
    return this.shatterNow;
  }

  /** How bright the refreeze's cracks still flash from the last scatter, 0..1. */
  get scatter(): number {
    return this.scatterNow;
  }

  /** The drawer's word for the colour the core is lit, which `rimeHit` does not carry. */
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
    this.marks.ingest(events);
    for (const e of events) {
      if (!e.type.startsWith("rime")) continue;
      const mid = rimeCentre(l, cfg);
      switch (e.type) {
        case "rimeEnter":
          burst(mid.x, mid.y, 12, PALETTE.rimeFrost);
          break;
        case "rimeLight":
          burst(mid.x, mid.y, 4, PALETTE.hullRim);
          break;
        case "rimeShave":
          // A pinch of flakes off the half under the thumb, every reversal.
          burst(...halfAt(l, mid, e.side), 6, PALETTE.rimeFrost);
          this.shaveNow[e.side] = 1;
          this.hurt.jab();
          break;
        case "rimeClear":
          burst(...halfAt(l, mid, e.side), 10, PALETTE.rimeFrost);
          this.cleanNow[e.side] = 1;
          this.hurt.hit();
          break;
        case "rimeFrost":
          burst(...halfAt(l, mid, e.side), 6, PALETTE.rimeFrostDeep);
          this.filmNow[e.side] = 1;
          break;
        case "rimeBare":
          this.clear.spawn(mid.x, mid.y, rimeRadius(l).rx * CLEAR_WIDTH);
          burst(mid.x, mid.y, 8, PALETTE.rimeFrost);
          break;
        case "rimeBlock":
          burst(mid.x, mid.y + rimeRadius(l).ry, 6, PALETTE.hullRim);
          break;
        case "rimeCloud":
          burst(mid.x, mid.y, 8, PALETTE.rimeFrostDeep);
          this.filmNow[0] = 1;
          this.filmNow[1] = 1;
          break;
        case "rimeHit":
          burst(mid.x, mid.y, 8 + 6 * e.hits, this.coreHex);
          this.flashNow = 1;
          this.flashHits = e.hits;
          this.hurt.hit();
          break;
        case "rimeRefreeze":
          burst(mid.x, mid.y, 6, PALETTE.rimeFrost);
          break;
        case "rimeScatter":
          burst(mid.x, mid.y, 5, PALETTE.hullRim);
          this.scatterNow = 1;
          break;
        case "rimeShatter":
          burst(mid.x, mid.y, 24, PALETTE.rimeFrost);
          this.shatterNow = 1;
          this.shock.strike(beatSeconds * SHATTER_BEATS, SHATTER_FORCE);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    for (const side of [0, 1] as const) {
      this.cleanNow[side] = Math.max(0, this.cleanNow[side] - CLEAN_DECAY * step);
      this.filmNow[side] = Math.max(0, this.filmNow[side] - FILM_DECAY * step);
      this.shaveNow[side] = Math.max(0, this.shaveNow[side] - SHAVE_DECAY * step);
    }
    this.flashNow = Math.max(0, this.flashNow - FLASH_DECAY * step);
    if (this.flashNow === 0) this.flashHits = 0;
    this.shatterNow = Math.max(0, this.shatterNow - FLASH_DECAY * step);
    this.scatterNow = Math.max(0, this.scatterNow - SCATTER_DECAY * step);
    this.clear.update(dt);
    this.shock.update(dt);
    this.hurt.update(dt);
    this.marks.update(dt);
  }

  reset(): void {
    this.cleanNow[0] = 0;
    this.cleanNow[1] = 0;
    this.filmNow[0] = 0;
    this.filmNow[1] = 0;
    this.shaveNow[0] = 0;
    this.shaveNow[1] = 0;
    this.flashNow = 0;
    this.flashHits = 0;
    this.shatterNow = 0;
    this.scatterNow = 0;
    this.coreHex = PALETTE.hullRim;
    this.clear.clear();
    this.shock.clear();
    this.hurt.clear();
    this.marks.clear();
  }
}

/** The middle of half `side`, in pixels: the pilot's to the left. */
function halfAt(l: Layout, mid: { x: number; y: number }, side: 0 | 1): [number, number] {
  const m = rimeHalfMiddle(l, side);
  return [mid.x + m.x, mid.y + m.y];
}
