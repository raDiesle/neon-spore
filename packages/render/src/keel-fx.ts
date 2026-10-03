import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { strikeOut } from "./boss-strike-fx.js";
import type { Burst } from "./effects-boss.js";
import { fieldX } from "./field-flip.js";
import { HullShock } from "./hull-shock.js";
import { keelRockPoint } from "./keel-rock.js";
import { keelSegCentre, type Point, RISE } from "./keel-shape.js";
import { keelStoryReceipt } from "./keel-story-fx.js";
import { KeelVerdicts } from "./keel-verdicts.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE KEEL leaves behind a frame: the **snap** of a segment as it locks,
 * the **jolt** of the whole spine as a joint or the socket takes, the **shock**
 * a hit sends through the hull, and the bursts the fight's receipts throw;
 * the story's between are `keel-story-fx.ts`'s, called for the rest.
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
 *
 * **A hit on the hull shows when the thing that hit it gets there.** The
 * socket's hit is a blow out of the boss (`boss-strike-fx.ts`), still on its
 * way for a fraction of a second after the rule has counted it, so its burst
 * and the shudder are held until it lands (`arrivals.ts` says why). The rock
 * is already at the hull when it hits — the sim breaks it from the hull row —
 * so its burst and shudder are thrown at once.
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
  /** The shudder down the plating as the socket or the rock hits the hull (`frame-on-ship.ts`). */
  readonly shock = new HullShock();
  private rockAge = 0;
  private rockFall = 0;
  private socketHex: string = PALETTE.hullRim;
  /** The socket's hits still on their way to the hull: seconds left, and what they throw on landing. */
  private held: { left: number; land: () => void }[] = [];
  /** The blow a lock and a shut socket deal the spine. */
  readonly hurt = new BossHurt();
  /** The verdict on each joint (`keel-verdicts.ts`). */
  readonly marks = new KeelVerdicts();

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
    this.marks.ingest(events, cfg.keelSegments);
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
        case "keelRockHit": {
          const x = fieldX(l, e.col);
          const y = tileCY(l, cfg.rows - 1);
          const land = (): void => {
            burst(x, y, 20, PALETTE.red);
            this.shock.strike(SHOCK_BEATS * beatSeconds, 1);
          };
          if (e.type === "keelSocketHit") this.held.push({ left: strikeOut(beatSeconds), land });
          else {
            land();
            this.rockFall = 0;
          }
          break;
        }
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
          keelStoryReceipt(e, n, (k) => this.setSnap(k, 1));
          break;
      }
    }
  }

  /** Segment `k`'s snap, the list grown with zeros to reach it so it is never sparse. */
  private setSnap(k: number, v: number): void {
    while (this.snaps.length <= k) this.snaps.push(0);
    this.snaps[k] = v;
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * step);
    if (this.joltNow < 0.002) this.joltNow = 0;
    this.snaps = this.snaps.map((v) => Math.max(0, v - SNAP_DECAY * step));
    if (this.snaps.every((v) => v === 0)) this.snaps = [];
    for (const h of this.held) h.left -= dt;
    const landed = this.held.filter((h) => h.left <= 0);
    this.held = this.held.filter((h) => h.left > 0);
    for (const h of landed) h.land();
    this.shock.update(dt);
    if (this.rockFall > 0) this.rockAge += dt;
    this.hurt.update(dt);
    this.marks.update(dt);
  }

  clear(): void {
    this.joltNow = 0;
    this.snaps = [];
    this.shock.clear();
    this.rockAge = 0;
    this.rockFall = 0;
    this.socketHex = PALETTE.hullRim;
    this.held = [];
    this.hurt.clear();
    this.marks.clear();
  }
}

/** Where the midpoint splits and the socket sits: half way between the middle two segments, on the arch at rest. */
function middle(l: Layout, cfg: SimConfig): Point {
  const n = cfg.keelSegments;
  const a = keelSegCentre(l, cfg, n / 2 - 1, n, RISE, 0);
  const b = keelSegCentre(l, cfg, n / 2, n, RISE, 0);
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
