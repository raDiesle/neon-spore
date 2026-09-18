import { KEY } from "@neon-spore/content";
import type { Dial } from "./gauge.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * THE GAUGE's **face plate**: the slab the dial is cut into, milled, lit and
 * bolted. Next door is what is mounted in it — the glass, the bezel and the
 * boss (`gauge-dial-face.ts`) — and the seam is the one the object has: this
 * is the thing the instrument is set into, that is the instrument.
 *
 * **The round's material is slabs and glyphs, never blobs**
 * (`docs/spec/interludes.md`), so the owner's *looks like something real*
 * (`.claude/skills/new-boss` §6.3) is answered across the two files as an
 * **instrument** and not as a body — THE MAZE's drum took the same brief the
 * same way (`maze-plate.ts`, `0497aba0`).
 *
 * **One light for all of it**, `KEY` (`content/light.ts`): the plate's sheen
 * and every bolt's highlight sit on the same side as the bezel's shoulder and
 * the boss's chamfer next door. That is what makes seven separate marks read
 * as one object rather than seven. `bolt` is here rather than there because
 * the plate is what has bolts in it, and the bezel's are the same head.
 *
 * **Not one number of the dial moves.** The needle's reach, the notches, the
 * band's width and the pivot are all still `gauge.ts`'s, and everything here
 * is drawn against `Dial` alone. A look that moved the rim would move where
 * the band is judged, which is not a look — it is a lie about the round.
 */

/** The plate's overhang past the dial's rim, as a share of the radius. */
export const PLATE_PAD = 0.16;

/** A bolt head's radius, as a share of the dial's. The bezel's are smaller
 * shares of the same head, so the plate and the ring read as one shop's work. */
export const BOLT = 0.026;

/**
 * The face plate's outline: a rectangle with its top corners taken off, which
 * is the shape the round shipped with and the cheapest thing that reads as
 * *made* beside a field of grown contours.
 *
 * A path rather than a sequence of strokes, because four things want it now —
 * the fill, the key-lit face, the hairline and the clip the sheen is laid
 * inside — and four copies of one outline is how a plate comes to be lit in a
 * shape it is not drawn in.
 */
export function gaugePlatePath(dial: Dial): Path2D {
  const pad = dial.r * PLATE_PAD;
  const left = dial.cx - dial.r - pad;
  const top = dial.cy - dial.r - pad;
  const w = (dial.r + pad) * 2;
  const h = dial.r + pad * 2.8;
  const cut = pad * 1.4;

  const p = new Path2D();
  p.moveTo(left + cut, top);
  p.lineTo(left + w - cut, top);
  p.lineTo(left + w, top + cut);
  p.lineTo(left + w, top + h);
  p.lineTo(left, top + h);
  p.lineTo(left, top + cut);
  p.closePath();
  return p;
}

/**
 * The plate: filled, lit along the key, edged, and bolted at the two bottom
 * corners — the only two corners it has that are square, and the ones a plate
 * this shape would actually be held by.
 */
export function drawGaugePlate(ctx: CanvasRenderingContext2D, dial: Dial): void {
  const pad = dial.r * PLATE_PAD;
  const left = dial.cx - dial.r - pad;
  const top = dial.cy - dial.r - pad;
  const w = (dial.r + pad) * 2;
  const h = dial.r + pad * 2.8;
  const face = gaugePlatePath(dial);

  ctx.save();
  ctx.fillStyle = "rgba(16,11,34,.92)";
  ctx.fill(face);
  // The mill's own sheen, across the plate where the key falls. Clipped to the
  // plate so it stops at the cut corners rather than squaring them off again.
  ctx.clip(face);
  // Along the key and nothing else: scaling the two ends by the plate's own
  // width and height would tilt the light toward whichever side the plate is
  // longer on, and then the sheen and the bolts would disagree about where it
  // comes from. One reach, the half-diagonal, for both ends.
  const reach = Math.hypot(w, h) / 2;
  const g = ctx.createLinearGradient(
    left + w / 2 + KEY.x * reach,
    top + h / 2 + KEY.y * reach,
    left + w / 2 - KEY.x * reach,
    top + h / 2 - KEY.y * reach,
  );
  g.addColorStop(0, rgba(PALETTE.hull, 0.22));
  g.addColorStop(0.5, rgba(PALETTE.hull, 0.05));
  g.addColorStop(1, rgba(PALETTE.background, 0.55));
  ctx.fillStyle = g;
  ctx.fillRect(left, top, w, h);
  ctx.restore();

  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 1.6;
  ctx.stroke(face);

  const head = dial.r * BOLT;
  for (const bx of [left + pad * 0.9, left + w - pad * 0.9]) {
    bolt(ctx, bx, top + h - pad * 0.9, head);
  }
}

/** One bolt head: dark, with the key's highlight on its shoulder. Two arcs,
 * because eleven of them are drawn every frame. */
export function bolt(ctx: CanvasRenderingContext2D, x: number, y: number, head: number): void {
  ctx.fillStyle = rgba(PALETTE.background, 0.85);
  ctx.beginPath();
  ctx.arc(x, y, head, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.7);
  ctx.beginPath();
  ctx.arc(x + KEY.x * head * 0.3, y + KEY.y * head * 0.3, head * 0.55, 0, Math.PI * 2);
  ctx.fill();
}
