import type { FilamentState, SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { filamentBodyPoint } from "./filament-heart.js";
import { filamentPoint, type Point } from "./filament-shape.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE FILAMENT leaves behind a frame: the **whip** of a filament
 * snapping back to its free end — a lateral throw of the whole line, one
 * way for the snap and the other for the recoil — the **dark** a gap opened
 * too far leaves over the line, the **jolt** of the body as a filament is
 * pulled out of it, the **hurt** of a pull — the owner's shake and red of 24
 * September, on the body the pair just took a filament out of
 * (`boss-hurt.ts`) — and the bursts its eleven receipts throw.
 *
 * Everything else — the lit tiles, the two thumbs, the gap — is read off the
 * boss every frame (`filament-draw.ts`). These are here for THE HIVE's
 * reason: a snap is one tick in the simulation, and a line that jumped back
 * to its end inside a frame would be a sign, not a lash. All of it is
 * cleared in `Effects.reset()` (`restart.test.ts`).
 *
 * **The events of this family are read here, above the loop**, the way THE
 * INSTAR's are, rather than as rows in a spark table at its limit
 * (`effects-spark-silent-boss-b.ts` keeps the rows, for the reason written
 * over them). The drawer tells this where the head and the free end are
 * every frame (`place`): an event that carries a tile bursts on that tile,
 * and one that carries only a column bursts on the head or the body.
 */

const WHIP = 1;
const WHIP_DECAY = 6;
const DARK_DECAY = 3;
const JOLT_TILES = 0.18;
const JOLT_DECAY = 8;

export class FilamentFx {
  private whipNow = 0;
  private darkNow = 0;
  private joltNow = 0;
  /** A filament pulled out of the body: the body shakes and glows red. */
  readonly hurt = new BossHurt();
  private head: Point | null = null;
  private end: Point | null = null;

  /** How far the line is thrown sideways right now, -1..1. */
  get whip(): number {
    return this.whipNow;
  }

  /** How dark the line has gone, 0..1. */
  get dark(): number {
    return this.darkNow;
  }

  /** How far the body is lifted right now, in tiles. */
  get jolt(): number {
    return this.joltNow;
  }

  /** Told by the drawer where the head and the free end are this frame. */
  place(l: Layout, s: FilamentState): void {
    const tiles = s.tiles[s.cursor];
    const head = tiles?.[s.head];
    const end = tiles?.[0];
    this.head = head === undefined ? null : filamentPoint(l, head);
    this.end = end === undefined ? null : filamentPoint(l, end);
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const at = (p: Point, n: number, hex: string) => burst(p.x, p.y, n, hex);
    const body = filamentBodyPoint(l, cfg);
    const tile = (col: number, row: number): Point => ({ x: tileCX(l, col), y: tileCY(l, row) });
    for (const e of events) {
      switch (e.type) {
        case "filamentEnter":
          at(body, 12, PALETTE.dim);
          break;
        case "filamentArm":
          at(this.end ?? tile(e.col, 0), 6, PALETTE.wispRim);
          break;
        case "filamentDrawn":
          at(tile(e.col, e.row), 3, PALETTE.wispRim);
          break;
        case "filamentFollowed":
          at(tile(e.col, e.row), 3, PALETTE.wisp);
          break;
        case "filamentSnap":
          at(this.head ?? tile(e.col, 0), 8, PALETTE.red);
          this.whipNow = WHIP;
          break;
        case "filamentRecoil":
          at(this.head ?? tile(e.col, 0), 8, PALETTE.red);
          this.whipNow = -WHIP;
          break;
        case "filamentDark":
          at(this.head ?? tile(e.col, 0), 6, PALETTE.dim);
          this.darkNow = 1;
          break;
        case "filamentLate":
          at(this.head ?? tile(e.col, 0), 8, PALETTE.red);
          this.darkNow = 1;
          break;
        case "filamentPulled":
          at(this.end ?? tile(e.col, 0), 14, PALETTE.good);
          this.joltNow = JOLT_TILES;
          this.hurt.hit();
          break;
        case "filamentDown":
          at(body, 30, PALETTE.sheenRim);
          this.joltNow = JOLT_TILES * 2;
          this.hurt.hit();
          break;
        case "filamentOut":
          at(body, 12, PALETTE.dim);
          break;
        default:
          break;
      }
    }
  }

  /** The whip stilled, the dark lifted, the jolt settled. */
  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.whipNow -= this.whipNow * WHIP_DECAY * step;
    if (Math.abs(this.whipNow) < 0.002) this.whipNow = 0;
    this.darkNow = Math.max(0, this.darkNow - this.darkNow * DARK_DECAY * step);
    if (this.darkNow < 0.002) this.darkNow = 0;
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * step);
    if (this.joltNow < 0.002) this.joltNow = 0;
    this.hurt.update(dt);
  }

  clear(): void {
    this.whipNow = 0;
    this.darkNow = 0;
    this.joltNow = 0;
    this.hurt.clear();
    this.head = null;
    this.end = null;
  }
}
