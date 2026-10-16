import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { colorTrio } from "./creature-tint.js";
import { fieldX } from "./field-flip.js";
import { GEODE_TALL, geodeCentre, geodeReach } from "./geode-shape.js";
import { signedHash } from "./hash.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE GEODE leaves behind a frame: the beam's white-hot line down a
 * crack it cut, the crystal shards thrown off it, the grit a bolt chips, and
 * the blow every boss takes.
 *
 * Everything else is drawn off the boss every frame (`geode-draw.ts`), the
 * halves of a cut piece among it. Its events are one family, read here above
 * the loop the way THE BROOD's are (`brood-fx.ts`), each on the column it names:
 * - a **cleave** flashes the crack white down the stone, throws shards in
 *   the crystal's colour, and the stone takes a counted hit;
 * - a **chip** — a bolt, or a beam down no crack — is a puff of grey grit at
 *   the stone's foot and nothing more: only the lance cuts stone;
 * - the **wrong colour** scuffs the crack grey, and the wave is lost for it;
 * - a **split** throws the dust of the pieces flying apart;
 * - the **shatter** throws the heart's shards both ways, and the blow of a
 *   fight landed.
 * A **strike** is the stone itself landing, which the draw shows.
 */

/** Seconds the cleave's line and a shard last. */
const CLEAVE_LIFE = 0.35;
const SHARD_LIFE = 0.8;

interface Cleave {
  x: number;
  /** The stone's top and foot, where the line runs between. */
  top: number;
  foot: number;
  hex: string;
  age: number;
}

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  /** Its fall per second, per second: a tile's worth of the field's own scale. */
  fall: number;
  hex: string;
  age: number;
}

type Burst = (x: number, y: number, n: number, hex: string) => void;

export class GeodeFx {
  private cleaves: Cleave[] = [];
  private shards: Shard[] = [];
  /** The blow a cut deals the stone, and the shatter more. */
  readonly hurt = new BossHurt();

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, burst: Burst): void {
    const c = geodeCentre(l, cfg);
    const half = geodeReach(l) * GEODE_TALL;
    const top = c.y - half;
    const foot = c.y + half;
    for (const e of events) {
      switch (e.type) {
        case "geodeCleave": {
          const x = fieldX(l, e.col);
          const trio = colorTrio(e.color);
          this.cleaves.push({ x, top, foot, hex: trio.rim, age: 0 });
          burst(x, c.y, 16, trio.rim);
          this.throwShards(x, c.y, 6, l.tile, () => trio.hex, e.piece);
          this.hurt.jab();
          break;
        }
        case "geodeChip":
          burst(fieldX(l, e.col), foot, 5, PALETTE.sparkDim);
          break;
        case "geodeWrong":
          burst(fieldX(l, e.col), c.y, 10, PALETTE.sparkDim);
          break;
        case "geodeSplit":
          burst(c.x, c.y, 20, PALETTE.rock);
          break;
        case "geodeShatter":
          this.throwShards(c.x, c.y, 16, l.tile, (k) => colorTrio(k % 2 ? "red" : "cyan").hex, 5);
          burst(c.x, c.y, 28, PALETTE.text);
          this.hurt.hit();
          break;
        default:
          break;
      }
    }
  }

  private throwShards(
    x: number,
    y: number,
    n: number,
    tile: number,
    hex: (k: number) => string,
    seed: number,
  ): void {
    for (let k = 0; k < n; k++) {
      const a = -Math.PI / 2 + signedHash(seed, k, 8) * 1.4;
      const v = tile * (4 + 3 * Math.abs(signedHash(seed, k, 9)));
      const spin = signedHash(seed, k, 10) * 9;
      this.shards.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        spin,
        fall: tile * 24,
        hex: hex(k),
        age: 0,
      });
    }
  }

  update(dt: number): void {
    for (const c of this.cleaves) c.age += dt;
    for (const s of this.shards) {
      s.age += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += s.fall * dt;
    }
    this.cleaves = this.cleaves.filter((c) => c.age < CLEAVE_LIFE);
    this.shards = this.shards.filter((s) => s.age < SHARD_LIFE);
    this.hurt.update(dt);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    ctx.save();
    ctx.lineCap = "round";
    for (const c of this.cleaves) {
      // The beam's heat left in the crack, narrowing as it cools.
      const k = c.age / CLEAVE_LIFE;
      ctx.strokeStyle = rgba(PALETTE.text, 0.95 * (1 - k));
      ctx.lineWidth = l.tile * (0.35 * (1 - k) + 0.05);
      ctx.beginPath();
      ctx.moveTo(c.x, c.top);
      ctx.lineTo(c.x, c.foot);
      ctx.stroke();
      ctx.strokeStyle = rgba(c.hex, 0.6 * (1 - k));
      ctx.lineWidth = l.tile * 0.7 * (1 - k);
      ctx.stroke();
    }
    for (const s of this.shards) {
      const k = s.age / SHARD_LIFE;
      const r = l.tile * 0.16;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.spin * s.age);
      ctx.fillStyle = rgba(s.hex, 1 - k);
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.4);
      ctx.lineTo(r * 0.6, 0);
      ctx.lineTo(0, r * 1.4);
      ctx.lineTo(-r * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  clear(): void {
    this.cleaves = [];
    this.shards = [];
    this.hurt.clear();
  }
}
