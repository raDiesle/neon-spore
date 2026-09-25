import {
  catmullRomToBezierPath,
  type HaloedOpts,
  haloedContour,
  haloedHole,
} from "@neon-spore/content";
import type { Subject } from "../contour.js";

/**
 * A ring with nodes standing on it, and the nodes travel.
 *
 * Converted off Neon Pulsefire's arena boss — `docs/tower-defence.md` — which
 * is a core inside a circle of orbiting satellites. That body is very nearly
 * THE WARDEN arrived at independently, which is the reason to draw it and the
 * reason to be careful with it: what it has that ours does not is **motion in
 * the outline itself**. The warden's hole slides because the design says so;
 * this ring's opening travels because the whole rim is turning, and a gap
 * between two moving nodes is a different thing to point at than a gap that is
 * moved.
 *
 * So `spin` is the parameter this form exists for. Everything else here is
 * arrangement.
 *
 * It is not `ring.ts` with bumps. `ring.ts` builds THE WARDEN out of the
 * parameters `packages/content` ships, so that the sheet and the canvas cannot
 * disagree about a shape the game draws; this is a proposal about a shape
 * nothing draws, and giving it a `RingSilhouette` would mean inventing content
 * for it. The hole is the only thing the two share, and it is eight lines.
 *
 * The arithmetic is `haloedContour` in `packages/content` since 25 September
 * 2026, when THE FILAMENT's player 2 took THE CORONA as her tool; this is the
 * card.
 */
export type { HaloedOpts } from "@neon-spore/content";

export function haloed(name: string, note: string, o: HaloedOpts): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt: (t) => haloedContour(o, t),
    /**
     * A loop of its own rather than a scaled copy of the outer one, for the
     * reason `ring.ts` gives: a ring whose inside repeats its outside reads as
     * a washer, and the whole point of this shape is that you can see the
     * field through it.
     */
    hole: (t) => haloedHole(o, t),
    path: catmullRomToBezierPath,
  };
}
