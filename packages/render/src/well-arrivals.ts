import { bodyCenterCol, rockEntryCol, spanOf, type World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { blipColor, type RadarBlip, radarBlips } from "./radar-blip.js";
import { wellAngle, wellAt, wellCenter, wellRadius, wellRim, wellSectorAngle } from "./well.js";

/**
 * THE WELL's warnings: the flat field's strip, bent into a ring outside the
 * rim, and the crossing rock's mark, which the flat field draws inside the
 * field against a wall and the circle draws inside the seam.
 *
 * Cut out of `well-draw.ts` on 13 September 2026, when the crossing mark went
 * in and took that file over its length limit — along the seam the flat field
 * already has between `field.ts`'s `drawRadar` and its two body passes.
 *
 * **Nothing here computes gameplay.** The walk, the gate, the size and the
 * alpha are `radarBlips`'s, the same call the flat strip makes; what this file
 * decides is only where on the circle each one goes.
 *
 * **The ring this draws is empty on the one wave that ships THE WELL.**
 * `radarBlips` gates every entry on `showsRadar`, and the shipped "well" wave
 * (`act-8.ts`) sends nothing but a `slick` and a `bulb` — both the
 * navigator's kinds — so nothing ever reaches the pilot's side of the gate.
 * The wave's own briefing says as much to his face ("Your clock carries no
 * warning marks: every arrival is on their strip alone."), and
 * `boss-cue-well.test.ts` proves it counts zero blips across the whole wave.
 * This file is drawn for a wave that has not been written yet, one that
 * sends a pilot-radar kind (`meteor` and its speed tiers, `veer`) during THE
 * WELL — `well-frame.test.ts` proves the arithmetic against a synthetic one
 * of those, since no real wave supplies it.
 */

/** How far the crossing mark's head stands into the field past the wall, as a
 * share of its own length: enough to read as coming *out* of the seam, not
 * enough to sit in the lane a body could already be in. */
const CROSS_TIP = 0.35;

/**
 * The warning strip, bent into a ring outside the rim.
 *
 * It is the same walk, the same gate and the same colours the flat strip uses
 * (`radar-blip.ts`): a mark in the lane the thing is coming down, growing and
 * brightening as it nears. What it cannot carry is the strip's own second axis
 * — height for *how soon* — because outside the rim there is nowhere to put it,
 * so the size and the alpha the walk already computes do all of the telling.
 *
 * A crossing rock is the other mark, and it is not on the ring: it has no
 * column and will hold a row, so it goes on that row's *circle*, at the seam
 * (`drawWellCrossing`).
 */
export function drawWellArrivals(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  const rim = wellRim(l);
  const pulse = 0.75 + 0.25 * Math.sin(time * 6);
  for (const blip of radarBlips(l, world)) {
    if (blip.cross !== undefined) {
      drawWellCrossing(ctx, l, world, blip, pulse);
      continue;
    }
    const a = wellAngle(l, bodyCenterCol(blip.entry, blip.entry.col));
    const tip = wellAt(l, a, rim + blip.s * 0.4);
    const back = wellAt(l, a, rim + blip.s * 1.6);
    const side = wellAt(l, a + wellSectorAngle(l) * 0.22 * blip.span, rim + blip.s * 1.3);
    const other = wellAt(l, a - wellSectorAngle(l) * 0.22 * blip.span, rim + blip.s * 1.3);
    ctx.globalAlpha = blip.alpha * pulse;
    ctx.fillStyle = blipColor(blip.entry);
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(side.x, side.y);
    ctx.lineTo(back.x, back.y);
    ctx.lineTo(other.x, other.y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * A rock that will come over a side wall, announced where the circle has its
 * walls: **in the seam**, on the circle of the row it will hold, pointing the
 * way round it will fly.
 *
 * The flat mark answers the two questions a crossing rock has instead of a
 * column — the *row* and the *side* — with its height and the wall it is
 * pushed against (`field.ts`). Here a row is a radius, so the mark sits on
 * that radius; and the two walls are the two edges of the one sector the
 * hours leave empty at twelve, so the side is which edge of the seam the mark
 * is pushed against: a rock walking clockwise comes out beside one o'clock,
 * one walking anticlockwise beside eleven. The head stands a little way into
 * the field and the tail hangs back across the seam, exactly as the flat mark
 * stands off its wall — the same picture read round a circle.
 *
 * Where it enters is asked of `rockEntryCol`, the spawn's own rule, and the
 * wall is half a column outside the body's edge there: the mark and the body
 * cannot come out of two different places.
 */
function drawWellCrossing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  blip: RadarBlip,
  pulse: number,
): void {
  const cross = blip.cross ?? 1;
  const span = spanOf(blip.entry);
  const entry = rockEntryCol(world.cfg.cols, span, cross);
  // The wall: half a column outside the body's leading edge. `entry` is the
  // leftmost column of a wide body, so walking anticlockwise the edge at the
  // wall is `span - 1` further on.
  const edge = cross > 0 ? entry : entry + span - 1;
  const wall = wellAngle(l, edge - cross * 0.5);
  // `radarBlips` put the flat mark at `tileCY(row)`; the row is read back off
  // the layout so the radius is that row's and no other.
  const row = l.tile > 0 ? (blip.y - l.gridTop - l.tile / 2) / l.tile : 0;
  const r = wellRadius(l, row);
  const long = blip.s * 1.6 * (span > 1 ? 1.3 : 1);
  // Pixel lengths along the circle, as angles at this radius.
  const per = 1 / Math.max(1, r);
  const tipA = wall + cross * long * CROSS_TIP * per;
  const backA = wall - cross * long * (1 - CROSS_TIP) * per;
  const tailA = wall - cross * long * 1.5 * per;
  const tip = wellAt(l, tipA, r);
  const inner = wellAt(l, backA, r - blip.s * 0.95);
  const outer = wellAt(l, backA, r + blip.s * 0.95);
  const hex = blipColor(blip.entry);
  ctx.globalAlpha = blip.alpha * pulse;
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(inner.x, inner.y);
  ctx.lineTo(outer.x, outer.y);
  ctx.closePath();
  ctx.fill();
  // The tail behind it, along the circle, so the mark reads as something
  // travelling rather than a wedge standing on the edge.
  ctx.globalAlpha = blip.alpha * pulse * 0.5;
  ctx.lineWidth = blip.s * 0.6;
  ctx.strokeStyle = hex;
  const c = wellCenter(l);
  ctx.beginPath();
  // Canvas angles run anticlockwise from the right; the clock's run clockwise
  // from up, so an hour angle `a` is `a - π/2` here, and the sweep is drawn
  // from the tail's end to the head's back the way round the rock will go.
  ctx.arc(c.x, c.y, r, tailA - Math.PI / 2, backA - Math.PI / 2, cross < 0);
  ctx.stroke();
}
