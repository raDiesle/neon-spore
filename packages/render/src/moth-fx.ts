import type { SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE MOTH leaves behind a frame, read above the loop as THE BROOD's
 * are (`brood-fx.ts`), each on the column its event names and the row the
 * moth was last drawn meeting a bolt on (`note`):
 * - a **tear** throws the scrap of wing the spot was on, fluttering down, and
 *   a puff of its scales, and the moth takes a counted hit;
 * - a **belly hit** knocks a plate off it, spinning down, and throws it up
 *   and away;
 * - a **flit** — a drift toward the light or a hop away from it — is the body
 *   swept over the column the simulation has already put it in, banking into
 *   the turn (`slideX`, `bank`);
 * - a **dust** shakes a wing tip (`shake`) and the slick drops out of a cloud
 *   of its scales — the slick itself is the field's from there;
 * - a **step** lit flares its spots open (`lightIn`);
 * - the **hide** taking a bolt is a scuff of grey scales, and the **wrong
 *   colour** a grey burst on the spot, which stays;
 * - **landing** on the cannon jolts it, and **beaten** it takes the blow of a
 *   fight landed.
 */

/** Seconds a flit takes to carry it over, a scrap to fall, a step to flare. */
const FLIT_LIFE = 0.4;
const SCRAP_LIFE = 1.1;
const LIGHT_LIFE = 0.45;
const SHAKE_LIFE = 0.5;

interface Scrap {
  x: number;
  y: number;
  /** A plate off the belly rather than a scrap of wing. */
  plate: boolean;
  spin: number;
  age: number;
}

type Burst = (x: number, y: number, n: number, hex: string) => void;

export class MothFx {
  private scraps: Scrap[] = [];
  private flitBy = 0;
  private flitAge = FLIT_LIFE;
  private lightAge = LIGHT_LIFE;
  private shakeAge = SHAKE_LIFE;
  /** The row it was last drawn meeting a bolt on, in pixels; -1 before it is. */
  private meetY = -1;
  readonly hurt = new BossHurt();

  /** Where it is meeting bolts this frame, for the events of the next. */
  note(meetY: number): void {
    this.meetY = meetY;
  }

  ingest(events: readonly SimEvent[], l: Layout, burst: Burst): void {
    const y = this.meetY < 0 ? l.gridTop + 3.5 * l.tile : this.meetY;
    for (const e of events) {
      switch (e.type) {
        case "mothTear": {
          const x = tileCX(l, e.col);
          burst(x, y, 12, PALETTE.redRim);
          burst(x, y, 8, PALETTE.dim);
          this.scraps.push({ x, y, plate: false, spin: e.col % 2 === 0 ? 1 : -1, age: 0 });
          this.hurt.jab();
          break;
        }
        case "mothBelly": {
          const x = tileCX(l, e.col);
          burst(x, y + l.tile * 0.3, 14, PALETTE.redRim);
          this.scraps.push({ x, y: y + l.tile * 0.4, plate: true, spin: 1, age: 0 });
          this.hurt.jab();
          break;
        }
        case "mothFlit":
          this.flitBy = e.by;
          this.flitAge = 0;
          break;
        case "mothDust":
          burst(tileCX(l, e.col), y + l.tile * 0.4, 10, PALETTE.dim);
          this.shakeAge = 0;
          break;
        case "mothStep":
          this.lightAge = 0;
          break;
        case "mothHide":
          burst(tileCX(l, e.col), y, 5, PALETTE.sparkDim);
          break;
        case "mothSpoil":
          burst(tileCX(l, e.col), y, 9, PALETTE.sparkDim);
          break;
        case "mothLand":
          this.hurt.hit(0.5);
          break;
        case "mothSpent":
          burst(tileCX(l, e.col), y - l.tile * 0.3, 26, PALETTE.dim);
          this.hurt.hit();
          break;
        default:
          break;
      }
    }
  }

  /** Pixels it still lags behind where the simulation has it, swept over a flit. */
  slideX(tile: number): number {
    const k = Math.min(1, this.flitAge / FLIT_LIFE);
    if (k >= 1) return 0;
    const sweep = 1 - smoothstep(k) - Math.sin(k * Math.PI) * 0.12;
    return -this.flitBy * tile * sweep;
  }

  /** The bank a flit gives it, radians: rolled into the way it goes. */
  bank(): number {
    const k = Math.min(1, this.flitAge / FLIT_LIFE);
    return k >= 1 ? 0 : Math.sign(this.flitBy) * 0.22 * Math.sin(k * Math.PI);
  }

  /** How far a step's spots have flared open, 0 at the step and 1 after. */
  lightIn(): number {
    return smoothstep(Math.min(1, this.lightAge / LIGHT_LIFE));
  }

  /** How hard a wing tip is shaking a slick loose, 0..1. */
  shake(): number {
    const k = this.shakeAge / SHAKE_LIFE;
    return k >= 1 ? 0 : Math.sin(k * Math.PI);
  }

  update(dt: number): void {
    this.flitAge += dt;
    this.lightAge += dt;
    this.shakeAge += dt;
    for (const s of this.scraps) s.age += dt;
    this.scraps = this.scraps.filter((s) => s.age < SCRAP_LIFE);
    this.hurt.update(dt);
  }

  /** The scraps and plates falling away, over everything else of it. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    for (const s of this.scraps) {
      const k = s.age / SCRAP_LIFE;
      // A scrap of wing flutters, side to side as it falls; a plate drops.
      const sway = s.plate ? 0 : Math.sin(k * 9) * l.tile * 0.35 * (1 - k);
      const x = s.x + sway;
      const y = s.y + l.tile * (s.plate ? 2.6 * k * k : 1.6 * k);
      ctx.save();
      ctx.globalAlpha *= 1 - smoothstep(k);
      ctx.translate(x, y);
      ctx.rotate(s.spin * k * (s.plate ? 5 : 2.4));
      ctx.scale(s.plate ? 1 : Math.cos(k * 11) * 0.8 + 0.2, 1);
      ctx.beginPath();
      if (s.plate) ctx.ellipse(0, 0, l.tile * 0.22, l.tile * 0.1, 0, 0, Math.PI * 2);
      else {
        ctx.moveTo(-l.tile * 0.3, -l.tile * 0.12);
        ctx.lineTo(l.tile * 0.25, -l.tile * 0.2);
        ctx.lineTo(l.tile * 0.12, l.tile * 0.18);
        ctx.lineTo(-l.tile * 0.2, l.tile * 0.1);
        ctx.closePath();
      }
      ctx.fillStyle = rgba(s.plate ? PALETTE.redDark : PALETTE.dim, 0.9);
      ctx.fill();
      ctx.strokeStyle = rgba(s.plate ? PALETTE.red : PALETTE.hullRim, 0.6);
      ctx.lineWidth = Math.max(1, l.tile * 0.04);
      ctx.stroke();
      ctx.restore();
    }
  }

  clear(): void {
    this.scraps = [];
    this.flitBy = 0;
    this.flitAge = FLIT_LIFE;
    this.lightAge = LIGHT_LIFE;
    this.shakeAge = SHAKE_LIFE;
    this.meetY = -1;
    this.hurt.clear();
  }
}
