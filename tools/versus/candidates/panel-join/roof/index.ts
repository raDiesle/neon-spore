import * as join from "../../../../../packages/render/src/band-join.js";
import { patch, type Variant } from "../../../variant.js";
import { ripple } from "./paint.js";

/**
 * `panel:ship-join` / `roof` — the ceiling of the panel is the underside of the
 * ship, ripple for ripple.
 *
 * The panel is already the inside of the hull and says so in three ways: the
 * chamber is cut to a grown contour rather than to the top of a rectangle, the
 * ship's flesh above and the chamber's first colour below are the same colour,
 * and light spills off the membrane into the top of the panel. Nothing traces
 * the join, because the owner removed the line that used to and said why:
 * *there is this wave line of control panel and then immediately comes the ship
 * … remove the line, and then the ship should feel like part of the control
 * panel* (`band-seam.ts`).
 *
 * What is still wrong is one step further in. The roof is a **wave of its own**
 * — four sines with a drift on each, invented in `band-seam.ts` and answering
 * to nothing above it. So the ship ripples one way and its own underside
 * ripples another, on the same screen, an inch apart. Two surfaces that do not
 * agree are two objects, and no amount of removing lines between them will make
 * them one.
 *
 * ROOF deletes that second wave. The rise at every x is `hullRadiusMul` read at
 * the angle `hullAngleAtX` puts that x at, on `hullSpan`'s ellipse, on
 * `hullClock`'s clock, with `HULL`'s own three fields — every one of them
 * called rather than re-typed, so the panel's crests are *the ship's crests*
 * and stay so the day either is tuned. Where the hull swells the roof swells;
 * where it dips, the roof dips. The membrane is one thickness the whole way
 * across, which is what a body has.
 *
 * **It is worth the most on the ship the game draws today**, and that is not a
 * coincidence: the hull went to fourteen shallow lobes on 9 September 2026, so
 * about three crests stand in front of the player at any moment. Against two
 * deep lobes there was barely a ripple to follow.
 *
 * **Nothing moves and nothing is drawn.** This candidate is one number per
 * sampled x and no canvas calls at all; the slime, the feeders, the spill and
 * every button are the shipped ones. What changes is the shape of the roof they
 * hang from.
 *
 * How it can lose, and there are two ways. **The hull's ripple is fast.** Its
 * radius function runs at `time * 1.4` against the roof's own drift of about a
 * fifth of that, so a panel that follows it is a ceiling that boils where the
 * shipped one breathes — over eleven columns of ammunition the pair is reading
 * by colour. And **the two may cancel rather than agree**: the ship's *lower*
 * edge is `bandTop` plus a swing, and its *upper* edge is an ellipse a tile and
 * a half above; if a crest on top lining up with a crest underneath reads as
 * the membrane getting thinner instead of as one body rolling, the roof has
 * made the ship look like a strip of tape.
 */
export const JOIN_ROOF: Variant = {
  slot: "panel:ship-join",
  name: "roof",
  sentence:
    "the panel's ceiling is the hull's own ripple, read off the same radius function at the same x — where the ship swells its underside swells, so the membrane is one thickness across the field",
  dir: "tools/versus/candidates/panel-join/roof",
  patches: [
    patch({
      target: join.BAND_JOIN,
      // No accessor: `band-seam.ts` and `band.ts` both read the export itself,
      // once per sampled point and once per frame. The module namespace is the
      // whole route there is.
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      // Both fields, and `attach` deliberately left as it ships. Every
      // candidate in a slot has to patch the same fields or the vote is a vote
      // on two questions at once (`variants.test.ts`), and this one's answer to
      // the second question is *nothing*: the buttons are fed the way they
      // always were, so what the pair is looking at is the roof alone.
      fields: { ceiling: ripple, attach: join.drawFeeders },
    }),
  ],
};
