import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { POD_TILES } from "./pods.js";
import { splinePath } from "./spline.js";
import { SWINDLE_STRAND_TILES } from "./swindle-place.js";
import { swindleHood } from "./swindle-shape.js";
import { SWINDLE_FLESH, SWINDLE_RIM } from "./swindle-tint.js";

/**
 * What THE SWINDLE leaves behind a frame: a hood flying up off a pod she lets
 * go, her lean toward it, and the blow every boss takes.
 *
 * Everything else is drawn off the boss and the pods every frame
 * (`swindle-draw.ts`). Her ten events are read here above the loop the way
 * THE MATRON's are (`matron-fx.ts`), each on the column it names:
 * - a pod **let go** (`swindleDrop`) has its hood lifted off it: the hood
 *   flies up into her belly and is gone, and she leans after it — the same
 *   for a real pod and a fake, since the drop does not say which;
 * - a shot **stopped on a hood** (`swindleHood`) spits a few drops off it;
 * - a real pod **swallowed** is a counted hit, a fake **refused** a shrug;
 * - a hand **cleared** shudders her; **beaten**, the blow of a fight landed.
 */

/** Seconds a lifted hood takes to reach her, and a lean to ease back. */
const LIFT_LIFE = 0.5;
const LEAN_LIFE = 0.9;
/** Her lean toward a drop at the field's edge, in radians. */
const LEAN_MAX = 0.1;

interface Lifted {
  x: number;
  y: number;
  age: number;
}

type Burst = (x: number, y: number, n: number, hex: string) => void;

export class SwindleFx {
  private lifted: Lifted[] = [];
  private leanTo = 0;
  private leanAge = LEAN_LIFE;
  /** The blow a real pod swallowed deals her, and the last hand more. */
  readonly hurt = new BossHurt();

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, burst: Burst): void {
    const row = tileCY(l, cfg.swindlePodRow);
    const belly = row - SWINDLE_STRAND_TILES * l.tile;
    const mid = (cfg.cols - 1) / 2;
    for (const e of events) {
      switch (e.type) {
        case "swindleDrop":
          this.lifted.push({ x: tileCX(l, e.col), y: row, age: 0 });
          this.leanTo = Math.max(-1, Math.min(1, (e.col - mid) / Math.max(1, mid))) * LEAN_MAX;
          this.leanAge = 0;
          break;
        case "swindleHood":
          burst(tileCX(l, e.col), row - POD_TILES * l.tile, 3, SWINDLE_RIM);
          break;
        case "swindleTaken":
          burst(tileCX(l, mid), belly, 10, SWINDLE_RIM);
          this.hurt.jab();
          break;
        case "swindleRefused":
          burst(tileCX(l, mid), belly, 4, SWINDLE_RIM);
          break;
        case "swindleCleared":
          burst(tileCX(l, e.col), belly - l.tile, 12, SWINDLE_RIM);
          break;
        case "swindleSpent":
          burst(tileCX(l, e.col), belly - l.tile, 24, SWINDLE_RIM);
          this.hurt.hit();
          break;
        default:
          break;
      }
    }
  }

  /** Her tilt this frame: toward the last pod let go, easing back upright. */
  lean(): number {
    return this.leanTo * (1 - smoothstep(Math.min(1, this.leanAge / LEAN_LIFE)));
  }

  update(dt: number): void {
    for (const h of this.lifted) h.age += dt;
    this.lifted = this.lifted.filter((h) => h.age < LIFT_LIFE);
    this.leanAge += dt;
    this.hurt.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, time: number): void {
    ctx.save();
    for (const h of this.lifted) {
      // The hood flying up off its pod into her belly, shrinking as it goes.
      const k = smoothstep(h.age / LIFT_LIFE);
      const y = h.y - k * SWINDLE_STRAND_TILES * l.tile;
      const r = l.tile * POD_TILES * (1 - 0.5 * k);
      const hood = splinePath(swindleHood(h.x, y, r, time, h.x), true);
      ctx.fillStyle = rgba(SWINDLE_FLESH, 0.85 * (1 - k));
      ctx.strokeStyle = rgba(SWINDLE_RIM, 0.8 * (1 - k));
      ctx.lineWidth = Math.max(1, l.tile * 0.05);
      ctx.fill(hood);
      ctx.stroke(hood);
    }
    ctx.restore();
  }

  clear(): void {
    this.lifted = [];
    this.leanTo = 0;
    this.leanAge = LEAN_LIFE;
    this.hurt.clear();
  }
}
