import { smoothstep } from "./ease.js";
import type { Point } from "./lamprey-shape.js";

/**
 * **THE LAMPREY eating, as a clock** (the owner, 9 October 2026: *it catches
 * with the mouth … some side perspective … and then when its in the middle of
 * mouth inside it closes it to crush it between the teeth*).
 *
 * The head's look is one number, the **fold**: 0 the round sucker face-on,
 * 1 the same disc turned edge-on to the screen — the side view — 2 its two
 * halves folded forward into gaping jaws, and 3 the jaws shut
 * (`lamprey-jaws.ts` draws 1 to 3; `lamprey-draw.ts` squashes the sucker
 * from 0 to 1). It turns toward the body it is hunting as that falls near,
 * the jaws open for it; when the simulation eats it (`lampreyEat`) the morsel
 * is carried into the middle of the mouth, the jaws snap shut on it, chew
 * twice and spill its crumbs out of the seam, and the head turns back to the
 * sucker.
 *
 * **Render only, and on the wall clock**: the simulation has already taken
 * the body off the field on the beat it was eaten, and this is the picture of
 * that. Cleared in `Effects.reset()` through `LampreyFx.clear()`.
 */

/** The bite's moments, in seconds from the eat: open full, morsel in, shut, chewed, turned back. */
const OPEN = 0.1;
const IN = 0.2;
const SHUT = 0.28;
const CHEWED = 0.7;
const DONE = 0.95;
/** The fold of jaws gaping and shut, and how far a chew opens them again. */
export const FOLD_GAPE = 2;
export const FOLD_SHUT = 3;
const CHEW = 0.3;
/** How fast the fold and the facing follow the hunt, per second. */
const FOLD_RATE = 7;
const TURN_RATE = 9;

/** The morsel being eaten: where it was caught from, its colour, how far in, how crushed. */
export interface Morsel {
  from: Point;
  hex: string;
  /** 0 where it was caught, 1 in the middle of the mouth. */
  in: number;
  /** 0 whole, 1 crushed flat between the teeth. */
  crush: number;
}

const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
const clamp01 = (k: number): number => Math.max(0, Math.min(1, k));

/** The shorter way round from `a` to `b`, radians. */
function turnTo(a: number, b: number, most: number): number {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + Math.max(-most, Math.min(most, d));
}

export class LampreyChomp {
  private age = -1;
  private start = 0;
  private from: Point = { x: 0, y: 0 };
  private hex = "#000000";
  private aimFold = 0;
  private aimFace = 0;
  private shown = 0;
  private faced = 0;

  /** The draw's word each frame: the fold the hunt wants, and which way the head should face. */
  aim(fold: number, face: number): void {
    this.aimFold = fold;
    this.aimFace = face;
  }

  /**
   * A body eaten at `at`, in `hex`, the mouth at `mouth`: the bite starts,
   * facing it. A second eaten before the jaws shut joins the first.
   */
  bite(at: Point, hex: string, mouth: Point, tile: number): void {
    if (this.age >= 0 && this.age < SHUT) return;
    this.age = 0;
    this.start = this.shown;
    this.from = at;
    this.hex = hex;
    if (Math.hypot(at.x - mouth.x, at.y - mouth.y) > tile * 0.3) {
      this.faced = Math.atan2(at.y - mouth.y, at.x - mouth.x);
    }
  }

  /** On by `dt` seconds; true on the frame the jaws close on the morsel. */
  update(dt: number): boolean {
    const step = Math.min(dt, 1 / 30);
    if (this.age < 0) {
      const most = FOLD_RATE * step;
      this.shown += Math.max(-most, Math.min(most, this.aimFold - this.shown));
      // Face-on the facing cannot be seen, so it is taken at once.
      this.faced =
        this.shown < 0.05 ? this.aimFace : turnTo(this.faced, this.aimFace, TURN_RATE * step);
      return false;
    }
    const was = this.age;
    this.age += step;
    this.shown = this.foldAt(this.age);
    if (this.age >= DONE) this.age = -1;
    return was < SHUT && this.age >= SHUT;
  }

  /** The fold `t` seconds into a bite. */
  private foldAt(t: number): number {
    if (t < OPEN) return lerp(this.start, FOLD_GAPE, smoothstep(t / OPEN));
    if (t < IN) return FOLD_GAPE;
    if (t < SHUT) return lerp(FOLD_GAPE, FOLD_SHUT, clamp01((t - IN) / (SHUT - IN)) ** 2);
    if (t < CHEWED) {
      const k = (t - SHUT) / (CHEWED - SHUT);
      return FOLD_SHUT - CHEW * Math.abs(Math.sin(k * Math.PI * 2));
    }
    return lerp(FOLD_SHUT, 0, smoothstep(clamp01((t - CHEWED) / (DONE - CHEWED))));
  }

  /** The head's fold this frame, 0..3. */
  get fold(): number {
    return this.shown;
  }

  /** Which way the head faces, radians on the screen. */
  get face(): number {
    return this.faced;
  }

  /** The morsel in the mouth, until it is crushed out of sight; null between bites. */
  get morsel(): Morsel | null {
    if (this.age < 0 || this.age >= CHEWED) return null;
    return {
      from: this.from,
      hex: this.hex,
      in: smoothstep(clamp01(this.age / IN)),
      crush: clamp01((this.age - IN) / (SHUT - IN)),
    };
  }

  clear(): void {
    this.age = -1;
    this.start = 0;
    this.from = { x: 0, y: 0 };
    this.hex = "#000000";
    this.aimFold = 0;
    this.aimFace = 0;
    this.shown = 0;
    this.faced = 0;
  }
}
