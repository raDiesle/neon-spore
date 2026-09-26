import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import type { SurfaceY } from "./hull-frame.js";
import { drawHullShock } from "./hull-shock.js";
import { keelRockPoint, keelSegCentre, type Point, RISE } from "./keel-shape.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE KEEL leaves behind a frame: the **snap** of a segment as it locks,
 * the **jolt** of the whole spine as a joint or the socket takes, the **shock**
 * a hit sends through the hull, and the bursts its sixteen receipts throw.
 *
 * Everything else — which segments are locked, how far the midpoint is
 * hinged, where the rock has fallen to — is read off the boss every frame
 * (`keel-draw.ts`, `keel-pose.ts`).
 *
 * **Both screens are thrown the same**, like the drawing: whose joint it is
 * is where it sits, and both players have to see a lock land to know whose
 * thumb it was.
 *
 * **A lock is a sequence landed** — a thumb inside the window — and so is the
 * shot that shuts the socket, so both deal the spine the blow every boss
 * takes (`boss-hurt.ts`). A joint lighting, missing or slipping deals nothing.
 *
 * Two things are told or timed here rather than carried by the event. The
 * socket's colour is the wave's and not in `keelShut`, so the drawer tells it
 * every frame (`tell`). The rock is shot out wherever it had fallen to and the
 * event says only the column, so its fall is timed from the throw on this
 * side too and the burst thrown where the drawing had it (`keelRockPoint`).
 * Everything is cleared in `Effects.reset()` (`restart.test.ts`).
 */

/** How far the spine is jolted up by a lock, and by the socket shutting, in tiles. */
const JOLT_TILES = 0.08;
const SHUT_JOLT = 0.2;
const JOLT_DECAY = 9;
/** How fast a lock's snap on its seam fades, per second. */
const SNAP_DECAY = 3.5;
/** The hull's shudder, in beats. */
const SHOCK_BEATS = 1;

export class KeelFx {
  private joltNow = 0;
  private snaps: number[] = [];
  private shockLeft = 0;
  private shockLife = 1;
  private rockAge = 0;
  private rockFall = 0;
  private socketHex: string = PALETTE.hullRim;
  /** The blow a lock and a shut socket deal the spine. */
  readonly hurt = new BossHurt();

  /** How far the whole spine is jolted up right now, in tiles. */
  get jolt(): number {
    return this.joltNow;
  }

  /** How bright segment `k`'s seam flares from its lock, 0..1. */
  snap(k: number): number {
    return this.snaps[k] ?? 0;
  }

  /** The drawer's word for the colour the socket flashes, which `keelShut` does not carry. */
  tell(socketHex: string): void {
    this.socketHex = socketHex;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    beatSeconds: number,
    burst: Burst,
  ): void {
    for (const e of events) {
      if (!e.type.startsWith("keel")) continue;
      const n = cfg.keelSegments;
      const seg = (k: number): Point => keelSegCentre(l, cfg, k, n, RISE, 0);
      const mid = middle(l, cfg);
      switch (e.type) {
        case "keelEnter":
          burst(mid.x, mid.y, 12, PALETTE.rock);
          break;
        case "keelLight": {
          const at = seg(e.seg);
          burst(at.x, at.y, 4, PALETTE.hullRim);
          break;
        }
        case "keelLock": {
          const at = seg(e.seg);
          burst(at.x, at.y, 10, PALETTE.hullRim);
          this.setSnap(e.seg, 1);
          this.joltNow = Math.max(this.joltNow, JOLT_TILES);
          this.hurt.hit();
          break;
        }
        case "keelMiss": {
          const at = seg(e.seg);
          burst(at.x, at.y, 5, PALETTE.rockDark);
          break;
        }
        case "keelSlip": {
          const at = seg(e.seg);
          burst(at.x, at.y, 8, PALETTE.rock);
          this.setSnap(e.seg, 0);
          break;
        }
        case "keelSplit":
          burst(mid.x, mid.y, 12, PALETTE.rock);
          break;
        case "keelShut":
          burst(mid.x, mid.y, 16, this.socketHex);
          for (const k of [n / 2 - 1, n / 2]) this.setSnap(k, 1);
          this.joltNow = SHUT_JOLT;
          this.hurt.hit();
          break;
        case "keelSocketHit":
        case "keelRockHit":
          burst(fieldX(l, e.col), tileCY(l, cfg.rows - 1), 20, PALETTE.red);
          this.shock(beatSeconds);
          if (e.type === "keelRockHit") this.rockFall = 0;
          break;
        case "keelRigid":
          for (let k = 0; k < n; k++) this.setSnap(k, 1);
          this.joltNow = SHUT_JOLT;
          break;
        case "keelThrow":
          this.rockAge = 0;
          this.rockFall = Math.max(1, cfg.keelRockBeats) * beatSeconds;
          break;
        case "keelRockOut": {
          const along = Math.min(1, this.rockAge / Math.max(1e-6, this.rockFall));
          const rock = keelRockPoint(l, seg(n - 1), e.col, along);
          burst(rock.x, rock.y, 12, PALETTE.rock);
          this.rockFall = 0;
          break;
        }
        case "keelStraight":
          for (let k = 0; k < n; k++) {
            const at = seg(k);
            burst(at.x, at.y, 6, PALETTE.hullRim);
          }
          break;
        default:
          break;
      }
    }
  }

  /** Segment `k`'s snap, the list grown with zeros to reach it so it is never sparse. */
  private setSnap(k: number, v: number): void {
    while (this.snaps.length <= k) this.snaps.push(0);
    this.snaps[k] = v;
  }

  private shock(beatSeconds: number): void {
    this.shockLife = SHOCK_BEATS * beatSeconds;
    this.shockLeft = this.shockLife;
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * step);
    if (this.joltNow < 0.002) this.joltNow = 0;
    this.snaps = this.snaps.map((v) => Math.max(0, v - SNAP_DECAY * step));
    if (this.snaps.every((v) => v === 0)) this.snaps = [];
    this.shockLeft = Math.max(0, this.shockLeft - dt);
    if (this.rockFall > 0) this.rockAge += dt;
    this.hurt.update(dt);
  }

  /** The shudder down the plating as the socket or the rock hits the hull (`frame-on-ship.ts`). */
  drawShock(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY, time: number): void {
    if (this.shockLeft <= 0) return;
    drawHullShock(ctx, l, surfaceY, time, this.shockLeft / this.shockLife);
  }

  clear(): void {
    this.joltNow = 0;
    this.snaps = [];
    this.shockLeft = 0;
    this.shockLife = 1;
    this.rockAge = 0;
    this.rockFall = 0;
    this.socketHex = PALETTE.hullRim;
    this.hurt.clear();
  }
}

/** Where the midpoint splits and the socket sits: half way between the middle two segments, on the arch at rest. */
function middle(l: Layout, cfg: SimConfig): Point {
  const n = cfg.keelSegments;
  const a = keelSegCentre(l, cfg, n / 2 - 1, n, RISE, 0);
  const b = keelSegCentre(l, cfg, n / 2, n, RISE, 0);
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
