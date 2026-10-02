import type { GLYPHS } from "@neon-spore/sim";

/**
 * **The five signs as they are drawn** — a ring, a triangle, a zigzag, a wave
 * and a hook (`sim/glyphs.ts`), each one stroke in a box from 0 to 1 with y
 * down.
 *
 * One table for both halves of DRAWN GLYPH: THE MIMIC's skin wears these
 * (`mimic-sign.ts`) and the drawing phone's recogniser listens for them
 * (`apps/game/src/glyph-stroke.ts`), so the shape a pair agrees a word for is
 * the shape the pad hears. It lives here, in the package that draws, because
 * the game imports the renderer and never the other way about.
 */

export interface GlyphPoint {
  x: number;
  y: number;
}

/** One sign as it is drawn, and whether it closes on itself. */
export interface GlyphShape {
  at: GlyphPoint[];
  closed: boolean;
}

/** Each of the five. */
export const GLYPH_SHAPES: Record<(typeof GLYPHS)[number], GlyphShape> = {
  ring: {
    at: Array.from({ length: 33 }, (_, i) => {
      const a = (i / 32) * Math.PI * 2 - Math.PI / 2;
      return { x: 0.5 + 0.5 * Math.cos(a), y: 0.5 + 0.5 * Math.sin(a) };
    }),
    closed: true,
  },
  triangle: {
    at: [
      { x: 0.5, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0.5, y: 0 },
    ],
    closed: true,
  },
  // Down and up twice, all straight: a W, four strokes with sharp corners.
  zigzag: {
    at: [
      { x: 0, y: 0 },
      { x: 0.25, y: 1 },
      { x: 0.5, y: 0 },
      { x: 0.75, y: 1 },
      { x: 1, y: 0 },
    ],
    closed: false,
  },
  // One whole period of a sine, lying down: up, over, down, under and back.
  wave: {
    at: Array.from({ length: 25 }, (_, i) => ({
      x: i / 24,
      y: 0.5 - 0.5 * Math.sin((i / 24) * Math.PI * 2),
    })),
    closed: false,
  },
  // A J: straight down the right-hand side, then a half turn up the left.
  hook: {
    at: [
      { x: 1, y: 0 },
      ...Array.from({ length: 13 }, (_, i) => {
        const a = (i / 12) * Math.PI;
        return { x: 0.5 + 0.5 * Math.cos(a), y: 0.6 + 0.4 * Math.sin(a) };
      }),
    ],
    closed: false,
  },
};
