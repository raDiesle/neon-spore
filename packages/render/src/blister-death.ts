import type { BlisterGesture } from "@neon-spore/sim";
import type { HitLook } from "./body-hit.js";
import { BREAK_LOOK } from "./break-look.js";

/**
 * **THE ONE RECORD A CANDIDATE BLISTER DEATH PATCHES**, one per control.
 *
 * Every control a blister wears has had a body of its own since 15 October
 * 2026 — MOLE round the press, PALM holding the drop, WHEEL turning with the
 * knob — and every one of them went the same way: the last blow pushed a plain
 * `destroy`, and the kill cut the pieces out of THE BLISTER's silhouette, the
 * rooted clover none of those bodies wears any more (`effects-break.ts`). The
 * owner, 17 October 2026: *every "controls" brush has a weird destroy
 * animation, which looks like a "bulb" is destroyed.*
 *
 * So the kill names its gesture (`sim/events-body.ts`), and each gesture has a
 * record here. **`play` is null for all seven, and null is what ships**: the
 * clover's wedges and their sparks, to the pixel. A candidate fills it, and
 * then the body that was up is kept on the frame after the blow and handed to
 * `play.draw` for `play.life` seconds (`blister-death-fx.ts`), while the
 * clover's pieces and most of its sparks stand down (`hitFor`, `body-hit.ts`).
 *
 * One field and not three because VERSUS asks two answers to one question to
 * differ in half of what they touch: a death is its length and its drawing
 * together, and splitting them would make every pair of candidates agree on
 * the one and argue only over the other.
 */
export interface BlisterDeath {
  readonly play: BlisterDeathPlay | null;
}

export interface BlisterDeathPlay {
  /** Seconds the death is drawn for. */
  readonly life: number;
  /** The body going, drawn every frame of `life` from what it was handed. */
  readonly draw: (d: BlisterDying) => void;
}

/**
 * What a death is drawn from: the body that was up on the frame before the
 * blow, and the two calls that redraw it — **the body is drawn by its own
 * code**, never by a copy, so a death is something that happens *to* MOLE or
 * to the SNAIL rather than a picture standing in for them.
 */
export interface BlisterDying {
  readonly ctx: CanvasRenderingContext2D;
  /** The body's middle on screen, and its radius there. */
  readonly x: number;
  readonly y: number;
  readonly r: number;
  /** The middle of the pore it came up out of, on screen. */
  readonly poreY: number;
  readonly gesture: BlisterGesture;
  /** The way its stroke ran, as a unit step: SWIPE's, COMBO's pull (right),
   * and right for a gesture with no stroke. */
  readonly way: { readonly dx: number; readonly dy: number };
  /** The way its turn went: 1 clockwise, -1 against. */
  readonly spin: 1 | -1;
  /** Seconds since the blow, and the share of `life` that is. */
  readonly age: number;
  readonly at: number;
  /** The same on both phones: the kill's (`killSeed`). */
  readonly seed: number;
  /** One tile in pixels, and the wall clock. */
  readonly tile: number;
  readonly time: number;
  /** The body `h` of the way out of its pore (1 is up, 0 is gone into it),
   * with `bend` laid on the body and never on the pore (`drawBlisterRisen`). */
  body(h: number, bend?: (ctx: CanvasRenderingContext2D) => void): void;
  /** Its control as the help drew it — the press, the drop, the knob — at
   * `alpha`, with `bend` laid on it. */
  control(alpha: number, bend?: (ctx: CanvasRenderingContext2D) => void): void;
}

/**
 * A bend about a point: moved by `dx, dy`, turned by `turn` radians and
 * scaled by `sx, sy`, all about `(x, y)` — the one transform nearly every
 * death lays on a body, so none of them spells it out.
 */
export function bendAbout(
  x: number,
  y: number,
  b: { sx?: number; sy?: number; turn?: number; dx?: number; dy?: number },
): (ctx: CanvasRenderingContext2D) => void {
  return (ctx) => {
    ctx.translate(x + (b.dx ?? 0), y + (b.dy ?? 0));
    if (b.turn) ctx.rotate(b.turn);
    ctx.scale(b.sx ?? 1, b.sy ?? 1);
    ctx.translate(-x, -y);
  };
}

/** How much of the window `from..to` a death at `at` has covered, 0..1. */
export function during(at: number, from: number, to: number): number {
  return Math.max(0, Math.min(1, (at - from) / (to - from)));
}

/** Seven records, each its own object, so a slot patches one control. */
export const BLISTER_DEATH: Record<BlisterGesture, BlisterDeath> = {
  tap: { play: null },
  hold: { play: null },
  swipe: { play: null },
  turn: { play: null },
  rub: { play: null },
  combo: { play: null },
  lever: { play: null },
};

/**
 * The kill under a death that draws its own: no clover wedges, and the squares
 * down to the flash — a body coming apart its own way under the clover's
 * pieces is two deaths at once (`BreakLook.sparkScale`'s reason).
 */
export const BLISTER_DEATH_HIT: HitLook = {
  pieces: { ...BREAK_LOOK, wedges: 0, sparkScale: 0.25 },
  life: 0,
  strike: () => {},
};

/** The hit a blister's kill takes instead of every body's, or null where its
 * control's death is the shipped one. */
export function blisterDeathHit(gesture: BlisterGesture | undefined): HitLook | null {
  return gesture && BLISTER_DEATH[gesture].play ? BLISTER_DEATH_HIT : null;
}
