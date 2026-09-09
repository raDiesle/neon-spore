import { facet, type Pin, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { Interior } from "../../../../../packages/render/src/body-interior.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";

/**
 * VENT — a mouth on the surface, opening and closing.
 *
 * The bulb *fills and vents*: that is what the creature does, and its interior
 * has never once said so. This puts a single aperture on the surface — a ring
 * of eight lips round one longitude — and works it slowly open and shut on the
 * body's own clock. The other four answers in this slot are all about what is
 * inside; this one is about what the body *does*, and it is the only one that
 * would still be legible if the membrane were opaque.
 *
 * **The aperture is placed, so it turns away.** Its lips are pinned round one
 * point on the surface, so as the body turns the mouth foreshortens to a slit
 * and then goes round the back altogether — which is a thing a pair can read at
 * speed and a squashed ellipse never is.
 *
 * **The roll is rotated out**: the light does not turn with the body
 * (`.claude/skills/depth`).
 */

const LIPS = 8;
/** How wide the mouth is on the surface, in radians, and how far it works. */
const MOUTH = 0.5;
const WORK = 0.45;
const REACH = 0.72;
const SPIN = 0.36;
const LIP = 0.12;
const DIM = 0.28;
/** How fast it opens and closes, against the contour clock. */
const RATE = 0.9;

const PINS: Pin[] = [];
for (let i = 0; i < LIPS; i++) {
  const a = (i / LIPS) * Math.PI * 2;
  // A ring about one point rather than about the pole: the mouth is a place on
  // the body, and a ring at one latitude is the shape that folds to a line.
  PINS.push(pin(Math.sin(a) * MOUTH, 0.15 + Math.cos(a) * MOUTH, 1));
}

export function vent(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPIN;
  const reach = Math.min(p.rx, p.ry) * REACH;
  // Never fully shut and never fully open: a mouth that closes to nothing is a
  // body that lost a mark, and one that stands wide is a hole.
  const open = 0.45 + Math.sin(p.t * RATE) * WORK * 0.5;

  ctx.save();
  ctx.rotate(-p.rot);
  for (const q of PINS) {
    const f = facet(q, theta);
    if (!f.near) continue;
    ctx.save();
    ctx.translate(f.x * reach * open, f.y * reach * open);
    ctx.scale(Math.max(0.1, f.sx), 1);
    ctx.fillStyle = mixHex(p.hex, p.rim, surfaceDim(DIM, f.lit));
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.5, reach * LIP * Math.max(0.3, f.sy)), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
