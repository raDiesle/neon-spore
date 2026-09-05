import { authorsBodyColor, kindForColor, type WaveEntry } from "@neon-spore/content";
import {
  type Color,
  CRAWLER_MAX,
  CRAWLER_MIN,
  type CrawlerSide,
  type CreatureKind,
  crawlerSegmentCount,
  crawlerSide,
  DEFAULT_CONFIG,
  type GhostPath,
  STRAND_MAX,
  STRAND_MIN,
  strandBeadCount,
} from "@neon-spore/sim";

/**
 * **What one arrival can say about itself**, apart from which cell it is in.
 *
 * Everything a wave could say about an arrival used to be said by *which
 * brush* placed it: five meteor buttons for five fall speeds, and no way at
 * all to say what colour the body inside a shell was. That does not scale —
 * every new number is another button in a palette that is already scrolled,
 * and speed crossed with width would have been ten of them — so the numbers
 * moved onto the entry and the panel under the map is where they are set
 * (`cell-config.ts` draws them, `cell-panel.ts` is what it hangs under).
 *
 * This file is only the reading and the writing: no DOM, no panel, no
 * knowledge that a map exists. Every rule it needs it calls — `METEOR_TIER_KINDS`
 * for which kind is which speed, `kindForColor` for which colour is which body,
 * `authorsBodyColor` for which kinds take a colour at all — so the tool cannot
 * come to disagree with the game about any of the three.
 */

/** How a ghost travels. Both, always — the choice is what this row is for. */
export const GHOST_PATHS: readonly GhostPath[] = ["down", "across"];

/** Whether this entry is a ghost, and therefore has a path to set. The one
 * kind that does: `path` means nothing on anything else, and a row offered on
 * a slick would be a row that writes a field the simulation never reads. */
export function hasGhostPath(entry: WaveEntry): boolean {
  return entry.kind === "ghost";
}

/** The path this ghost takes. Unset means it falls, which is what absent means
 * everywhere downstream (`queueFromWave`, `SpawnEntry.path`). */
export function ghostPathOf(entry: WaveEntry): GhostPath {
  return entry.path ?? "down";
}

/**
 * Set the path. `"down"` is written as *no* field rather than as
 * `path: "down"`, so a ghost left falling serialises exactly as it always did
 * and the diff of a wave nobody sent across is empty — the same arrangement
 * `setMeteorSize` makes with a rock left at its ordinary width.
 */
export function setGhostPath(entry: WaveEntry, path: GhostPath): void {
  entry.path = path === "down" ? undefined : path;
}

/**
 * The lengths a thread may be authored at, read off the simulation's own two
 * bounds rather than typed out here: `STRAND_MIN` and `STRAND_MAX` are what
 * `strandBeadCount` clamps to, and a second list would be a panel offering a
 * length the field then quietly refuses.
 */
export const STRAND_COUNTS: readonly number[] = Array.from(
  { length: STRAND_MAX - STRAND_MIN + 1 },
  (_, i) => STRAND_MIN + i,
);

/** Whether this entry is a strand, and therefore has a length to set. The one
 * kind that does: `beads` means nothing on anything else, and a row offered on
 * a slick would write a field the simulation never reads. */
export function hasBeadCount(entry: WaveEntry): boolean {
  return entry.kind === "strand";
}

/** How many beads this thread carries. Unset means the default, which is
 * `strandBeads` — asked of the shipped configuration rather than repeated, so
 * the number under the map is the number the field will build. */
export function beadCountOf(entry: WaveEntry): number {
  return strandBeadCount(DEFAULT_CONFIG, entry.beads);
}

/**
 * Set the length. The default is written as *no* field rather than as the
 * number itself, so a thread left at the shipped length serialises exactly as
 * it always did — the same arrangement `setMeteorSize` makes with a rock left
 * at its ordinary width, and `setGhostPath` with a ghost left falling.
 */
export function setBeadCount(entry: WaveEntry, beads: number): void {
  entry.beads = beads === DEFAULT_CONFIG.strandBeads ? undefined : beads;
}

/**
 * The lengths a worm may be authored at, read off the simulation's own two
 * bounds rather than typed out here — `STRAND_COUNTS`' arrangement, and for
 * its reason: `crawlerSegmentCount` is what clamps, and a second list would be
 * a panel offering a length the field then quietly refuses.
 */
export const CRAWLER_COUNTS: readonly number[] = Array.from(
  { length: CRAWLER_MAX - CRAWLER_MIN + 1 },
  (_, i) => CRAWLER_MIN + i,
);

