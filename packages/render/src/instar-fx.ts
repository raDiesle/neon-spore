import {
  INSTAR_PARTS,
  type InstarPart,
  type InstarState,
  instarStep,
  type SimEvent,
} from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { GripVerdicts } from "./grip-verdict.js";
import { FallingEggs } from "./instar-eggs.js";
import { instarAt, instarMarkPoint, type Point } from "./instar-place.js";
import { LipShove } from "./instar-shove.js";
import { InstarStrike } from "./instar-strike.js";
import type { Sway } from "./instar-sway.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What THE INSTAR leaves behind a frame: the **jolt** of a landing and of
 * the last, the **flinch** at a refused thumb or a slipped mark — a lateral
 * shiver of the whole body — the **strike** of a part the pair did not stop,
 * fire or swarm or tail (`instar-strike.ts`), the **eggs** a swipe takes off
 * its nest falling to the hull and the ones a tap bursts where they lie
 * (`instar-eggs.ts`), the **hurt** of a step the pair landed — a shake and
 * a red glow on the body (`boss-hurt.ts`), the **tremble** of a lip the jaw
 * shoved back against its thumb (`instar-shove.ts`) — and the bursts its
 * eleven receipts throw.
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
 *
 * **Every touch is judged on the mark it touched** (`grip-verdict.ts`, the
 * owner's rule of 24 September 2026): a part that moved or gave washes its
 * mark green, and a refused thumb or a slipped part washes it red — on both
 * screens, since the partner is the one who says whose mark it was.
 */

const JOLT_TILES = 0.15;
const JOLT_DECAY = 8;
const FLINCH = 1;
const FLINCH_DECAY = 7;

export class InstarFx {
  private joltNow = 0;
  private flinchNow = 0;
  private marks: Point[] = [];
  /** Whether each mark of this step is a swipe, which is what drops an egg:
   * a tap on the brood squashes it where it lies. */
  private swipes: boolean[] = [];
  private head: Point | null = null;
  private headR = 0;
  /** Whether the last touch on each mark of this step was right, by index. */
  readonly verdicts = new GripVerdicts();
  /** The eggs swiped off the nest, on their way down to the hull. */
  readonly eggs = new FallingEggs();
  /** What a part the pair did not stop does to the ship. */
  readonly strike = new InstarStrike();
  /** The blow a landed step deals the body. */
  readonly hurt = new BossHurt();
  /** The lips trembling under the jaw's shove. */
  readonly shove = new LipShove();

  /** How far the window had run at the last frame of the step's asking,
   * held through its landing so a swept blade eases back (`instarFigure`). */
  private heldAlong = 0;

  /** How far the body is lifted right now, in tiles. */
  get jolt(): number {
    return this.joltNow;
  }

  /** How far the window had run when this step landed, 0..1 — nought outside a landing. */
  get held(): number {
    return this.heldAlong;
  }

  /** How hard the body is shivering sideways right now, 0..1. */
  get flinch(): number {
    return this.flinchNow;
  }

  /**
   * Told by the drawer where the marks and the head are this frame, swing
   * included — a burst thrown at a mark the body has swung away from lands
   * on empty field (`instar-sway.ts`), and so does one thrown where a swept
   * mark was (`along`). `r` is the head's radius, which an
   * egg is sized by, and `head` is where the fire comes out of.
   */
  place(l: Layout, s: InstarState, sway: Sway, along: number, head: Point, r: number): void {
    this.headR = r;
    if (s.phase !== "land") this.heldAlong = s.phase === "act" ? along : 0;
    const step = instarStep(s);
    this.marks = step === null ? [] : step.marks.map((m) => instarMarkPoint(l, m, sway, along));
    this.swipes = step === null ? [] : step.marks.map((m) => m.gesture === "swipeDown");
    this.shove.place(step);
    this.head = head;
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
          this.verdicts.clear();
          this.strike.soften();
          break;
        case "instarShow":
          for (const p of this.marks) at(p, 5, PALETTE.red);
          break;
        case "instarRefuse":
          at(mark(e.mark), 4, PALETTE.dim);
          this.flinchNow = FLINCH;
          this.verdicts.mark(e.mark, false);
          break;
        case "instarAnswer":
          at(mark(e.mark), 3, PALETTE.redRim);
          this.verdicts.mark(e.mark, true);
          if (e.part !== "eggs") break;
          if (this.swipes[e.mark] === false) this.eggs.squash(mark(e.mark), this.headR || l.tile);
          else this.eggs.drop(mark(e.mark), l.hullY, this.headR || l.tile);
          break;
        case "instarShove":
          this.shove.hit(e.mark, e.pushMilli);
          break;
        case "instarDone":
          at(mark(e.mark), 8, PALETTE.hullRim);
          this.joltNow = Math.max(this.joltNow, JOLT_TILES * 0.4);
          this.verdicts.mark(e.mark, true);
          break;
        case "instarSlip":
          at(mark(e.mark), 4, PALETTE.dim);
          this.flinchNow = FLINCH * 0.7;
          this.verdicts.mark(e.mark, false);
          break;
        case "instarLand":
          at(this.headOr(l), 14, PALETTE.hull);
          this.joltNow = JOLT_TILES;
          this.hurt.hit();
          break;
        case "instarStrike":
          at({ x: tileCX(l, e.col), y: l.hullY }, 16, PALETTE.red);
          // A part THE INSTAR does not have is THE NETTLE's, not this body's.
          if (!isInstarPart(e.part)) break;
          this.strike.hit(
            e.part,
            e.part === "jaw" || e.part === "fire" ? [this.headOr(l)] : this.marks,
            tileCX(l, e.col),
          );
          this.joltNow = JOLT_TILES * 2;
          break;
        case "instarDown":
          at(this.headOr(l), 30, PALETTE.hullRim);
          this.joltNow = JOLT_TILES * 2;
          this.hurt.hit();
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

  /** The jolt settled, the flinch stilled, the strike spent. */
  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * step);
    if (this.joltNow < 0.002) this.joltNow = 0;
    this.flinchNow = Math.max(0, this.flinchNow - this.flinchNow * FLINCH_DECAY * step);
    if (this.flinchNow < 0.002) this.flinchNow = 0;
    this.strike.update(step);
    this.verdicts.update(step);
    this.eggs.update(step);
    this.hurt.update(step);
    this.shove.update(step);
  }

  /** The falling and the burst eggs, and the strike over everything. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    this.eggs.draw(ctx);
    this.strike.draw(ctx, l);
  }

  clear(): void {
    this.joltNow = 0;
    this.flinchNow = 0;
    this.heldAlong = 0;
    this.marks = [];
    this.swipes = [];
    this.head = null;
    this.strike.clear();
    this.headR = 0;
    this.verdicts.clear();
    this.eggs.clear();
    this.hurt.clear();
    this.shove.clear();
  }
}

function isInstarPart(part: string): part is InstarPart {
  return (INSTAR_PARTS as readonly string[]).includes(part);
}
