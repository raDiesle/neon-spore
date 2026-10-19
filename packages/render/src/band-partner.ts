import { type ControlSet, partnerSeat, setHas } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { drawBandHalf } from "./band-half.js";
import { bandLobes, hitCircle, type Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { seatOf, type ViewRole } from "./view-role.js";

/**
 * **The other phone's controls, drawn dead on this one.**
 *
 * The owner, 19 October 2026: on the first rungs of the ladder — the cannon
 * on one screen and the two shots on the other — each player should see where
 * the partner's controls are, plainly not theirs, and a press on one should
 * say whose job it is and that the two of them have to talk. The panel asks
 * for it (`ControlSet.partner`); this file draws it and answers where it is.
 *
 * **It stands where the partner's own phone has it.** A solo screen lays out
 * both seats on the same rows and the same spread (`PANEL_PLAN.solo`), so
 * asking `bandLobes` and the strips as the other role answers exactly the
 * circles and the rail the other phone draws — nothing is placed twice.
 *
 * Grey and not red, and labelled with the other seat: this is THE BATON's
 * *not yours* (`band-lock.ts`), held for the whole wave, and never THE
 * MIRROR's *locked*.
 */

/** The scrim over the partner's controls. Exported for the frame test. */
export const PARTNER_GREY = "rgba(40,42,52,.7)";

/** The seat this screen draws dead, or null. Only a phone ever has one. */
function partnerOf(l: Layout, set: ControlSet): 1 | 2 | null {
  return partnerSeat(set, l.role === "test" ? "both" : seatOf(l.role));
}

/** The layout as the other phone has it: the same rows, the other seat. */
function asRole(l: Layout, seat: 1 | 2): Layout {
  const role: ViewRole = seat === 1 ? "p1" : "p2";
  return { ...l, role };
}

/** Where the partner's rail is on this screen, for the scrim and the hit test. */
function partnerStrip(l: Layout, set: ControlSet, seat: 1 | 2) {
  if (seat === 1) return setHas(set, "cannon") ? l.cannonStrip : null;
  return setHas(set, "shield") ? l.shieldStrip : null;
}

export function drawPartner(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  set: ControlSet,
  time: number,
): void {
  const seat = partnerOf(l, set);
  if (seat === null) return;
  const as = asRole(l, seat);
  // Drawn as the partner draws it, unarmed and shut: it is a picture of where
  // their thumb goes, not a second reading of what it is doing.
  drawBandHalf(ctx, as, world, set, seat, false, false, time);
  ctx.save();
  ctx.fillStyle = PARTNER_GREY;
  const strip = partnerStrip(l, set, seat);
  if (strip !== null) ctx.fillRect(0, strip.y - strip.height * 0.85, l.width, strip.height * 1.7);
  const lobes = bandLobes(as, set, seat);
  for (const lobe of lobes) {
    const { x, y, r } = lobe.circle;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.25, 0, Math.PI * 2);
    ctx.fill();
  }
  // The labels last: each sets its own fill, and the scrims above share one.
  if (strip !== null) label(ctx, l.width / 2, strip.y, seat);
  if (lobes.length > 0) label(ctx, l.width / 2, l.lobeY, seat);
  ctx.restore();
}

/** `P1` or `P2` on a dark pill: the short form a mark takes (`game-words`). */
function label(ctx: CanvasRenderingContext2D, x: number, y: number, seat: 1 | 2): void {
  const text = seat === 1 ? "P1" : "P2";
  ctx.font = '700 11px "Courier New",monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(7,4,15,.85)";
  ctx.beginPath();
  ctx.roundRect(x - 16, y - 9, 32, 18, 9);
  ctx.fill();
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(text, x, y + 1);
  ctx.textBaseline = "alphabetic";
}

/**
 * Whose dead control a press on the band landed on, or null — asked only
 * where nothing of this screen's own wanted the point (`apps/game/input.ts`).
 */
export function partnerUnder(l: Layout, set: ControlSet, x: number, y: number): 1 | 2 | null {
  const seat = partnerOf(l, set);
  if (seat === null || y < l.bandTop) return null;
  const as = asRole(l, seat);
  if (bandLobes(as, set, seat).some((lobe) => hitCircle(lobe.circle, x, y))) return seat;
  const strip = partnerStrip(l, set, seat);
  return strip !== null && y >= strip.top && y <= strip.bottom ? seat : null;
}
