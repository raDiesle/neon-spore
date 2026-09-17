import type { SimEvent } from "@neon-spore/sim";
import { hiveUnderY, type Point } from "./hive-shape.js";
import { type Layout, tileCX, type ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { showsHiveColor } from "./view-role-clocks-b.js";

/**
 * What THE HIVE leaves behind a frame: the **clench** a wrong colour puts
 * through the body, the **jolt** of a seal and of the last seal, and the
 * bursts its nine receipts throw.
 *
 * Everything else about the boss is drawn off the world every frame
 * (`hive-draw.ts`). The clench and the jolt are here for THE SCUTTLE's
 * reason: a provoke and a seal are one tick each in the simulation, and a
 * body that flinched and was still again inside a frame would be a sign
 * rather than a fixture — the drawer *asks* for both every frame, draws the
 * whole mass in on the clench and lifts it on the jolt, and they settle
 * over the frames after. All of it is cleared in `Effects.reset()`
 * (`restart.test.ts`).
 *
 * The bursts go through `Sparks` like any other event's and are read here,
 * above the loop, for THE SINEW's reason. Every one is thrown at the
 * underside over the column the event names, which is where its site is
 * (`hiveSiteCols`: one site a column, never two), on both screens: the mass
 * stands in the same place on each, and a column is no secret from anyone
 * under this boss — what one screen alone is shown is a breach's *colour*,
 * so an opening bursts in that colour only where the colour is drawn
 * (`view-role-clocks-b.ts`), and everywhere else in the body's own wax.
 */

/** The clench: how far the mass draws in, as a share of its width, and how fast it lets go. */
const CLENCH = 0.06;
const CLENCH_DECAY = 6;
/** The jolt: how far the mass lifts, in tiles, and how fast it settles. */
const JOLT_TILES = 0.1;
const JOLT_DECAY = 9;

export class HiveFx {
  private clenchNow = 0;
  private joltNow = 0;

  /** How far the mass is drawn in right now, as a share of its width. */
  get clench(): number {
    return this.clenchNow;
  }

  /** How far the mass is lifted right now, as a share of a tile. */
  get jolt(): number {
    return this.joltNow;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    role: ViewRole,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const at = (p: Point, n: number, hex: string) => burst(p.x, p.y, n, hex);
    const site = (col: number, dy = 0): Point => ({
      x: tileCX(l, col),
      y: hiveUnderY(l) + dy * l.tile,
    });
    for (const e of events) {
      switch (e.type) {
        case "hiveEnter":
          at(site(e.col, -0.5), 6, PALETTE.bile);
          break;
        case "hiveSwell":
          at(site(e.col, 0.2), 3, PALETTE.bileRim);
          break;
        case "hiveOpen":
          at(site(e.col, 0.2), 8, showsHiveColor(role) ? PALETTE[e.color] : PALETTE.bileRim);
          break;
        case "hiveSpill":
          at(site(e.col, 0.4), 3, PALETTE.rock);
          break;
        case "hiveSkin":
          at(site(e.col, 0.1), 4, PALETTE.dim);
          break;
        case "hiveWrong":
          at(site(e.col, 0.2), 10, PALETTE.bileRim);
          this.clenchNow = CLENCH;
          break;
        case "hiveSeal":
          at(site(e.col, 0.2), 14, PALETTE.hullRim);
          this.joltNow = JOLT_TILES;
          break;
        case "hiveDown":
          at(site(e.col, -0.3), 24, PALETTE.hullRim);
          this.joltNow = JOLT_TILES * 2;
          break;
        case "hiveOut":
          at(site(e.col, -0.6), 12, PALETTE.dim);
          break;
        default:
          break;
      }
    }
  }

  /** The clench let go, the jolt settled. */
  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.clenchNow = Math.max(0, this.clenchNow - this.clenchNow * CLENCH_DECAY * step);
    if (this.clenchNow < 0.002) this.clenchNow = 0;
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * step);
    if (this.joltNow < 0.002) this.joltNow = 0;
  }

  clear(): void {
    this.clenchNow = 0;
    this.joltNow = 0;
  }
}
