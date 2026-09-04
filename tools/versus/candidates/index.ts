import type { Variant } from "../variant.js";
// region: candidates
import { SHOT_STREAK } from "./cannon-shot/streak/index.js";
// endregion

/**
 * Every candidate currently offered, in the order the pair should show them.
 *
 * Assembled the way `tools/shape-sheet/src/drafts/index.ts` assembles DRAFTS —
 * one import per candidate, one array — for the same reason: adding an answer
 * is one directory and one line, and removing a decided slot is a `git rm -r`
 * and the same line back out again.
 *
 * The left-hand side of the pair is not in here. It is whatever the game draws
 * today, read off the live records, and giving it an entry would be a second
 * copy of shipped values in a tool.
 *
 * An empty array is a correct state, not a broken one: `variant.ts`, `seed.ts`,
 * `run.ts` and this file all stay whether or not a slot is open. They are the
 * seam, the way `Effects` stays whether or not anything is exploding.
 *
 * `ship:hull-skin` / `warm` left this list by being *answered*, which is the
 * only way anything is meant to. The answer was not "violet" or "amber" but
 * both: the amber hull is player two's ship and the violet one is player one's,
 * so the pair can tell whose screen they are looking at without reading a word
 * (`packages/render/src/seat-skin.ts`). A question with a shipped answer is not
 * a question, so the directory went with the entry.
 */
export const VARIANTS: Variant[] = [SHOT_STREAK];
