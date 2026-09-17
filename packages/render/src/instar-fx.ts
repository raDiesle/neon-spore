import { type InstarState, instarStep, type SimEvent } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { instarAt, instarMarkPoint, type Point } from "./instar-shape.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * What THE INSTAR leaves behind a frame: the **jolt** of a landing and of
 * the last, the **flinch** at a refused thumb or a slipped mark — a lateral
 * shiver of the whole body — the **lash** a strike draws from the part to
 * the hull, and the bursts its eleven receipts throw.
 *
 * Everything else is drawn off the world every frame (`instar-draw.ts`).
 * These are here for THE HIVE's reason: a landing is one tick in the
 * simulation and a body that lifted and settled inside a frame would be a
 * sign, not a blow. All of it is cleared in `Effects.reset()`
 * (`restart.test.ts`).
 *
 * **The bursts land on the marks.** The drawer tells this the marks' places
 * every frame (`place`), since an event carries a mark's *index* and only
 * the picture knows where that part is drawn; a receipt with no mark bursts
 * at the head. Both screens see the same body, so nothing here is per seat.
 */

const JOLT_TILES = 0.15;
const JOLT_DECAY = 8;
const FLINCH = 1;
const FLINCH_DECAY = 7;
/** How long the strike's lash stays on the screen, in seconds. */
const LASH_SECONDS = 0.6;

export class InstarFx {
  private joltNow = 0;
  private flinchNow = 0;
  private marks: Point[] = [];
  private head: Point | null = null;
  private lash: { from: Point; x: number; life: number } | null = null;

  /** How far the body is lifted right now, in tiles. */
  get jolt(): number {
    return this.joltNow;
  }

  /** How hard the body is shivering sideways right now, 0..1. */
  get flinch(): number {
    return this.flinchNow;
  }

  /** Told by the drawer where the marks and the head are this frame. */
  place(l: Layout, s: InstarState): void {
    const step = instarStep(s);
    this.marks = step === null ? [] : step.marks.map((m) => instarMarkPoint(l, m));
    this.head = instarAt(l, 500, 300);
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    const at = (p: Point, n: number, hex: string) => burst(p.x, p.y, n, hex);
    const mark = (i: number): Point => this.marks[i] ?? this.headOr(l);
    for (const e of events) {
      switch (e.type) {
        case "instarEnter":
          at(this.headOr(l), 10, PALETTE.dim);
          break;
        case "instarMorph":
          at(this.headOr(l), 8, PALETTE.hull);
          break;
        case "instarShow":
          for (const p of this.marks) at(p, 5, PALETTE.red);
          break;
        case "instarRefuse":
          at(mark(e.mark), 4, PALETTE.dim);
          this.flinchNow = FLINCH;
          break;
        case "instarAnswer":
          at(mark(e.mark), 3, PALETTE.redRim);
          break;
        case "instarDone":
          at(mark(e.mark), 8, PALETTE.hullRim);
          this.joltNow = Math.max(this.joltNow, JOLT_TILES * 0.4);
          break;
        case "instarSlip":
          at(mark(e.mark), 4, PALETTE.dim);
          this.flinchNow = FLINCH * 0.7;
          break;
        case "instarLand":
          at(this.headOr(l), 14, PALETTE.hull);
          this.joltNow = JOLT_TILES;
          break;
        case "instarStrike":
          at({ x: tileCX(l, e.col), y: l.hullY }, 16, PALETTE.red);
          this.lash = {
            from: this.marks[0] ?? this.headOr(l),
            x: tileCX(l, e.col),
            life: LASH_SECONDS,
          };
          this.joltNow = JOLT_TILES * 2;
          break;
        case "instarDown":
          at(this.headOr(l), 30, PALETTE.hullRim);
          this.joltNow = JOLT_TILES * 2;
          break;
        case "instarOut":
          at(this.headOr(l), 12, PALETTE.dim);
          break;
        default:
          break;
      }
    }
  }

  private headOr(l: Layout): Point {
    return this.head ?? instarAt(l, 500, 300);
  }

  /** The jolt settled, the flinch stilled, the lash faded. */
  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * step);
    if (this.joltNow < 0.002) this.joltNow = 0;
    this.flinchNow = Math.max(0, this.flinchNow - this.flinchNow * FLINCH_DECAY * step);
    if (this.flinchNow < 0.002) this.flinchNow = 0;
    if (this.lash !== null) {
      this.lash.life -= step;
      if (this.lash.life <= 0) this.lash = null;
    }
  }

  /** The lash: a red line from the part that was not undone to the hull it struck. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.lash === null) return;
    const a = this.lash.life / LASH_SECONDS;
    ctx.save();
    ctx.strokeStyle = rgba(PALETTE.red, a);
    ctx.lineWidth = STROKE.outline * (1 + 2 * a);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(this.lash.from.x, this.lash.from.y);
    ctx.lineTo(this.lash.x, l.hullY);
    ctx.stroke();
    ctx.restore();
  }

  clear(): void {
    this.joltNow = 0;
    this.flinchNow = 0;
    this.marks = [];
    this.head = null;
    this.lash = null;
  }
}
