import type { SkinContext, SkinFrame } from "../skins/types.js";

/**
 * What a glow is, and what it is told.
 *
 * A **glow** is what a body throws off into the space around it. A skin is
 * what is drawn *on* the body, and the two are different axes on SHAPES for a
 * reason that is not filing: a skin is exclusive and a glow stacks. Picking
 * BLOOM *instead of* MEMBRANE is the one combination that makes no sense, and
 * folding these into `SKINS` would have made it the only way to say it.
 *
 * `docs/glow.md` has the whole argument and the four rules an author works to.
 *
 * ## The context is the skin's, deliberately
 *
 * A glow is built into the same figure, with the same `<defs>`, against the
 * same contour, at the same moment. Everything `SkinContext` carries is
 * exactly what a glow needs, so this is an alias and not a second interface —
 * `parts.ts` already makes the argument at length: three copies of a shared
 * thing drift, and a page whose axes drifted apart is a page whose comparison
 * means nothing. A field added for a skin is a field a glow gets, and the
 * reverse; `centre` arrived for AURA and SWARM and costs the skins nothing.
 */
export type GlowContext = SkinContext;

/** The moment a glow is being drawn at — the skin's frame, for the same
 * reason the context is. See `skins/types.ts`, which documents every field. */
export type GlowFrame = SkinFrame;

/** Where in the stack a glow draws. */
export type GlowLayer = "under" | "over";

/** One glow: its name in the switcher, where it draws, how far it reaches. */
export interface Glow<Id extends string = string> {
  readonly id: Id;
  readonly label: string;
  readonly hint: string;
  /**
   * Beneath the skin or on top of it.
   *
   * Not a matter of taste and not left to the order somebody ticked the boxes
   * in. A bloom sitting on top of its own outline is the effect drawn wrong,
   * and a page whose stacking depended on click order could not be reproduced
   * from a screenshot. The builder draws every `under` in registry order, then
   * the skin, then every `over` — so two readers who tick the same three
   * boxes see the same picture.
   */
  readonly layer: GlowLayer;
  /**
   * How far past the contour this glow reaches, as a fraction of the body's
   * half-extent.
   *
   * This is the field that keeps the cards from clipping, and it is declared
   * rather than measured because measuring it would mean rendering the figure
   * to find out how big to draw it. `shape-figure.ts` takes the largest
   * `spread` in the enabled stack and pads the fitted box by that much before
   * working out the scale — so turning on HALO shrinks every body slightly
   * instead of cutting its halo off at the frame edge.
   *
   * Be generous. A card drawn a little small is a card; a card whose effect is
   * sliced by its own frame reads as the effect being broken.
   */
  readonly spread: number;
  build(ctx: GlowContext): void;
}
