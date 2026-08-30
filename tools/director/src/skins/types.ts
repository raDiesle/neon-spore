import type { Pose } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";

/**
 * What a skin is, and what it is told.
 *
 * The types live apart from the registry so that a skin file can import them
 * without importing its own siblings — `index.ts` imports every skin, and a
 * skin that imported `index.ts` back would be a cycle.
 */

export const SVG = "http://www.w3.org/2000/svg";

/**
 * The page's heartbeat, in seconds — one named constant, and the game's own
 * beat is not written beside it in a comment but *is* it: `DEFAULT_CONFIG.bpm`
 * is 96, so this is 0.625 s. A card is not a world and cannot read
 * `world.beat`, but a page whose pulse is a different tempo from the field's
 * is a page answering a question about a look nobody will ever see.
 */
export const BEAT_SECONDS = 60 / DEFAULT_CONFIG.bpm;

/**
 * The moment a skin is being drawn at.
 *
 * It is an **object and not two arguments**, and that is the only decision in
 * this file worth an argument. A dozen skins are written against this shape;
 * a positional `onFrame(t, beat)` that later wants a third thing is a dozen
 * files edited at once, while a field added to an interface is read by the
 * skins that want it and invisible to the rest.
 *
 * What is in it:
 *
 * - `t` — seconds on the page clock, the same number the contour is sampled
 *   at. A skin that wants its own free-running rate takes it from here.
 * - `beat` — 0..1, and **the same value on every card in the frame**. It is
 *   computed once per `requestAnimationFrame` and handed to everyone, which
 *   is the whole point: twelve cards pulsing on twelve private clocks reads
 *   as noise, and a heartbeat is only a heartbeat because the page does it
 *   together.
 *
 * - `pose` — where the own-motion has put the body this instant, in the tiles
 *   `content/own-motion.ts` measures a sway in. Unlike `beat` it is **per
 *   card**, because it is a fact about one body rather than about the page.
 *   It comes from `shapes-motion.ts`'s `poseAtSecond`, which is also what
 *   writes the transform on the group — one pose, computed once, used twice —
 *   rather than a seconds-to-beats conversion re-derived inside a skin, which
 *   would show a sway the game does not have. A figure with no own-motion is
 *   handed `REST`.
 *
 * Two skins used to reach for the pose through the DOM instead, differencing
 * `ctx.body.transform.baseVal.getItem(0).matrix` frame to frame. That read a
 * translate rounded to two decimals and assumed it was written first, which
 * was true and promised nowhere; the field is the promise.
 */
export interface SkinFrame {
  /** Seconds on the page clock. */
  readonly t: number;
  /** Beat phase 0..1, shared page-wide. */
  readonly beat: number;
  /** This body's own-motion pose, in tiles. `REST` when it has no motion. */
  readonly pose: Pose;
}

/** Everything a skin is given to build itself into one figure. */
export interface SkinContext {
  /** The group to append to. Everything is drawn in the body's own frame. */
  readonly body: SVGGElement;
  /** This figure's `<defs>`. Key every id on `uid`. */
  readonly defs: SVGDefsElement;
  /** The rim colour, and the colour every other pass is tinted from. */
  readonly colour: string;
  /** Line weight, already divided by the fit's scale. */
  readonly weight: number;
  /**
   * Unique per figure. Several cards draw at once — an unkeyed `<defs>` id
   * silently gives two shapes one texture.
   */
  readonly uid: string;
  /** The shape's name. Seed anything random from it and nothing else. */
  readonly name: string;
  /** Half the shape's extent, in contour units. */
  readonly reach: number;
  /**
   * The body's own width and height, in contour units — what `reach` throws
   * away by taking the larger of the two.
   *
   * A skin that needs to know which way its subject is *long* asks
   * `longAxis(extent.w, extent.h)` and never re-derives the threshold. WIND
   * used to look the subject back up in `CATALOGUE` by `ctx.name` to get this,
   * and fell silently back to "tall" for any name the catalogue did not reach.
   *
   * Measured over a whole wobble rather than at rest, because seven of the
   * sixty entries change which way they are longer as they breathe.
   */
  readonly extent: { readonly w: number; readonly h: number };
  /**
   * Contour units to one tile — the unit a `Pose` offset is measured in. A
   * skin that wants the frame's pose as a distance on its own drawing
   * multiplies by this, the way the game multiplies by `layout.tile`.
   */
  readonly tile: number;
  /**
   * The middle of the body's still bounds, in contour units.
   *
   * Every skin so far got by without it: a texture is clipped to the contour
   * and a gradient is in `objectBoundingBox` units, and neither needs to know
   * where anything is. A **glow** does — AURA is an ellipse standing off the
   * body and SWARM is a cloud under it, and neither is a function of the
   * outline, so both need a point to be centred on.
   *
   * It is the same `pivot` the frame and the own-motion transform both turn
   * about, handed down rather than re-derived. Two answers to where the middle
   * is would put the ring somewhere the body is not.
   */
  readonly centre: { readonly x: number; readonly y: number };
  /**
   * Whether the key light is switched on. Orthogonal to which skin is picked —
   * `light.ts`'s passes read this and draw nothing when it is false, which is
   * what keeps "take the light off and look" possible once a skin composes it
   * rather than being it (TURN, CRATER). Everything else a skin draws is
   * unaffected: this is a light going off, not a different skin.
   */
  readonly lit: boolean;
  /**
   * A path that will be handed the contour's `d` every frame. It is not
   * appended anywhere — the caller decides where it goes, and in what order.
   */
  contourPath(): SVGPathElement;
  /**
   * Ask to be called once a frame, for as long as this figure is on the page.
   *
   * It is registered rather than returned from `build` so that a *pass* can
   * animate itself. MEMBRANE, CORE and VEIN are one picture with one thing
   * added each time, and the passes in `parts.ts` are how that stays true —
   * a pass whose animation had to be handed back up through its skin would be
   * plumbing every skin repeats, which is how three copies drift apart.
   *
   * Mutate attributes here and **allocate nothing**: no gradient, no filter,
   * no path built inside it.
   */
  onFrame(fn: (f: SkinFrame) => void): void;
}

/** One skin: its name in the switcher, and how it draws. */
export interface Skin<Id extends string = string> {
  readonly id: Id;
  readonly label: string;
  readonly hint: string;
  build(ctx: SkinContext): void;
}
