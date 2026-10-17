import type { BlisterGesture } from "@neon-spore/sim";
import { drawSlide } from "./blister-death-combo-slide.js";
import { drawSnap } from "./blister-death-combo-snap.js";
import { drawDrain } from "./blister-death-hold-drain.js";
import { drawSpill } from "./blister-death-hold-spill.js";
import { drawLeverSnap } from "./blister-death-lever-snap.js";
import { drawYank } from "./blister-death-lever-yank.js";
import { drawErase } from "./blister-death-rub-erase.js";
import { drawFoam } from "./blister-death-rub-foam.js";
import { drawSmear } from "./blister-death-swipe-smear.js";
import { drawUnzip } from "./blister-death-swipe-unzip.js";
import { drawPlunge } from "./blister-death-tap-plunge.js";
import { drawPopcap } from "./blister-death-tap-popcap.js";
import { drawScrew } from "./blister-death-turn-screw.js";
import { drawSpring } from "./blister-death-turn-spring.js";
import type { HitLook } from "./body-hit.js";
import { BREAK_LOOK } from "./break-look.js";
import { sinHash } from "./hash.js";

/**
 * **A BLISTER'S DEATH, ONE RECORD PER CONTROL.**
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
 * record here: the deaths it may die, of which a kill plays one
 * (`blisterDeathOf`). The body that was up is kept on the frame after the
 * blow and handed to that death's `draw` for its `life` seconds
 * (`blister-death-fx.ts`), while the clover's pieces and most of its sparks
 * stand down (`hitFor`, `body-hit.ts`). An empty list is the clover's wedges
 * and their sparks, to the pixel.
 *
 * Two each, both of each pair VERSUS offered for the control on 17 October
 * 2026 and both taken, picked between at random for variety — the owner the
 * same day: *apply them to game and iterate randomly over them for variety —
 * i like all.* A death is its length and its drawing together, so a new one
 * is one more `play(life, draw)` in its control's list.
 */
export interface BlisterDeath {
  readonly plays: readonly BlisterDeathPlay[];
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

/** Seven records, each its own object, so a slot patches one control. */
export const BLISTER_DEATH: Record<BlisterGesture, BlisterDeath> = {
  tap: { plays: [play(0.85, drawPlunge), play(1.0, drawPopcap)] },
  hold: { plays: [play(1.1, drawDrain), play(0.95, drawSpill)] },
  swipe: { plays: [play(0.8, drawSmear), play(1.0, drawUnzip)] },
  turn: { plays: [play(1.0, drawScrew), play(0.9, drawSpring)] },
  rub: { plays: [play(1.0, drawErase), play(1.1, drawFoam)] },
  combo: { plays: [play(1.0, drawSlide), play(1.0, drawSnap)] },
  lever: { plays: [play(1.0, drawLeverSnap), play(0.9, drawYank)] },
};

function play(life: number, draw: (d: BlisterDying) => void): BlisterDeathPlay {
  return { life, draw };
}

/**
 * The death a kill plays: one of its control's, picked by the kill's seed so
 * both phones pick the same one, and on a salt of its own so the pick does not
 * follow the side a death throws its pieces to (most read `sinHash(seed)`).
 * Null where the control has none, which is the clover's.
 */
export function blisterDeathOf(gesture: BlisterGesture, seed: number): BlisterDeathPlay | null {
  const { plays } = BLISTER_DEATH[gesture];
  if (plays.length === 0) return null;
  return plays[Math.floor(sinHash(seed, PICK_SALT) * plays.length)] ?? plays[0] ?? null;
}

const PICK_SALT = 41;

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
  return gesture && BLISTER_DEATH[gesture].plays.length > 0 ? BLISTER_DEATH_HIT : null;
}
