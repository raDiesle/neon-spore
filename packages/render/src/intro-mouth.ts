import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";

/**
 * **A MOUTH, AND NOTHING BUT A MOUTH.**
 *
 * The owner, 16 September 2026, on the intro's two people: *maybe only show the
 * mouth and ear, but they must look like real identifiable as those*. So the
 * one test this file has to pass is a stranger's: a glance at a phone in a shop
 * window says *that is a mouth* before it says anything else. Everything here
 * is spent on the two or three things that carry that and on nothing else —
 * **a cupid's bow, two lips of different weight, and a dark cavity between
 * them that only exists while it is open.**
 *
 * The bow is the whole recognition. A pair of arcs with a gap is a bracket; the
 * dip at the middle of the top lip is the one feature no other shape in this
 * game has, and it is what stops this reading as a lens, a leaf or a slot. The
 * lower lip is fuller than the upper and always has been on every face there
 * is, so the two are drawn at different heights rather than mirrored.
 *
 * Its own file beside the ear (`intro-ear.ts`), which is the other half of the
 * same instruction, and both are assembled into a person in
 * `intro-player.ts`. It knows nothing about the scene — a width, a colour and
 * how far open it is.
 */

/**
 * The mouth, centred on `cx,cy`, `w` wide, opening by `open` (0..1).
 *
 * Drawn in the seat's own colour, which is how the pair is named everywhere
 * else in the game (`seat-skin.ts`): violet is player one and amber is player
 * two, and a stranger meets those two colours here before they have chosen
 * anything.
 */
export function introMouth(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  tint: string,
  open: number,
): void {
  if (w <= 0) return;
  const hw = w / 2;
  // How far the jaw drops. The gap is shared unevenly — a mouth opens mostly
  // downward, because the top lip is held up by a skull and the bottom one is
  // not.
  const gap = Math.max(0, open) * w * 0.34;
  const topInner = -gap * 0.32;
  const botInner = gap * 0.68;
  const up = w * 0.19;
  const down = w * 0.2;

  // The cavity first and the lips over it, so the lips' own rims read as the
  // edge of the hole rather than as two shapes standing next to one.
  if (gap > 0.6) {
    ctx.beginPath();
    ctx.ellipse(cx, cy + gap * 0.18, hw * 0.84, gap * 0.62, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#0B0718";
    ctx.fill();
    // Teeth: a light band hung off the top lip and cut off before it reaches
    // the bottom of the hole. Without it an open mouth is a black hole with a
    // rim, which reads as a shout on a poster and not as a mouth.
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy + gap * 0.18, hw * 0.84, gap * 0.62, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.rect(cx - hw * 0.84, cy + topInner, hw * 1.68, Math.max(1, gap * 0.3));
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.fill();
    ctx.restore();
  }

  const lips = mixHex(tint, "#FFFFFF", 0.18);
  halo(ctx, cx, cy, w * 0.8, tint, 0.34 + 0.3 * Math.min(1, open));

  // **The upper lip, with the bow in it.** Two peaks and a dip between them,
  // and the dip is the feature the whole shape is recognised by.
  const upper = new Path2D();
  upper.moveTo(cx - hw, cy);
  upper.quadraticCurveTo(cx - hw * 0.66, cy - up * 0.52, cx - hw * 0.34, cy - up);
  upper.quadraticCurveTo(cx - hw * 0.15, cy - up * 0.94, cx, cy - up * 0.44);
  upper.quadraticCurveTo(cx + hw * 0.15, cy - up * 0.94, cx + hw * 0.36, cy - up);
  upper.quadraticCurveTo(cx + hw * 0.66, cy - up * 0.52, cx + hw, cy);
  upper.quadraticCurveTo(cx, cy + topInner * 2.2, cx - hw, cy);
  upper.closePath();
  ctx.fillStyle = mixHex(lips, "#0B0718", 0.42);
  ctx.fill(upper);
  strokeGlow(ctx, upper, tint, Math.max(1.1, w * 0.045), 1);

  // **The lower lip, fuller than the upper**, which is the second thing that
  // makes it a mouth rather than a pair of brackets.
  const lower = new Path2D();
  lower.moveTo(cx - hw, cy);
  lower.quadraticCurveTo(cx, cy + botInner * 1.4, cx + hw, cy);
  lower.quadraticCurveTo(cx + hw * 0.7, cy + botInner + down * 1.45, cx, cy + botInner + down);
  lower.quadraticCurveTo(cx - hw * 0.7, cy + botInner + down * 1.45, cx - hw, cy);
  lower.closePath();
  ctx.fillStyle = mixHex(lips, "#0B0718", 0.34);
  ctx.fill(lower);
  strokeGlow(ctx, lower, tint, Math.max(1.1, w * 0.045), 1);

  // The wet spot every body on the field has (`intro-parts.ts`'s `body`), on
  // the fuller lip where a light lands on a real one.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.beginPath();
  ctx.ellipse(
    cx - hw * 0.26,
    cy + botInner + down * 0.46,
    hw * 0.2,
    down * 0.15,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = "rgba(255,255,255,.42)";
  ctx.fill();
  ctx.restore();
}
