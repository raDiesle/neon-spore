import { drawFace, drawSlime } from "./crawler-skin.js";

/**
 * THE ONE RECORD A CANDIDATE CRAWLER SURFACE PATCHES.
 *
 * A file of its own, and not the bottom of `crawler-skin.ts`, for
 * `magnet-look.ts`'s reason word for word: the record needs the paint and a
 * candidate needs the record, so a record sitting beside the paint would make
 * `crawler.ts` import the paint to reach it. `dart-look.ts` and `magnet-look.ts`
 * are the two files this is the third of.
 *
 * The draw goes through a record rather than through the two functions
 * directly because a call site that names a function can never see a candidate
 * (`docs/versus.md`): a look is a field patched onto a live export for the
 * length of one `draw()`, and the export has to be the thing the drawing code
 * reads on every call.
 */

/**
 * One ring of a worm, as everything a surface on it could want.
 *
 * A record rather than eight positional arguments, `MagnetDraw`'s form, and it
 * carries two things the shipped paint does not use: `beats` and `order`. Both
 * are already in the caller's hand and both are what a *placed* surface needs
 * — a mark at a longitude has to be turned by a clock, and a worm's rings are
 * out of step with each other by where each one stands in the chain. Handing
 * them over costs nothing and is the difference between a candidate that can
 * roll a surface and one that can only slide a highlight across a picture
 * (`docs/style-guide.md`, Depth).
 *
 * There is no `x`/`y`: the caller has already translated to the ring's centre
 * and scaled to it, so every ring is drawn about the origin.
 */
export interface CrawlerLinkDraw {
  readonly ctx: CanvasRenderingContext2D;
  /** The ring's own contour, about the origin, already filled by the caller. */
  readonly body: Path2D;
  /** The ring's radii before the contraction narrows it. */
  readonly rx: number;
  readonly ry: number;
  /** Which way the worm is heading: +1 right, -1 left. */
  readonly dir: number;
  /** How far into its own contraction this ring is, 0..1. */
  readonly squeeze: number;
  /** The shared clock in beats. The one clock two devices agree about. */
  readonly beats: number;
  /** Where this ring stands in the chain, head 0. */
  readonly order: number;
}

export interface CrawlerLook {
  /** The wet on one ring, drawn over the fill and under the rim. */
  slime(d: CrawlerLinkDraw): void;
  /** The head's face, drawn over everything and only on the leading ring. */
  face(d: CrawlerLinkDraw): void;
}

/** The shipped worm: every ring a ball, with eight pores placed on it and
 * carried round by a roll that runs backwards along the way it is going, under
 * a light that stays put. `crawler-skin.ts` holds the arithmetic. */
export const CRAWLER_LOOK: CrawlerLook = { slime: drawSlime, face: drawFace };
