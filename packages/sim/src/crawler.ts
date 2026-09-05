import type { SimConfig } from "./config.js";
import { shieldRow } from "./hull-guard.js";
import type { Color, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CRAWLER: a maggot that walks the ship's own surface, and the first body
 * **both controls have to answer, one link at a time, on the same creature**.
 *
 * One body of kind `"crawler"` is one link of it; the creature is the run of
 * them sharing a `crawlerId`, the way one `strand` body is one bead. It never
 * falls and it never arrives — it comes over a side wall at `crawlRow` and
 * walks the ship lengthways, a column every `crawlerStepBeats`, and while it
 * is walking it costs the hull nothing at all. What it costs is the far wall.
 *
 * ## What answers a link
 *
 * **Every ring of it comes off**, and there are two ways to take one. The
 * segments between the ends cycle red, cyan, armour, red, cyan, armour
 * (`segmentColor`); the head and the tail carry no colour, so they are armour
 * too and the shield is what they want. A pair can read the whole order off a
 * worm before saying a word, which is what makes the sentence they then have
 * to say a *plan* rather than a reading.
 *
 * - A red or a cyan segment wants the matching cannon, in that segment's own
 *   column. Player 1 holds the column and player 2 holds the colour.
 * - An armoured link — a plate, the head or the tail — wants the **shield**,
 *   under it, on the beat. Player 2 holds the column, player 1 the trigger.
 *
 * Every link wears a crosshair and every armoured one the shield's own mark
 * above it, so which control is owed where is read rather than worked out
 * (`render/crawler-marks.ts`).
 *
 * Every third link turns the two of them round: the seat that was calling a
 * number is now the seat pressing on the count, and the seat that was pressing
 * is the one who has to be somewhere. Nothing is hidden from either screen —
 * the whole worm is drawn on both — and the pair still cannot stop talking,
 * which is THE GYRE's `null` in `TALKER` arrived at from the other end.
 *
 * ## The magnet
 *
 * A link that is answered leaves, and **the body closes up behind it**: where
 * a link stands is its rank among the living rather than its place along the
 * order (`linkCol`), so everything behind a gap snaps a column forward the
 * instant the gap appears. That is the whole of the regrouping, as one rule
 * rather than as an animation — and it has a cost the pair feels, because the
 * tail comes onto the field sooner every time they take a segment off.
 *
 * ## The two endings
 *
 * With every ring off, the worm is finished where it stood and the ship sweeps
 * the lane clean (`crawler-round.ts`). With the head over the far wall it eats
 * its way in instead, in as many columns as it still has body, and what that
 * costs is exactly what the pair failed to take off it.
 */

/** Which way a crawler walks. `1` is to the right. */
export type CrawlerDir = 1 | -1;

/** The wall a crawler comes over, as a wave authors it. */
export type CrawlerSide = "left" | "right";

/** The sides that exist, for a tool offering the choice. */
export const CRAWLER_SIDES: readonly CrawlerSide[] = ["left", "right"];

/**
 * Segments a worm may be authored with, between its two ends.
 *
 * Two is the shortest run that makes the pair change controls at all — one
 * colour and one plate. Seven is as many as fit: the body feeds onto the field
 * a link a step and the head only has `cols` steps in it, so a worm longer
 * than this would have its last segments walk on with nothing left to walk.
 */
export const CRAWLER_MIN = 2;
export const CRAWLER_MAX = 7;

/**
 * The row a crawler walks along: the shield's own, which is the surface of the
 * ship rather than its plating.
 *
 * It has to be this row and no other, and the two reasons are the two controls
 * the creature is made of. A shot leaves the muzzle at `hullRow - 1`
 * (`bullets.ts`), so a body standing on the hull itself is one the cannon can
 * never reach; and the shield answers a body a row above the ship
 * (`shieldRow`), which is where a rock's underside first meets the dome.
 * `shieldRow` rather than `hullRow(cfg) - 1` written out again — that shape is
 * a second copy of where the shield is, and it will drift.
 */
export function crawlRow(cfg: SimConfig): number {
  return shieldRow(cfg);
}

/**
 * How many segments this arrival actually gets: what the wave asked for, or
 * `crawlerSegments` when it asked for nothing, held inside the two bounds
 * above.
 *
 * Call this rather than reading `entry.segments` at a spawn site: the director
 * offers the range and the wave stores a number, and a second spelling of the
 * clamp is a worm the field will not build the length the page says it will.
 */
export function crawlerSegmentCount(cfg: SimConfig, asked: number | undefined): number {
  const wanted = Math.floor(asked ?? cfg.crawlerSegments);
  return Math.max(CRAWLER_MIN, Math.min(CRAWLER_MAX, wanted));
}

/**
 * Which wall this arrival comes over: what the wave authored, or the wall the
 * authored column is nearest when it authored nothing.
 *
 * The fallback is `ghostOnSpawn`'s arithmetic and it is here so a worm placed
 * on the director's map comes over the side it was placed on — the plainest
 * reading of a cell in the left half is that it starts on the left. An
 * explicit `side` wins, because a wave may want a worm announced on one strip
 * and entering over the other wall.
 */
export function crawlerSide(
  cols: number,
  col: number,
  asked: CrawlerSide | undefined,
): CrawlerSide {
  if (asked !== undefined) return asked;
  return col * 2 < cols - 1 ? "left" : "right";
}

/** Which way a worm off that wall walks. */
export function crawlerHeadingFor(side: CrawlerSide): CrawlerDir {
  return side === "left" ? 1 : -1;
}

/** The column its head stands in on the beat it comes on. */
export function crawlerEntryCol(cols: number, side: CrawlerSide): number {
  return side === "left" ? 0 : cols - 1;
}

/** Which worm this link belongs to, or `-1` for a body that is not one. */
export function crawlerOf(c: Creature): number {
  return c.crawlerId ?? -1;
}

/** Where it sits along the body, counting back from the head. Zero for a body
 * that is not a link, which nothing asks — `crawlerOf` is that test. */
export function linkOrder(c: Creature): number {
  return c.crawlerOrder ?? 0;
}

/** Which way this link is walking. Read it here and never off the field. */
export function crawlerHeading(c: Creature): CrawlerDir {
  return c.crawlerDir ?? 1;
}

/**
 * Every link of this worm still on the field, head first.
 *
 * Sorted on the place along the body rather than on the column, so the run
 * keeps its order whichever way the worm is walking — a right-hand worm has
 * its head in the *highest* column, and a sort on `col` would read it
 * backwards and hang the whole body off the tail.
 */
export function crawlerLinks(world: World, crawlerId: number): Creature[] {
  // `-1` is what `crawlerOf` answers for a body that is not a link at all, so
  // asking for that worm has to be empty rather than *every* such body: a
  // caller that reached this with a slick's id would otherwise be handed the
  // whole field as one enormous run.
  if (crawlerId === -1) return [];
  return world.creatures
    .filter((c) => crawlerOf(c) === crawlerId)
    .sort((a, b) => linkOrder(a) - linkOrder(b));
}

/** The head of this worm, or null once the whole of it has gone. */
export function crawlerHead(world: World, crawlerId: number): Creature | null {
  return crawlerLinks(world, crawlerId)[0] ?? null;
}

/**
 * Whether this link is one of the two ends — the head with the mouth in it, or
 * the hooked tail.
 *
 * It decides a *shape* and nothing else now: both ends carry no colour, so
 * both are the shield's like any plate, and `linkIsArmoured` no longer asks
 * this. Read off the run rather than stored, because the run already settles
 * it — the first of the order is the head, the last of it is the tail — and a
 * stored flag would be a second answer to a settled question.
 */
export function linkIsEnd(world: World, c: Creature): boolean {
  if (c.kind !== "crawler") return false;
  const links = crawlerLinks(world, crawlerOf(c));
  return links.length > 0 && (c.id === links[0]!.id || c.id === links[links.length - 1]!.id);
}

/**
 * The answer this segment wants, by its place among the segments: red, then
 * cyan, then armour, then round again.
 *
 * `null` is the armoured one and is what the body carries as its `color`, so
 * "no colour" and "the shield has this one" are the same fact rather than two.
 * The cycle is a rule and never authored per segment — a worm whose order the
 * wave could scramble would be a worm the pair has to read one link at a time
 * instead of planning the whole of.
 */
export function segmentColor(place: number): Color | null {
  const step = ((place % 3) + 3) % 3;
  if (step === 0) return "red";
  if (step === 1) return "cyan";
  return null;
}

/**
 * Whether this link is one the **shield** answers: a crawler carrying no
 * colour, which is every third segment and both ends.
 *
 * One question rather than two at every call site, for `isWardable`'s reason:
 * a link the dome turns is a link the cannon cannot break, and the reverse.
 *
 * It used to exclude the two ends, because nothing took either off. The owner
 * asked for a worm every part of which comes apart, and there is nothing left
 * for the exclusion to mean: "no colour" and "the shield has this one" are one
 * fact, which is what `segmentColor`'s `null` has always said. So it asks
 * about the body alone, and render can mark a link without walking its run
 * (`render/crawler-marks.ts`).
 */
export function linkIsArmoured(c: Creature): boolean {
  return c.kind === "crawler" && c.color === null;
}

/** Where the link of this rank stands, counting back from the head's column. */
export function linkCol(headCol: number, dir: CrawlerDir, rank: number): number {
  return headCol - rank * dir;
}

/**
 * Whether this beat is one the worms take a column on. A fixed cycle off the
 * shared clock, `echoFalls`' arrangement — so two worms never drift apart and
 * neither device has to store a phase of its own.
 */
export function crawlerCrawls(cfg: SimConfig, beat: number): boolean {
  return beat % Math.max(1, cfg.crawlerStepBeats) === 0;
}

/** Every worm with a link still on the field, in the order they arrived. */
export function crawlerIds(world: World): number[] {
  const ids: number[] = [];
  for (const c of world.creatures) {
    const id = crawlerOf(c);
    if (id !== -1 && !ids.includes(id)) ids.push(id);
  }
  return ids;
}
