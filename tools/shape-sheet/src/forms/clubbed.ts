import {
  type ClubbedRim,
  type CreatureSilhouette,
  catmullRomToBezierPath,
  clubbedPoints,
} from "@neon-spore/content";
import type { Subject } from "../contour.js";

/**
 * A body wearing balls on stalks: a thin neck out of the rim, ending in a cap
 * wider than the neck that carries it.
 *
 * **The walk itself is in `packages/content/src/body-path.ts` now**, and this
 * is a card over it. It moved the day THE THROB claimed the form — the
 * transaction `docs/asset-catalogue.md` describes, where a shape stops being a
 * picture looking for a behaviour and its parameters become content. What that
 * buys is the property the sheet exists for: THE POMMEL on this page and the
 * throb on the field are the same outline, and neither can drift from the
 * other, because there is one of it.
 *
 * **Why this cannot be `studded`.** That form samples one radius per angle,
 * which is the right machinery for a knob, a spine or a hair and cannot
 * describe this one at all. A club is wider at its tip than at its waist, so
 * over the angular range the cap subtends there are two radii — the near side
 * of the ball and the far one — and a radius function keeps only the far. What
 * comes back is a cone: the neck vanishes, the cap becomes a lobe, and the body
 * reads as a sea urchin. That is exactly what the first conversion of the
 * Galaxy Defense boss produced, and no amount of `blunt` could fix it, because
 * blunting rounds a tip and the defect was the waist.
 *
 * **The clubs vary, and are not random.** `vary` spreads reach and cap size
 * around the ring by a fixed pattern derived from the index, so a body is the
 * same on every reload and two bodies with different `seed`s are not the same
 * body. A ring of identical clubs reads as a cog; the source's do not match
 * each other, and that mismatch is most of why it reads as grown.
 */
export interface ClubbedOpts extends ClubbedRim {
  rx: number;
  ry: number;
  /** Lobing of the body under the clubs. */
  lobes?: number;
  depth?: number;
  seed?: number;
}

/** The wobble every clubbed draft was tuned against, before the walk was content. */
const DRAFT_WOBBLE = 0.025;

export function clubbed(name: string, note: string, o: ClubbedOpts): Subject {
  const body: CreatureSilhouette = {
    rx: o.rx,
    ry: o.ry,
    lobes: o.lobes ?? 4,
    depth: o.depth ?? 0.05,
    wobble: DRAFT_WOBBLE,
    seed: o.seed ?? 3.7,
  };
  const rim: ClubbedRim = {
    clubs: o.clubs,
    reach: o.reach,
    cap: o.cap,
    neck: o.neck,
    vary: o.vary ?? 0.18,
  };
  return {
    name,
    note,
    open: false,
    pointsAt: (t) => clubbedPoints(body, rim, t),
    path: catmullRomToBezierPath,
  };
}
