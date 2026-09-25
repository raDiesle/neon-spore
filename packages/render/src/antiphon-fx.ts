import type { SimConfig, SimEvent } from "@neon-spore/sim";
import {
  antiphonCentre,
  antiphonContourPath,
  antiphonPerch,
  antiphonPitSpot,
  PIT_R,
} from "./antiphon-shape.js";
import { BossHurt } from "./boss-hurt.js";
import { rgba } from "./hex.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { showsAntiphonRail } from "./view-role-clocks-b.js";

/**
 * What THE ANTIPHON leaves behind a frame: the **eruption** of every pit
 * into the shape that made it once the right ship is named, and the bursts
 * its ten receipts throw.
 *
 * Everything else about the boss is drawn off the world every frame
 * (`antiphon-draw.ts`). The eruption is here for THE LEAD's reason: the
 * burst is one tick in the simulation and the pits are still on the state
 * for `antiphonOutBeats` after it, but what comes *out* of them is the
 * picture's — each pit's contour pushing out to a full size and thinning
 * to nothing over the beats the body has left. The drawer tells this file
 * the pits every frame (`note`), so the eruption knows their shapes without
 * the event carrying sixteen indices. All of it is cleared in
 * `Effects.reset()` (`restart.test.ts`).
 *
 * The bursts go through `Sparks` like any other event's and are read here,
 * above the loop, for THE SINEW's reason. **A growth bursts where the organ
 * is drawn**: at its column on the screen shown the rail, and under the
 * middle of the body on the screen that is not — the organ's column is the
 * one thing the pilot's screen keeps from him, and a spark at it would say
 * it (`view-role-clocks-b.ts`). Everything after the shot is at the column
 * the shot went up, which both screens know.
 *
 * **A pit is a sequence landed** — the organ's colour brought to its column
 * — and so is the burst, so both deal the body the blow every boss takes
 * (`boss-hurt.ts`). A growth deals nothing.
 */

/** How far an erupting pit's contour reaches, in tiles, and how much longer than a pit it takes to get there. */
const ERUPT_TILES = 1.1;

interface Eruption {
  x: number;
  y: number;
  shape: number;
  left: number;
  life: number;
}

export class AntiphonFx {
  private pits: number[] = [];
  private eruptions: Eruption[] = [];
  /** The blow a pit or the burst deals the body. */
  readonly hurt = new BossHurt();

  /** The pits on the body this frame, by shape, for the eruption. */
  note(pits: readonly number[]): void {
    if (pits.length === this.pits.length) return;
    this.pits = pits.slice();
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    /** Seconds a beat lasts. */
    spb: number,
    role: ViewRole,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const at = (p: { x: number; y: number }, n: number, hex: string) => burst(p.x, p.y, n, hex);
    const centre = antiphonCentre(l, cfg);
    const perch = (col: number) => antiphonPerch(l, col);
    const organ = (col: number) =>
      showsAntiphonRail(role) ? perch(col) : { x: centre.x, y: perch(col).y };
    for (const e of events) {
      switch (e.type) {
        case "antiphonEnter":
          at(centre, 14, PALETTE.hull);
          break;
        case "antiphonGrow":
          at(organ(e.col), e.organs > 1 ? 4 : 6, PALETTE.hullRim);
          break;
        case "antiphonPit":
          this.hurt.hit();
          at(perch(e.col), 10, PALETTE.hullRim);
          at(antiphonPitSpot(l, cfg, e.pits - 1), 6, PALETTE.hull);
          break;
        case "antiphonHarden":
          at(perch(e.col), 6, PALETTE.dim);
          break;
        case "antiphonSink":
          at(perch(e.col), e.fired ? 6 : 3, PALETTE.dim);
          break;
        case "antiphonSpill":
          at({ x: perch(e.col).x, y: l.gridTop }, 5, PALETTE[e.color]);
          break;
        case "antiphonStill":
          at(centre, 10, PALETTE.hullRim);
          break;
        case "antiphonShip":
          at(organ(e.col), 8, PALETTE.hullRim);
          break;
        case "antiphonBurst":
          this.hurt.hit();
          this.erupt(l, cfg, spb, at);
          break;
        case "antiphonOut":
          at(centre, 16, PALETTE.dim);
          break;
        default:
          break;
      }
    }
  }

  /** Every pit noted this frame becomes an eruption, and bursts. */
  private erupt(
    l: Layout,
    cfg: SimConfig,
    spb: number,
    at: (p: { x: number; y: number }, n: number, hex: string) => void,
  ): void {
    const life = Math.max(1, cfg.antiphonOutBeats) * spb;
    this.eruptions = this.pits.map((shape, i) => {
      const p = antiphonPitSpot(l, cfg, i);
      at(p, 8, PALETTE.hullRim);
      return { x: p.x, y: p.y, shape, left: life, life };
    });
  }

  /** The eruptions, run down. */
  update(dt: number): void {
    for (const e of this.eruptions) e.left = Math.max(0, e.left - dt);
    if (this.eruptions.length > 0 && this.eruptions.every((e) => e.left <= 0)) this.eruptions = [];
    this.hurt.update(dt);
  }

  /** Each erupting pit: its contour pushing out from pit size to `ERUPT_TILES`, thinning as it goes. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    for (const e of this.eruptions) {
      if (e.left <= 0) continue;
      const gone = 1 - e.left / e.life;
      const r = l.tile * (PIT_R + (ERUPT_TILES - PIT_R) * Math.sqrt(gone));
      const p = antiphonContourPath(e.shape, e, r, gone * 2);
      ctx.save();
      ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9 * (1 - gone));
      ctx.lineWidth = 1.6;
      ctx.stroke(p);
      ctx.fillStyle = rgba(PALETTE.hull, 0.3 * (1 - gone));
      ctx.fill(p);
      ctx.restore();
    }
  }

  /** Whether anything is erupting, for the tests. */
  get erupting(): boolean {
    return this.eruptions.length > 0;
  }

  clear(): void {
    this.pits = [];
    this.eruptions = [];
    this.hurt.clear();
  }
}
