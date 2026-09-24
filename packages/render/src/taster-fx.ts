import type { Color, SimEvent } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { bladePath, edgeHex } from "./taster-blade.js";
import { tasterCrestY } from "./taster-draw.js";

/**
 * What THE TASTER leaves behind a frame: a blade coming off the crest, and the
 * shiver down the fan when it re-edges itself.
 *
 * Everything else about the boss is drawn off the world every frame
 * (`taster-draw.ts`). These two are not in the world a frame later — a shorn
 * blade is `shorn: true` and gone, and a re-edge is eleven edges that have
 * already changed colour — so a picture without them would be a fan that lost
 * a blade between frames and a fan whose colours flipped between frames, and
 * the re-edge is the one moment in this fight the pair most needs to *see*
 * arrive. Both are cleared in `Effects.reset()` like everything transient
 * (`restart.test.ts`).
 *
 * **It remembers what colour each blade was.** `tasterShear` carries the
 * column and how many are left, not the edge that broke — the simulation has
 * already cleared it, and rightly: nothing in the world is that colour any
 * more. But the picture owes the pair a blade falling in the colour they were
 * looking at, so the colours are kept here, per column, off `tasterSet` and
 * `tasterTaste`. This is the one thing in this file that is a memory rather
 * than a clock.
 *
 * The bursts go through `Sparks` like any other event's and are read here,
 * above the loop, because `effects-spark.ts`'s table is at its limit and the
 * twelve are one family — THE GORGE's and THE CURTAIN's arrangement
 * (`gorge-fx.ts`, `curtain-fx.ts`).
 */

/** Beats a shorn blade takes to tumble out of the picture. */
const FALL_BEATS = 3;
/** How far it falls in that time, in tiles: onto the field it was over. */
const FALL_TILES = 4;
/** Beats the shiver takes to run the width of the crest. */
const SHIVER_BEATS = 1;

interface Shard {
  x: number;
  y: number;
  tile: number;
  color: Color | null;
  life: number;
  left: number;
  /** Which way it tumbles: seeded off the column, so it is not all one way. */
  spin: number;
}

interface Shiver {
  x0: number;
  x1: number;
  y: number;
  hex: string;
  life: number;
  left: number;
}

