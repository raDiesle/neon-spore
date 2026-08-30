import type { CatalogueEntry } from "../catalogue.js";
import { BOSS_DRAFTS } from "./bosses.js";
import { COLLECTED_DRAFTS } from "./collected.js";
import { CREATURE_DRAFTS } from "./creatures.js";
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
 * `tower-defence.ts` is the newest and is a third seam again: bodies converted
 * out of another game's screenshot rather than drawn at an idea of ours, which
 * is why those three carry no `suggests`.
 *
 * The ship and the rounds are a seam rather than
 * an overflow. `ship.ts` is the four ideas that turned out to be marks on the
 * membrane rather than bodies; `rounds.ts` is what a boss round needs that the
 * field does not have, which is almost nothing.
 */
export const DRAFTS: CatalogueEntry[] = [
  ...CREATURE_DRAFTS,
  ...BOSS_DRAFTS,
  ...COLLECTED_DRAFTS,
  ...TOWER_DEFENCE_DRAFTS,
  ...SYSTEM_DRAFTS,
  ...SHIP_DRAFTS,
  ...ROUND_DRAFTS,
];
