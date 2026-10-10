import type { Point } from "@neon-spore/content";
import { noteMark } from "./mark-spots.js";
import { PALETTE, STROKE } from "./palette.js";
import type { PullWay } from "./pull-line.js";
import type { PullAfter } from "./pull-track.js";
import { drawWayArrow } from "./way-arrow.js";

/**
 * **Where a pull starts**: the circle a thumb goes on, and how far round it a
 * press is still taken to have meant it. The half of every pull handle that is
 * *the control*; the channel it runs in, next door in `pull-track.ts`, only
 * says where it can go. Cut from that file along exactly that line.
 */

/**
 * How much wider than the drawn knob a press on a pull handle is answered,
 * before `hitReach`'s own margin — so about three times the circle drawn.
 * The owner, 25 September 2026, generic: *the area of starting the pull must
 * be much bigger than the visual, otherwise it's hard to catch, as it's also
 * moving.* Every pull handle's grab circle is its knob times this.
 */
export const PULL_GRAB = 2.2;

/** The arrow's reach inside the knob, in knob radii: THE INSTAR's glyph fills
 * its ring at 1.1 of the mark's radius, and the knob is the ring. */
const ARROW = 1.1;

/** How one knob is asked to be drawn — `drawPullKnob`'s last argument. */
export interface PullKnobDraw {
  hex: string;
  rim: string;
  held: boolean;
  time: number;
  way: PullWay | null;
  /** A pull that may go either way and has not gone one yet: an arrow with two heads. */
  either?: boolean;
  /** The partner's knob: nothing punched under it, which over a lobe or a
   * board read as a black hole rather than a handle (`handle-draw.ts`). */
  theirs?: boolean;
  /** The lift's verdict and the knob's offset off the path (`PullAfter`). */
  after?: PullAfter;
}

/**
 * **The circle to start**: where the thumb goes, drawn at the handle's full
 * radius over the thin channel so there is no doubt where a pull begins. It
 * breathes a ring round itself until it is taken, and is lit while held.
 *
 * **It carries the way the pull goes**, THE INSTAR's arrow (`way-arrow.ts`):
 * the owner, 29 September 2026, on THE WARDEN's rope, *not just rounded red
 * circle … which looks like a slider*. `way` is required so no pull handle
 * can be drawn without being asked which way it goes; `null` is the one
 * answer that draws none — the partner's handle, because a gesture on a mark
 * reads as *your next move* (`mark-feedback.ts`) and the word under it
 * already says whose it is (`handle-word.ts`).
 */
export function drawPullKnob(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  o: PullKnobDraw,
): void {
  PULL_KNOB.paint(ctx, at, r, o);
}

/**
 * **The knob as it ships**, which `PULL_KNOB` holds and every pull handle in
 * the game reaches through `drawPullKnob`. One record rather than a function
 * so a second answer to the knob can be held beside this one and drawn in its
 * place for the length of a frame — VERSUS's `pull:handle`, and the PULL LAB
 * (`tools/director/src/pull-lab.ts`), which plays any of them on an empty
 * field. Nothing in the game patches it.
 */
export function paintPullKnob(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  o: PullKnobDraw,
): void {
  noteMark(ctx, at.x, at.y, r);
  ctx.save();
  if (!o.held) {
    const breathe = 0.5 + 0.5 * Math.sin(o.time * 4);
    ctx.strokeStyle = o.hex;
    ctx.lineWidth = STROKE.inner;
    ctx.globalAlpha = 0.25 + 0.35 * breathe;
    ctx.beginPath();
    ctx.arc(at.x, at.y, r * (1.25 + 0.15 * breathe), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const disc = ring(at, r);
  if (!o.theirs) {
    ctx.fillStyle = PALETTE.background;
    ctx.fill(disc);
  }
  ctx.fillStyle = o.held ? o.rim : o.hex;
  ctx.globalAlpha = o.held ? 0.85 : 0.35;
  ctx.fill(disc);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = o.held ? PALETTE.text : o.rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(disc);
  if (o.way !== null)
    strokeWay(ctx, at, r, o.way, o.time, o.held ? 0.7 : 0.95, o.either, PALETTE.text);
  ctx.restore();
}

/**
 * **The knob's arrow without the knob**, for a pull handle whose mark is not
 * a ring — a bead, a ball, a plate, a horn, a candidate the ring would hide.
 * The same arrow at the same reach in the same stroke, inside `r`, the mark's
 * own radius; the caller decides whose screen it is on, as it passes `way:
 * null` to the knob.
 */
export function drawPullArrow(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  way: PullWay,
  time: number,
  o: {
    alpha: number;
    either?: boolean;
    hex?: string;
    /** The stroke, where a mark's arrow has to read from across a table: `STROKE.outline` otherwise. */
    width?: number;
  },
): void {
  ctx.save();
  strokeWay(ctx, at, r, way, time, o.alpha, o.either, o.hex ?? PALETTE.text, o.width);
  ctx.restore();
}

function strokeWay(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  way: PullWay,
  time: number,
  alpha: number,
  either: boolean | undefined,
  hex: string,
  width: number = STROKE.outline,
): void {
  ctx.strokeStyle = hex;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  drawWayArrow(ctx, at.x, at.y, r * ARROW, way.dx, way.dy, time, either ? 2 : 1);
}

/** What `drawPullKnob` draws with: the shipped knob, unless something holds
 * another in its place for a frame (`paintPullKnob`). */
export const PULL_KNOB: { paint: typeof paintPullKnob } = { paint: paintPullKnob };

/** A circle as its own path, so it adds nothing to the context's current one. */
function ring(at: Point, r: number): Path2D {
  const p = new Path2D();
  p.arc(at.x, at.y, r, 0, Math.PI * 2);
  return p;
}
