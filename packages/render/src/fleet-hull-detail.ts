import { BRIDGE, type HullSkin } from "./fleet-hull-body.js";
import { rgba } from "./hex.js";
import { STROKE } from "./palette.js";

/**
 * WHAT IS BOLTED TO ONE OF THE FLEET'S HULLS: its seams, its sockets and its
 * lamp.
 *
 * Next door is the vessel — the contour and the plate it is made of — and this
 * is everything drawn *on* that plate. The seam is the one the owner's brief
 * already draws (`.claude/skills/new-boss-more` §6.3): a made thing, and then
 * the details that say it was made. Split at 227 lines, while the diff was
 * still the one that is about it.
 *
 * Both halves are two paths and two passes, and that is the whole economy of
 * this file: the pilot is drawn five hulls on every frame of the fight, so a
 * detail costing a fill apiece costs twenty-five of them (`fleet-budget.test.ts`).
 */

/**
 * The plate seams, on the squares' own boundaries.
 *
 * Two strokes for the whole ship rather than two a seam: the dark gap and the
 * lit lip above it are each one path of however many lines the hull is long,
 * which is `eye-iris.ts`'s rule — one path and one stroke, not nine.
 */
export function seams(
  ctx: CanvasRenderingContext2D,
  long: number,
  across: number,
  tile: number,
  len: number,
  skin: HullSkin,
): void {
  if (len < 2) return;
  const top = -across * 0.88;
  const low = across * 0.8;
  ctx.lineWidth = STROKE.inner;
  for (const [pass, style] of [
    [0, rgba(skin.dark, 0.9)] as const,
    [1, rgba(skin.rim, 0.28)] as const,
  ]) {
    ctx.beginPath();
    for (let i = 1; i < len; i++) {
      const x = ((len - 1) / 2 - i + 0.5) * tile + pass;
      if (Math.abs(x) > long - tile * 0.2) continue;
      ctx.moveTo(x, top);
      ctx.lineTo(x, low);
    }
    ctx.strokeStyle = style;
    ctx.stroke();
  }
}

/**
 * What is bolted to it: the bridge's own glass, the transom's two ports, and
 * the lamp at the bow.
 *
 * One dark path for every socket and one bright path for what is lit in them,
 * which is two fills for five details — a ship with a fill apiece would be
 * five hulls' worth of them on the pilot's every frame.
 */
export function fittings(
  ctx: CanvasRenderingContext2D,
  long: number,
  across: number,
  nose: number,
  skin: HullSkin,
): void {
  const bx = long * BRIDGE.at;
  const r = Math.max(0.8, across * 0.22);
  ctx.beginPath();
  // The bridge's glass, cut into the lobe the contour already lifted rather
  // than drawn on top of it, and the deck's own shadowed edge running aft of
  // it — the line that says the top of this thing is a deck and the side of it
  // is a wall.
  ctx.ellipse(bx, -across * 1.02, Math.max(1.2, across * 0.34), r * 0.8, 0, 0, Math.PI * 2);
  ctx.moveTo(-long + nose * 0.8, -across * 0.42);
  ctx.lineTo(long - nose * 1.6, -across * 0.42);
  // The turn of the bilge, where the ramp is already darkest: a line there is
  // what gives the hull a bottom rather than an edge.
  ctx.moveTo(-long + nose * 0.9, across * 0.72);
  ctx.lineTo(long - nose * 1.9, across * 0.72);
  for (const dy of [-0.42, 0.42]) {
    ctx.moveTo(-long + nose * 0.62 + r, across * dy);
    ctx.arc(-long + nose * 0.62, across * dy, r * 0.7, 0, Math.PI * 2);
  }
  ctx.fillStyle = rgba(skin.dark, 0.92);
  ctx.fill();
  ctx.strokeStyle = rgba(skin.dark, 0.85);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();

  ctx.beginPath();
  // The gloss along the sheer, a film over the curve rather than a second rim:
  // it stops short of both ends, which is what keeps it a highlight.
  ctx.moveTo(-long + nose, -across * 0.92);
  ctx.lineTo(bx - across * 0.5, -across * 0.92);
  ctx.moveTo(bx + across * 0.5, -across * 0.92);
  ctx.lineTo(long - nose * 1.4, -across * 0.92);
  ctx.strokeStyle = rgba(skin.rim, 0.6);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();

  ctx.beginPath();
  // The lamp at the head, and the one meniscus on the bridge's glass. The lamp
  // is the reference sheet's own detail and the only thing that says which end
  // is the bow.
  ctx.moveTo(long - nose * 0.9 + r, 0);
  ctx.arc(long - nose * 0.9, 0, r, 0, Math.PI * 2);
  ctx.moveTo(bx + across * 0.16, -across * 1.04);
  ctx.arc(bx - across * 0.1, -across * 1.04, Math.max(0.6, r * 0.38), 0, Math.PI * 2);
  ctx.fillStyle = skin.rim;
  ctx.fill();
}
