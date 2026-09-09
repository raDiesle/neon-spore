import { facet, type Pin, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { Interior } from "../../../../../packages/render/src/body-interior.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";

/**
 * FILAMENT — one thread wound round the inside.
 *
 * A single line, wound from pole to pole round the inner wall, so the body is a
 * ball of yarn seen through a skin. It is the only answer in this slot with no
 * discrete parts in it at all: nothing to count, nothing to mistake for a mark,
 * just a continuous thing that goes round and comes back.
 *
 * **A turn and a fifth, not three and a half.** The first cut wound tightly,
 * and a tight winding photographed at true size is three horizontal hairlines —
 * which is what a crack in a hull looks like in this game, and the exact
 * failure this candidate's own argument had predicted for itself. A slow pitch
 * crosses the body diagonally and reads as one thread.
 *
 * **The winding is what carries the turn.** The near half of the thread is
 * drawn and the far half is not, so as the body turns the visible arc slides
 * across it — the reveal, which is the cue an affine cannot produce at any
 * setting (`docs/dimensional.md`).
 *
 * **A stroke, broken at the limb**, not a row of dots: a run of dots is
 * SPORES's answer and the two must not converge.
 */

const STEPS = 34;
/** How many times the thread goes round while it climbs from pole to pole. */
const WINDS = 1.2;
const REACH = 0.66;
const SPIN = 0.38;
const THREAD = 0.1;
const DIM = 0.3;

const PINS: Pin[] = [];
for (let i = 0; i < STEPS; i++) {
  const s = i / (STEPS - 1);
  PINS.push(pin(s * WINDS * Math.PI * 2, (s * 2 - 1) * 0.82, 1));
}

export function filament(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPIN;
  const reach = Math.min(p.rx, p.ry) * REACH;

  ctx.save();
  ctx.rotate(-p.rot);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  let open = false;
  for (const q of PINS) {
    const f = facet(q, theta);
    if (!f.near) {
      if (open) ctx.stroke();
      open = false;
      continue;
    }
    const x = f.x * reach;
    const y = f.y * reach;
    if (!open) {
      ctx.strokeStyle = mixHex(p.hex, p.rim, surfaceDim(DIM, f.lit));
      ctx.lineWidth = Math.max(0.5, reach * THREAD);
      ctx.beginPath();
      ctx.moveTo(x, y);
      open = true;
    } else ctx.lineTo(x, y);
  }
  if (open) ctx.stroke();
  ctx.restore();
}
