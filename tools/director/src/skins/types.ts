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
 * What is out, and why: the body's own pose. A fringe that leans against the
 * direction of travel and an iridescence that rides the movement both want it,
 * and both would want it in the body's own units — which is
 * `shapes-motion.ts`'s `poseAtSecond`, currently private to that file. Adding
 * it means exporting that one function, not re-deriving the seconds-to-beats
 * conversion here: a card that converted at its own rate would show a sway the
 * game does not have. So the field is not guessed at now; the lane that first
 * needs it exports the pose, adds `pose?: Pose` here, and touches no other
 * skin, which is exactly what the object shape above is for.
 */
export interface SkinFrame {
  /** Seconds on the page clock. */
  readonly t: number;
  /** Beat phase 0..1, shared page-wide. */
  readonly beat: number;
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
