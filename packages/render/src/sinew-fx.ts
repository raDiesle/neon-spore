import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { rgba } from "./hex.js";
import type { SurfaceY } from "./hull-frame.js";
import { drawHullShock } from "./hull-shock.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE SINEW leaves behind a frame: the whip a snap-back puts through
 * the mass and its handles, the flash of it, the shock it runs down the
 * hull, and the bursts its fourteen receipts throw.
 *
 * Everything else about the boss is drawn off the world every frame
 * (`sinew-draw.ts`). The snap is the exception three times over: the
 * simulation says *it snapped* on one beat and remembers only that no hand
 * may take hold for `sinewSnapBeats` (`sinewSwinging`), and a tendon that
 * threw both hands off without the mass so much as moving would be a rule
 * and not an event. So the whip is kept here — a decaying swing in tiles
 * the mass and both rings are drawn offset by — with a one-beat flash over
 * the field and a shock through the plating (`hull-shock.ts`), and all
 * three are cleared in `Effects.reset()` like everything that outlives its
 * frame (`restart.test.ts`).
 *
 * The bursts go through `Sparks` like any other event's and are read here,
 * above the loop, because `effects-spark.ts`'s table is at its limit and
 * the fourteen are one family — THE GORGE's and THE CURTAIN's arrangement.
 * The ones with no row on them are thrown at the mass as it was last drawn,
 * which `note` is told every frame; before the first frame they are thrown
 * nowhere, and nothing is lost.
 *
 * **A fibre parted is a sequence landed** — the sum held in its zone for the
 * count — and so is the last, so both deal the mass the blow every boss
 * takes (`boss-hurt.ts`). Coming into the zone deals nothing.
 */

/** The whip: how far the mass swings at the instant of the snap, in tiles,
 * how many swings a second, and how many beats it takes to die. */
const WHIP_TILES = 0.45;
const WHIP_HZ = 2.2;
const WHIP_BEATS = 2;
/** The flash: how bright at the instant, and how long, in beats. */
const FLASH_ALPHA = 0.3;
const FLASH_BEATS = 1;
/** The shock down the hull: how long, in beats. */
const SHOCK_BEATS = 1;

export class SinewFx {
  private whipLeft = 0;
  private whipLife = 1;
  private flashLeft = 0;
  private flashLife = 1;
  private shockLeft = 0;
  private shockLife = 1;
  private massX = 0;
  private massY = 0;
  private noted = false;
  /** The blow a fibre parted deals the mass. */
  readonly hurt = new BossHurt();

  /** Where the mass was drawn this frame, for the receipts with no row of their own. */
  note(x: number, y: number): void {
    this.massX = x;
    this.massY = y;
    this.noted = true;
  }

  /** The whip's offset now, in tiles: a sine dying away. */
  get swingTiles(): number {
    if (this.whipLeft <= 0) return 0;
    const gone = 1 - this.whipLeft / this.whipLife;
    return Math.sin(gone * WHIP_HZ * WHIP_BEATS * Math.PI * 2) * WHIP_TILES * (1 - gone);
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    /** Seconds a beat lasts. */
    spb: number,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const span = Math.max(1, Math.min(cfg.sinewMassCols, cfg.cols));
    const atMass = (n: number, hex: string) => {
      if (this.noted) burst(this.massX, this.massY, n, hex);
    };
    const handle = (player: 1 | 2, col: number, n: number, hex: string) => {
      if (this.noted) burst(tileCX(l, col + (player === 1 ? -span : span)), this.massY, n, hex);
    };
    for (const e of events) {
      switch (e.type) {
        case "sinewSettle":
          for (let i = 0; i < span; i++) {
            burst(tileCX(l, e.col - Math.floor(span / 2) + i), tileCY(l, e.row), 2, PALETTE.dim);
          }
          break;
        case "sinewGrip":
          handle(e.player, e.col, 3, PALETTE.text);
          break;
        case "sinewRelease":
          handle(e.player, e.col, 2, PALETTE.dim);
          break;
        case "sinewEnter":
          atMass(4, PALETTE.hullRim);
          break;
        case "sinewLoose":
          atMass(2, PALETTE.dim);
          break;
        case "sinewPart":
          burst(tileCX(l, e.col), tileCY(l, e.row) - l.tile, 12, PALETTE.hullRim);
          this.hurt.hit();
          break;
        case "sinewSnap":
          atMass(16, PALETTE.ember);
          this.snap(spb);
          break;
        case "sinewRock":
          burst(tileCX(l, e.col), tileCY(l, e.row), 4, PALETTE.rock);
          break;
        case "sinewCatch":
          // The one "something went right" moment this fight has: both hands
          // carried apart bought the beats back early, and the mint is the
          // one hue this boss's strain never touches (`palette.ts`'s `good`).
          atMass(12, PALETTE.good);
          break;
        case "sinewSlack":
          atMass(2, PALETTE.dim);
          break;
        case "sinewFall":
          burst(tileCX(l, e.col), tileCY(l, e.row), 10, PALETTE.hull);
          this.hurt.hit();
          break;
        case "sinewSwing":
          burst(tileCX(l, e.col), this.massY, 5, PALETTE.hullRim);
          break;
        case "sinewOut":
          burst(tileCX(l, e.col), l.hullY, 20, PALETTE.hullRim);
          break;
        case "sinewCrush":
          burst(tileCX(l, e.col), l.hullY, 24, PALETTE.ember);
          break;
        default:
          break;
      }
    }
  }

  private snap(spb: number): void {
    this.whipLife = WHIP_BEATS * spb;
    this.whipLeft = this.whipLife;
    this.flashLife = FLASH_BEATS * spb;
    this.flashLeft = this.flashLife;
    this.shockLife = SHOCK_BEATS * spb;
    this.shockLeft = this.shockLife;
  }

  update(dt: number): void {
    this.whipLeft = Math.max(0, this.whipLeft - dt);
    this.flashLeft = Math.max(0, this.flashLeft - dt);
    this.shockLeft = Math.max(0, this.shockLeft - dt);
    this.hurt.update(dt);
  }

  /** The flash: the whole field lit for a beat, dying away. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.flashLeft <= 0) return;
    const a = FLASH_ALPHA * (this.flashLeft / this.flashLife);
    ctx.save();
    ctx.fillStyle = rgba(PALETTE.hullRim, a);
    ctx.fillRect(l.gridLeft, l.gridTop, l.gridWidth, l.hullY - l.gridTop);
    ctx.restore();
  }

  /** The shock down the plating, on the finished ship (`frame-on-ship.ts`). */
  drawShock(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY, time: number): void {
    if (this.shockLeft <= 0) return;
    drawHullShock(ctx, l, surfaceY, time, this.shockLeft / this.shockLife);
  }

  clear(): void {
    this.whipLeft = 0;
    this.flashLeft = 0;
    this.shockLeft = 0;
    this.whipLife = 1;
    this.flashLife = 1;
    this.shockLife = 1;
    this.massX = 0;
    this.massY = 0;
    this.noted = false;
    this.hurt.clear();
  }
}
