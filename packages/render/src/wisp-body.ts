import { blobPath, livingMotion, livingSilhouette, poseClock } from "@neon-spore/content";
import type { Creature } from "@neon-spore/sim";
import { contourClock } from "./creature-place.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { WispJump } from "./wisp.js";
import { drawTentacles } from "./wisp-tentacles.js";

/**
 * THE WISP's body: a bell with streamers under it, which is to say a jellyfish.
 *
 * **Why a jellyfish and not a blob.** The wisp was a round contour like every
 * other living body, and a round contour cannot jump. It has no top, no
 * underside and nothing that trails, so the only thing squash and stretch can
 * do to it is make it briefly oval — which reads as a wobble at any speed and
 * never as a launch. A bell with streamers has an axis: the hem gathers before
 * it goes, the streamers stream behind it while it is going, and both splash
 * outward when it arrives. The jump is drawn *by* the body rather than
 * happening to it.
 *
 * It is still one blob contour. `livingSilhouette("wisp")` is untouched and
 * `blobPath` still draws the bell, so this creature's size, lobes and wobble
 * remain one row in `content/silhouettes.ts` like every other body's. What is
 * added is underneath: five streamers hung off the hem, drawn behind the bell
 * so they come out of it rather than sit on it.
 *
 * Everything here is in *silhouette units* — the same space `blobPath` returns
 * — and the one `ctx.scale` in `drawWispBody` takes the whole picture to
 * screen size at once. A streamer measured in pixels would be a body whose
 * tentacles grew a different amount than its bell as it came down the field.
 */

/**
 * The body, at the position and height its jump has it.
 *
 * `j` is the whole of the animation: everything below is a reading of those
 * four numbers, so there is no frame in which the bell is doing one thing and
 * the streamers another.
 */
export function drawWispBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
  beats: number,
  j: WispJump,
  haze: (hex: string) => string,
): void {
  const shape = livingSilhouette("wisp");
  const r = l.tile * 0.4;
  const scale = (r / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1);
  const pose = livingMotion("wisp").poseAt(poseClock(c.id, beats));
  const t = contourClock(c.id, time);

  // How hard it is moving *vertically*: 1 at the launch and again at the
  // touchdown, 0 at the apex. One number for both ends of the arc, because
  // they are the same event with the sign flipped, and a body that stretched
  // on the way up and not on the way down would read as falling limp.
  const dive = j.flying ? Math.abs(Math.cos(Math.PI * j.flight)) : 0;
  // How high it is, as a share of the apex — the float, and what the lean and
  // the streamers' spread are read off.
  const air = j.arc;
  // Which way it is going, or 0 when it is standing. `fromCol` is where the
  // beat loop put it (`sim/types.ts`); absent means it has never moved.
  const heading = Math.sign(c.col - (c.fromCol ?? c.col));

  // Squash then stretch, out of the three windows rather than one ramp: the
  // gather flattens it, the flight draws it out, the landing flattens it
  // harder than the gather did. A jump is absorbed more than it is announced.
  const sx = (1 + j.crouch * 0.4 + j.land * 0.62) * (1 - dive * 0.2);
  const sy = (1 - j.crouch * 0.42 - j.land * 0.5) * (1 + dive * 0.34);
  // A squash about the body's own centre is a body shrinking, not a body
  // meeting the ground. Dropping it by what the squash took off the bottom
  // half keeps the hem where the tile is.
  const sink = r * (j.crouch * 0.3 + j.land * 0.42);

  ctx.save();
  ctx.translate(x, y + sink);
  // The lean into the arc, on top of the own-motion's shallow rock. Only ever
  // while it is off the ground: a body that leaned on its tile would be a body
  // pointing at somewhere, and where it is going is the one thing this
  // creature's picture is allowed to say early — on the ground it is not going
  // anywhere yet.
  ctx.rotate(pose.rot + heading * air * 0.24);
  ctx.scale(scale * pose.sx * sx, scale * pose.sy * sy);

  drawTentacles(ctx, shape.rx, shape.ry, t, j, dive, air, heading, haze);

  // The bell: the silhouette's own contour, lifted so its hem clears the
  // streamers' roots rather than sitting in the middle of them.
  const bell = new Path2D(
    blobPath(
      0,
      -shape.ry * 0.14,
      shape.rx,
      shape.ry * 0.86,
      shape.lobes,
      shape.depth,
      shape.wobble,
      t,
      shape.seed,
      28,
    ),
  );

  // The one body in the game filled through *both* ammunition colours at
  // once. It carries neither, and either shot kills it, so a fill that is
  // cyan at one edge and red at the other is the honest picture as well as
  // the unnameable one — see `PALETTE.wisp`.
  ctx.fillStyle = spectrum(ctx, shape.rx, shape.ry, beats, haze);
  ctx.fill(bell);
  strokeGlow(ctx, bell, haze(PALETTE.wispRim), Math.max(1, r * 0.1) / scale, 1);

  // The ridge across the dome: one light line following the hem, which is what
  // makes the bell read as a dome seen from slightly above rather than as a
  // disc. It rides the same wobble clock as the contour it sits inside.
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = haze(PALETTE.text);
  ctx.lineWidth = Math.max(0.8, r * 0.05) / scale;
  ctx.beginPath();
  ctx.moveTo(-shape.rx * 0.52, shape.ry * 0.02);
  ctx.quadraticCurveTo(0, -shape.ry * 0.38, shape.rx * 0.52, shape.ry * 0.02);
  ctx.stroke();
  ctx.restore();

  drawCore(ctx, shape.rx, shape.ry, pose.sx * sx, pose.sy * sy, haze);

  ctx.restore();

  halo(ctx, x, y + sink, r * 2.1, haze(PALETTE.wisp), 0.18 + 0.16 * air);
}

/**
 * The core organ: a hard bright point inside the bell that the squash and the
 * stretch do not touch.
 *
 * Its own scale undoes the transit's and the pose's, which is the whole point
 * — there is one thing on this body holding its shape while the rest of it
 * gathers, streams and flattens, and an eye tracking a jump tracks that. It
 * never undoes `rot`, because a point has no rotation to undo.
 */
function drawCore(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  sx: number,
  sy: number,
  haze: (hex: string) => string,
): void {
  ctx.save();
  ctx.scale(1 / sx, 1 / sy);
  const g = ctx.createRadialGradient(0, -ry * 0.16, 0, 0, -ry * 0.16, ry * 0.34);
  g.addColorStop(0, PALETTE.text);
  g.addColorStop(0.45, haze(PALETTE.red));
  g.addColorStop(1, `${haze(PALETTE.wisp)}00`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, -ry * 0.16, rx * 0.26, ry * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(0, -ry * 0.16, ry * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The fill: cyan, violet, red, travelling across the body on the shared beat.
 *
 * A gradient built per body per frame rather than a cached one, and it is the
 * one thing in this file that costs anything. `gradientSlot` caches on a key,
 * and the key here would have to carry the phase — which changes every frame,
 * so the cache would be a map that only ever grew. There are never many wisps.
 */
function spectrum(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  beats: number,
  haze: (hex: string) => string,
): CanvasGradient {
  // A slow drift across the body, so the band is visibly travelling without
  // landing on anything the pair is counting.
  const k = Math.sin(beats * 0.4);
  const g = ctx.createLinearGradient(-rx * (1 - k * 0.3), -ry, rx * (1 + k * 0.3), ry);
  g.addColorStop(0, haze(PALETTE.cyan));
  g.addColorStop(0.5, haze(PALETTE.wisp));
  g.addColorStop(1, haze(PALETTE.red));
  return g;
}
