import { blobPath, livingMotion, livingSilhouette, poseClock } from "@neon-spore/content";
import { type Creature, type SimConfig, type World, wispHops } from "@neon-spore/sim";
import { contourClock } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE WISP: a body on one screen and not on the other, going out of one tile
 * and coming back in another.
 *
 * **On player 1's screen nothing is drawn at all.** `showsWisp` is that
 * sentence and `creatures.ts` asks it before it draws anything, exactly as it
 * does for the body inside a veil. The tempting version — a dimmed shape, a
 * ghost, a smear where it is — leaks: a halo, a glow pass and a portal ring
 * all reach outside the contour they belong to, so the tile would show as a
 * patch of light on the one screen that must not be able to name it. Drawing
 * nothing cannot leak.
 *
 * There is no companion picture on that screen either, and that is the one way
 * this creature is unlike every split before it. A veil gives player 2 a
 * question mark *over the cloud*, a dart gives player 1 arrows *over the
 * body* — both can, because both bodies are visible to both seats and only
 * something about them is hidden. Here the body itself is the secret, so a
 * mark would have to stand on the tile it is marking. What player 1 gets
 * instead is the lettered grid (`coord-grid.ts`), the siren in the corner
 * (`siren.ts`) and the pip on every hop (`wispHop`) — a place to put a word,
 * a light saying somebody has one, and a sound saying the last one is spent.
 *
 * **The teleport is drawn across the beat, in the shape the owner drew it.**
 * A squash, a launch upward into a line, nothing, then the same run backwards
 * into the new tile — with a flat ring on the ground at both ends and a beam
 * standing over it. The two halves belong to two different beats: the going
 * is the *last* third of the beat before the hop and the coming is the *first*
 * third of the beat after it. That ordering is not decoration. It is what
 * leaves the body standing still and plainly on its tile through the middle of
 * every dwell, which is the part player 2 has to read a letter and a number
 * off — an animation that ran only after the move would have spent the whole
 * of the short dwell arriving.
 *
 * Both ends are read off the shared beat through `wispHops`, so two devices
 * draw one hop, and neither stores a phase.
 */

/**
 * Whether this screen can see a wisp at all. Player 1 never can — that is the
 * whole creature — and `test` can, because it is both halves at once on one
 * screen and a rig that hid half the picture would be no rig.
 *
 * The mirror image of `showsVeilCore`, deliberately and to the letter: that
 * one is `role !== "p2"`, this one is `role !== "p1"`, and the two creatures
 * hide opposite things from opposite seats.
 */
export function showsWisp(l: Layout): boolean {
  return l.role !== "p1";
}

/** Every wisp on the field. Exported so the grid and the body pass ask the
 * same question once. */
export function wisps(world: World): Creature[] {
  return world.creatures.filter((c) => c.kind === "wisp");
}

/**
 * The share of a beat each end of the teleport takes. Roughly a third: any
 * less and the stretch is a flicker rather than a thing leaving, any more and
 * the two ends meet in the middle at the shortest dwell the config allows.
 */
const PORT = 0.32;

/**
 * How far *out* of its tile a wisp is this frame — 0 standing on it, 1 gone.
 *
 * One number for both ends of the hop, because they are one movement run in
 * two directions and everything below reads it the same way. Two phases with
 * two sets of easing would be two places for the going and the coming to stop
 * being the same picture.
 */
export function wispOut(cfg: SimConfig, beat: number, beatPhase: number): number {
  // This beat began with a hop, so the first third of it is the arrival.
  if (wispHops(cfg, beat) && beatPhase < PORT) return 1 - beatPhase / PORT;
  // The next beat begins with one, so the last third of this one is the going.
  if (wispHops(cfg, beat + 1) && beatPhase > 1 - PORT) return (beatPhase - (1 - PORT)) / PORT;
  return 0;
}

/**
 * The body, and the transit it is part of the way through.
 *
 * `out` is `wispOut`. At 0 this is an ordinary living body drawn the way
 * `drawLiving` draws one; from there it squashes, stretches into a line,
 * rises and fades, and the ring and the beam come up under it.
 */
