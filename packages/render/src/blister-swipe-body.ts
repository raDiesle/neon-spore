import type { BlisterBodyLook, BlisterFrame } from "./blister-bodies.js";
import { blisterBodyOf } from "./blister-pick.js";
import { drawSlugHump, drawSlugStretched } from "./blister-swipe-slug.js";
import { drawZipBase, drawZipPod } from "./blister-swipe-zip.js";
import type { Body } from "./creature-body-in.js";

/**
 * **THE BLISTER's SWIPE body: SLUG or ZIP, one per blister** (the owner, 15
 * October 2026, on `blister:swipe`: *i like all except frog. make sure the
 * path length to pull is big enough so increase* — the length is
 * `blisterSwipeMilli`, which both bodies are drawn along).
 *
 * Which one a blister wears is read off its id, the way COMBO's is
 * (`blister-pick.ts`), so both screens of the pair draw the same one and it does
 * not change while the blister is up.
 */

const BODIES: readonly BlisterBodyLook[] = [
  { draw: drawSlugHump, beyond: drawSlugStretched },
  { draw: drawZipBase, beyond: drawZipPod },
];

export function drawSwipeBody(b: Body, f: BlisterFrame): void {
  BODIES[swipeBodyOf(b.c.id)]?.draw(b, f);
}

/** Nothing past the pore while it is still under it: both bodies are sized off the rise. */
export function drawSwipeBeyond(b: Body, f: BlisterFrame): void {
  if (f.rise <= 0) return;
  BODIES[swipeBodyOf(b.c.id)]?.beyond(b, f);
}

/** 0 for SLUG, 1 for ZIP. */
export function swipeBodyOf(id: number): number {
  return blisterBodyOf(id, BODIES.length);
}