export class TasterFx {
  private shards: Shard[] = [];
  private shivers: Shiver[] = [];
  /** The colour each column's blade was last seen wearing. */
  private edges = new Map<number, Color>();
  /** The crest's own span, off `tasterRise`: the two fan-wide events need it. */
  private span: { col: number; width: number } | null = null;

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    /** Seconds a beat lasts, for the fall and the shiver. */
    spb: number,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const y = tasterCrestY(l);
    for (const e of events) {
      switch (e.type) {
        case "tasterRise":
          this.span = { col: e.col, width: e.width };
          for (let i = 0; i < e.width; i++) burst(tileCX(l, e.col + i), y, 2, PALETTE.rock);
          break;
        case "tasterGrow":
          burst(tileCX(l, e.col), y, 2, PALETTE.rock);
          break;
        case "tasterSet":
          this.edges.set(e.col, e.color);
          // The crystallising, and the beat THE SLOW holds: the loudest glint
          // in the fight, in the colour that has just been decided against.
          burst(tileCX(l, e.col), y - l.tile * 0.7, 7, edgeHex(e.color).rim);
          break;
        case "tasterThick":
          burst(tileCX(l, e.col), y - l.tile * 0.5, 4, edgeHex(this.edges.get(e.col) ?? null).lit);
          break;
        case "tasterPare":
          // Metal off an edge, not colour: the layer the pair bought back.
          burst(tileCX(l, e.col), y - l.tile * 0.5, 5, PALETTE.rock);
          break;
        case "tasterShear":
          burst(tileCX(l, e.col), y - l.tile * 0.5, 12, PALETTE.rockDark);
          this.shear(l, e.col, y, spb);
          break;
        case "tasterCrest":
          burst(tileCX(l, e.col), y + l.tile * 0.2, 5, PALETTE.hull);
          break;
        case "tasterLift":
          this.acrossCrest(l, y, 3, PALETTE.hullRim, burst);
          break;
        case "tasterTaste":
          this.shiver(l, y, spb, edgeHex(e.color).rim);
          for (const [col] of this.edges) this.edges.set(col, e.color);
          break;
        case "tasterClose":
          burst(tileCX(l, e.col), y - l.tile * 0.6, 10, PALETTE.hullRim);
          break;
        case "tasterRefused":
          burst(tileCX(l, e.col), y - l.tile * 0.4, 3, PALETTE.sparkDim);
          break;
        case "tasterPryFill":
          // The payoff's burst, smaller: the fan answered, and one beam owed.
          burst(tileCX(l, e.col), y - l.tile * 0.5, 8, edgeHex(e.color).rim);
          break;
        case "tasterOut":
          burst(tileCX(l, e.col), y - l.tile * 0.5, 20, edgeHex(e.color).rim);
          break;
        default:
          break;
      }
    }
  }

  /** The two fan-wide events have no column: they are the whole crest's. */
  private acrossCrest(
    l: Layout,
    y: number,
    n: number,
    hex: string,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const span = this.span;
    if (span === null) return;
    for (let i = 0; i < span.width; i++) burst(tileCX(l, span.col + i), y, n, hex);
  }

  /** A blade off the crest, falling and turning as it goes. */
  private shear(l: Layout, col: number, y: number, spb: number): void {
    const life = FALL_BEATS * spb;
    this.shards.push({
      x: tileCX(l, col),
      y,
      tile: l.tile,
      color: this.edges.get(col) ?? null,
      life,
      left: life,
      spin: col % 2 === 0 ? 1 : -1,
    });
    this.edges.delete(col);
  }

  /** The shiver: a lit band running the crest as every standing blade re-edges. */
  private shiver(l: Layout, y: number, spb: number, hex: string): void {
    const span = this.span;
    if (span === null) return;
    const life = SHIVER_BEATS * spb;
    this.shivers.push({
      x0: tileCX(l, span.col) - l.tile * 0.5,
      x1: tileCX(l, span.col + span.width - 1) + l.tile * 0.5,
      y,
      hex,
      life,
      left: life,
    });
  }

  update(dt: number): void {
    for (const s of this.shards) s.left -= dt;
    for (const s of this.shivers) s.left -= dt;
    this.shards = this.shards.filter((s) => s.left > 0);
    this.shivers = this.shivers.filter((s) => s.left > 0);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    for (const s of this.shards) {
      const gone = 1 - s.left / s.life;
      const y = s.y + gone * gone * s.tile * FALL_TILES;
      const path = bladePath(s.x, y, s.tile, s.tile * 0.8, s.spin * gone * s.tile * 1.4);
      const hex = edgeHex(s.color);
      ctx.save();
      ctx.globalAlpha = 0.45 * (1 - gone);
      ctx.fillStyle = PALETTE.rockDark;
      ctx.fill(path);
      ctx.globalAlpha = 0.8 * (1 - gone);
      ctx.strokeStyle = hex.rim;
      ctx.lineWidth = STROKE.inner;
      ctx.stroke(path);
      ctx.restore();
    }
    for (const s of this.shivers) {
      const gone = 1 - s.left / s.life;
      const x = s.x0 + (s.x1 - s.x0) * gone;
      const band = new Path2D();
      band.moveTo(x, s.y - l.tile);
      band.lineTo(x, s.y + l.tile * 0.35);
      ctx.save();
      ctx.globalAlpha = 0.7 * (1 - Math.abs(gone - 0.5) * 2 * 0.7);
      ctx.strokeStyle = s.hex;
      ctx.lineWidth = STROKE.outline;
      ctx.stroke(band);
      ctx.restore();
    }
  }

  clear(): void {
    this.shards = [];
    this.shivers = [];
    this.edges.clear();
    this.span = null;
  }
}
