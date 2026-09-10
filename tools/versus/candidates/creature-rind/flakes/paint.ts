import { KEY } from "../../../../../packages/content/src/light.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { RindShed } from "../../../../../packages/render/src/rind-look.js";
import { drawCrush } from "../../../../../packages/render/src/rind-skin.js";

/**
 * FLAKES — the skin comes apart into a dozen thick pieces, each one thrown
 * outward, tumbling as it goes, lit on its face by the key light and dark on
 * its underside, and falling a little as it fades.
 *
 * The shipped plates are strokes: short arcs of one width, all facing the
 * same way, all the same brightness. A stroke is a mark and a mark has no
 * near side. These are **filled** pieces cut from the band the skin occupied
 * — the outer fifth of the body, between the contour and a little inside it —
 * and each one tumbles about its own tangent, so its height is the cosine of
 * how far it has turned and past edge-on it shows the other face. The face is
 * the body's colour lit by where the piece sits against `KEY`: the pieces up
 * and to the left take the light and the ones down and to the right do not,
 * which is one light on a dozen things rather than a dozen things each lit
 * from nowhere. The underside is cool and dark. The crush stays as it ships.
 */

const FLAKES = 12;
/** How far a piece is thrown, in the size it came off at — a little under
 * the shipped husk's reach, because a piece is heavier than a ring. */
const REACH = 0.4;
/** The band the skin occupied: from this share of the radius to the contour. */
const THICK = 0.22;
/** How far a piece tumbles over its life, in radians, and how much each one
 * differs from the next. */
const TUMBLE = Math.PI * 1.3;
const TUMBLE_SPREAD = 0.7;
/** The drop as the pieces spend themselves — gravity, so it grows with t². */
const DROP = 0.3;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";
const EDGE_ON = 0.04;

export function flakes(s: RindShed): void {
  const { ctx, x, y, id, hex, rim, t, was } = s;
  drawCrush(s);
  const k = 1 - (1 - t) ** 2;
  const alpha = (1 - t) ** 0.6;

  const step = Math.max(2, was * 0.25);
  halo(ctx, x, y, Math.round((was * 0.9) / step) * step, hex, alpha * 0.4);

  // The piece's own size: the band's thickness, and its share of the girth.
  const h = was * THICK;
  const w = ((Math.PI * 2 * was) / FLAKES) * 0.82;
  ctx.save();
  ctx.lineJoin = "round";
  for (let i = 0; i < FLAKES; i++) {
    // Where on the skin it broke off, spread by the body so two rinds never
    // shed the same picture, and where it is now: out along its own angle,
    // and down by its weight.
    const a = (i / FLAKES) * Math.PI * 2 + sinHash(i * 7.1, id) * 0.6;
    const throwMul = 0.8 + 0.4 * sinHash(i * 3.7, id);
    // Not from a perfect circle: a skin is on a lobed body, so each piece
    // starts a little in or out of the mean radius and is its own size.
    const seat = 0.8 + 0.25 * sinHash(i * 5.3, id);
    const d = was * seat * (1 - THICK / 2) + was * REACH * k * throwMul;
    const pw = w * (0.75 + 0.45 * sinHash(i * 2.9, id));
    const ph = h * (0.8 + 0.5 * sinHash(i * 6.1, id));
    const px = x + Math.cos(a) * d;
    const py = y + Math.sin(a) * d + was * DROP * t * t;
    // Its tumble: about its own tangent, by its own amount.
    const spin = TUMBLE * k * (1 + TUMBLE_SPREAD * sinHash(i * 11.3, id)) * (i % 2 ? 1 : -1);
    const facing = Math.cos(spin);
    const face = facing >= 0;
    // One light on all of them: how much this piece's outward normal agrees
    // with the key. `KEY` points from the body toward the light.
    const lit = 0.5 + 0.5 * (Math.cos(a) * KEY.x + Math.sin(a) * KEY.y);
    const fill = face
      ? mixHex(mixHex(hex, SHADOW, 0.2 * (1 - lit)), rim, 0.25 + 0.55 * lit)
      : mixHex(mixHex(hex, SHADOW, 0.5), PALETTE.text, 0.15 * lit);

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(a + Math.PI / 2);
    const height = Math.abs(facing) < EDGE_ON ? EDGE_ON : Math.abs(facing);
    ctx.scale(1, height);
    // A piece of a curved band: its outer edge bows out and its inner edge in.
    ctx.beginPath();
    ctx.moveTo(-pw / 2, -ph / 2);
    ctx.quadraticCurveTo(0, -ph / 2 - ph * 0.3, pw / 2, -ph / 2);
    ctx.lineTo(pw / 2, ph / 2);
    ctx.quadraticCurveTo(0, ph / 2 - ph * 0.3, -pw / 2, ph / 2);
    ctx.closePath();
    ctx.globalAlpha = alpha * (face ? 0.9 : 0.8);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.strokeStyle = face ? rim : rgba(mixHex(rim, PALETTE.text, 0.3), 0.8);
    ctx.lineWidth = Math.max(0.6, was * 0.035) / Math.max(height, 0.3);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
