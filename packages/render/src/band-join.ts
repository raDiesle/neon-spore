import { hash01 } from "./backdrop.js";
import { rgba } from "./hex.js";
import type { Circle, Layout } from "./layout.js";
import type { SeatSkin } from "./seat-skin.js";

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

/**
 * The shipped roof: a slow contour with three periods and a drift on each, so
 * nothing in it repeats over a screen's width and it never reads as a wave
 * pattern. It knows nothing about where the controls are.
 */
export const wobbleCeiling: CeilingRise = (l, x, time) => {
  const u = x / Math.max(1, l.width);
  const swell =
    Math.sin(u * 4.3 + time * 0.19) * 0.5 +
    Math.sin(u * 9.7 - time * 0.31) * 0.28 +
    Math.sin(u * 19.3 + 2.1 + time * 0.13) * 0.14 +
    Math.sin(u * 1.7 + 1.1 - time * 0.09) * 0.36;
  return Math.max(0, Math.min(1, 0.5 + swell / 2.2));
};

/**
 * The shipped attachment: a feeder running out of the membrane down to each
 * control.
 *
 * This is the sentence the owner asked for — *like it is part of the ship* —
 * said in one line rather than in texture: nothing on this panel is placed on
 * it, everything on it is fed from the hull above.
 *
 * All of them in one path and one stroke, the same bargain the slime makes:
 * five tendrils drawn one at a time would be five paths and ten strokes of a
 * frame's budget for a thing nobody looks straight at.
 */
export function drawFeeders(d: BandAttach): void {
  const { ctx, l, lobes, time, skin } = d;
  if (lobes.length === 0) return;
  const path = new Path2D();
  for (const [i, c] of lobes.entries()) {
    const y = c.y - c.r * 1.1;
    const top = d.ceilingY(c.x);
    // A lazy S rather than a straight drop, and each one leans its own way.
    const lean = (hash01(i * 149 + 31) - 0.5) * l.width * 0.24;
    const drift = Math.sin(time * 0.3 + i * 1.7) * l.tile * 0.12;
    path.moveTo(c.x + drift * 0.3, top);
    path.bezierCurveTo(
      c.x + lean + drift,
      top + (y - top) * 0.38,
      c.x - lean + drift,
      top + (y - top) * 0.72,
      c.x,
      y,
    );
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.flesh[1], 0.2);
  ctx.lineWidth = Math.max(1.4, l.tile * 0.08);
  ctx.stroke(path);
  ctx.strokeStyle = rgba(skin.rim, 0.14);
  ctx.lineWidth = Math.max(0.6, l.tile * 0.026);
  ctx.stroke(path);
}

/** The shipped join: a roof that knows nothing about the buttons under it, and
 * a thin tendril from it down to each one. */
export const BAND_JOIN: BandJoin = { ceiling: wobbleCeiling, attach: drawFeeders };
