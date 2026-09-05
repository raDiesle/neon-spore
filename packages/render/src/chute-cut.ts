import { blobPath, livingSilhouette } from "@neon-spore/content";
import type { Color, CreatureKind, SimEvent } from "@neon-spore/sim";
import { CANOPY_HALF, CANOPY_LIFT, canopyPath } from "./chute.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * A chute shot down under its canopy, and the only kill in this game that
 * comes apart into two pieces going opposite ways.
 *
 * **The creature is two things, so its end is two things.** THE CAROM's whole
 * argument is that one arrival becomes two problems answered by different
 * people (`sim/carom.ts`), and the body under the canopy is the second of
 * them. A single burst at a tile closes that sentence the way every other kill
 * in the game closes one, and it would be the one picture that says nothing
 * about what the pair have just finished. So the canopy is cut loose and
 * climbs away empty — the same shape it has been drawn as the whole descent
 * (`canopyPath`), with its four lines snapped short — and the body drops the
 * instant nothing is holding it up.
 *
 * **The drop is the whole of it.** Everything in this field falls, so a body
 * that suddenly falls *faster* is the plainest available sentence for "the
 * thing carrying it is gone". It is short — under a tile — and it eases to a
 * stop rather than running out of the frame, because what follows it is the
 * end of the body rather than a landing.
 *
 * **And then it goes outward.** A ring opens away from it and the body swells
 * and empties, which is deliberately the opposite gesture to
 * `lure-vanish.ts`: a lure folds inward to a point because it *left*, and this
 * one was killed. The ordinary `destroy` burst is already throwing its colour
 * away from the tile on the same tick — this rides on top of it, the way
 * `ghost-release.ts` and `veil-tear.ts` do.
 *
 * Pure render. The simulation has finished with the creature before any of
 * this starts, so nothing here is ever read back — the property every
 * transient in `effects-body.ts` shares, and the reason it is one of them.
 */

/** How long the whole thing runs. Longer than a lure's fold, because it is two
 * gestures in sequence rather than one — and short enough that the canopy is
 * away before the next beat needs the pair's eyes. */
const LIFE = 0.8;
/** The share of that spent falling. The rest is the body going. */
const DROP_SHARE = 0.45;
/** How far the body drops, in its own radii — under a tile, so it never
 * reaches the row below and reads as a body dying in the lane it was named in
 * rather than one that moved. */
const DROP = 1.8;
/** How far the canopy climbs, in body radii. Far enough to be off the top of
 * most of the field, so it reads as gone rather than as fading out in place —
 * `ghost-release.ts`'s number and its reason. */
const RISE = 13;
/** How far the ring opens past the body, in body radii. */
const RING = 2.4;

interface Cut {
  x: number;
  y: number;
  /** The body's drawn radius when it was hit. */
  r: number;
  hex: string;
  rim: string;
  /** Slick or bulb — what was hanging there, drawn as itself. */
  kind: CreatureKind;
  /** Spreads the canopy's tumble, so two chutes cut on one beat are not one
   * picture drawn twice. Deterministic, from the tile it was hit in. */
  seed: number;
  /** Seconds left. */
  left: number;
}

export class ChuteCutFx {
  private cuts: Cut[] = [];

  /**
   * Every `chuteCut` in this frame's events. Its own `ingest` rather than a
   * case in `effects.ts`, the way every other transient in `effects-body.ts`
   * has one: the tile arithmetic belongs beside the drawing that uses it.
   *
   * The radius is a plain tile fraction rather than `creatureRadius` — there
   * is no creature left to ask, it having been the thing that went — and it is
   * the same 0.4 of a tile every living body is drawn at.
   */
  ingest(events: readonly SimEvent[], l: Layout): void {
    for (const e of events) {
      if (e.type !== "chuteCut") continue;
      const seed = e.col * 1.7 + e.row;
      this.spawn(tileCX(l, e.col), tileCY(l, e.row), l.tile * 0.4, e.color, e.kind, seed);
    }
  }

  spawn(x: number, y: number, r: number, color: Color, kind: CreatureKind, seed: number): void {
    const red = color === "red";
    this.cuts.push({
      x,
      y,
      r,
      hex: red ? PALETTE.red : PALETTE.cyan,
      rim: red ? PALETTE.redRim : PALETTE.cyanRim,
      kind,
      seed,
      left: LIFE,
    });
  }

  update(dt: number): void {
    for (const c of this.cuts) c.left -= dt;
    this.cuts = this.cuts.filter((c) => c.left > 0);
  }

  clear(): void {
    this.cuts = [];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const c of this.cuts) {
      // `u` runs 0 at the moment it was hit to 1 when there is nothing left.
      const u = Math.min(1, Math.max(0, 1 - c.left / LIFE));
      drawCanopyGone(ctx, c, u);
      drawBodyFalling(ctx, c, u);
    }
  }
}

