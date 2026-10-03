import { THROAT_MODES } from "./throat.js";

/**
 * **THE MIMIC's pictures**, painted a tile at a time on the field above the
 * ship (`docs/spec/bosses-choreographed.md` §42; the owner, 3 October 2026:
 * *one touch fills the tile … not freestyle, easy identifiable by the
 * pixels*).
 *
 * Each is a few rows of letters: `.` a tile left bare, and `a`, `b`, `c` the
 * first, second and third of the colours it is painted in. Which colours
 * those are is picked with the picture (`mimic-step.ts`), from the four the
 * standard panel stands for — THE THROAT's four (`THROAT_MODES`): the red
 * shot, the cyan shot, the shield and the maw. So eleven pictures are many
 * more signs, and none is the same as one a pair has met before.
 *
 * **The list is in the order a fight climbs it**: the one-colour pictures
 * first, then two, then three (`mimicShapesUpTo`).
 */
export const MIMIC_SHAPES: readonly (readonly string[])[] = [
  [".a.", "aaa", ".a."],
  ["a..", "a..", "aaa"],
  ["aaa", ".a.", ".a."],
  ["aaa", "a.a", "aaa"],
  ["a..", "aa.", ".aa"],
  [".a.", "aba", ".a."],
  ["aaa", "bbb"],
  ["ab", "ba"],
  [".a.", "aaa", ".b."],
  ["a.b", ".a.", "b.a"],
  [".a.", "bab", ".c."],
  ["abc", "abc"],
];

/** How many colours a picture is painted in. */
export function mimicShapeHues(shape: number): number {
  const rows = MIMIC_SHAPES[shape] ?? [];
  return new Set(rows.join("").replace(/\./g, "")).size;
}

/** The pictures painted in at most `hues` colours, as indices into `MIMIC_SHAPES`. */
export function mimicShapesUpTo(hues: number): number[] {
  return MIMIC_SHAPES.map((_, i) => i).filter((i) => mimicShapeHues(i) <= hues);
}

/** A picture's width and height, in tiles. */
export function mimicShapeSize(shape: number): { w: number; h: number } {
  const rows = MIMIC_SHAPES[shape] ?? [];
  return { w: Math.max(0, ...rows.map((r) => r.length)), h: rows.length };
}

/**
 * **The colours a picture is painted in, packed**: the first in the units,
 * the second in the fives, the third in the twenty-fives — each 1 to 4, one
 * more than its index into `THROAT_MODES`, so nought is a bare tile.
 */
export function mimicInk(hues: readonly number[]): number {
  return (hues[0] ?? 0) + 5 * (hues[1] ?? 0) + 25 * (hues[2] ?? 0);
}

/**
 * The colour a picture wants on the tile `dc`, `dr` from its top left, 1 to
 * 4 (`THROAT_MODES` index plus one), or 0 for bare — and for a tile outside it.
 */
export function mimicShapeAt(shape: number, ink: number, dc: number, dr: number): number {
  const letter = MIMIC_SHAPES[shape]?.[dr]?.[dc];
  if (letter === undefined || letter === ".") return 0;
  const k = "abc".indexOf(letter);
  return Math.floor(ink / 5 ** k) % 5;
}

/** A tile's colour as the panel's mode it is painted with, or null for bare. */
export function mimicPaintMode(paint: number): (typeof THROAT_MODES)[number] | null {
  return THROAT_MODES[paint - 1] ?? null;
}
