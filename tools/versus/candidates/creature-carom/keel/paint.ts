import { crystalPath, LIGHT_HALF, METEOR } from "../../../../../packages/content/src/index.js";
import type { CrustDraw } from "../../../../../packages/render/src/carom-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * KEEL — the stone has a side that goes first, and it is pushing through
 * something.
 *
 * **The shell.** The shipped key pass, and then the two zones it leaves out.
 * A terminator sweep across the away side with the reflected light standing in
 * its far edge — the cool bounce that stops a shaded ball reading as a flat
 * grey — and a rim light along the **leading** edge, on whichever side
 * `caromHeading` says the body is going. That rim is the one thing on this
 * drawing that knows which way is forward, and it is why the same rock read
 * from the left and from the right is two pictures rather than one mirrored.
 * The specular is left out on purpose: the window already carries one, and a
 * second highlight on the rock beside it reads as two light sources.
 *
 * **The travel.** A bow rather than a tail. A thin bright crescent standing
 * off the leading edge and two narrow wakes peeling back off its shoulders,
 * so the picture is of a solid displacing what it moves through rather than of
 * a shape smearing. The crescent is the body's own colour, because what is
 * being pushed aside is lit by what is inside the rock.
 */

/** The unlit mid-tone `meteor.ts` fills a stone with, so the crust and the rock
 * it becomes are one drawing. */
const STONE_FILL = "#8A8F9C";
/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";
/** How far past the rock the bow stands, and how far the two wakes reach back,
 * both in rock radii. The bow is close: a shock front that stood off by half a
 * radius would be a second object in the lane. */
const BOW_GAP = 0.16;
const WAKE_MUL = 2.2;

/** The stone's outline at this turn, hole and all. */
function shellPath(r: number, glass: number, time: number): Path2D {
  const p = new Path2D(
    crystalPath(0, 0, r, r, METEOR.sides, METEOR.depth, METEOR.wobble, time * 0.15, METEOR.seed),
  );
  const hole = new Path2D();
  hole.arc(0, 0, glass, 0, Math.PI * 2);
  p.addPath(hole);
  return p;
}

export function keeled(d: CrustDraw): void {
  const { ctx, r, glass, dir, turn, time, metal, rim } = d;
  const shell = shellPath(r, glass, time);

  ctx.save();
  ctx.rotate(turn);
  ctx.fillStyle = STONE_FILL;
  ctx.fill(shell, "evenodd");
  ctx.save();
  ctx.clip(shell, "evenodd");
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);

  // The terminator, and the bounce inside its far edge. Six stops rather than
  // three: the cool reflected light is the stop that stops a shaded ball
  // reading as a grey disc, and it only exists if the ramp has room for it.
  // The gradient runs down the key's own diagonal, taken back out of the turn
  // so the light does not roll with the stone.
  const k = -turn + Math.PI * 0.25;
  const g = ctx.createLinearGradient(
    -Math.cos(k) * r,
    -Math.sin(k) * r,
    Math.cos(k) * r,
    Math.sin(k) * r,
  );
  g.addColorStop(0, rgba(SHADOW, 0));
  g.addColorStop(0.42, rgba(SHADOW, 0.06));
  g.addColorStop(0.68, rgba(SHADOW, 0.34));
  g.addColorStop(0.86, rgba(SHADOW, 0.5));
  g.addColorStop(0.95, rgba("#6E7DB8", 0.28));
  g.addColorStop(1, rgba("#8FA0DE", 0.34));
  ctx.fillStyle = g;
  ctx.fill(shell, "evenodd");
  ctx.restore();

  // The rim light along the side that goes first. Inside the clip it would be
  // half a line; drawn as a stroke on the path with the far half clipped away
  // it is a lip. Taken out of the turned frame, because forward is a fact about
  // the field and not about the stone.
  ctx.save();
  ctx.rotate(-turn);
  ctx.beginPath();
  ctx.rect(dir > 0 ? 0 : -r * 1.2, -r * 1.2, r * 1.2, r * 2.4);
  ctx.clip();
  ctx.rotate(turn);
  ctx.strokeStyle = rim;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = STROKE.outline * 1.3;
  ctx.stroke(shell);
  ctx.restore();

  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(shell);
  ctx.restore();
}

export function bow(d: CrustDraw): void {
  const { ctx, r, dir, glow } = d;
  ctx.save();
  // The whole bow is drawn pointing right and then turned to face the heading,
  // rather than written twice with a sign in it: a mirrored crescent and a
  // rotated one are the same picture, and one of them can be got wrong.
  if (dir < 0) ctx.scale(-1, 1);

  // The two wakes, peeling back off the shoulders. Behind and *above*: the body
  // is falling as well as crossing, so a wake laid flat along the row would
  // describe a different creature. The lean is applied after the mirror, so it
  // still points down the field on both headings.
  const back = -r * WAKE_MUL;
  const tip = -r * WAKE_MUL * 0.5 * (dir < 0 ? -1 : 1);
  for (const side of [-1, 1]) {
    const grad = ctx.createLinearGradient(0, side * r * 0.6, back, tip + side * r * 0.3);
    grad.addColorStop(0, rgba("#FFFFFF", 0.16));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.moveTo(0, side * r * 0.62);
    ctx.lineTo(0, side * r * 0.2);
    ctx.lineTo(back, tip + side * r * 0.34);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // The bow itself: a crescent standing just off the leading edge, brightest
  // where the heading points and thinning to nothing at the shoulders. Two arcs
  // sharing their ends, which is the shape a front makes and a stroked arc does
  // not — `carom-window.ts` builds its specular the same way.
  const gap = r * BOW_GAP;
  ctx.beginPath();
  ctx.ellipse(gap, 0, r * (1 + BOW_GAP), r * 0.82, 0, -Math.PI * 0.42, Math.PI * 0.42);
  ctx.ellipse(gap, 0, r * (0.86 + BOW_GAP), r * 0.7, 0, Math.PI * 0.42, -Math.PI * 0.42, true);
  ctx.closePath();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = glow;
  ctx.fill();
  ctx.restore();
}
