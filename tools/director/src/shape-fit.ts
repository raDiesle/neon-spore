import type { LongAxis, OwnMotion } from "@neon-spore/content";
import {
  type Bounds,
  boundsOver,
  type CatalogueEntry,
  WOBBLE_PERIOD,
} from "@neon-spore/shape-sheet";
import {
  type Centre,
  extentOf,
  longAxisOf,
  tilePixels,
  transformedBounds,
} from "./shapes-motion.js";

/**
 * How big a frame a shape needs, and which way round the shape is.
 *
 * Split from `shape-figure.ts` because none of it touches the document: it is
 * a scan over a contour and a table of remembered answers, and the file it
 * came from is the one that builds elements and runs the loop. The split is
 * also where the memo belongs — an answer kept forever wants to sit beside the
 * argument for why it can be.
 */

/** The moments a frame is fitted over: one whole wobble, sampled. */
export const FIT_TIMES = [0, 0.2, 0.4, 0.6, 0.8].map((f) => f * WOBBLE_PERIOD);

/**
 * The hull is six times as wide as it is tall, and a span of it far more.
 * Fitted into a square such a shape becomes a hairline across the middle, so
 * anything this long gets a wide frame and everything else stays square.
 */
export const WIDE_RATIO = 3;

/**
 * The rest pose's box, and the two numbers derived from it. Depends on the
 * contour and on nothing else — not on the frame it will be drawn into, not
 * on the skin, not on the light.
 */
export interface Still {
  bounds: Bounds;
  /**
   * The body's own width and height, asked over the six moments
   * `EXTENT_TIMES` names rather than the five a frame is fitted over. Not
   * merged with `bounds`, and the two disagree about ECHO: which way a body is
   * long is a different question from how big a frame it needs, and WIND has
   * been answering the first one over those six moments since it was written.
   */
  extent: Bounds;
  /** Which way this body is long, from `extent`. */
  long: LongAxis;
  tile: number;
  /**
   * The still shape's middle. Both the frame and the transform written every
   * frame turn about this same point, or the two disagree and the card clips
   * whatever the frame did not know was coming.
   */
  pivot: Centre;
}

/**
 * The fit, remembered.
 *
 * A card's frame is found by scanning: a hundred and thirty contour samples,
 * each a metaball bisection, and then six thousand poses over the sixty-four
 * seconds `DRIFT` takes to reach its widest excursion. That is the honest
 * price of a frame that never clips, and it is nearly the whole price of a
 * card — measured on the SHAPES tab, 6130 ms of a 6376 ms skin switch, against
 * 112 ms for every `buildSkin` on the page and 2 ms for every element.
 *
 * None of it depends on the skin, the light, or the frame the answer is drawn
 * into. So switching skin used to re-derive sixty identical numbers and throw
 * the old ones away — the rebuild was never the cost, recomputing the fit
 * sixty times for no new information was. The catalogue is a fixed table and
 * `FIT_TIMES` a constant, so the answer for a given contour and a given
 * own-motion is the same answer forever; it is worked out once and kept.
 *
 * Keyed on the entry and the motion because those are the only two inputs.
 * The stored boxes are handed out by reference and read, never written.
 */
const stills = new Map<CatalogueEntry, Still>();
const fits = new Map<CatalogueEntry, Map<OwnMotion | undefined, Bounds>>();

export function stillOf(entry: CatalogueEntry): Still {
  const had = stills.get(entry);
  if (had) return had;
  const bounds = boundsOver(entry.subject, FIT_TIMES);
  const extent = extentOf(entry.subject);
  const still: Still = {
    bounds,
    extent,
    long: longAxisOf(extent),
    tile: tilePixels(bounds),
    pivot: { x: (bounds.x0 + bounds.x1) / 2, y: (bounds.y0 + bounds.y1) / 2 },
  };
  stills.set(entry, still);
  return still;
}

/** The box the shape needs once its own-motion is counted in. */
export function fitOf(entry: CatalogueEntry, motion: OwnMotion | undefined, still: Still): Bounds {
  let byMotion = fits.get(entry);
  if (!byMotion) {
    byMotion = new Map();
    fits.set(entry, byMotion);
  }
  const had = byMotion.get(motion);
  if (had) return had;
  const b = transformedBounds(
    entry.subject,
    motion,
    FIT_TIMES,
    still.tile,
    still.pivot,
    still.long,
  );
  byMotion.set(motion, b);
  return b;
}

/** Whether this shape needs the wide frame rather than the square one. */
export function isWide(entry: CatalogueEntry): boolean {
  const b = stillOf(entry).bounds;
  return (b.x1 - b.x0) / (b.y1 - b.y0) > WIDE_RATIO;
}
