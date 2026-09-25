import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX, type ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type Point, scuttlePlatePath, scuttleSocket } from "./scuttle-shape.js";
import { showsScuttleLive } from "./view-role-clocks-b.js";

/**
 * What THE SCUTTLE leaves behind a frame: the **jolt** a throw puts through
 * the frame, the **plate** that tumbles off the thread when a shot strikes
 * a hanging part, and the bursts its ten receipts throw.
 *
 * Everything else about the boss is drawn off the world every frame
 * (`scuttle-draw.ts`). The jolt is here for THE SURGE's reason: a throw is
 * one tick in the simulation, and a frame that snapped and was still again
 * in a frame would be a sign, not a fixture — it kicks up and settles over
 * the frames after. The drawer *asks* for the jolt every frame and stands
 * the whole frame on it. The struck plate is THE LEAD's tumbling bead: the
 * part is `null` the tick it is struck, and what falls is the picture's.
 * All of it is cleared in `Effects.reset()` (`restart.test.ts`).
 *
 * The bursts go through `Sparks` like any other event's and are read here,
 * above the loop, for THE SINEW's reason. Every one is thrown at the socket
 * the event names, on both screens: the frame stands in the same place on
 * each, and a column is no secret from anyone under this boss — what the
 * navigator's screen alone is shown is *which* hanging part counts, so the
 * detachment of a live part bursts in the lock's tone only where the lock
 * is drawn (`view-role-clocks-b.ts`), and everywhere else in grey.
 *
 * **A part struck off is a sequence landed** — the live one named, and a
 * shot in its column and colour while it hangs — and so is the beam, so both
 * deal the slab the blow every boss takes (`boss-hurt.ts`). A shot rebuffed
 * deals nothing.
 */

/** The jolt: how far it kicks, in tiles, and how fast it settles. */
const JOLT_TILES = 0.12;
const JOLT_DECAY = 9;
/** The tumbling plate: how far it falls, in tiles, for how many beats, and how fast it turns. */
const TUMBLE_TILES = 1.6;
const TUMBLE_BEATS = 1.1;
const TUMBLE_SPIN = 7;

export class ScuttleFx {
  private joltNow = 0;
  private hangX = 0;
  private hangY = 0;
  private noted = false;
  private tumbleLeft = 0;
  private tumbleLife = 1;
  private tumbleX = 0;
  private tumbleY = 0;
  private tumbleHex = PALETTE.rock;
  /** The blow a part struck off deals the slab. */
  readonly hurt = new BossHurt();

  /** Where the live part hung this frame, for the strike that takes it. */
  note(x: number, y: number): void {
    this.hangX = x;
    this.hangY = y;
    this.noted = true;
  }

  /** How far the frame is kicked up right now, as a share of a tile. */
  get jolt(): number {
    return this.joltNow;
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
    const at = (p: Point, n: number, hex: string) => burst(p.x, p.y, n, hex);
    const socket = (i: number) => scuttleSocket(l, cfg, i);
    const col = (c: number, dy: number) => ({ x: tileCX(l, c), y: l.gridTop + dy * l.tile });
    for (const e of events) {
      switch (e.type) {
        case "scuttleEnter":
          for (let i = 0; i < e.parts; i++) at(socket(i), 2, PALETTE.rock);
          break;
        case "scuttleLoose":
          at(
            socket(e.socket),
            5,
            e.live && showsScuttleLive(role) ? PALETTE.shieldRim : PALETTE.dim,
          );
          break;
        case "scuttleThrow":
          at(col(e.col, -0.3), 6, PALETTE.rock);
          this.joltNow = JOLT_TILES;
          break;
        case "scuttleStruck":
          this.hurt.hit();
          at(this.noted ? { x: this.hangX, y: this.hangY } : socket(e.socket), 14, PALETTE.hullRim);
          this.tumbleLife = TUMBLE_BEATS * spb;
          this.tumbleLeft = this.tumbleLife;
          this.tumbleX = this.noted ? this.hangX : socket(e.socket).x;
          this.tumbleY = this.noted ? this.hangY : socket(e.socket).y;
          this.tumbleHex = PALETTE.rock;
          break;
        case "scuttleRebuff":
          at(col(e.col, -0.6), 4, PALETTE.dim);
          break;
        case "scuttleSlack":
          at(col(e.col, cfg.scuttlePodRow), 8, PALETTE.podRim);
          break;
        case "scuttleWind":
          at(socket(e.socket), 8, PALETTE.hullRim);
          break;
        case "scuttleLast":
          at(col(e.col, -0.3), 10, PALETTE.rock);
          this.joltNow = JOLT_TILES * 2;
          break;
        case "scuttleDown":
          this.hurt.hit();
          at(col(e.col, -0.9), 24, PALETTE.hullRim);
          this.joltNow = JOLT_TILES * 2;
          break;
        case "scuttleOut":
          at(col(e.col, -0.9), 12, PALETTE.dim);
          break;
        default:
          break;
      }
    }
  }

  /** The jolt, settled; the tumble, run down. */
  update(dt: number): void {
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * Math.min(dt, 1 / 30));
    if (this.joltNow < 0.002) this.joltNow = 0;
    this.tumbleLeft = Math.max(0, this.tumbleLeft - dt);
    this.hurt.update(dt);
  }

  /** The plate that came off: turning as it falls from where the part hung, fading as it goes. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.tumbleLeft <= 0) return;
    const gone = 1 - this.tumbleLeft / this.tumbleLife;
    const y = this.tumbleY + gone * gone * TUMBLE_TILES * l.tile;
    const x = this.tumbleX + Math.sin(gone * 6) * l.tile * 0.1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(gone * TUMBLE_SPIN);
    ctx.fillStyle = rgba(this.tumbleHex, 0.8 * (1 - gone));
    ctx.fill(scuttlePlatePath(l, { x: 0, y: 0 }, 1 - gone * 0.4));
    ctx.restore();
  }

  clear(): void {
    this.joltNow = 0;
    this.hangX = 0;
    this.hangY = 0;
    this.noted = false;
    this.tumbleLeft = 0;
    this.tumbleLife = 1;
    this.tumbleX = 0;
    this.tumbleY = 0;
    this.tumbleHex = PALETTE.rock;
    this.hurt.clear();
  }
}
