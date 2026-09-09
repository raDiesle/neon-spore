import { facet, type Pin, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { Interior } from "../../../../../packages/render/src/body-interior.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";

/**
 * GUT — one tube, coiled, threaded through both sacs.
 *
 * The shipped slick has two dots in it. This says the body is one animal rather
 * than two bags: a single tube runs from one sac into the other, and the pinch
 * at the waist is where it passes through. It is the opposite answer to ROE's —
 * ROE says *contents*, this says *anatomy* — and at twenty-six pixels the two
 * should be tellable apart instantly, which is the whole reason both are
 * offered.
 *
 * **A tube of discs rather than a stroked path**, because a stroke has one
 * width and a tube going round the back has none: each sample is placed with
 * `facet` and drawn at the width its own tangent plane gives it, so the coil
 * narrows as it turns away and the far half is simply not there. The samples
 * overlap, which is what makes a run of discs read as one continuous thing.
 *
 * **The roll is rotated out** for the reason `.claude/skills/depth` gives: the
 * light does not turn with the body, so the layout does.
 */

const LEFT = -0.42;
const RIGHT = 0.42;
const SACS = [LEFT, RIGHT];
/** How many samples make the coil, and how thick it is against the sac's reach. */
const STEPS = 22;
const THICK = 0.28;
/** How many turns the coil makes through one sac. */
const TURNS = 2.4;
/** How far up and down the sac it climbs while it does. */
const CLIMB = 0.7;
const SPIN = 0.45;
const DIM = 0.3;
const REACH = 0.56;

const PINS: Pin[] = [];
for (let i = 0; i < STEPS; i++) {
  const s = i / (STEPS - 1);
  PINS.push(pin(s * TURNS * Math.PI * 2, (s * 2 - 1) * CLIMB, 1));
}

export function gut(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPIN;
  const reach = p.ry * REACH;
  const wall = p.rim;

  ctx.save();
  ctx.rotate(-p.rot);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const side of SACS) {
    const cx = p.rx * side;
    // One stroked run per unbroken stretch of near samples, rather than a disc
    // per sample. A row of discs reads as beads — which is ROE's answer, and
    // the two must not converge — where a stroke reads as one continuous tube.
    // The run is broken and restarted where the coil goes round the back, so
    // the far half is absent instead of being drawn across the body.
    let open = false;
    for (const q of PINS) {
      const f = facet(q, theta + side * 2);
      if (!f.near) {
        if (open) ctx.stroke();
        open = false;
        continue;
      }
      const x = cx + f.x * reach;
      const y = f.y * reach;
      if (!open) {
        ctx.strokeStyle = mixHex(p.hex, wall, surfaceDim(DIM, f.lit));
        ctx.lineWidth = Math.max(0.5, reach * THICK);
        ctx.beginPath();
        ctx.moveTo(x, y);
        open = true;
      } else ctx.lineTo(x, y);
    }
    if (open) ctx.stroke();
  }
  // The one thing that makes it a single tube and not two coils: a short
  // segment across the waist, at the height the two coils meet. It is drawn
  // flat because the waist is the one part of a slick that is not a sac.
  ctx.strokeStyle = mixHex(p.hex, wall, surfaceDim(DIM, 0.5));
  ctx.lineWidth = Math.max(0.5, reach * THICK);
  ctx.beginPath();
  ctx.moveTo(p.rx * LEFT, 0);
  ctx.lineTo(p.rx * RIGHT, 0);
  ctx.stroke();
  ctx.restore();
}
