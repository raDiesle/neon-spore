import type { CatalogueEntry } from "../catalogue.js";
import { BOSS_DRAFTS } from "./bosses.js";
import { CREATURE_DRAFTS } from "./creatures.js";
import { SYSTEM_DRAFTS } from "./systems.js";

/**
 * Every draft, in the order a person would want to read them: the creatures
 * first, because that is where most of the idea store is, then the bosses,
 * then the things that are neither.
 *
 * Split across three files for the ordinary reason — a single list of twenty
 * entries with a paragraph each is a thousand-line file — and split along the
 * same seam the backlog page already groups by, so an entry that is filed
 * wrongly is one move between two files.
 */
export const DRAFTS: CatalogueEntry[] = [...CREATURE_DRAFTS, ...BOSS_DRAFTS, ...SYSTEM_DRAFTS];
