import { saggingRoof } from "./gland-join.js";
import type { Circle, Layout } from "./layout.js";
import type { SeatSkin } from "./seat-skin.js";
import { chamber } from "./ship-gland.js";

/**
 * THE ONE RECORD A CANDIDATE SHIP-AND-PANEL JOIN PATCHES.
 *
 * The ninth of `magnet-look.ts`'s kind, and the first about two objects rather
 * than one. `band-seam.ts` already says what the join is *for*: the panel is
 * the underside of the hull seen from inside, the controls are organs of it,
 * and there is no line anywhere saying where one ends and the other begins.
 * The owner has now asked twice for more of that — *the control panel should
 * look like part of the hull ship shape, so it looks perfectly integrated. Ship
 * must more follow visual of control panel, or the way around* — so this is the
 * seam a second answer can live in.
 *
 * **Two fields, because there are two halves of one question.** `ceiling` is
 * the shape of the ship's underside across the whole width; `attach` is what
 * stands between that underside and one control. A candidate that changed only
 * the first says the panel's roof is the ship; one that changed only the second
 * says its buttons are organs of it; one that changes both says both. The three
 * are worth seeing separately, which is why the record has two fields and not
 * one function that draws everything.
 *
 * It lives here rather than at the bottom of `band-seam.ts` for the reason
 * every look record in this package does: the record needs the paint and the
 * paint needs the record, so a record beside either would make two files import
 * each other.
 */

/**
 * How high the ship's underside stands at one screen x, as **0 at the lowest
 * the membrane hangs and 1 at the highest it climbs**.
 *
 * A share rather than a y on purpose: `band-seam.ts` maps it into the
 * membrane's own band and clamps it there, so the ship can never draw into the
 * chamber where the buttons are however a candidate answers (`hullBottom`, and
 * `test/swallow-bounds.test.ts`, which holds that bound).
 *
 * `lobes` is every control on this screen, so a candidate may shape the roof
 * over a button rather than across the width alone.
 */
export type CeilingRise = (l: Layout, x: number, time: number, lobes: readonly Circle[]) => number;

/** Everything the pass between the membrane and the controls can want. It is
 * drawn inside the chamber's own clip, so nothing here can reach up past the
 * roof or down past the bottom of the panel. */
export interface BandAttach {
  readonly ctx: CanvasRenderingContext2D;
  readonly l: Layout;
  /** Every control this screen carries, as the circle it is drawn in. */
  readonly lobes: readonly Circle[];
  /** The wall clock in seconds. Everything here is a pure function of it. */
  readonly time: number;
  /** Whose ship this is. The chamber, its light and its fluid are all one
   * colour, and a pass that reached for a palette hue would be the one violet
   * mark on player two's golden panel (`seat-skin.ts`). */
  readonly skin: SeatSkin;
  /** Where the roof is at `x` — this record's own other half, already asked. */
  readonly ceilingY: (x: number) => number;
}

export interface BandJoin {
  ceiling: CeilingRise;
  attach(d: BandAttach): void;
}

/** The shipped join, GLAND's since 11 September 2026: the hull's own ripple
 * as the roof, hanging lower over every control (`gland-join.ts`), and a wet
 * chamber under it with the hull's ribs hanging on through it as ribbons
 * (`gland-wet.ts`, tuned in `ship-gland.ts`). It replaced a roof that knew
 * nothing about the buttons and a thin tendril from it down to each one. */
export const BAND_JOIN: BandJoin = { ceiling: saggingRoof(2.6, 0.25), attach: chamber };
