import type { SimConfig } from "./config.js";
import { pullTravelMilli } from "./pull.js";

/**
 * **What a hand on a handle is allowed to do**, and it is one rule for both
 * of them — THE WARDEN's rope and THE LID's cord.
 *
 * For a while a hand could carry a handle in any direction, and the tension
 * was how far it had come. The owner took that back (10 October 2026, THE
 * WARDEN's rope; 13 October, THE LID's cord): **a handle runs down one fixed
 * path**, and only the hand's travel along it counts — across is nothing and
 * back is slack. The rope's path is straight down (`pullDownMilli`); the
 * cord's is the way the field has room for at the grab (`lid-way.ts`).
 *
 * **Two bounds, and they are different kinds of thing.**
 *
 *  1. **Taut** — `tautMilli`, the length the gate opens over.
 *  2. **The field** — the handle may not leave it, and it may not go under the
 *     app's own chrome along the top either (`CHROME_MILLI`). The owner asked
 *     for the circle to stay wholly on screen, "like a boundary", and this is
 *     that: the travel is cut to the room the path has (`handleBoundsMilli`).
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
export function handleBoundsMilli(cfg: SimConfig): {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
} {
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
export function tileCentreMilli(col: number, row: number): { x: number; y: number } {
  return { x: col * 1000 + 500, y: row * 1000 + 500 };
}

/**
 * A pull along one fixed path, straight down from `anchorY`: the travel the
 * hand has made down it, cut to taut and kept on the field (`handleBoundsMilli`,
 * so the whole circle stays above the bottom edge). Across counts nothing and
 * up is slack — the pair reads the way from the channel, and the channel only
 * goes one way. The one generic PULL's travel (`pull.ts`), with the field's
 * edge as a second bound.
 */
export function pullDownMilli(
  cfg: SimConfig,
  anchorY: number,
  rawY: number,
  tautMilli: number,
): number {
  const room = handleBoundsMilli(cfg).y1 - anchorY;
  return Math.max(0, Math.min(pullTravelMilli({ way: "down", reachMilli: tautMilli }, rawY), room));
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
export function pullOpenMilli(pullMilli: number, tautMilli: number): number {
  const full = Math.max(1, tautMilli);
  return Math.min(1000, Math.round((Math.max(0, pullMilli) * 1000) / full));
}

/**
 * Whether a pull has reached taut — **the raw travel against the raw
 * threshold, never the readout above**. `pullOpenMilli` rounds, so a hand a
 * thousandth of a tile short reads as a full thousand and a shot the pair had
 * not earned would land; the rounding belongs to the picture and must never
 * decide a hit.
 */
export function pullIsTaut(pullMilli: number, tautMilli: number): boolean {
  return pullMilli >= tautMilli;
}
