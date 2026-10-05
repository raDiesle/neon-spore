/**
 * **THE MIMIC's pictures**, painted a tile at a time on the field above the
 * ship (`docs/spec/bosses-choreographed.md` §42; the owner, 3 October 2026:
 * *one touch fills the tile … not freestyle, easy identifiable by the
 * pixels*).
 *
 * Each is a square of letters, `.` a tile left bare and `a` a tile painted.
 * **One colour, and the same tile every time** — the owner, 5 October 2026:
 * *the visual of tiles should always be the same for every level*. The
 * colours the first cut picked from THE THROAT's four buttons went with the
 * buttons, and the fight climbs by size instead: every picture fills the
 * frame it is shown in, so a frame's side is a picture's side
 * (`mimicShapesOfSize`), and a step names which (`MimicStep.size`).
 */
export const MIMIC_SHAPES: readonly (readonly string[])[] = [
  [".a.", "aaa", ".a."],
  ["a..", "a..", "aaa"],
  ["aaa", ".a.", ".a."],
  ["aaa", "a.a", "aaa"],
  ["a..", "aa.", ".aa"],
  ["a.a", ".a.", "a.a"],
  ["a.a", "a.a", "aaa"],
  ["a.a", "aaa", "a.a"],
  ["aa.", ".a.", ".aa"],
  ["a.a", "...", "a.a"],
  ["aaaaa", "a...a", "a...a", "a...a", "aaaaa"],
  ["..a..", "..a..", "aaaaa", "..a..", "..a.."],
  ["a...a", ".a.a.", "..a..", ".a.a.", "a...a"],
  ["..a..", ".a.a.", "a...a", ".a.a.", "..a.."],
  ["a....", "aa...", ".aa..", "..aa.", "...aa"],
  ["a.a.a", ".a.a.", "a.a.a", ".a.a.", "a.a.a"],
  ["a....", "aaa..", "..a..", "..aaa", "....a"],
  ["aa.aa", "a...a", ".....", "a...a", "aa.aa"],
];

/** A picture's width and height, in tiles. */
export function mimicShapeSize(shape: number): { w: number; h: number } {
  const rows = MIMIC_SHAPES[shape] ?? [];
  return { w: Math.max(0, ...rows.map((r) => r.length)), h: rows.length };
}

/** The pictures that fill a frame `size` tiles on a side, as indices into `MIMIC_SHAPES`. */
export function mimicShapesOfSize(size: number): number[] {
  return MIMIC_SHAPES.map((_, i) => i).filter((i) => {
    const { w, h } = mimicShapeSize(i);
    return w === size && h === size;
  });
}

/**
 * Whether a picture wants the tile `dc`, `dr` from its top left painted: 1
 * for painted, 0 for bare — and for a tile outside it.
 */
export function mimicShapeAt(shape: number, dc: number, dr: number): number {
  return MIMIC_SHAPES[shape]?.[dr]?.[dc] === "a" ? 1 : 0;
}
