import { KEY } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import type { LidPlates } from "./lid-look.js";

/**
 * IRIS — six armour leaves overlapping like a diaphragm, closing to a point
 * at the middle of the eye and turning as they open until the lens is clear.
 *
 * The shipped armour is two plates that part on a straight seam. This is the
 * same amount of armour arranged as an **iris**: six round leaves, each
 * overlapping the next, each pivoting outward as the cord is pulled — so the
 * opening is a rounded hexagon that grows from a point rather than a slot
 * that widens, and the leaves *turn* on the way, which is a motion a slide
 * does not have. Every leaf is lit by where it sits under the one key light,
 * with a dark cut along its edge where it rides over the leaf
 * beneath, and the six edges meeting at six seams is what a mechanism looks
 * like rather than a shutter.
 *
 * The readout is kept. Each leaf stands off the middle by the shipped `gap`
 * exactly, so the aperture's inradius is the rule's number and a seat reading
 * how far open the eye is reads the same distance it always did — as a circle
 * rather than as a slot. The seam in the lens's colour runs along every
 * leaf's inner arc, so a shut iris still says which trigger to load.
 *
 * Drawn in a frame scaled to the socket's aspect, so a leaf that is a circle
 * here is the same ellipse as the eye on the field.
 */

const LEAVES = 6;
/** Each leaf's radius as a share of the socket's half-width. At this size six
 * leaves touching the middle overlap by a third, which reads as leaves rather
 * than as petals with light between them. */
const LEAF = 0.9;
/** How far the whole iris turns from shut to open, in radians. */
const TURN = 0.55;
/** How much of each leaf's rim bounds the aperture, in radians either side of
 * the point nearest the middle. About a sixth of a turn between six leaves,
 * and no more: the first picture lit the whole inner half of every leaf and
 * the eye was six pink rings. */
const SEAM_SPAN = 0.42;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

export function iris(d: LidPlates): void {
  const { ctx, open, gap, rx, ry, plate, edge, light, line } = d;
  const R = rx * LEAF;
  const D = R + gap;
  const lit = mixHex(plate, edge, 0.4);
  const dark = mixHex(plate, SHADOW, 0.45);

  ctx.save();
  ctx.scale(1, ry / rx);
  const lw = line * (rx / ry);
  // One light across the whole iris: a leaf up and to the left is the lit one.
  const shade = ctx.createLinearGradient(KEY.x * rx, KEY.y * rx, -KEY.x * rx, -KEY.y * rx);
  shade.addColorStop(0, lit);
  shade.addColorStop(0.5, plate);
  shade.addColorStop(1, dark);

  const seam = new Path2D();
  for (let i = 0; i < LEAVES; i++) {
    const phi = (i / LEAVES) * Math.PI * 2 + TURN * open;
    const cx = Math.cos(phi) * D;
    const cy = Math.sin(phi) * D;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = shade;
    ctx.fill();
    // The leaf's own curve: darker toward its rim, where it turns down onto
    // the leaf under it, which is what makes six discs read as six things
    // with a thickness rather than six circles.
    const curl = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R);
    curl.addColorStop(0, rgba(SHADOW, 0));
    curl.addColorStop(1, rgba(SHADOW, 0.4));
    ctx.fillStyle = curl;
    ctx.fill();
    // The cut edge: a dark hairline where this leaf rides over the next.
    ctx.lineWidth = lw * 0.8;
    ctx.strokeStyle = rgba(SHADOW, 0.6);
    ctx.stroke();
    // The inner arc — the part of this leaf's rim that faces the middle and
    // bounds the aperture — collected for the lit seam.
    const toward = phi + Math.PI;
    seam.moveTo(cx + Math.cos(toward - SEAM_SPAN) * R, cy + Math.sin(toward - SEAM_SPAN) * R);
    seam.arc(cx, cy, R, toward - SEAM_SPAN, toward + SEAM_SPAN);
  }
  // The seam in the lens's colour, lit whatever the tension — thinner than
  // the shipped plates' straight seam, because there are six of it.
  strokeGlow(ctx, seam, light, lw * 0.7, 0.6 + open * 0.6);
  ctx.restore();
}