/**
 * The canopy climbing away with nothing under it.
 *
 * It goes up for the reason a released ghost does — nothing else in this game
 * travels upward, so a shape doing it cannot be read as anything but leaving —
 * and it tips as it goes, because a canopy with no weight on it has nothing
 * left to hang square from. The four lines are the tell that it was *cut*
 * rather than let go: they trail under the hem and lose their length as it
 * climbs, which is the only difference between this picture and the one the
 * pair have been looking at all the way down.
 */
function drawCanopyGone(ctx: CanvasRenderingContext2D, c: Cut, u: number): void {
  // Fast off the mark and slowing as it climbs — a canopy just relieved of its
  // load, rather than one being lifted.
  const climb = c.r * RISE * u ** 0.65;
  const swing = Math.sin(u * 9 + c.seed) * c.r * 0.9 * (1 - u) ** 0.6;
  const fade = 1 - u ** 1.6;
  if (fade <= 0) return;

  ctx.save();
  ctx.translate(c.x + swing, c.y - climb);
  // It tips further the higher it gets: the empty canopy spilling its air out
  // of one side, which is what stops the climb reading as a balloon.
  ctx.rotate(swing * 0.02 + u * 0.5 * Math.sign(Math.cos(c.seed)));
  const dome = canopyPath(c.r, 1 + u * 0.25);
  ctx.globalAlpha = 0.22 * fade;
  ctx.fillStyle = c.hex;
  ctx.fill(dome);
  ctx.globalAlpha = 0.9 * fade;
  ctx.strokeStyle = c.rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(dome);

  // The cut lines, hanging from the same four points on the hem they were
  // gathered from and reaching toward a body that is no longer there.
  const lift = -c.r * CANOPY_LIFT;
  const half = c.r * CANOPY_HALF;
  const slack = (1 - u) ** 0.7;
  ctx.globalAlpha = 0.8 * fade;
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = STROKE.inner;
  ctx.beginPath();
  for (let k = 0; k < 4; k++) {
    const t = -1 + (k * 2) / 3;
    const hx = half * t;
    const hy = lift + c.r * 0.42 * (1 - t * t);
    ctx.moveTo(hx, hy);
    // Only part of the way, and less of it every frame: a severed line falls
    // behind whatever is still holding it, so it trails rather than points.
    ctx.lineTo(hx + (0 - hx) * 0.45 * slack, hy + (-c.r * 0.45 - hy) * 0.55 * slack);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * The body: dropping while nothing holds it, then going.
 *
 * Drawn from `livingSilhouette` and `blobPath` like any other body, and
 * deliberately not hazed by distance the way `drawLiving` is — `veil-tear.ts`
 * makes the same call for the same reason: this is a moment rather than a
 * thing standing in the field, and it has half a second to say which body it
 * was.
 */
function drawBodyFalling(ctx: CanvasRenderingContext2D, c: Cut, u: number): void {
  // The fall: away out of the cut and easing to a stop, which is a body that
  // has lost its lift rather than one that has been thrown.
  const fall = Math.min(1, u / DROP_SHARE);
  const drop = c.r * DROP * (1 - (1 - fall) ** 2.2);
  // And the going, over whatever is left once it has stopped falling.
  const end = u <= DROP_SHARE ? 0 : (u - DROP_SHARE) / (1 - DROP_SHARE);
  const shape = livingSilhouette(c.kind);
  const scale = (c.r / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1);

  ctx.save();
  ctx.translate(c.x, c.y + drop);

  // The ring, opening away from the body — the gesture that says killed rather
  // than withdrawn (`lure-vanish.ts` closes one inward, on purpose).
  if (end > 0) {
    const ring = c.r * (1 + RING * end ** 0.6);
    ctx.globalAlpha = Math.max(0, 1 - end) * 0.7;
    ctx.strokeStyle = c.rim;
    ctx.lineWidth = Math.max(1, c.r * 0.12 * (1 - end));
    ctx.beginPath();
    ctx.arc(0, 0, ring, 0, Math.PI * 2);
    ctx.stroke();
  }

  // It swells a little as it empties and then there is nothing: a body giving
  // up its pressure, not one shrinking away into the distance.
  const swell = 1 + end * 0.35;
  const body = Math.max(0, 1 - end ** 1.4);
  if (body > 0) {
    ctx.scale(scale * swell, scale * swell);
    ctx.globalAlpha = body;
    ctx.fillStyle = c.hex;
    const d = blobPath(
      0,
      0,
      shape.rx,
      shape.ry,
      shape.lobes,
      shape.depth,
      shape.wobble,
      c.seed,
      shape.seed,
    );
    ctx.fill(new Path2D(d));
  }
  ctx.restore();
}
