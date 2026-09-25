import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { rgba } from "./hex.js";
import type { SurfaceY } from "./hull-frame.js";
import { drawHullShock } from "./hull-shock.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE LEDGER leaves behind a frame: the pulse a warded return throws back
 * **up** the cord, the shock the ship takes when the cord roots in it or a
 * return lands in it, the flash of the tear, and the bursts its eleven
 * receipts throw.
 *
 * Everything else about the boss is read off the world every frame
 * (`ledger-draw.ts`) — the halves, the seam, the cord's bow and every bead on
 * it are all state. Three things are not, and each is a *moment* the
 * simulation keeps nothing of:
 *
 * - **the whip.** A return warded is thrown back up the cord and widens the
 *   seam (`sim/ledger-step.ts`, `ward`). The world remembers the wider seam
 *   and nothing of the journey, and a seam that simply got wider with no
 *   travel would tell the pilot that his trigger did the damage at the body
 *   rather than that his own bill went back where it came from.
 * - **the shock through the plating.** The design asks for the hull to be the
 *   presentation of this whole fight rather than a camera, and it is asked for
 *   twice: on the rooting, and on a return the pair did not answer.
 * - **the flash of the tear**, one beat of the cord coming out of the ship.
 *
 * All four are cleared in `Effects.reset()` like everything that outlives its
 * frame (`restart.test.ts`). The bursts go through `Sparks` and are read here,
 * above the loop, because `effects-spark.ts`'s table is at its limit and the
 * eleven are one family — THE GORGE's, THE CURTAIN's and THE SINEW's
 * arrangement. Every one of the eleven carries a column, so none of them needs
 * to be told where the cord was last drawn.
 *
 * **A seam widened is a sequence landed** — the seam's colour up its column,
 * or a return warded back up the cord — and so is the tear, so each deals the
 * halves the blow every boss takes (`boss-hurt.ts`). The ward itself, and a
 * bolt refused, deal nothing.
 */

/** The whip: how many beats it takes to travel the cord, body-ward. */
const WHIP_BEATS = 1;
/** The flash: how bright at the instant, and how long, in beats. */
const FLASH_ALPHA = 0.26;
const FLASH_BEATS = 1;
/** The shock down the hull, in beats. Longer for the tear: it takes plating. */
const SHOCK_BEATS = 1;
const TEAR_SHOCK_BEATS = 2;

export class LedgerFx {
  private whipLeft = 0;
  private whipLife = 1;
  private flashLeft = 0;
  private flashLife = 1;
  private shockLeft = 0;
  private shockLife = 1;
  /** The blow a widened seam deals the halves. */
  readonly hurt = new BossHurt();

  /**
   * How far up the cord the whip has got: 1 at the socket, 0 at the body, and
   * -1 while there is none. Asked for by the drawer, the way the sinew's swing
   * is (`ledger-draw.ts`).
   */
  get whipU(): number {
    if (this.whipLeft <= 0) return -1;
    return this.whipLeft / this.whipLife;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    /** Seconds a beat lasts. */
    spb: number,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const above = l.gridTop + l.tile * 0.4;
    for (const e of events) {
      switch (e.type) {
        case "ledgerRoot":
          // The cord going in, and the ship feeling it (`hull-shock.ts`). One
          // column, because one column is where it goes in — how wide the body
          // over it stands is what the burst is *sized* by, and spreading it
          // across that width would draw a root the fight does not have.
          burst(
            tileCX(l, e.col),
            l.hullY,
            3 * Math.max(1, Math.min(e.cols, cfg.cols)),
            PALETTE.hull,
          );
          this.shockLife = SHOCK_BEATS * spb;
          this.shockLeft = this.shockLife;
          break;
        case "ledgerSeam":
          this.hurt.hit();
          // The split widening, in the colour it is showing *next*: the thing
          // the navigator has to load, thrown where she has to aim it.
          burst(tileCX(l, e.col), above, 8, e.color === "red" ? PALETTE.redRim : PALETTE.cyanRim);
          break;
        case "ledgerRefused":
          burst(tileCX(l, e.col), above, 3, PALETTE.rock);
          break;
        case "ledgerBead":
          burst(tileCX(l, e.col), l.hullY, 2, PALETTE.hull);
          break;
        case "ledgerWard":
          // The return turned in the socket, and thrown back up the cord.
          burst(tileCX(l, e.col), l.hullY, 10, PALETTE.hullRim);
          this.whipLife = WHIP_BEATS * spb;
          this.whipLeft = this.whipLife;
          break;
        case "ledgerWhip":
          this.hurt.hit();
          burst(tileCX(l, e.col), l.hullY, 6, PALETTE.hullRim);
          break;
        case "ledgerBill":
          // The one the pair did not answer. The hull's own `breach` bursts
          // beside this on the same tick, so what is added here is the ship
          // taking it — the design's presentation, said in plating.
          this.shockLife = SHOCK_BEATS * spb;
          this.shockLeft = this.shockLife;
          break;
        case "ledgerSocket":
          burst(tileCX(l, e.col), l.hullY, 3, PALETTE.dim);
          break;
        case "ledgerLast":
          burst(tileCX(l, e.col), l.hullY, 5, PALETTE.hullRim);
          break;
        case "ledgerHeld":
          burst(tileCX(l, e.col), l.hullY, 4, PALETTE.dim);
          break;
        case "ledgerTear":
          this.hurt.hit();
          burst(tileCX(l, e.col), l.hullY, 24, PALETTE.hullRim);
          this.flashLife = FLASH_BEATS * spb;
          this.flashLeft = this.flashLife;
          this.shockLife = TEAR_SHOCK_BEATS * spb;
          this.shockLeft = this.shockLife;
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    this.whipLeft = Math.max(0, this.whipLeft - dt);
    this.flashLeft = Math.max(0, this.flashLeft - dt);
    this.shockLeft = Math.max(0, this.shockLeft - dt);
    this.hurt.update(dt);
  }

  /** The tear: the field lit violet for a beat, dying away. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.flashLeft <= 0) return;
    const a = FLASH_ALPHA * (this.flashLeft / this.flashLife);
    ctx.save();
    ctx.fillStyle = rgba(PALETTE.hull, a);
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
    this.hurt.clear();
  }
}