export function drawWisp(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  beats: number,
  near: number,
  out: number,
): void {
  const haze = (h: string): string => hazed(cfg, h, near);
  // The ground at both ends of the hop. Down before the body, because the
  // body rises out of it.
  if (out > 0) drawPortal(ctx, l, x, y, out, haze);
  if (out >= 1) return;

  // Squash then stretch, in that order and out of one number. The tent peaks
  // a fifth of the way out — the body gathers itself before it goes, which is
  // what makes the line that follows read as a launch rather than as a wipe.
  const squash = Math.max(0, 1 - Math.abs(out - 0.18) / 0.18);
  const stretch = Math.max(0, (out - 0.25) / 0.75);
  const alpha = 1 - Math.max(0, (out - 0.45) / 0.55);

  const shape = livingSilhouette("wisp");
  const r = l.tile * 0.4;
  const scale = (r / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1);
  const pose = livingMotion("wisp").poseAt(poseClock(c.id, beats));
  const t = contourClock(c.id, time);
  const path = new Path2D(
    blobPath(0, 0, shape.rx, shape.ry, shape.lobes, shape.depth, shape.wobble, t, shape.seed, 28),
  );

  // Up, never down: `row` only grows toward the hull, so a body leaving the
  // field leaves it the way the beam points.
  const lift = -stretch * stretch * l.tile * 1.7;
  const sx = (1 + squash * 0.45) * (1 - stretch * 0.94);
  const sy = (1 - squash * 0.5) * (1 + stretch * 2.4);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y + lift);
  ctx.rotate(pose.rot);
  ctx.scale(scale * pose.sx * sx, scale * pose.sy * sy);

  // The one body in the game filled through *both* ammunition colours at
  // once. It carries neither, and either shot kills it, so a fill that is
  // cyan at one edge and red at the other is the honest picture as well as
  // the unnameable one — see `PALETTE.wisp`.
  ctx.fillStyle = spectrum(ctx, shape.rx, shape.ry, beats, haze);
  ctx.fill(path);
  strokeGlow(ctx, path, haze(PALETTE.wispRim), Math.max(1, r * 0.1) / scale, 1);

  // The core: a hard white point the stretch does not stretch, so there is one
  // thing on the body holding still while the rest of it goes. Its own scale
  // undoes the transit's, never the pose's `rot` — a point has no rotation to
  // undo.
  ctx.save();
  ctx.scale(1 / (pose.sx * sx), 1 / (pose.sy * sy));
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = alpha * 0.85;
  ctx.beginPath();
  ctx.arc(0, 0, shape.ry * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
  ctx.globalAlpha = 1;

  halo(ctx, x, y + lift, r * 2.1, haze(PALETTE.wisp), 0.2 * alpha);
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

/**
 * The ring on the tile and the beam standing over it — the picture the owner
 * drew, transposed onto a square field: a flat ellipse where the body stands,
 * flaring as it goes, and a column of light above it that the body travels up.
 *
 * Drawn at both ends of the hop, and only ever on the screen that can see the
 * body at all. It is not a mark: it is the body's own exhaust, and a screen
 * that got one without the other would be a screen that can find the tile
 * without being told.
 */
function drawPortal(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  out: number,
  haze: (hex: string) => string,
): void {
  const rx = l.tile * (0.42 + 0.22 * out);
  const ry = rx * 0.26;
  const hex = haze(PALETTE.wisp);
  const rim = haze(PALETTE.wispRim);

  // The beam first, so the ring sits on top of its own foot.
  const height = l.tile * 2.4;
  const g = ctx.createLinearGradient(0, y, 0, y - height);
  g.addColorStop(0, `${rim}D0`);
  g.addColorStop(0.3, `${hex}88`);
  g.addColorStop(1, `${hex}00`);
  ctx.save();
  ctx.globalAlpha = out * 0.9;
  ctx.fillStyle = g;
  const w = l.tile * (0.7 - 0.36 * out);
  ctx.fillRect(x - w / 2, y - height, w, height);

  ctx.globalAlpha = Math.min(1, out * 1.2);
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(1.6, l.tile * 0.07);
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  halo(ctx, x, y, l.tile * (0.8 + 0.6 * out), rim, 0.45 * out);
}
