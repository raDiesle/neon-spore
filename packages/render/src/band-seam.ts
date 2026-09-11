import { openSmoothPath, type Point } from "@neon-spore/content";
import { BAND_JOIN } from "./band-join.js";
import { gradientSlot, slotGradient } from "./gradient-slot.js";
import { rgba } from "./hex.js";
import type { Circle, Layout } from "./layout.js";
import { CLIMB, seamBottom, seamRise, seamTop } from "./seam-line.js";
import { P1_SKIN, type SeatSkin } from "./seat-skin.js";

export { hullBottom, seamBottom, seamRise, seamTop } from "./seam-line.js";

/**
 * WHERE THE SHIP ENDS AND THE PANEL BEGINS — WHICH IS NOWHERE.
 *
 * The band's top edge was a 1.5 px straight line in `#33295C`, and it was the
 * one straight edge on a screen whose every other shape is a closed contour
 * with lobes. `sheen.ts` says why that reads wrong on the hull: *a straight
 * edge anywhere on this ship reads as a seam, and the membrane has no seams.*
 * The panel is under the same rule, because it is the same ship: this is the
 * underside of the hull, seen from inside, and the controls are organs of it.
 *
 * So the edge is a membrane — a contour that rises into the hull and never
 * falls below the band it is allowed, so nothing under it is ever uncovered —
 * with slime hanging off it into the chamber. What shape that contour takes is
 * `band-join.ts`’s record, which is where a second answer to *how much the
 * panel should look like the ship* lives. The owner asked for the slime by
 * name: *some slime from ship flowing down a little bit into the control set*.
 *
 * **The membrane is not drawn.** It had a lit rim along it — a glow pass and a
 * pale thread, the brightest line on the lower half of the screen — and that
 * was the whole of what the owner objected to: *there is this wave line of
 * control panel and then immediately comes the ship … remove the line, and
 * then the ship should feel like part of the control panel*. A lit line along
 * a join is a line **at** the join, and no amount of shaping it undoes that.
 * So the contour stays as the edge the chamber is *cut to* — the tissue still
 * ends in a grown contour rather than at the top of a rectangle — and nothing
 * traces it. What is left saying where the ship ends is what should have been
 * saying it all along: the ship’s flesh above, the same colour opening the
 * chamber below (`seat-skin.ts`’s `ground`), and light spilling off the
 * membrane into the top of the panel.
 *
 * **Every shape here is a pure function of `time`.** Nothing is stepped and
 * nothing is remembered, which is what makes it restart-safe by construction
 * rather than by remembering to clear it (`restart.test.ts`, and the note in
 * CLAUDE.md about `world.beat` not being monotonic).
 */

/**
 * The underside of the ship at `x`, swinging either side of `bandTop`.
 *
 * The *shape* of it is `BAND_JOIN.ceiling`'s, and the **clamp is here** rather
 * than there: a candidate roof hands back how high it stands as a share, and
 * this is the one place that turns a share into a y. That is what keeps the
 * ship out of the chamber where the buttons are whatever a candidate answers,
 * without every candidate having to remember the rule (`hullBottom`).
 */
export function seamY(l: Layout, x: number, time: number, lobes: readonly Circle[] = []): number {
  const raw = BAND_JOIN.ceiling(l, x, time, lobes);
  const at = Math.max(0, Math.min(1, Number.isFinite(raw) ? raw : 0.5));
  return l.bandTop + seamRise(l) * ((1 - at) * (1 - CLIMB) - at * CLIMB);
}

function seamPoints(l: Layout, time: number, lobes: readonly Circle[]): Point[] {
  const steps = 48;
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (l.width * i) / steps;
    pts.push({ x, y: seamY(l, x, time, lobes) });
  }
  return pts;
}

/**
 * The ship's own body in the sliver the membrane hangs down through — and only
 * where the hull itself cannot reach.
 *
 * It used to be the whole width, because `hull.ts` filled its contour down to
 * `bandTop` and stopped, so everything the membrane dipped below that was raw
 * background and this carried the deep violet the hull ends in the rest of the
 * way. The ship fills its own belly now (`hullBottom`), which is the better
 * answer: a flat band of one colour under a gradient is exactly the horizontal
 * cut this shape was drawn to avoid.
 *
 * What is left is the strip beside the columns. The hull is clipped to the
 * field, and a stage wider than it — which the phone never is, and a test or a
 * director frame may be — would otherwise show background through the dip.
 */
export function drawSeamFlesh(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  skin: SeatSkin = P1_SKIN,
): void {
  const top = l.bandTop - 1;
  const height = seamBottom(l) - top;
  const right = l.gridLeft + l.gridWidth;
  ctx.fillStyle = skin.hull.body[3];
  if (l.gridLeft > 0) ctx.fillRect(0, top, l.gridLeft, height);
  if (right < l.width) ctx.fillRect(right, top, l.width - right, height);
}

/**
 * The chamber the membrane closes off, as one path to clip the panel to.
 *
 * It used to come back beside a second path for the rim to be stroked along;
 * the rim is gone, and a pair whose other half nothing asks for is a pair.
 */
export function chamberPath(l: Layout, time: number, lobes: readonly Circle[] = []): Path2D {
  const spline = openSmoothPath(seamPoints(l, time, lobes));
  const bottom = l.bandTop + l.bandHeight;
  return new Path2D(`${spline} L ${l.width} ${bottom} L 0 ${bottom} Z`);
}

/** The slot the spill's gradient lives in — layout-only, so one is enough. */
const SPILL = gradientSlot<CanvasGradient>();

/**
 * The light the membrane lets through, pooling into the top of the chamber.
 *
 * With the rim gone this is the only thing left marking the join, and that is
 * the right thing to have left: a lit line says *edge*, and light falling
 * *through* says the panel is the inside of the thing above it. It is in the
 * seat’s own colour, so player two’s chamber is lit by player two’s ship.
 */
export function drawSeamSpill(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  skin: SeatSkin = P1_SKIN,
): void {
  const top = seamTop(l);
  const deep = l.bandTop + l.bandHeight * 0.42;
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = slotGradient(ctx, SPILL, `${top}|${deep}|${skin.tint}`, () => {
    const g = ctx.createLinearGradient(0, top, 0, deep);
    // The tissue's brightest colour rather than the ship's rim: the spill is
    // additive over the whole top of the panel, and a rim is the one colour on
    // a seat bright enough to wash it out.
    g.addColorStop(0, rgba(skin.flesh[0], 0.19));
    g.addColorStop(0.35, rgba(skin.flesh[1], 0.06));
    g.addColorStop(1, rgba(skin.flesh[2], 0));
    return g;
  });
  ctx.fillRect(0, top, l.width, deep - top);
  ctx.globalCompositeOperation = "source-over";
}
