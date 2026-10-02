/**
 * **The five signs a thumb can draw**, each one stroke so that each is easy to
 * say across a room and easy to draw on glass: a ring, a triangle, a zigzag, a
 * wave and a hook (`docs/spec/bosses-choreographed.md` §42, DRAWN GLYPH).
 *
 * A sign crosses the wire as its index into this list and nothing else
 * (`command-touch.ts`'s `glyph`). Which of the five a stroke was nearest is
 * decided on the phone it was drawn on, where milliseconds are allowed, and
 * never here: the simulation is told the fact, as it is told a shake.
 *
 * THE MIMIC is the first boss to ask for one; the list is its own file so the
 * next boss that is answered by drawing reads the same five.
 */
export const GLYPHS = ["ring", "triangle", "zigzag", "wave", "hook"] as const;
export type Glyph = (typeof GLYPHS)[number];

/** Whether `n` names one of the five: a whole number in range. */
export function isGlyph(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n < GLYPHS.length;
}
