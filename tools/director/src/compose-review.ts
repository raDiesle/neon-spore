import { type Wave, waveTalk } from "@neon-spore/content";
import { type Block, placeable, poolOf, readBlock } from "./compose-block.js";
import { blocksBefore, gentlestBefore, isReviewHead } from "./compose-starts.js";
import { BLOCK_STEPS, STEPS, TUTORIAL_LAST_ID } from "./compose-steps.js";

/**
 * **A review block**: three regular waves that bring nothing new, written in
 * front of a boss that has no block of its own — `docs/spec/wave-curriculum.md`
 * §7. The owner, 15 October 2026: *create all other waves, so that waves are
 * distributed also between all the boss waves.* There are more bosses than
 * things to teach, so the bosses past the last intro stood in a row at the
 * end; a review block gives each its own waves.
 *
 * A review block has no intro. Its **theme** is a thing the game already
 * taught, taken from the last taught back, and it gives the block no more
 * than its ids, its panel and its place in the sawtooth: the block's three
 * waves (`BLOCK_STEPS`) each draw a few of everything taught by then
 * (`Block.pool`) — the owner, 19 October 2026: a parent should *not repeat
 * another parent*, and *mix in more often existing other enemy types*. It is
 * named for the boss behind it (`compose-names.ts`), and its first wave
 * stands a little above the gentlest of the block before (`START_RISE`), so
 * the game keeps rising through them.
 *
 * Its first wave is its **head**: not a variant, so the director folds the
 * other two under it as it folds a block under its intro, and boss
 * placement counts it as a block (`boss-slots.ts`).
 */

export interface Review {
  block: Block;
  /** The theme's intro, and the prefix every composed id starts with. */
  theme: string;
  prefix: string;
  /** Which review this is, from 0. */
  k: number;
}

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
  const arcIntros: number[] = [];
  let k = 0;
  for (let i = 0; i < waves.length; i++) {
    if (placeable(waves, i) === undefined) k += i > finale && isReviewHead(waves, i) ? 1 : 0;
    else (i > finale ? intros : arcIntros).push(i);
  }
  const arc = arcIntros.length;
  // The last taught first: the dearest things (§4.1), so the talk at the
  // end of the game does not fall back to its first blocks'. A block an
  // author wrote whole (THE BLISTER's) has no R1 to review. **The arc's
  // bodies come after every one taught past it**, still last taught first:
  // the owner moved fourteen bodies into the arc on 18 October 2026, which
  // left more bosses at the end than bodies past the arc to theme them on,
  // and a theme reviewed twice is a second set of the same ids.
  const themes = [...arcIntros, ...intros]
    .filter((i) => STEPS.some((s) => waves.some((w) => w.id === `${waves[i]?.id}${s.name}`)))
    .reverse();
  const themeAt = themes[k % themes.length];
  const theme = themeAt === undefined ? undefined : waves[themeAt];
  if (!theme) return "no theme to review";
  const read = readBlock(waves, theme.id);
  if (typeof read === "string") return read;
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
    only: BLOCK_STEPS,
    pool: poolOf(read),
  };
  return { block, theme: theme.id, prefix: `review${capital(read.x)}`, k };
}
