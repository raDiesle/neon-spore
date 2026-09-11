import type { CreatureKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";

/**
 * The body that is **two bodies in one shell**: a slick and a bulb joined at
 * a thin middle and armoured all the way round — THE CRYSTAL.
 *
 * Its own file rather than a row in `creatures-worn.ts`, which is at its
 * 250-line limit, and along a seam that is true anyway: every row next door
 * is one slick or one bulb under something, resolved by `wornKind` to the body
 * its colour names. This is not one body and `wornKind` cannot resolve it —
 * the colour a wave gives it is the colour of the *join*, not of anything
 * living, and both halves are drawn in their own colour whatever the join is.
 *
 * Spread into `CREATURES` beside the rest, so everything downstream still asks
 * one question in one place.
 */
export type JoinedKind = Extract<CreatureKind, "crystal">;

export const JOINED_CREATURES: Record<JoinedKind, CreatureDef> = {
  crystal: {
    kind: "crystal",
    // **Both**, and more than the carom's both: the carom asks for the two
    // controls one after the other and this asks for them at once. The
    // shield has to stand armed in the middle lane on the tick the matching
    // shot lands there, so a wave with one on it must show every button both
    // halves need.
    controls: ["aim", "guard"],
    // No colour of its own: a wave authors one per arrival, and here it is
    // the colour of the **middle** — the one tile a shot can break — rather
    // than of a body. The two ends are always a red slick on the left and a
    // cyan bulb on the right, so what the pair has to read off the shell is
    // the join alone, and it is drawn on both screens.
    color: null,
    authorsColor: true,
    // Player 2's strip, like every other aim target: the harder half of the
    // answer is a shot, and the seat that fires it is the seat that hears it
    // coming.
    radar: "p2",
    blurb:
      "A slick and a bulb joined at a thin middle and armoured all the way round — an hourglass on its side, three tiles wide — crossing the field on a diagonal and turning at the walls. Only the middle can be broken, in its own colour, and only while the shield stands armed in that lane. Then it breaks in two: a plain slick and a plain bulb, each falling its own column. Any other shot bounces off and drives it a row toward the ship.",
  },
};
