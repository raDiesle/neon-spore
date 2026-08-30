import type { SkinContext, SkinFrame } from "../skins/types.js";

/**
 * What a hit is, and what it is told.
 *
 * A **hit** is what a body does at a moment — the announcement that something
 * is coming, the impact itself, and what is left over. It is a fifth axis on
 * SHAPES beside SKINS, MOTIONS, LIGHT and GLOW, and `docs/glow.md` has the
 * argument for why it is not simply seven more glows. In one line: everything
 * on GLOW runs forever on its own and can be judged by looking, and everything
 * here needs a *moment* before there is anything to see. That is not a
 * difference in mood, it is a difference in control — GLOW is a set of ticks,
 * HITS needs a trigger.
 *
 * The context is `SkinContext`, for the same reason `GlowContext` is: a hit is
 * drawn into the same figure, with the same `<defs>`, against the same
 * contour. One definition, so a field added for one axis is a field all three
 * get.
 */
export type HitContext = SkinContext;

/** The moment a hit is being drawn at — the skin's frame, which carries `hit`. */
export type HitFrame = SkinFrame;

/**
 * Where the page is in the current hit, handed to every figure at once.
 *
 * One object for the whole page and not one per card, the same way `beat` is
 * one number for the whole page: thirty bodies flinching on thirty clocks is
 * noise, and a flinch is only legible because the page does it together.
 *
 * The three fields are **derived once here rather than in seven values**,
 * which is the whole reason this is an object and not a raw timestamp. Seven
 * files each turning "seconds since impact" into a ramp is seven chances to
 * pick a different curve, and then TELEGRAPH and FLASH would disagree about
 * when the hit actually landed.
 */
export interface HitMoment {
  /**
   * Seconds since the impact. **Negative while the hit is still coming**,
   * which is the window TELEGRAPH lives in and the reason this is signed
   * rather than a phase in 0..1.
   */
  readonly since: number;
  /**
   * The wind-up, 0 before the telegraph starts and 1 at the instant of impact.
   *
   * It reaches 1 and is then immediately 0 — the snap is the point. A ramp
   * that eased back down would be a body relaxing, and what a telegraph
   * announces is that it is not going to.
   */
  readonly wind: number;
  /**
   * The aftermath, 1 at the instant of impact and decaying to 0. Everything
   * that happens *because* the hit landed reads this.
   */
  readonly shock: number;
}

/** One hit: its name in the switcher, which phase it belongs to, how it draws. */
export interface Hit<Id extends string = string> {
  readonly id: Id;
  readonly label: string;
  readonly hint: string;
  /**
   * Which part of the event this value draws. It is not used to gate anything
   * — a value reads `wind` or `shock` itself — but it groups the switcher and,
   * more usefully, it makes an axis with three answers to one question legible
   * as three answers rather than as seven unrelated effects.
   */
  readonly phase: "before" | "impact" | "after";
  /**
   * How far past the contour this reaches, as a fraction of the body's
   * half-extent — the same contract `Glow.spread` has, and read by the same
   * padding in `shape-figure.ts`. A ring that expands out of its own frame
   * reads as broken rather than as large.
   */
  readonly spread: number;
  build(ctx: HitContext): void;
}
