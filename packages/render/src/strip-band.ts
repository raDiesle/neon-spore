/**
 * HOW FAR OFF A STRIP A THUMB MAY LAND AND STILL MEAN IT.
 *
 * The owner, 17 September 2026, on his phone: *"the slider control often does
 * not work, but the shoot buttons always work and the animations are fluent"*,
 * guessing at load or at the grab area being too small. The area was measured
 * first. It is not small — on a 390x844 phone the slab was 48 px tall and the
 * full width of the stage, and the cannon's swelling on the hull is 65 px
 * across, both over the 44 px the platform guidelines ask for. So neither of
 * the two guesses was it.
 *
 * What was wrong is the **margin**, and it is a different thing: the strip was
 * answered within `0.75` of its own height of its row, and the node a thumb
 * actually aims at is drawn with a halo of `1.1` of that height — `spine` in
 * `gland-fluid.ts`. The glow was 70 px tall against a slab of 48. A press on
 * the top of the thing the player can see landed 11 px outside the only
 * rectangle that answers it, and a press that misses is not a slow slider, it
 * is no slider at all, which is exactly the shape of *often does not work*.
 * Between the cannon on the hull and the cannon on the panel there were 36 px
 * of screen that answered nothing at all.
 *
 * So a strip answers **its share of the band** rather than a fixed slab: from
 * halfway to whatever is above it to halfway to whatever is below, which on a
 * solo panel is the top of the band and the first row of buttons. Nothing is
 * drawn differently and no control moves. The rule is here rather than in
 * `layout.ts` because that file is at its length and because this is one
 * decision with its own reasons, and it takes the rows rather than a `Layout`
 * so `computeLayout` can call it while it is still building one.
 */

export interface Strip {
  /** The row the cord is drawn along, and how thick the look may be. */
  y: number;
  height: number;
  /**
   * The rows this strip answers a press on. `touch.ts` reads them and nothing
   * else re-derives them — a second copy of "how near a strip counts" is how a
   * control comes to be answered off the place it is drawn, which is the rule
   * `layout.ts`'s own header states.
   */
  top: number;
  bottom: number;
}

/** Everything the two bands are worked out from, all of it already known to
 * `computeLayout` by the time it asks. */
export interface StripRows {
  bandTop: number;
  cannon: number;
  shield: number;
  /** The button row, and a lobe's drawn radius. The strip stops at the
   * drawn edge rather than at the lobe's wider reach (`hitReach`): the lobes
   * are asked first, so where a reach holds the press the button still wins,
   * and between two buttons the row goes on belonging to the strip. */
  button: number;
  lobeR: number;
  /** A strip's own thickness, which is the floor on its reach. */
  height: number;
  /** Which of the two this screen carries. A panel showing one strip gives it
   * the whole band; the two share it only where both are drawn. */
  shows: { cannon: boolean; shield: boolean };
}

/** The two strips, each with the rows it answers. */
export function stripBands(r: StripRows): { cannon: Strip; shield: Strip } {
  return {
    cannon: band(r, "cannon"),
    shield: band(r, "shield"),
  };
}

function band(r: StripRows, which: "cannon" | "shield"): Strip {
  const y = which === "cannon" ? r.cannon : r.shield;
  const other = which === "cannon" ? r.shield : r.cannon;
  const shares = r.shows.cannon && r.shows.shield && other !== y;
  // The floor: never narrower than the slab this replaced, whatever a plan
  // puts where. A panel that stacked a strip on its own buttons would
  // otherwise end up with a strip that answers nothing.
  const own = r.height * 0.75;
  const above = shares && other < y ? (other + y) / 2 : r.bandTop;
  // Down to a button's drawn edge, or halfway to the strip below. The button
  // is asked first, so under the edge its wider reach still wins.
  const below = shares && other > y ? (other + y) / 2 : r.button - r.lobeR;
  return { y, height: r.height, top: Math.min(above, y - own), bottom: Math.max(below, y + own) };
}
