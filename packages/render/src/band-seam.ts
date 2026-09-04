import { openSmoothPath, type Point } from "@neon-spore/content";
import { gradientSlot, slotGradient } from "./gradient-slot.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { P1_SKIN, type SeatSkin } from "./seat-skin.js";

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
 * So the edge is a membrane — a slow contour that rises into the hull and
 * never falls below `bandTop`, so nothing under it is ever uncovered — with
 * slime hanging off it into the chamber. The owner asked for the slime by
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

/** How far the membrane swings either side of `bandTop`. */
export function seamRise(l: Layout): number {
  return Math.max(5, Math.min(l.tile * 0.62, l.bandHeight * 0.12));
}

/**
 * How far the membrane may climb onto the hull, as a share of `seamRise`. The
 * rest of its swing hangs *down* into the chamber, which is where the shape
 * has to come from: the hull's belly is one tile deep and a membrane that took
 * most of it would be eating the ship to decorate the panel.
 */
const CLIMB = 0.3;

/** The underside of the ship at `x`, swinging either side of `bandTop`. */
export function seamY(l: Layout, x: number, time: number): number {
  const u = x / Math.max(1, l.width);
  // Three periods and a slow drift on each: nothing in it repeats over a
  // screen's width, which is what keeps it from reading as a wave pattern.
  const swell =
    Math.sin(u * 4.3 + time * 0.19) * 0.5 +
    Math.sin(u * 9.7 - time * 0.31) * 0.28 +
    Math.sin(u * 19.3 + 2.1 + time * 0.13) * 0.14 +
    Math.sin(u * 1.7 + 1.1 - time * 0.09) * 0.36;
  const at = Math.max(0, Math.min(1, 0.5 + swell / 2.2));
  return l.bandTop + seamRise(l) * ((1 - at) * (1 - CLIMB) - at * CLIMB);
}

function seamPoints(l: Layout, time: number): Point[] {
  const steps = 48;
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (l.width * i) / steps;
    pts.push({ x, y: seamY(l, x, time) });
  }
  return pts;
}

/**
 * The membrane as two paths: the line itself, and the chamber it closes off.
 *
 * Both come out of one sampling, so the rim can never be drawn a pixel away
 * from the edge of what it encloses.
 */
export function seamTop(l: Layout): number {
  return l.bandTop - seamRise(l) * CLIMB;
}

/** The deepest the membrane hangs — the flesh above it is the ship's, not the
 * chamber's, and is filled before anything is clipped (`drawSeamFlesh`). */
export function seamBottom(l: Layout): number {
  return l.bandTop + seamRise(l) * (1 - CLIMB);
}

/**
 * The ship's own body, in the sliver the membrane hangs down through.
 *
 * `hull.ts` fills its contour down to `bandTop` and stops. Anything the
 * membrane dips below that would be raw background showing through the ship,
 * so the same deep violet the hull ends in is carried the rest of the way —
 * which is what it is: the inside of the belly, above the skin.
 */
export function drawSeamFlesh(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  skin: SeatSkin = P1_SKIN,
): void {
  ctx.fillStyle = skin.hull.body[3];
  ctx.fillRect(0, l.bandTop - 1, l.width, seamBottom(l) - l.bandTop + 1);
}

/**
 * The chamber the membrane closes off, as one path to clip the panel to.
 *
 * It used to come back beside a second path for the rim to be stroked along;
 * the rim is gone, and a pair whose other half nothing asks for is a pair.
 */
export function chamberPath(l: Layout, time: number): Path2D {
  const spline = openSmoothPath(seamPoints(l, time));
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
