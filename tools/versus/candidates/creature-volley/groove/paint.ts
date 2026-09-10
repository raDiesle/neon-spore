import { rgba } from "../../../../../packages/render/src/hex.js";
import { keyAxis } from "../../../../../packages/render/src/meteor-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { VolleyShell } from "../../../../../packages/render/src/volley-look.js";
import { seamPath } from "../../../../../packages/render/src/volley-seams.js";
import { drawFrame } from "../../../../../packages/render/src/volley-stone.js";

/**
 * GROOVE — the four seams are cut into the stone rather than painted on it.
 *
 * A basketball's seams are channels: the panels stand proud and the seam is
 * the trench between them. The shipped seam is a line of colour laid on the
 * rock, and a line on a rock has no side the light can catch. This one draws
 * each seam as a trench with a *lip*: a dark cut, a pale edge along the side
 * that faces the key light and a deeper shadow along the side that faces
 * away, and the body's colour down at the bottom of the cut — thinner than
 * the trench, so the colour reads as something *in* the seam rather than as
 * the seam itself. The two edges are the whole claim: they are the one cue
 * that says the surface has relief, and they swap sides as the ball rolls
 * because the key light stays where it is while the pattern turns under it.
 *
 * The stone is the shipped one. The rim is the shipped one.
 */

/** How wide the trench is, as a share of the radius — a fifth wider than the
 * shipped seam, because a cut needs room for two edges and a floor. */
const TRENCH = 0.085;
/** How far each edge is set off the trench's centre, in trench widths. */
const LIP = 0.55;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";
/** The lit lip: the stone's own grey, lifted. */
const LIT_LIP = "#C9CDD8";

export function grooveSeams(s: VolleyShell): void {
  const { ctx, ball, r, turn, glow } = s;
  drawFrame(ctx, ball, turn, s.metal);

  const path = seamPath(r);
  const w = Math.max(1.2, r * TRENCH);
  // The key axis with the roll taken back out, so "toward the light" is a
  // fixed direction on screen however far the pattern has turned.
  const { dx, dy } = keyAxis(turn);

  ctx.save();
  ctx.rotate(turn);
  ctx.clip(ball);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // The shadow edge: the same path shifted away from the light, dark and a
  // little wider than the trench, so the far wall of the cut reads as depth.
  ctx.save();
  ctx.translate(-dx * w * LIP, -dy * w * LIP);
  ctx.strokeStyle = rgba(SHADOW, 0.7);
  ctx.lineWidth = w * 1.15;
  ctx.stroke(path);
  ctx.restore();

  // The lit edge: shifted toward the light, pale and thin — the rim of the
  // near panel catching the key.
  ctx.save();
  ctx.translate(dx * w * LIP, dy * w * LIP);
  ctx.strokeStyle = rgba(LIT_LIP, 0.85);
  ctx.lineWidth = Math.max(0.8, w * 0.45);
  ctx.stroke(path);
  ctx.restore();

  // The trench itself, in the stone's dark, over both edges so they become
  // its two walls.
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = w;
  ctx.stroke(path);

  // And the colour down in the cut: a glow the width of the trench, faint,
  // and a core well inside it. Thinner than the shipped seam on purpose — the
  // colour is at the bottom of something, not on top of it.
  ctx.strokeStyle = glow;
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = w * 1.6;
  ctx.stroke(path);
  ctx.globalAlpha = 1;
  ctx.lineWidth = Math.max(0.7, w * 0.4);
  ctx.stroke(path);
  ctx.restore();
}
