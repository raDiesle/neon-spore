import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { MATRON_LOBE_TILES } from "./matron-place.js";
import { MATRON_RIM } from "./matron-tint.js";
import { PALETTE } from "./palette.js";

/**
 * What THE MATRON leaves behind a frame: a lobe springing back up as its pod
 * is shot loose, her lean as she throws, and the blow every boss takes.
 *
 * Everything else is drawn off the boss and the pods every frame
 * (`matron-draw.ts`). Her seven events are read here above the loop the way
 * THE BROOD's are (`brood-fx.ts`), each on the column it names:
 * - a pod of hers **shot loose** (`podLoose` while she hangs) snaps its lobe:
 *   it whips back up into her belly, and the pod falls as the field's own;
 * - a **throw** leans her toward its column and spits at her belly;
 * - a pod **swallowed** takes its lobe for good: a counted hit;
 * - a clutch **cleared** shudders her; **beaten**, the blow of a fight landed.
 */

/** Seconds a snapped lobe lasts, and a lean. */
const SNAP_LIFE = 0.45;
const LEAN_LIFE = 0.9;
/** Her lean toward a throw at the field's edge, in radians. */
const LEAN_MAX = 0.12;

interface Snap {
  x: number;
  y: number;
  age: number;
}

type Burst = (x: number, y: number, n: number, hex: string) => void;

export class MatronFx {
  private snaps: Snap[] = [];
  private leanTo = 0;
  private leanAge = LEAN_LIFE;
  /** Whether she is over the field, so a pod shot loose is one of hers. */
  private over = false;
  /** The blow a pod swallowed deals her, and the last one more. */
  readonly hurt = new BossHurt();

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, burst: Burst): void {
    const row = tileCY(l, cfg.matronPodRow);
    const belly = row - MATRON_LOBE_TILES * l.tile;
    const mid = (cfg.cols - 1) / 2;
    for (const e of events) {
      switch (e.type) {
        case "matronEnter":
          this.over = true;
          break;
        case "matronOut":
          this.over = false;
          break;
        case "podLoose":
          if (this.over && Math.abs(e.row - cfg.matronPodRow) < 0.5) {
            this.snaps.push({ x: tileCX(l, e.col), y: tileCY(l, e.row), age: 0 });
            burst(tileCX(l, e.col), belly, 5, MATRON_RIM);
          }
          break;
        case "matronThrow":
          this.leanTo = Math.max(-1, Math.min(1, (e.col - mid) / Math.max(1, mid))) * LEAN_MAX;
          this.leanAge = 0;
          burst(tileCX(l, e.col), belly - l.tile * 0.6, 6, MATRON_RIM);
          break;
        case "matronLobe":
          burst(tileCX(l, e.col), belly, 10, PALETTE.podRim);
          this.hurt.jab();
          break;
        case "matronCleared":
          burst(tileCX(l, e.col), belly - l.tile, 12, MATRON_RIM);
          break;
        case "matronSpent":
          burst(tileCX(l, e.col), belly - l.tile, 24, MATRON_RIM);
          this.hurt.hit();
          break;
        default:
          break;
      }
    }
  }

  /** Her tilt this frame: toward the last throw, easing back upright. */
  lean(): number {
    return this.leanTo * (1 - smoothstep(Math.min(1, this.leanAge / LEAN_LIFE)));
  }

  update(dt: number): void {
    for (const s of this.snaps) s.age += dt;
    this.snaps = this.snaps.filter((s) => s.age < SNAP_LIFE);
    this.leanAge += dt;
    this.hurt.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    ctx.save();
    ctx.lineCap = "round";
    for (const s of this.snaps) {
      // The lobe springing back up into her belly, shortening as it goes.
      const k = s.age / SNAP_LIFE;
      const top = s.y - l.tile * MATRON_LOBE_TILES;
      const end = s.y - (s.y - top) * k;
      const whip = Math.sin(k * Math.PI * 3) * l.tile * 0.3 * (1 - k);
      ctx.strokeStyle = rgba(MATRON_RIM, 0.9 * (1 - k));
      ctx.lineWidth = l.tile * 0.22 * (1 - 0.5 * k);
      ctx.beginPath();
      ctx.moveTo(s.x, top);
      ctx.quadraticCurveTo(s.x + whip, (top + end) / 2, s.x - whip * 0.5, end);
      ctx.stroke();
    }
    ctx.restore();
  }

  clear(): void {
    this.snaps = [];
    this.leanTo = 0;
    this.leanAge = LEAN_LIFE;
    this.over = false;
    this.hurt.clear();
  }
}
