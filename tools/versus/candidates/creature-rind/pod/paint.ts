import { KEY } from "../../../../../packages/content/src/light.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { RindShed } from "../../../../../packages/render/src/rind-look.js";
import { drawCrush } from "../../../../../packages/render/src/rind-skin.js";

/**
 * POD — the skin splits down its meridian and the two halves swing open on
 * the limbs like a seed pod, showing their pale insides as they turn past
 * edge-on, and drift off the body they came from.
 *
 * The shipped husk is a *ring*: the whole contour, thrown outward and thinned.
 * A ring has no inside and no outside, so nothing about it says which way it
 * is facing, and a thing with no facing is a mark rather than a body. This
 * skin is two **half-shells**, each hinged on the limb it stays attached to
 * and swung open about a vertical axis — so its projected width is the cosine
 * of how far it has turned, it goes to nothing edge-on, and when it comes back
 * it is the *other* face: the underside, cooler and paler, with the skin's cut
 * edge as a line of thickness along the meridian. That flip is the one cue
 * a squash cannot fake (`.claude/skills/depth`), spent on a body three tiles
 * wide where a foreshortened mark is more than a pixel.
 *
 * The crush stays: the outline collapsing onto the smaller body is the size
 * going down a step, which is the health bar and not the material.
 */

/** How far each half swings, in radians — past edge-on, so the inside shows
 * for the last part of the life and the outside for most of it. */
const SWING = Math.PI * 0.72;
/** How far the hinge drifts off the body, in the size it came off at, and how
 * far it drops: a thing let go of has weight. */
const DRIFT = 0.42;
const DROP = 0.18;
/** The skin's thickness where it is cut, as a share of the body. */
const EDGE = 0.05;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";
/** Below this the half is edge-on and a scale of nought is a transform the
 * canvas cannot invert; it is drawn as its cut edge alone. */
const EDGE_ON = 0.04;

export function pod(s: RindShed): void {
  const { ctx, x, y, path, unit, hex, rim, t, was } = s;
  drawCrush(s);
  // The drift is thrown — fast out of the gate and spent by the end — but the
  // swing is a flap falling open, slow to start and quickest at the end, so
  // the outside face is what is seen for most of the life and the flip past
  // edge-on comes as the halves go.
  const k = 1 - (1 - t) ** 2;
  const alpha = (1 - t) ** 1.3;
  const swing = SWING * t ** 1.5;
  const facing = Math.cos(swing);
  const scale = was / unit;

  // The bloom, quantised the way the shipped husk quantises it (`glow.ts`).
  const step = Math.max(2, was * 0.25);
  halo(ctx, x, y, Math.round((was * 0.9) / step) * step, hex, alpha * 0.35);

  for (const side of [-1, 1] as const) {
    // The hinge: the limb this half stays attached to, drifting outward and
    // down as the half comes free.
    const hx = x + side * was * (1 + DRIFT * k);
    const hy = y + was * DROP * k * k;
    // Which face is toward us, and how much light it takes. The outside is
    // the body's own colour; the inside is pale and cool, lit from behind by
    // nothing. The half on the key's side is brighter than the one away from
    // it — `KEY.x` is negative, so `side * KEY.x` is positive on the left.
    const outside = facing >= 0;
    const lit = 0.5 + 0.5 * side * KEY.x * -1;
    const face = outside
      ? mixHex(hex, rim, 0.25 + 0.45 * lit)
      : mixHex(mixHex(hex, PALETTE.text, 0.4), SHADOW, 0.3 - 0.2 * lit);

    ctx.save();
    ctx.translate(hx, hy);
    // Swing about the hinge: every point of the half moves toward the hinge by
    // the cosine, and past edge-on comes out the other side mirrored.
    const width = Math.abs(facing) < EDGE_ON ? EDGE_ON * Math.sign(facing || 1) : facing;
    ctx.scale(width * scale, scale);
    ctx.translate(-side * unit, 0);
    // Only this half of the contour: the meridian is the cut.
    ctx.beginPath();
    ctx.rect(side < 0 ? -unit * 4 : 0, -unit * 4, unit * 4, unit * 8);
    ctx.clip();
    ctx.globalAlpha = alpha * (outside ? 0.62 : 0.72);
    ctx.fillStyle = face;
    ctx.fill(path);
    // The rim of the skin, in the body's rim colour outside and paler inside.
    // Widths are divided by the swing as well as the scale, so a line is a
    // line in screen pixels however far the half has turned.
    const thin = scale * Math.max(Math.abs(width), 0.25);
    ctx.globalAlpha = alpha * 0.9;
    ctx.strokeStyle = outside ? rim : mixHex(rim, PALETTE.text, 0.5);
    ctx.lineWidth = Math.max(0.6, was * 0.06) / thin;
    ctx.stroke(path);
    // The cut edge: the skin's thickness along the meridian, exactly as tall
    // as the contour is there — a line down x = 0 clipped to the contour, so
    // it is the chord and not a guess at one. It does not foreshorten, which
    // is what says the sheet has a thickness at all.
    ctx.clip(path);
    ctx.globalAlpha = alpha * 0.85;
    ctx.strokeStyle = rgba(mixHex(rim, PALETTE.text, 0.35), 1);
    ctx.lineWidth = Math.max(0.8, was * EDGE) / thin;
    ctx.beginPath();
    ctx.moveTo(0, -unit * 2);
    ctx.lineTo(0, unit * 2);
    ctx.stroke();
    ctx.restore();
  }
}