/** Whether this entry is a crawler, and therefore has a length and a side to
 * set. Neither field means anything on any other kind. */
export function hasCrawlerFields(entry: WaveEntry): boolean {
  return entry.kind === "crawler";
}

/** How many segments this worm carries between its two ends. Unset means the
 * default, asked of the shipped configuration rather than repeated. */
export function crawlerCountOf(entry: WaveEntry): number {
  return crawlerSegmentCount(DEFAULT_CONFIG, entry.segments);
}

/** Set the length, writing the default as *no* field so a worm nobody
 * lengthened serialises exactly as it always did. */
export function setCrawlerCount(entry: WaveEntry, segments: number): void {
  entry.segments = segments === DEFAULT_CONFIG.crawlerSegments ? undefined : segments;
}

/**
 * Which wall this worm comes over. Unset means the wall its column is nearest,
 * which is `crawlerSide`'s own fallback asked rather than repeated — so the
 * panel shows the side the field will actually use, not a blank.
 */
export function crawlerSideOf(entry: WaveEntry): CrawlerSide {
  return crawlerSide(DEFAULT_CONFIG.cols, entry.col, entry.side);
}

/**
 * Set the side. Writing the one the column already implies is written as *no*
 * field, `setGhostPath`'s arrangement: a worm placed on the left and told to
 * come from the left is a worm nobody has overridden, and its wave should
 * serialise byte for byte as it did before anybody clicked.
 */
export function setCrawlerSide(entry: WaveEntry, side: CrawlerSide): void {
  const implied = crawlerSide(DEFAULT_CONFIG.cols, entry.col, undefined);
  entry.side = side === implied ? undefined : side;
}

/** The bodies a colour can name. Both, always — the choice is the point. */
export const BODY_KINDS: readonly ("slick" | "bulb")[] = ["slick", "bulb"];

/**
 * Whether this entry is one of the kinds whose body is authored rather than
 * fixed: the lure's disguise, the shell's core, the clasp's prisoner, the
 * dart's colour. `authorsBodyColor` is the one place that list lives, and it is
 * in `packages/content` because it is a fact about the bestiary and not about
 * this tool.
 */
export function authorsBody(entry: WaveEntry): boolean {
  return entry.kind !== undefined && authorsBodyColor(entry.kind as CreatureKind);
}

/**
 * The body behind this arrival: the slick or the bulb the colour names. Null
 * for an entry that has not been given one — which is what every shell, clasp
 * and dart the old palette placed looks like, since the brush had no way to
 * ask.
 */
export function bodyOf(entry: WaveEntry): CreatureKind | null {
  return entry.color === null ? null : kindForColor(entry.color);
}

/**
 * Choose the body, by choosing the colour that names it. There is deliberately
 * no second field: the colour *is* the body (`kindForColor`, and
 * `livingKindForColor` under it), so storing "bulb" beside "cyan" would be one
 * fact written twice and free to disagree with itself. A lure's `wears` follows
 * from the same colour in `queueFromWave`, which is why nothing is written for
 * it here either.
 */
export function setBody(entry: WaveEntry, body: "slick" | "bulb"): void {
  entry.color = colorForBody(body);
}

/** The colour that names a body. The inverse of `kindForColor`, and derived
 * from it — see `COLOR_FOR_BODY`. */
export function colorForBody(body: "slick" | "bulb"): Color {
  return COLOR_FOR_BODY[body];
}

/**
 * The colour that names each body, derived from `kindForColor` rather than
 * typed out: writing `{ slick: "red" }` here would be a second copy of the
 * pairing `packages/sim/src/kinds.ts` owns, and purity.test.ts has a row for
 * exactly that shape of mistake.
 */
const COLOR_FOR_BODY: Record<"slick" | "bulb", Color> = (() => {
  const out = {} as Record<"slick" | "bulb", Color>;
  for (const color of ["red", "cyan"] as const) {
    const body = kindForColor(color);
    if (body === "slick" || body === "bulb") out[body] = color;
  }
  return out;
})();

// **A rock's two numbers** — how fast it falls and how wide it arrives — are
// `entry-fields-rock.ts` next door, cut out when THE CRAWLER's two took this
// file over its limit. Re-exported here so nothing that already reached for
// one had to move.
export {
  isTieredRock,
  METEOR_SIZES,
  METEOR_SPEEDS,
  type MeteorSpeed,
  meteorSize,
  meteorSpeed,
  setMeteorSize,
  setMeteorSpeed,
} from "./entry-fields-rock.js";
