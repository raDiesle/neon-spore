import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { colorTrio } from "./creature-tint.js";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE BROOD leaves behind a frame: the splash of a bud popped, the
 * stalk whipping back up when one drops, and the blow every boss takes.
 *
 * Everything else is drawn off the boss every frame (`brood-draw.ts`). Its
 * twelve events are one family, read here above the loop the way THE GORGE's
 * are (`gorge-fx.ts`), each on the column it names and the bud row the
 * simulation meets a bolt on:
 * - a **pop** bursts the bud in its colour and splashes a ring of its slime,
 *   and the sac takes a counted hit;
 * - a **drop** snaps the stalk: it whips back up into the belly, and the body
 *   that falls is the field's own from there;
 * - the **hide** taking a bolt is a scuff of grey grit and nothing more —
 *   `bolt-stop.ts`'s *some damage visual but without any effect on the boss*;
 * - the **wrong colour** bursts red-grey on the bud, which stays;
 * - a **lay** tears the body out of the belly on a strand of slime that
 *   stretches after it and lets go, the belly's valve rings in its colour,
 *   and the sac squeezes (`squeeze`);
 * - a **lurch** swings the sac over the column the simulation has already
 *   moved it, so it is seen to go rather than to jump (`slideX`), its belly
 *   trailing the swing (`tilt`);
 * - **beaten**, the sac takes the blow of a fight landed.
 */

/** Seconds a splash ring and a snapped stalk last. */
const SPLASH_LIFE = 0.45;
const SNAP_LIFE = 0.4;
/** Seconds a lurch takes to swing the sac over a column. */
const LURCH_LIFE = 0.35;
/** Seconds a body takes to tear free of the belly, and the sac to squeeze after it. */
const BIRTH_LIFE = 0.45;

interface Splash {
  x: number;
  y: number;
  hex: string;
  age: number;
}

interface Birth {
  x: number;
  y: number;
  hex: string;
  age: number;
}

interface Snap {
  x: number;
  y: number;
  age: number;
}

type Burst = (x: number, y: number, n: number, hex: string) => void;

export class BroodFx {
  private splashes: Splash[] = [];
  private snaps: Snap[] = [];
  private births: Birth[] = [];
  /** The last lurch: columns it went, and seconds since; the sim has it there already. */
  private lurchBy = 0;
  private lurchAge = LURCH_LIFE;
  /** The blow a bud popped deals the sac, and the last one more. */
  readonly hurt = new BossHurt();

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, burst: Burst): void {
    const y = tileCY(l, cfg.broodBudRow);
    for (const e of events) {
      switch (e.type) {
        case "broodPop": {
          const x = tileCX(l, e.col);
          burst(x, y, 14, colorTrio(e.color).rim);
          this.splashes.push({ x, y, hex: colorTrio(e.color).hex, age: 0 });
          this.hurt.jab();
          break;
        }
        case "broodDrop":
          this.snaps.push({ x: tileCX(l, e.col), y, age: 0 });
          burst(tileCX(l, e.col), y - l.tile * 0.4, 4, PALETTE.organRim);
          break;
        case "broodHide":
          burst(tileCX(l, e.col), y - l.tile * 0.3, 5, PALETTE.sparkDim);
          break;
        case "broodSpoil":
          burst(tileCX(l, e.col), y, 8, PALETTE.sparkDim);
          break;
        case "broodLay": {
          const x = tileCX(l, e.col);
          this.births.push({ x, y, hex: colorTrio(e.color).hex, age: 0 });
          burst(x, y + l.tile * 0.2, 6, PALETTE.organRim);
          break;
        }
        case "broodLurch":
          this.lurchBy = e.by;
          this.lurchAge = 0;
          break;
        case "broodSpent":
          burst(tileCX(l, e.col), y - l.tile * 1.5, 24, PALETTE.organRim);
          this.hurt.hit();
          break;
        default:
          break;
      }
    }
  }

  /**
   * Pixels the sac still lags behind where the simulation already has it: a
   * lurch moves it a whole column at once, and the picture swings it over,
   * overshooting a little the way a hung weight does.
   */
  slideX(tile: number): number {
    const k = Math.min(1, this.lurchAge / LURCH_LIFE);
    if (k >= 1) return 0;
    const swing = 1 - smoothstep(k) - Math.sin(k * Math.PI) * 0.18;
    return -this.lurchBy * tile * swing;
  }

  /** The tilt a swing gives the sac, radians: its belly trailing the way it goes. */
  tilt(tile: number): number {
    return (-this.slideX(tile) / tile) * 0.16;
  }

  /** How hard the sac is squeezing after a body it has just laid, 0..1. */
  squeeze(): number {
    let k = 0;
    for (const b of this.births) k = Math.max(k, Math.sin((b.age / BIRTH_LIFE) * Math.PI));
    return k;
  }

  update(dt: number): void {
    this.lurchAge += dt;
    for (const b of this.births) b.age += dt;
    this.births = this.births.filter((b) => b.age < BIRTH_LIFE);
    for (const s of this.splashes) s.age += dt;
    for (const s of this.snaps) s.age += dt;
    this.splashes = this.splashes.filter((s) => s.age < SPLASH_LIFE);
    this.snaps = this.snaps.filter((s) => s.age < SNAP_LIFE);
    this.hurt.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    ctx.save();
    ctx.lineCap = "round";
    for (const s of this.splashes) {
      const k = s.age / SPLASH_LIFE;
      ctx.strokeStyle = rgba(s.hex, 0.8 * (1 - k));
      ctx.lineWidth = Math.max(1, l.tile * 0.1 * (1 - k));
      ctx.beginPath();
      ctx.arc(s.x, s.y, l.tile * (0.3 + 0.6 * k), 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const b of this.births) {
      // The strand of slime the body tears out of the belly on, stretching
      // down after it and thinning until it lets go.
      const k = b.age / BIRTH_LIFE;
      const end = b.y + l.tile * (0.2 + 1.1 * k);
      ctx.strokeStyle = rgba(PALETTE.organ, 0.85 * (1 - k));
      ctx.lineWidth = l.tile * 0.22 * (1 - k);
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - l.tile * 0.1);
      ctx.quadraticCurveTo(b.x + Math.sin(k * 9) * l.tile * 0.08, (b.y + end) / 2, b.x, end);
      ctx.stroke();
      ctx.strokeStyle = rgba(b.hex, 0.7 * (1 - k));
      ctx.lineWidth = Math.max(1, l.tile * 0.07);
      ctx.beginPath();
      ctx.ellipse(
        b.x,
        b.y,
        l.tile * (0.25 + 0.5 * k),
        l.tile * (0.08 + 0.12 * k),
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    for (const s of this.snaps) {
      // The broken stalk springing back up into the belly, shortening as it goes.
      const k = s.age / SNAP_LIFE;
      const top = s.y - l.tile * 0.9;
      const end = s.y - l.tile * 0.2 - (s.y - top) * k;
      const whip = Math.sin(k * Math.PI * 3) * l.tile * 0.25 * (1 - k);
      ctx.strokeStyle = rgba(PALETTE.vein, 0.95 * (1 - k));
      ctx.lineWidth = l.tile * 0.14;
      ctx.beginPath();
      ctx.moveTo(s.x, top);
      ctx.quadraticCurveTo(s.x + whip, (top + end) / 2, s.x - whip * 0.5, end);
      ctx.stroke();
    }
    ctx.restore();
  }

  clear(): void {
    this.lurchBy = 0;
    this.lurchAge = LURCH_LIFE;
    this.births = [];
    this.splashes = [];
    this.snaps = [];
    this.hurt.clear();
  }
}
