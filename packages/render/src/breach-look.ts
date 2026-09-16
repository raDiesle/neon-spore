import { either, STRIKE_SECONDS } from "./breach-either.js";
import type { Layout } from "./layout.js";

/**
 * THE ONE RECORD A CANDIDATE **STRIKE** PATCHES.
 *
 * `break-look.ts`'s kind, and for its reasons: a record rather than a named
 * function, so a candidate look is a field patched onto it for the length of
 * one `draw()` and the call site never learns anything about it
 * (`docs/versus.md`).
 *
 * **`seconds` was 0 and the shipped picture was therefore nothing**, from the
 * day the record existed until the evening of the same one. The most expensive
 * event in this game — the hit that loses the wave, 12 September 2026 — was
 * drawn about as loudly as a shot landing: sparks thrown from the point in the
 * body's own colour (`effects-breach.ts`), a crack that stays (`scars.ts`), and
 * for one creature out of forty the whole ship conducting (`hull-shock.ts`).
 * There was no moment in it. The owner asked for one by name on 16 September
 * 2026, was shown three, and took **two**: a tear (`breach-rend.ts`) and a blow
 * (`breach-hammer.ts`), either one or the other per hit. Which one is
 * `breach-either.ts`, and it is decided by the hit's own seed rather than at
 * random, because both phones have to be looking at the same picture.
 *
 * The seam is `Debris`'s, spelled the same way: a transient that draws nothing
 * sits in `RenderState` because a candidate cannot add one — it can only patch
 * a record — and a seam that exists only once something is using it is a seam
 * nobody can offer an answer through.
 *
 * **The whole strike is one `paint`, and `t` is the whole of its clock.** A
 * record of numbers would decide the shape of the answer before any answer had
 * been written: a ring wants a radius, a lit lane wants a length, a starburst
 * wants forks, and a record carrying all three would be a record carrying two
 * that are always ignored. What every answer shares is where the ship was hit,
 * how wide, in what colour, and how far through it is.
 */
export interface StrikePaint {
  /** Where the body went in: the column's middle, on the membrane. */
  readonly x: number;
  readonly y: number;
  /** One tile in pixels. Every reach an answer draws is in tiles, so a strike
   * is the same size relative to the ship on every phone. */
  readonly tile: number;
  /** How many columns wide the body was. */
  readonly span: number;
  /** 0 on the frame it visibly landed, 1 when the strike is over. */
  readonly t: number;
  /** The colour of what made it (`breach-hue.ts`). */
  readonly hex: string;
  /** The ship's own outline, sampled at any x — so a picture can ride the
   * membrane rather than being laid over it (`hull-shock.ts`'s one decision). */
  readonly surfaceY: (x: number) => number;
  /** The whole stage: a strike that reaches past its own column needs it. */
  readonly l: Layout;
  /** The column and the beat, as one number. Two hits in one wave are two
   * different pictures without either of them being random (`sparks.ts`). */
  readonly seed: number;
}

export interface BreachStrikeLook {
  /**
   * How long the strike is on screen, seconds — and the switch: at 0 nothing
   * is drawn and `paint` is never called.
   *
   * There is room for a long one. `failWave` holds the field for
   * `waveFailBeats` from the tick of the hit — nothing falls, nothing fires —
   * so the beat of the breach is the one place in this game where a slow,
   * deliberate picture costs the pair nothing they were going to do anyway.
   */
  readonly seconds: number;
  readonly paint: (ctx: CanvasRenderingContext2D, s: StrikePaint) => void;
}

export const BREACH_STRIKE_LOOK: BreachStrikeLook = {
  seconds: STRIKE_SECONDS,
  paint: either,
};
