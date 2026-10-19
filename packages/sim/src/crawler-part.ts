import type { Color, Creature } from "./types.js";

/**
 * **What answers one ring of THE CRAWLER**: a colour, the shield, or the
 * mouth. Its own file beside `crawler.ts`, which was at its limit the day the
 * fourth answer arrived.
 *
 * The segments between the ends cycle red, cyan, shield, suck, and round
 * again (`segmentPart`); the head and the tail are the shield's. The owner,
 * 19 October 2026: *add a new body part of crawler which needs to use suck* —
 * the cannon's column and the SUCK press, the way a pod is taken.
 */

/** A ring's answer: the cannon in that colour, the dome, or the maw. */
export type CrawlerPart = Color | "shield" | "suck";

/**
 * The answer this segment wants, by its place among the segments.
 *
 * The cycle is a rule and never authored per segment — a worm whose order the
 * wave could scramble would be a worm the pair has to read one link at a time
 * instead of planning the whole of.
 */
export function segmentPart(place: number): CrawlerPart {
  const step = ((place % 4) + 4) % 4;
  if (step === 0) return "red";
  if (step === 1) return "cyan";
  if (step === 2) return "shield";
  return "suck";
}

/**
 * The colour a segment carries as its `color`: the part when it is one, and
 * `null` for the two that are not, so "no colour" means "not the cannon's".
 */
export function segmentColor(place: number): Color | null {
  const part = segmentPart(place);
  return part === "shield" || part === "suck" ? null : part;
}

/**
 * Whether this link is one the **mouth** answers. Stored rather than read off
 * the place, because the tail's place along the body is a segment's place in
 * the cycle too, and the run that would tell them apart shortens as the pair
 * takes it apart.
 */
export function linkIsSucked(c: Creature): boolean {
  return c.kind === "crawler" && c.crawlerSuck === true;
}

/**
 * Whether this link is one the **shield** answers: a crawler carrying no
 * colour that is not the mouth's — every shield segment and both ends.
 *
 * One question rather than two at every call site, for `isWardable`'s reason:
 * a link the dome turns is a link the cannon cannot break, and the reverse.
 */
export function linkIsArmoured(c: Creature): boolean {
  return c.kind === "crawler" && c.color === null && !linkIsSucked(c);
}
