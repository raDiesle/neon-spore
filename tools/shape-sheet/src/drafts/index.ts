import type { CatalogueEntry } from "../catalogue.js";
import { ARMOURED_DRAFTS } from "./armoured.js";
import { BOSS_DRAFTS } from "./bosses.js";
import { COLLECTED_DRAFTS } from "./collected.js";
import { CREATURE_DRAFTS } from "./creatures.js";
import { MINE_DRAFTS } from "./mine.js";
import { OFFERED_DRAFTS } from "./offered.js";
import { ROUND_DRAFTS } from "./rounds.js";
import { SHIP_DRAFTS } from "./ship.js";
import { SYSTEM_DRAFTS } from "./systems.js";
import { TOWER_DEFENCE_DRAFTS } from "./tower-defence.js";

/**
 * Every draft, in the order a person would want to read them: the creatures
 * first, because that is where most of the idea store is, then the bosses,
 * then the things that are neither.
 *
 * Split across several files for the ordinary reason — a single list of thirty
 * entries with a paragraph each is a thousand-line file — and split along the
 * same seam the backlog page already groups by, so an entry that is filed
 * wrongly is one move between two files.
 *
 * `tower-defence.ts` is a third seam again: bodies converted out of another
 * game's screenshot rather than drawn at an idea of ours, which is why those
 * nine carry no `suggests`. `armoured.ts` is the same seam gone looking rather
 * than browsing — five bodies collected against the two gaps that file's own
 * page says the nine left open, off one game and two animals.
 *
 * `offered.ts` is the newest seam and the one that is not about ideas at all:
 * second answers to bodies the game already draws, filed where they can be
 * browsed once nobody is going to vote on them. Its own doc has the argument.
 *
 * The ship and the rounds are a seam rather than
 * an overflow. `ship.ts` is the four ideas that turned out to be marks on the
 * membrane rather than bodies; `rounds.ts` is what a boss round needs that the
 * field does not have, which is almost nothing.
 */
export const DRAFTS: CatalogueEntry[] = [
  ...CREATURE_DRAFTS,
  ...MINE_DRAFTS,
  ...BOSS_DRAFTS,
  ...COLLECTED_DRAFTS,
  ...TOWER_DEFENCE_DRAFTS,
  ...ARMOURED_DRAFTS,
  ...SYSTEM_DRAFTS,
  ...SHIP_DRAFTS,
  ...ROUND_DRAFTS,
  ...OFFERED_DRAFTS,
];
