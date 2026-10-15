import { SCOUT_ARENAS } from "../scout-arenas.js";
import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";
import { STARE_LEVELS } from "../stare-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * The third page of act seven, cut off `act-7b.ts` when THE STARE took that
 * file twenty-one lines over the 250-line ceiling.
 *
 * **THE UNDERTOW stood last on this page until 18 September 2026**, when one
 * line per boss wave — which kind of boss it is (`Wave.bossType`) — took three
 * act files over at once. It moved to the head of `act-7e.ts`, which is the
 * next page and therefore the next wave: an act file is a page and the order of
 * the waves is the order of the game, so a page that fills up hands its last
 * wave to the one after it rather than keeping it and growing.
 *
 * **`7c` and not `8`, because the order of the waves is the order of the
 * game** — the rule `act-3b.ts` states and `act-7b.ts` repeats, arrived at the
 * same way each time. An act file is a page rather than a chapter, and this
 * page is a different answer to *what may you touch*: the little ship one of
 * you flies and neither of you can see whole, the eye that stops one of you
 * touching anything at all, and the rock that crosses the field in front of
 * the cannon and leaves.
 *
 * **Its last two waves, THE BATON among them, left for a new `act-7d.ts` on
 * 20 September 2026**, when this page sat at 241 of 250
 * lines with no room left for another wave and no letter of its own to give
 * one: it is not the last page of act seven, so the overflow could not simply
 * take the next free letter without playing every wave after it out of order.
 * Every page from `7d` on shifted up one letter instead — the standing
 * convention `docs/queue.md`'s *Act seven has no room* entry settled, the
 * same move `act-7e.ts` (as `act-7d.ts`, the day before) made for THE TASTER
 * and THE SINEW.
 *
 * **THE CLAW's rocks are answered by its pods** since 15 October 2026. The
 * panel has no shield and a breach loses the wave, and the rock in column 2
 * landed before anything could clear it, so no pair could pass it. The owner
 * chose to recompose the rocks rather than give the panel a shield. Two rocks
 * now land in the shield's own column, each under a ward held on the arm until
 * its rock is close. Every other rock is on the field when a purge goes in.
 *
 * **THE STARE's wave has no arrivals** since 29 September 2026, when the
 * eye became a fight of its own — levels of beat patterns
 * (`stare-levels.ts`) and, since 2 October, an eye nothing hurts — and the owner took the rocks
 * off: *rocks falling is stupid because it doesn't relate to the boss*. Its
 * guide went the same day: *the guide is not required for this wave*.
 *
 * **THE HAUL follows THE SCOUT** since 1 October 2026: the same round with a
 * hold that fills (`scout-haul-arenas.ts`), so the line and the prime its ship
 * was drawn with are finally asked for. It is flown second because it is the
 * same picture with two more hands on it. */
