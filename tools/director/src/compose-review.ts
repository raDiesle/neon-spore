import { type Wave, waveTalk } from "@neon-spore/content";
import { type Block, placeable, readBlock } from "./compose-block.js";
import { blocksBefore, gentlestBefore, isReviewHead } from "./compose-starts.js";
import { TUTORIAL_LAST_ID } from "./compose-steps.js";

/**
 * **A review block**: eight regular waves that bring nothing new, written in
 * front of a boss that has no block of its own — `docs/spec/wave-curriculum.md`
 * §7. The owner, 15 October 2026: *create all other waves, so that waves are
 * distributed also between all the boss waves.* There are more bosses than
 * things to teach, so the bosses past the last intro stood in a row at the
 * end; a review block gives each its eight waves.
 *
 * A review block has no intro. Its **theme** is a thing the game already
 * taught, taken from the last taught back — the first review revisits the
 * last body taught, the second the one before, so the talk at the end of the
 * game stays with its dearest things (§4.1) — and its eight steps are
 * the theme block's own, composed afresh one notch further on: the same jobs
 * (Again … Peak), the same Y and Z, the panel the game has reached by then,
 * and a first wave a little above the gentlest of the block before
 * (`START_RISE`), so the game keeps rising through them.
 *
 * Its first wave is its **head**: not a variant, so the director folds the
 * other seven under it as it folds a block under its intro, and boss
 * placement counts it as a block (`boss-slots.ts`).
 */

export interface Review {
  block: Block;
  /** The theme's intro, and the prefix every composed id starts with. */
  theme: string;
  prefix: string;
  /** The theme's plural, read off its R1 ("LURES AGAIN"), for the names. */
  plural: string;
  /** Which review this is, from 0. */
  k: number;
}

/** The step names a review block's waves take, from its theme's plural:
 * at most 20 letters for every theme the game has (`compose-review.test.ts`). */
export const REVIEW_NAMES: readonly ((plural: string) => string)[] = [
  (p) => `${p} RETURN`,
  (p) => `${p} WIDER`,
  (p) => `${p} OUT WIDE`,
  (p) => `${p} IN PAIRS`,
  (p) => `${p} AT REST`,
  (p) => `${p} RECALLED`,
  (p) => `${p} DOUBLED`,
  (p) => `${p} SUMMIT`,
];

const capital = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

/**
 * The next review block of a wave list, or why there is none: it goes in
 * front of the second boss of the row at the end — the first closes the block
 * before — so the boss behind it closes it.
 */
export function nextReview(waves: readonly Wave[]): Review | string {
  let last = waves.length - 1;
  while (last >= 0 && waves[last]?.boss) last--;
  const insertAt = last + 2;
  if (insertAt >= waves.length) return "no boss waits at the end";
  const finale = waves.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  const intros: number[] = [];
  let k = 0;
  let arc = 0;
  for (let i = 0; i < waves.length; i++) {
    if (placeable(waves, i) === undefined) k += i > finale && isReviewHead(waves, i) ? 1 : 0;
    else if (i > finale) intros.push(i);
    else arc++;
  }
  // The last taught first: the dearest things (§4.1), so the talk at the
  // end of the game does not fall back to its first blocks'. A block an
  // author wrote whole (THE BLISTER's) has no R1 to name a theme by.
  const themes = intros.filter((i) => waves.some((w) => w.id === `${waves[i]?.id}Again`)).reverse();
  const themeAt = themes[k % themes.length];
  const theme = themeAt === undefined ? undefined : waves[themeAt];
  if (!theme) return "no theme to review";
  const read = readBlock(waves, theme.id);
  if (typeof read === "string") return read;
  const again = waves.find((w) => w.id === `${theme.id}Again`);
  const plural = again?.name.replace(/ AGAIN$/, "");
  if (!plural || plural === again?.name) return `${theme.id} has no R1 named "… AGAIN"`;
  const floor = gentlestBefore(waves, last + 1);
  const talkFloor = gentlestBefore(waves, last + 1, waveTalk);
  const { leads: _l, after: _a, floor: _f, talkFloor: _t, ...rest } = read;
  const block: Block = {
    ...rest,
    number: arc + intros.length + k,
    tutorial: false,
    existing: 0,
    sinceTutorial: blocksBefore(waves, insertAt),
    ...(floor === undefined ? {} : { floor }),
    ...(talkFloor === undefined ? {} : { talkFloor }),
    insertAt,
    controls: waves[last]?.controls,
  };
  return { block, theme: theme.id, prefix: `review${capital(read.x)}`, plural, k };
}
