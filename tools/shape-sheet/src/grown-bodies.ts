import type { CatalogueEntry } from "./catalogue.js";
import { bodiesFrom, type Recipe } from "./recipe.js";

/**
 * Fourteen bodies that are nothing but a base blob and a handful of parts.
 *
 * They are on the page to answer one question, and it is not "is this a good
 * creature": it is **how far a combination moves a silhouette**. Every card
 * here starts from a shape the catalogue would otherwise call another blob —
 * three or four lobes, a little depth, the same wobble the game draws — and
 * every one of them is nameable at a glance, which is the claim the parts
 * library is making and the only one an eye can settle.
 *
 * So they are `free` rather than `draft`. A draft is a picture offered to a
 * named idea in `docs/spec/ideas.md`, and offering fourteen at once would be
 * spending fourteen of the owner's decisions on a mechanism rather than on a
 * creature. These are pictures with no behaviour behind them, which is exactly
 * what `free` means, and the day one is claimed its recipe moves into
 * `packages/content` the way any other claimed shape's parameters do.
 *
 * The recipes are deliberately short. A body wearing nine kinds of part is a
 * proof that the composer works and tells you nothing about whether *parts*
 * work; two or three is the number a creature would actually carry.
 */

const RECIPES: Recipe[] = [
  {
    name: "HALO SPORE",
    note: "node ring + spore cluster",
    owner: "nothing — a body that is shedding while something orbits it, held apart",
    rx: 34,
    ry: 34,
    lobes: 4,
    depth: 0.1,
    parts: [
      { part: "node-ring", at: 0, size: 1.5 },
      { part: "spore-cluster", at: 2.3, size: 0.9 },
    ],
  },
  {
    name: "WHIPTAIL",
    note: "three lashes on one side + a bump on the other",
    owner: "nothing — the asymmetry says which way it is facing before anything moves",
    rx: 36,
    ry: 30,
    lobes: 3,
    depth: 0.18,
    parts: [
      { part: "lash", at: 3.0, count: 3, spread: 1.1, stagger: 0.4 },
      { part: "bump", at: 0.1, size: 1.1 },
    ],
  },
  {
    name: "THISTLE",
    note: "serrated rim + two shards",
    owner: "nothing — hard all the way round, which nothing living in the game is",
    rx: 34,
    ry: 34,
    lobes: 5,
    depth: 0.12,
    parts: [
      { part: "serration", at: 0, count: 5, spread: 5.0, size: 1.3 },
      { part: "shard", at: 4.4, size: 1.1 },
      { part: "shard", at: 5.2, size: 0.8, flip: true },
    ],
  },
  {
    name: "DRIFT NEST",
    note: "four droops + a loose spore",
    owner: "nothing — mass hanging below a small body, so it reads as heavy without being big",
    rx: 30,
    ry: 26,
    lobes: 3,
    depth: 0.14,
    parts: [
      { part: "droop", at: 1.57, count: 4, spread: 1.9, stagger: 0.5 },
      { part: "spore", at: 4.6, size: 1.2 },
    ],
  },
  {
    name: "CROWN POLYP",
    note: "micro caps across the top + two buds",
    owner: "nothing — a body being grown on, which is a different threat from a body with limbs",
    rx: 36,
    ry: 32,
    lobes: 4,
    depth: 0.15,
    parts: [
      { part: "micro-caps", at: 4.7, count: 2, spread: 1.4, size: 1.3 },
      { part: "bud", at: 0.4, size: 1.1 },
      { part: "bud", at: 2.6, size: 0.8 },
    ],
  },
  {
    name: "HOOK COLONY",
    note: "a rim of hooklets + one welt",
    owner: "nothing — every hook turned the same way, so the whole body reads as travelling",
    rx: 33,
    ry: 33,
    lobes: 3,
    depth: 0.1,
    parts: [
      { part: "hooklet", at: 0, count: 9, spread: 5.6, size: 1.2, stagger: 0.2 },
      { part: "welt", at: 1.2, size: 1.2 },
    ],
  },
  {
    name: "GLASS BLOOM",
    note: "three shard clusters + a node",
    owner: "nothing — the soft body is barely visible under what is growing out of it",
    rx: 30,
    ry: 30,
    lobes: 4,
    depth: 0.12,
    parts: [
      { part: "shard-cluster", at: 0.3, count: 3, spread: 4.2, size: 1.3 },
      { part: "node", at: 3.4, size: 1.4 },
    ],
  },
  {
    name: "LANTERN",
    note: "two antennae + a vesicle",
    owner: "nothing — one lit thing inside and two outside, which is a lure before it is a body",
    rx: 28,
    ry: 34,
    lobes: 2,
    depth: 0.14,
    parts: [
      { part: "antenna", at: 4.5, count: 2, spread: 1.1, stagger: 0.6 },
      { part: "vesicle", at: 1.3, size: 1.1 },
    ],
  },
  {
    name: "RAG FIN",
    note: "a web fin, a blade and a tear",
    owner: "nothing — membrane and damage on the same body, which nothing in the bestiary carries",
    rx: 38,
    ry: 28,
    lobes: 3,
    depth: 0.16,
    parts: [
      { part: "web-fin", at: 5.5, size: 1.3 },
      { part: "fin", at: 0.5, size: 1.1 },
      { part: "tear", at: 2.9, size: 1.2 },
    ],
  },
  {
    name: "CILIATE",
    note: "cilia most of the way round + veins under the skin",
    owner: "nothing — the outline is a haze, and what is legible is inside it",
    rx: 34,
    ry: 30,
    lobes: 2,
    depth: 0.1,
    parts: [
      { part: "cilia", at: 0, count: 8, spread: 5.5, size: 1.5, stagger: 0.15 },
      { part: "vein", at: 1.0, count: 2, spread: 2.4, size: 1.2 },
    ],
  },
  {
    name: "BRAMBLE",
    note: "coral + a rootlet + a loose fragment",
    owner: "nothing — a body that branches, which is the one growth habit the game has none of",
    rx: 30,
    ry: 30,
    lobes: 4,
    depth: 0.16,
    parts: [
      { part: "coral", at: 5.0, count: 2, spread: 1.5, size: 1.4 },
      { part: "rootlet", at: 2.2, size: 1.2 },
      { part: "fragment", at: 3.7, size: 1.1 },
    ],
  },
  {
    name: "SIPHON",
    note: "a gill, an arc and a lifted plate",
    owner: "nothing — three things standing off the rim and none of them touching it twice",
    rx: 32,
    ry: 32,
    lobes: 3,
    depth: 0.12,
    parts: [
      { part: "gill", at: 0.2, size: 1.1 },
      { part: "arc", at: 3.3, size: 1.0 },
      { part: "plate", at: 4.9, size: 1.2 },
    ],
  },
  {
    name: "SPINDLE",
    note: "a flagellum, two filaments and debris",
    owner: "nothing — long and thin, with the motion all at one end of it",
    rx: 22,
    ry: 40,
    lobes: 2,
    depth: 0.1,
    parts: [
      { part: "flagellum", at: 1.57, size: 1.1 },
      { part: "filament", at: 4.7, count: 2, spread: 0.8, stagger: 0.5 },
      { part: "debris", at: 0.0, size: 1.0 },
    ],
  },
  {
    name: "HUSK PLATE",
    note: "three plates + a ring shard",
    owner:
      "nothing — armour that has come loose, which is a boss's second act rather than a creature",
    rx: 34,
    ry: 32,
    lobes: 3,
    depth: 0.1,
    parts: [
      { part: "plate", at: 0.4, count: 3, spread: 3.4, size: 1.1, stagger: 0.7 },
      { part: "ring-shard", at: 4.3, size: 1.2 },
    ],
  },
];

export const GROWN_BODIES: CatalogueEntry[] = bodiesFrom(RECIPES);
