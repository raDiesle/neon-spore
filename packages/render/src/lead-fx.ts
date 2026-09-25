import type { SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX, type ViewRole } from "./layout.js";
import { leadRidgeY } from "./lead-shape.js";
import { PALETTE } from "./palette.js";
import { showsLeadLean } from "./view-role-clocks.js";

/**
 * What THE LEAD leaves behind a frame: the **spring** the stalk leans on,
 * the **whip** a doubling back puts through it, the **segment** that tumbles
 * off the tip on a hit, and the bursts its fourteen receipts throw.
 *
 * Everything else about the boss is drawn off the world every frame
 * (`lead-draw.ts`). The spring is here for THE SINEW's reason: the
 * simulation's lean is `-1`, `0` or `1` and flips on the beat, and a stalk
 * that snapped from one side to the other in a frame would be a sign, not a
 * body — it leans over with lag and a little overshoot, which is what a
 * thing about to move looks like. The drawer *asks* for an angle every
 * frame (`aim`) and reads back where the spring has got to; the asking is
 * per screen, so the navigator's stalk is asked for nought every frame and
 * never leans, and the whip only lands where the lean is shown. All of it
 * is cleared in `Effects.reset()` (`restart.test.ts`).
 *
 * The bursts go through `Sparks` like any other event's and are read here,
 * above the loop, for THE SINEW's reason. The ones about the **body** are
 * thrown at the foot as it was last drawn, which `note` is told every
 * frame — on the pilot's screen that is the middle of the field, so a
 * receipt never says a column his screen keeps from him. The ones about a
 * **shot** or a **drop** are thrown at their own column: the shot is his,
 * and a torch or a rock is on the field for both to see.
 *
 * **A hit is a sequence landed** — a shot led to where the body would be —
 * and so is the beam taking the last segment, so both deal the stalk the
 * blow every boss takes (`boss-hurt.ts`). A flight or a miss deals nothing.
 */

/** The spring: its stiffness and its damping, a little under critical. */
const SPRING_K = 90;
const SPRING_C = 11;
/** The whip a doubling back puts in, in radians a second, and the most the
 * stalk is ever let lean. */
const WHIP = 6;
const ANGLE_MAX = 1.35;
/** The tumbling segment: how far it falls, in tiles, and for how many beats. */
const TUMBLE_TILES = 1.4;
const TUMBLE_BEATS = 1.2;

export class LeadFx {
  private angleNow = 0;
  private vel = 0;
  private target = 0;
  private footX = 0;
  private footY = 0;
  private tipX = 0;
  private tipY = 0;
  private noted = false;
  private tumbleLeft = 0;
  private tumbleLife = 1;
  private tumbleX = 0;
  private tumbleY = 0;
  private tumbleR = 0;
  /** The blow a hit deals the stalk. */
  readonly hurt = new BossHurt();

  /** Where the stalk stood this frame, for the receipts with no column of their own on this screen. */
  note(footX: number, footY: number, tipX: number, tipY: number): void {
    this.footX = footX;
    this.footY = footY;
    this.tipX = tipX;
    this.tipY = tipY;
    this.noted = true;
  }

  /** The angle the drawer wants, in radians off upright; the spring gets there over the next frames. */
  aim(angle: number): void {
    this.target = angle;
  }

  /** Where the spring has got to. */
  get angle(): number {
    return this.angleNow;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    /** Seconds a beat lasts. */
    spb: number,
    role: ViewRole,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const ridge = leadRidgeY(l);
    const atFoot = (n: number, hex: string) => {
      if (this.noted) burst(this.footX, this.footY, n, hex);
    };
    const atCol = (col: number, y: number, n: number, hex: string) =>
      burst(tileCX(l, col), y, n, hex);
    for (const e of events) {
      switch (e.type) {
        case "leadEnter":
          atFoot(10, PALETTE.hull);
          break;
        case "leadPace":
          atFoot(2, PALETTE.dim);
          break;
        case "leadTurn":
          atFoot(6, PALETTE.hullRim);
          break;
        case "leadFlight":
          atCol(e.col, ridge.bottom, 3, PALETTE.text);
          break;
        case "leadHit":
          this.hurt.hit();
          atCol(e.col, ridge.top, 12, PALETTE.hullRim);
          if (this.noted) {
            this.tumbleLife = TUMBLE_BEATS * spb;
            this.tumbleLeft = this.tumbleLife;
            this.tumbleX = this.tipX;
            this.tumbleY = this.tipY;
            this.tumbleR = l.tile * 0.14;
          }
          break;
        case "leadMiss":
          atCol(e.col, ridge.top - l.tile * 0.5, 4, PALETTE.dim);
          break;
        case "leadReverse":
          atFoot(8, PALETTE.hullRim);
          if (showsLeadLean(role)) this.vel += e.dir * WHIP;
          break;
        case "leadTorch":
          atCol(e.col, ridge.bottom, 5, PALETTE.ember);
          break;
        case "leadRock":
          atCol(e.col, ridge.bottom, 5, PALETTE.rock);
          break;
        case "leadStill":
          atFoot(8, PALETTE.hullRim);
          break;
        case "leadPass":
          atFoot(8, PALETTE.hull);
          break;
        case "leadWall":
          atFoot(6, PALETTE.dim);
          break;
        case "leadDown":
          this.hurt.hit();
          atFoot(24, PALETTE.hullRim);
          if (this.noted) burst(this.tipX, this.tipY, 10, PALETTE.hull);
          break;
        case "leadOut":
          atFoot(12, PALETTE.dim);
          break;
        default:
          break;
      }
    }
  }

  /** The spring, stepped; the tumble, run down. */
  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.vel += (this.target - this.angleNow) * SPRING_K * step - this.vel * SPRING_C * step;
    this.angleNow = Math.max(-ANGLE_MAX, Math.min(ANGLE_MAX, this.angleNow + this.vel * step));
    this.tumbleLeft = Math.max(0, this.tumbleLeft - dt);
    this.hurt.update(dt);
  }

  /** The segment that came off: a bead falling from where the tip was, fading as it goes. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.tumbleLeft <= 0) return;
    const gone = 1 - this.tumbleLeft / this.tumbleLife;
    const y = this.tumbleY + gone * gone * TUMBLE_TILES * l.tile;
    const x = this.tumbleX + Math.sin(gone * 9) * l.tile * 0.12;
    ctx.save();
    ctx.fillStyle = rgba(PALETTE.hull, 0.8 * (1 - gone));
    ctx.beginPath();
    ctx.arc(x, y, this.tumbleR * (1 - gone * 0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  clear(): void {
    this.angleNow = 0;
    this.vel = 0;
    this.target = 0;
    this.footX = 0;
    this.footY = 0;
    this.tipX = 0;
    this.tipY = 0;
    this.noted = false;
    this.tumbleLeft = 0;
    this.tumbleLife = 1;
    this.tumbleX = 0;
    this.tumbleY = 0;
    this.tumbleR = 0;
    this.hurt.clear();
  }
}
