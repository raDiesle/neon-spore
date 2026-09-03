import type { SimConfig } from "./config.js";

/**
 * **What a hand on a handle is allowed to do**, and it is one rule for all
 * three of them — THE MAZE's string, THE WARDEN's rope, THE LID's cord.
 *
 * A pull used to be one signed number along x, because the only handle in the
 * game hung under a rim and was swung *aside*. The owner asked for the whole
 * circle: a hand may now carry a handle in any direction, and the tension is
 * how far it has come rather than how far across.
 *
 * **Two bounds, and they are different kinds of thing.**
 *
 *  1. **Taut** — `tautMilli`, the length the gate opens over. It bounds the
 *     *vector*, not each axis: a diagonal pull that reached taut on each axis
 *     separately would be half as long again as a straight one, and the pair
 *     would learn that the cheapest way to open anything is to pull corner-ways.
 *  2. **The field** — the handle may not leave it, and it may not go under the
 *     app's own chrome along the top either (`CHROME_MILLI`). The owner asked
 *     for the circle to stay wholly on screen, "like a boundary", and this is
 *     that:
 *     the handle slides *along* the edge it reached instead of stopping dead,
 *     because the bound is applied to each axis of the **position** after the
 *     vector has been cut to length. A hand carrying a handle down and to the
 *     left past the left wall goes on travelling downward, which is what a
 *     boundary does and what a hard stop does not.
 *
 * **In tiles, in the simulation, and not in pixels in render.** The bound has
 * to be somewhere both devices agree about, and it has to be somewhere the
 * *rule* can see: a handle stopped only in the picture would sit pinned against
 * the edge while the gauge on it went on filling, and the one thing the seat
 * not holding the cord reads would be saying something the hand is not doing.
 * The field is `cfg.cols` by `cfg.rows` on both phones, so this arithmetic is
 * the same arithmetic on both — which a screen's own edge would not have been.
 */

/**
 * The whole-number square root of `n`, by bisection over the square — the
 * pattern `purity.test.ts` names when it bans `Math.hypot` and its family.
 *
 * A pull is a length, and a length is a square root; `Math.hypot` is not
 * required to be correctly rounded, so V8 on Android and JavaScriptCore on iOS
 * need not agree in the last bit — and this number is rounded into a stored
 * integer, where half an ulp lands on either side of a boundary and desyncs two
 * phones in a way that reproduces on neither. Bisection uses only `*`, `+`,
 * `>>` and a comparison, all of them exact on integers this size, so both
 * phones walk the same sixteen steps to the same answer.
 *
 * The ceiling is `46340`, the largest whole number whose square is under 2^31 —
 * far past the longest pull a field of tiles can hold.
 */
export function isqrt(n: number): number {
  let lo = 0;
  let hi = 46340;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (mid * mid <= n) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** A point or a displacement, in thousandths of a tile. */
export interface PullVec {
  x: number;
  y: number;
}

/**
 * How much of the top row is somebody else's, in thousandths of a tile.
 *
 * One whole tile, and it is the app's chrome rather than the field: the view
 * switch and the wave counter are drawn over the top of the canvas and always
 * are (`apps/game/src/view.ts` — "always on screen"), so they cover the radar
 * strip and about a tile of grid under it. A body drawn up there is partly
 * behind them and always has been; a **control** up there is one the chrome
 * takes the touch for, which is a different and worse thing. So a handle stops
 * a tile lower than a creature may stand.
 */
const CHROME_MILLI = 1000;

/** The tile grid, in thousandths, inset by the radius of the handle itself —
 * so what is kept on the field is the whole circle and not its centre — and by
 * the app's chrome along the top. */
function bounds(cfg: SimConfig): { x0: number; x1: number; y0: number; y1: number } {
  const r = cfg.handleRadiusMilli;
  return {
    x0: r,
    x1: cfg.cols * 1000 - r,
    y0: r + CHROME_MILLI,
    y1: cfg.rows * 1000 - r,
  };
}

/** The tile centre `col`/`row` name, in thousandths — where a handle hangs
 * before anybody has touched it. */
export function tileCentreMilli(col: number, row: number): PullVec {
  return { x: col * 1000 + 500, y: row * 1000 + 500 };
}

/**
 * The pull, cut to length and then kept on the field.
 *
 * `anchor` is **where the handle was when the hand took it**, frozen there for
 * as long as the hand stays, and `raw` is what the pulling device reported — a
 * displacement from wherever the finger grabbed, resolved on that device
 * (`Command` in `command-types.ts`). Anchor plus pull is therefore the finger,
 * and the handle stays under it however far the body it hangs off has moved
 * since (`lidAnchorMilli`, `WardenState.pullAnchorX`).
 *
 * **Frozen, and not the handle's resting place today**, which is what it used
 * to be and what made the bug: a lid falls a tile a beat, so a handle drawn at
 * its current rest walked down the screen out from under a stationary thumb,
 * and the warden's walked sideways as the pupil drifted. What comes back is
 * what the handle actually did, which is what both the picture and the openness
 * are read off.
 */
export function clampPull(
  cfg: SimConfig,
  anchor: PullVec,
  raw: PullVec,
  tautMilli: number,
): PullVec {
  const len = isqrt(raw.x * raw.x + raw.y * raw.y);
  // Cut to taut first, so the box below can only ever shorten it further and
  // the two bounds cannot fight over which one is the length.
  const cut =
    len > tautMilli && len > 0
      ? { x: Math.round((raw.x * tautMilli) / len), y: Math.round((raw.y * tautMilli) / len) }
      : { x: Math.round(raw.x), y: Math.round(raw.y) };

  const b = bounds(cfg);
  return {
    x: Math.max(b.x0, Math.min(b.x1, anchor.x + cut.x)) - anchor.x,
    y: Math.max(b.y0, Math.min(b.y1, anchor.y + cut.y)) - anchor.y,
  };
}

/**
 * How taut a pull is, 0..1000 — and so how far open the gate it holds stands,
 * because they are the same number drawn twice.
 *
 * There is no easing anywhere between this and the picture. The openness *is*
 * the other seat's readout of a hand they cannot see, and a readout that lags
 * the rule is a readout that lies at exactly the moment somebody is deciding to
 * fire.
 */
export function pullOpenMilli(pull: PullVec, tautMilli: number): number {
  const full = Math.max(1, tautMilli);
  const len = isqrt(pull.x * pull.x + pull.y * pull.y);
  return Math.min(1000, Math.round((len * 1000) / full));
}

/**
 * Whether a pull has reached taut — **the squares compared, never the readout
 * above and never even the root**.
 *
 * `pullOpenMilli` rounds, so a hand a thousandth of a tile short reads as a
 * full thousand and a shot the pair had not earned would land; the rounding
 * belongs to the picture and must never decide a hit. And the root itself is
 * not needed at all to answer this — two squares compared is the same question
 * with no rounding anywhere in it, which is the strongest form the rule can
 * take on two phones.
 */
export function pullIsTaut(pull: PullVec, tautMilli: number): boolean {
  return pull.x * pull.x + pull.y * pull.y >= tautMilli * tautMilli;
}
