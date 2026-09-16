import { gape, OPEN } from "./hull-break-gape.js";

/**
 * THE ONE RECORD A CANDIDATE **BREAK IN THE HULL** PATCHES.
 *
 * `break-look.ts`'s kind, `breach-look.ts`'s twin, and the second half of one
 * subject: that one is the *instant* a body goes through the ship and this is
 * what the ship wears afterwards. They are two slots rather than one because
 * they are two decisions — an answer to the moment that nobody would want left
 * on the hull for the rest of the wave, and an answer on the hull that says
 * nothing at all about the moment, are both perfectly possible.
 *
 * **`open` was 0 and the shipped picture was therefore nothing extra**, for
 * the length of one day. What the hull already wore was a crystal-shaped pit
 * clipped into the skin (`craters.ts`) and a crack running out of its rim
 * (`scars.ts`), and neither of them is *plating*: a hole in a membrane, with a
 * line off it. The owner asked for the ship to look destroyed where it was
 * hit, by name, on 16 September 2026, was shown three answers, and took `gape`
 * — with the cavity it opened under the mouth taken back out of it
 * (`hull-break-gape.ts`). The hole keeps its own shape; what is new is what
 * stands *in* it.
 *
 * **Nothing here is clipped to the ship, and that is deliberate.** A crater is
 * clipped because a hole has to be *inside* something or it is a mark in the
 * sky. Plating torn open is the opposite case: the whole of what makes it read
 * as torn is that it stands off the membrane the ship was drawn to. So the
 * paint is handed the geometry and left to decide, and an answer that wants to
 * stay inside the outline clips itself.
 *
 * **It is a state and not an event**, which is what separates its context from
 * `StrikePaint`'s. A scar stays for the rest of the run (`world.scars`), so
 * there is no life to run down and no `t` — only `time`, for an answer whose
 * torn edge is still glowing.
 */
export interface HullBreakPaint {
  /** The middle of the rock that made it — a torch's pair, at their midpoint. */
  readonly x: number;
  /** The skin line right above it: the hole's mouth sits on this. */
  readonly y: number;
  /** How big the hole is, in pixels. A two-tile rock makes one wide one. */
  readonly r: number;
  /** Where the hole cuts the skin, left and right — `craters.ts` measured it
   * once and kept it, so nothing here re-derives a mouth. */
  readonly left: number;
  readonly right: number;
  /** One tile in pixels: every reach an answer draws is in tiles. */
  readonly tile: number;
  /** The frame clock, for a tear that is still hot. */
  readonly time: number;
  /** The column this happened in, as a number to shape a break from. Two holes
   * in one hull are two different pictures without either being random. */
  readonly seed: number;
  /** The ship's own outline, sampled anywhere. */
  readonly skinY: (x: number) => number;
  /** The ship's rim colour: torn plating is the same material as the hull. */
  readonly rim: string;
  /** What the hole itself is filled with (`HullSkin.muzzle`), so anything an
   * answer opens below the hole is the *same* dark and not a second one. */
  readonly pit: string;
  /**
   * The hole's own outline, in screen space: the exact eight-point crystal
   * `crater-pit.ts` fills (`crystalPoints`).
   *
   * **The crater is not the answer's to change.** The owner's rule, 16
   * September 2026: *the crater shape must stay like current in game
   * untouched*. An answer that wants to draw inside the hole clips to this and
   * is then physically unable to widen it; one that wants to reach past it does
   * so on purpose rather than by measuring a shape of its own off `r`.
   */
  readonly dark: Path2D;
  /** The lowest that outline reaches. *The dark shouldn't go lower than the
   * crater* — same sentence, same day — so this is the line an answer's own
   * darkness is measured against. */
  readonly floor: number;
}

export interface HullBreakLook {
  /**
   * How far the break reaches past the hole itself, in tiles — and the switch:
   * at 0 nothing is drawn and `paint` is never called.
   *
   * A reach rather than a count of pieces, because the three answers this slot
   * opened with do not agree about what a piece is: one bends two flaps of
   * plating back, one opens a cavity with ribs across it, and one adds no
   * material at all and only deforms the membrane. What all three share is how
   * far out from the hole the damage is legible, which is also the number the
   * pair is really voting on.
   */
  readonly open: number;
  readonly paint: (ctx: CanvasRenderingContext2D, b: HullBreakPaint) => void;
}

export const HULL_BREAK_LOOK: HullBreakLook = { open: OPEN, paint: gape };
