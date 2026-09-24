import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * What THE SURGE leaves behind a frame: the row the bulb sinks through
 * after a vent, the jolt a burst puts through the body, the jet a vent
 * throws up out of the seam, and the bursts its thirteen receipts throw.
 *
 * Everything else about the boss is drawn off the world every frame
 * (`surge-draw.ts`). The three here are THE SINEW's exception said three
 * ways: the simulation moves the bulb a whole row on the beat it vents, and
 * a bulb that jumped a row would be a bulb nobody saw sink; it says *burst*
 * once and remembers only that no thumb takes hold for `surgeBurstBeats`,
 * and a body that threw both thumbs off without so much as flinching would
 * be a rule and not an event; and the vent's jet is the picture of the
 * pressure leaving, which the navigator's mark already says by falling to
 * nought — the jet is what the *pilot* sees of it, on the one screen with
 * no pressure on it. All three are cleared in `Effects.reset()` like
 * everything that outlives its frame (`restart.test.ts`).
 *
 * The bursts go through `Sparks` like any other event's and are read here,
 * above the loop, for THE SINEW's reason: the thirteen are one family and the
 * spark table is at its limit. The ones with no row on them are thrown at
 * the bulb as it was last drawn, which `note` is told every frame.
 */

/** The sink: how many beats the bulb takes to ease down its new row. */
const SINK_BEATS = 1;
/** The jolt: how far the body squashes at the instant of a burst, as a share
 * of its half-height, how many shakes a second, how many beats to die. */
const JOLT_SHARE = 0.28;
const JOLT_HZ = 3;
const JOLT_BEATS = 1.5;
/** The jet: how far above the bulb it reaches, in tiles, and for how long. */
const JET_TILES = 1.6;
const JET_BEATS = 1;

export class SurgeFx {
  private sinkLeft = 0;
  private sinkLife = 1;
  private joltLeft = 0;
  private joltLife = 1;
  private jetLeft = 0;
  private jetLife = 1;
  private bulbX = 0;
  private bulbY = 0;
  private noted = false;

  /** Where the bulb was drawn this frame, for the receipts with no row of their own. */
  note(x: number, y: number): void {
    this.bulbX = x;
    this.bulbY = y;
    this.noted = true;
  }

  /** How far above its row the bulb still is, in tiles: a row easing to nought. */
  get sinkTiles(): number {
    if (this.sinkLeft <= 0) return 0;
    const left = this.sinkLeft / this.sinkLife;
    return left * left;
  }

  /** The jolt's squash now, as a share of the half-height: a sine dying away. */
  get jolt(): number {
    if (this.joltLeft <= 0) return 0;
    const gone = 1 - this.joltLeft / this.joltLife;
    return Math.sin(gone * JOLT_HZ * JOLT_BEATS * Math.PI * 2) * JOLT_SHARE * (1 - gone);
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    /** Seconds a beat lasts. */
    spb: number,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const span = Math.max(1, Math.min(cfg.surgeBulbCols, cfg.cols));
    const atBulb = (n: number, hex: string) => {
      if (this.noted) burst(this.bulbX, this.bulbY, n, hex);
    };
    const grip = (player: 1 | 2, n: number, hex: string) => {
      if (this.noted)
        burst(this.bulbX + (player === 1 ? -1 : 1) * l.tile * 0.6, this.bulbY, n, hex);
    };
    for (const e of events) {
      switch (e.type) {
        case "surgeSettle":
          for (let i = 0; i < span; i++) {
            burst(tileCX(l, e.col - Math.floor(span / 2) + i), tileCY(l, e.row), 2, PALETTE.dim);
          }
          break;
        case "surgeGrip":
          grip(e.player, 3, PALETTE.text);
          break;
        case "surgeRelease":
          grip(e.player, 2, PALETTE.dim);
          break;
        case "surgeNear":
          atBulb(4, PALETTE.hullRim);
          break;
        case "surgeVent":
          atBulb(14, PALETTE.hullRim);
          this.sinkLife = SINK_BEATS * spb;
          this.sinkLeft = this.sinkLife;
          this.jetLife = JET_BEATS * spb;
          this.jetLeft = this.jetLife;
          break;
        case "surgeBurst":
          atBulb(18, PALETTE.hull);
          this.joltLife = JOLT_BEATS * spb;
          this.joltLeft = this.joltLife;
          break;
        case "surgeGum":
          burst(tileCX(l, e.col), tileCY(l, e.row), 4, PALETTE.hull);
          break;
        case "surgeRock":
          burst(tileCX(l, e.col), tileCY(l, e.row), 4, PALETTE.rock);
          break;
        case "surgeLost":
          atBulb(3, PALETTE.dim);
          break;
        case "surgeAbsorb":
          burst(tileCX(l, e.col), tileCY(l, e.row), 5, PALETTE.hullRim);
          break;
        case "surgeClose":
          atBulb(3, PALETTE.dim);
          break;
        case "surgeEvert":
          atBulb(16, PALETTE.hullRim);
          break;
        case "surgeOut":
          atBulb(20, PALETTE.hullRim);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    this.sinkLeft = Math.max(0, this.sinkLeft - dt);
    this.joltLeft = Math.max(0, this.joltLeft - dt);
    this.jetLeft = Math.max(0, this.jetLeft - dt);
  }

  /** The jet: a violet streak up out of the seam, thinning as it goes. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.jetLeft <= 0 || !this.noted) return;
    const left = this.jetLeft / this.jetLife;
    const reach = JET_TILES * l.tile * (1 - left * left);
    const p = new Path2D();
    p.moveTo(this.bulbX, this.bulbY);
    p.lineTo(this.bulbX, this.bulbY - reach);
    ctx.save();
    // What is left of the jet as the glow's alpha, which sets its own.
    strokeGlow(ctx, p, PALETTE.hullRim, STROKE.outline * 2 * left, 1.2, left);
    ctx.fillStyle = rgba(PALETTE.hull, 0.35 * left);
    ctx.beginPath();
    ctx.ellipse(this.bulbX, this.bulbY - reach, l.tile * 0.3, l.tile * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  clear(): void {
    this.sinkLeft = 0;
    this.joltLeft = 0;
    this.jetLeft = 0;
    this.sinkLife = 1;
    this.joltLife = 1;
    this.jetLife = 1;
    this.bulbX = 0;
    this.bulbY = 0;
    this.noted = false;
  }
}
