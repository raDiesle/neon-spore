/**
 * THE PART OF THE SCREEN A ROCK'S FIRE CAN REACH.
 *
 * A rock on the field is drawn whole, and every mark of its fire — the plume
 * behind it, the tongues, the smoke, each chip and its thread — is a gradient
 * and a path. THE CAIRN draws seven of those rocks under one clip, the pile's
 * own outline (`cairn-pile.ts`), and for every stone but the apex nearly all
 * of the fire lies outside it: the apex stone's plume alone is about nine
 * parts in ten above the pile. A mark the clip lets nothing of through drew
 * nothing, and it cost the whole of its gradient and its path to draw it.
 *
 * So the pile tells each stone's fire where the clip is, and a mark asks
 * before it builds anything. **The answer errs towards drawing**: a mark is
 * described by a circle that contains the whole of it, and the clip by the
 * circles round each stone, which contain their seven-gons — so a mark that
 * is skipped could not have reached the clip, and a mark that could have
 * reached it is drawn exactly as before. That is what makes this an
 * *identical* change in `.claude/skills/render-perf`'s sense, and
 * `cairn-window.test.ts` holds it to the ordered log: the pile's calls with
 * the window are the pile's calls without it, minus whole marks.
 *
 * In the rock-centred screen frame — the one the fire is drawn in, after a
 * look has turned the rock's own rotation back out — because that is the
 * frame every mark already knows its own place in. Nothing here reads `time`
 * and nothing is held between frames.
 */

/** Where a rock's fire may show. Every mark asks it with the circle that
 * contains the mark, and draws unless the answer is *nowhere*. */
export interface Window {
  /** Whether a mark reaching `ext` from `(x, y)` can touch what the clip shows. */
  shows(x: number, y: number, ext: number): boolean;
}

/** No clip: a rock on the field, drawn whole. */
export const WHOLE: Window = { shows: () => true };

/** A place the clip is the outline of, and how far it reaches. */
export interface Disc {
  x: number;
  y: number;
  r: number;
}

/**
 * The union of the discs, seen from `(ox, oy)` — the rock whose fire is
 * asking, so the question arrives in that rock's own frame. A mark shows if
 * its circle meets any disc's.
 */
export function seenFrom(discs: readonly Disc[], ox: number, oy: number): Window {
  return {
    shows(x, y, ext) {
      const sx = ox + x;
      const sy = oy + y;
      for (const d of discs) {
        const reach = d.r + ext;
        const dx = d.x - sx;
        const dy = d.y - sy;
        if (dx * dx + dy * dy < reach * reach) return true;
      }
      return false;
    },
  };
}