export const WAVES_ACT_7C: Wave[] = [
  {
    id: "theTwitch",
    name: "THE TWITCH",
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 10, col: 10, kind: "coil", color: null },
      { beat: 26, col: 10, kind: "coil", color: null },
      { beat: 28, col: 10, kind: "coil", color: null },
      { beat: 30, col: 10, kind: "coil", color: null },
      { beat: 48, col: 10, kind: "coil", color: null },
      { beat: 50, col: 10, kind: "coil", color: null },
      { beat: 52, col: 10, kind: "coil", color: null },
      { beat: 54, col: 10, kind: "coil", color: null },
      { beat: 62, col: 0, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "shield" }],
  },
  {
    id: "theClaw",
    name: "THE CLAW",
    guide: {
      scene: "theClaw",
    },
    entries: [
      { beat: 4, col: 5, kind: "meteor", color: null },
      { beat: 14, col: 5, kind: "meteor", color: null },
      { beat: 32, col: 8, kind: "meteorMedium", color: null },
      { beat: 44, col: 7, kind: "meteor", color: null },
      { beat: 46, col: 3, kind: "meteor", color: null },
      { beat: 52, col: 10, kind: "meteorMedium", color: null },
    ],
    pods: [
      { beat: 2, col: 0, row: 4, kind: "ward", cross: 1 },
      { beat: 18, col: 10, row: 6, kind: "ward", cross: -1 },
      { beat: 34, col: 0, row: 3, kind: "purge", cross: 1, speed: 3 },
      { beat: 50, col: 10, row: 5, kind: "purge", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theScout",
    name: "THE SCOUT",
    guide: {
      scene: "theScout",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_ARENAS },
    bossType: "special",
    controls: "scout",
  },
  {
    id: "theHaul",
    name: "THE HAUL",
    guide: {
      scene: "theHaul",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_HAUL_ARENAS },
    bossType: "special",
    controls: "scout",
  },
  {
    id: "theStare",
    name: "THE STARE",
    entries: [],
    boss: { kind: "stare", levels: STARE_LEVELS },
    bossType: "normal",
  },
  {
    id: "theCrossing",
    name: "THE CROSSING",
    guide: {
      scene: "theCrossing",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 8, col: 5, color: "red" },
      { beat: 10, col: 10, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 18, col: 8, color: "cyan" },
      { beat: 20, col: 0, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 28, col: 2, color: "red" },
      { beat: 31, col: 10, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 34, col: 0, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
  {
    id: "theChoir",
    name: "THE CHOIR",
    guide: {
      scene: "theChoir",
    },
    entries: [
      { beat: 0, col: 3, kind: "choir", color: "red" },
      { beat: 10, col: 0, kind: "choir", color: "cyan" },
      { beat: 22, col: 7, kind: "choir", color: "cyan" },
      { beat: 34, col: 2, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirAgain",
    name: "CHOIRS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "choir", color: "cyan" },
      { beat: 6, col: 6, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 12, col: 3, kind: "choir", color: "cyan" },
      { beat: 19, col: 10, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 26, col: 9, kind: "choir", color: "cyan" },
      { beat: 32, col: 4, kind: "meteor", color: null, cross: 1, row: 5 },
    ],
  },
  {
    id: "theChoirSpread",
    name: "CHOIRS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "choir", color: "cyan" },
      { beat: 7, col: 4, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 12, col: 6, kind: "meteor", color: null },
      { beat: 17, col: 1, kind: "choir", color: "cyan" },
      { beat: 22, col: 10, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 29, col: 3, kind: "meteor", color: null },
    ],
  },
  {
    id: "theChoirReach",
    name: "CHOIRS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "choir", color: "red" },
      { beat: 6, col: 1, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 11, col: 7, kind: "carom", color: "cyan" },
      { beat: 16, col: 2, kind: "choir", color: "cyan" },
      { beat: 22, col: 6, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 28, col: 1, kind: "carom", color: "cyan" },
    ],
  },
  {
    id: "theChoirPair",
    name: "CHOIR AND CROSSING",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 7, kind: "choir", color: "cyan" },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 16, col: 6, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 28, col: 8, kind: "wisp", color: null },
      { beat: 32, col: 5, kind: "choir", color: "red" },
      { beat: 36, col: 3, color: "cyan" },
      { beat: 36, col: 7, color: "cyan" },
      { beat: 40, col: 6, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
  },
  {
    id: "theChoirBreathe",
    name: "EASY CHOIRS",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 7, col: 3, kind: "choir", color: "cyan" },
      { beat: 14, col: 9, color: "cyan" },
      { beat: 21, col: 3, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 27, col: 10, color: "red" },
      { beat: 33, col: 2, kind: "rind", color: "red" },
      { beat: 39, col: 4, color: "cyan" },
    ],
  },
  {
    id: "theChoirRecall",
    name: "CHOIR RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 4, kind: "choir", color: "cyan" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 5, kind: "magnet", color: "red" },
      { beat: 23, col: 2, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 29, col: 3, kind: "choir", color: "cyan" },
      { beat: 34, col: 5, kind: "magnet", color: "cyan" },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
    ],
  },
];
