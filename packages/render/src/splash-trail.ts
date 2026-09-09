import { ageBlob, type Blob, drawBlob, MAX_BLOBS, makeBlob } from "./splash-blob.js";

/**
 * SLIME OFF THE END OF A MOUSE.
 *
 * The owner sent a page whose whole background is a WebGL fluid simulation —
 * drag across it and a cloud of ink smears out under the pointer, swirls and
 * dissipates — and asked whether the game could borrow it for a player at a
 * desk. It could not borrow the *implementation*: that is five hundred lines
 * of GLSL on a second canvas, outside every budget this renderer is measured
 * against and outside the visual language of a game whose every body is a
 * closed contour with lobes. So this borrows the *effect* instead, drawn the
 * way this game draws everything else — the pointer leaves a string of blobs
 * out of `blobPath`, they swell, sag and thin out, and where they overlap they
 * add up into one mass rather than reading as beads on a string.
 *
 * This file is the *stroke*: where the hand has been, how far apart to lay ink
 * along it, what colour the next drop is and when one stroke ends. What a drop
 * is made of and how it is drawn is `splash-blob.ts`.
 *
 * **Nothing here can be seen on a phone.** The host only ever builds one of
 * these for a real mouse (`apps/game/src/trail.ts`), so the cost on the device
 * the game is actually played on is zero — not small, zero.
 */

/**
 * The colour a stroke starts on turns by this much from the last one. The
 * golden angle, so eight strokes in a row are eight different hues rather than
 * a slow crawl through one — and it needs no randomness to be varied, which
 * matters because a frame test cannot diff a picture that is a different
 * colour every run.
 */
const STROKE_TURN = 137.508;
/**
 * Degrees of hue per pixel dragged. A long sweep walks the rainbow; a flick
 * stays one colour, which is what makes a stroke read as one thing.
 */
const HUE_PER_PX = 0.55;
/**
 * Pixels of travel between blobs, at full size. Below this a slow drag lays
 * them on top of each other and the additive fills blow out to white.
 */
const STEP_PX = 11;
/** Seconds of stillness that end a stroke. */
const STROKE_GAP_S = 0.32;

export class SplashTrail {
  /**
   * How big the ink is, against the size the effect was designed at.
   *
   * The owner asked for the trail full size on the menu and the room screen
   * and *much* smaller on the field — the menu is a place a pointer wanders
   * and the ink is the only thing happening, and the field is a picture two
   * people are reading, where the same ink is weather across it. So the host
   * sets this as the screen changes (`apps/game/src/trail.ts`), and the
   * director's field, which is never anything but the field, holds the small
   * one for good (`tools/director/src/stage-trail.ts`).
   *
   * Every length scales together — the radius, the spacing between blobs, the
   * sideways throw and the sag. Nothing about the *timing* does: a blob lives
   * as long, swells by as much and fades on the same curve, so a small trail
   * is the same effect seen from further away rather than a faster one.
   */
  scale = 1;
  private blobs: Blob[] = [];
  private hue = 200;
  private since = STROKE_GAP_S;
  private last: { x: number; y: number } | undefined;
  /**
   * Distance left over from the previous segment, so a slow drag emits on the
   * same spacing as a fast one instead of once per event.
   */
  private carry = 0;
  private t = 0;
  private next = 0;

  /** Nothing left to draw, so the host can stop asking for frames. */
  get idle(): boolean {
    return this.blobs.length === 0;
  }

  /**
   * End the stroke without touching what is already out.
   *
   * The mouse leaving the window is not the ink disappearing — what is on the
   * glass goes on running down it and thinning, the same as if the hand had
   * simply stopped. What must not survive is the *last position*: without
   * this, a pointer that left at the top right and came back at the bottom
   * left would lay a stroke straight across the screen between the two.
   */
  lift(): void {
    this.last = undefined;
    this.carry = 0;
    this.since = STROKE_GAP_S;
  }

  /** Forget everything. The page is one document and this outlives a run. */
  reset(): void {
    this.blobs = [];
    this.last = undefined;
    this.carry = 0;
    this.since = STROKE_GAP_S;
  }

  /** Where the mouse is now. Called from a pointer event, not from a frame. */
  push(x: number, y: number): void {
    if (this.since >= STROKE_GAP_S) {
      this.hue = (this.hue + STROKE_TURN) % 360;
      this.last = { x, y };
      this.carry = 0;
    }
    this.since = 0;
    const from = this.last ?? { x, y };
    const dx = x - from.x;
    const dy = y - from.y;
    const span = Math.hypot(dx, dy);
    this.last = { x, y };
    if (span < 0.001) return;
    // Walk the segment rather than dropping one blob per event: a mouse
    // reports every few pixels when it crawls and every eighty when it is
    // thrown, and a trail with a gap in it is not a trail.
    const speed = Math.min(1, span / 40);
    // The spacing is a length like every other, so it shrinks with the ink —
    // blobs a third the size laid a third of the way apart still overlap into
    // one mass, which is the whole effect. Left unscaled they would be beads.
    const step = STEP_PX * this.scale;
    for (let d = step - this.carry; d <= span; d += step) {
      const k = d / span;
      // Per pixel dragged, not per blob, so a hand travelling a given distance
      // walks the same amount of rainbow at either size.
      this.hue = (this.hue + HUE_PER_PX * step) % 360;
      this.spawn(from.x + dx * k, from.y + dy * k, dx / span, dy / span, speed);
    }
    this.carry = (this.carry + span) % step;
  }

  update(dt: number): void {
    this.t += dt;
    this.since += dt;
    const drag = Math.max(0, 1 - dt * 3.2);
    const kept: Blob[] = [];
    for (const b of this.blobs) {
      ageBlob(b, dt, drag);
      if (b.age >= b.life) continue;
      kept.push(b);
    }
    this.blobs = kept;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.blobs.length === 0) return;
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "lighter";
    for (const b of this.blobs) drawBlob(ctx, b, this.t);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = prev;
  }

  private spawn(x: number, y: number, ux: number, uy: number, speed: number): void {
    const blob = makeBlob(this.next++, x, y, ux, uy, speed, this.scale);
    blob.hue = this.hue;
    this.blobs.push(blob);
    // The ceiling rises as the ink shrinks: the spacing came down with it, so
    // the same drag lays proportionally more, and each is a fraction of the
    // area to fill (`splash-blob.ts`).
    const cap = Math.round(MAX_BLOBS / this.scale);
    if (this.blobs.length > cap) this.blobs.splice(0, this.blobs.length - cap);
  }
}
