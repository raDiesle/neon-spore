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
  // Three on a side.
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
  // Five on a side.
  ["aaaaa", "a...a", "a...a", "a...a", "aaaaa"],
  ["..a..", "..a..", "aaaaa", "..a..", "..a.."],
  ["a...a", ".a.a.", "..a..", ".a.a.", "a...a"],
  ["..a..", ".a.a.", "a...a", ".a.a.", "..a.."],
  ["a....", "aa...", ".aa..", "..aa.", "...aa"],
  ["a.a.a", ".a.a.", "a.a.a", ".a.a.", "a.a.a"],
  ["a....", "aaa..", "..a..", "..aaa", "....a"],
  ["aa.aa", "a...a", ".....", "a...a", "aa.aa"],
  // Four on a side, added on 6 October 2026 with the six and the seven: the
  // owner, *add more levels with more tiles*.
  ["aaaa", "a..a", "a..a", "aaaa"],
  ["a..a", ".aa.", ".aa.", "a..a"],
  ["aaaa", "a...", "a...", "a..."],
  [".aa.", "aaaa", "aaaa", ".aa."],
  ["a...", "aa..", "aaa.", "aaaa"],
  ["a.a.", ".a.a", "a.a.", ".a.a"],
  ["aa..", "aa..", "..aa", "..aa"],
  [".aa.", "a..a", "a..a", ".aa."],
  ["aaaa", ".aa.", ".aa.", ".aa."],
  ["a..a", "aaaa", "a..a", "a..a"],
  ["...a", "..a.", ".a..", "a..."],
  ["a..a", "....", "....", "a..a"],
  // More five on a side.
  [".a.a.", "aaaaa", "aaaaa", ".aaa.", "..a.."],
  ["..a..", ".aaa.", "a.a.a", "..a..", "..a.."],
  [".a.a.", ".a.a.", ".....", "a...a", ".aaa."],
  ["..a..", ".a.a.", "a...a", "a...a", "aaaaa"],
  ["aaaaa", "....a", "aaaaa", "a....", "aaaaa"],
  ["a...a", "aaaaa", "a...a", "aaaaa", "a...a"],
  // Six on a side.
  ["aaaaaa", "a....a", "a....a", "a....a", "a....a", "aaaaaa"],
  ["a....a", ".a..a.", "..aa..", "..aa..", ".a..a.", "a....a"],
  ["..aa..", "..aa..", "aaaaaa", "aaaaaa", "..aa..", "..aa.."],
  ["aa..aa", "aa..aa", "..aa..", "..aa..", "aa..aa", "aa..aa"],
  ["a....a", "a....a", "a....a", "a....a", ".a..a.", "..aa.."],
  ["..aa..", ".a..a.", "a....a", "a....a", ".a..a.", "..aa.."],
  ["aa..aa", "a....a", "......", "......", "a....a", "aa..aa"],
  ["aa....", "aa....", "..aa..", "..aa..", "....aa", "....aa"],
  ["aaaaaa", "......", "aaaaaa", "......", "aaaaaa", "......"],
  ["a.....", "a.....", "a.....", "a.....", "a.....", "aaaaaa"],
  // Seven on a side.
  ["a.....a", ".a...a.", "..a.a..", "...a...", "..a.a..", ".a...a.", "a.....a"],
  ["...a...", "...a...", "...a...", "aaaaaaa", "...a...", "...a...", "...a..."],
  ["...a...", "..a.a..", ".a...a.", "a.....a", ".a...a.", "..a.a..", "...a..."],
  ["...a...", "..aaa..", ".a.a.a.", "a..a..a", "...a...", "...a...", "...a..."],
  ["aaaaaaa", ".a...a.", "..a.a..", "...a...", "..a.a..", ".a...a.", "aaaaaaa"],
  ["aa...aa", "a.....a", ".......", "...a...", ".......", "a.....a", "aa...aa"],
  ["aaaaaaa", "a.....a", "a.aaa.a", "a.a.a.a", "a.aaa.a", "a.....a", "aaaaaaa"],
  ["a.a.a.a", ".......", "a.a.a.a", ".......", "a.a.a.a", ".......", "a.a.a.a"],
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
