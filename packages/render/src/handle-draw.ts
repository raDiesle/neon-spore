import { circleSubpath, type Point } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import type { Circle, Layout, ViewRole } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * What every handle on this field is made of.
 *
 * There are three now — THE MAZE's string, THE WARDEN's rope and THE LID's cord
 * — and the last two were drawing the same four things with the same numbers in
 * two files, because `lid-string.ts` was written by reading `tether.ts` and
 * changing the anchor. That is the shape of thing that drifts: a fix to one
 * handle's read is a fix to one of them, and the pair stop being the same
 * gesture without anybody deciding they should.
 *
 * So the ring, the gauge, the rest mark, the sag curve and the word live here,
 * and each handle passes its own anchor and its own colour. **Nothing about the
 * look changed in the move** — the figures are the ones each file already had,
 * which is why the two that differ (the wave amplitudes, the hint's size) are
 * arguments rather than a number picked between them.
 *
 * The hit circles stay where they are. Each handle rests somewhere different,
 * `handles.ts` already asks each file for its own, and a control drawn in one
 * place and answered in another is a control that works until somebody moves
 * one of them.
 *
 * THE MAZE's handle calls only `drawHandleHint`: its ring has no gauge, no
 * breathing and no rest mark, because the wheel it hangs off reports tension
 * itself. Folding it into the ring here would be a change to what the game
 * draws, which is not what a refactor may do.
 */

/**
 * A point the simulation named in thousandths of a tile, in pixels — the same
 * arithmetic as `tileCX`/`tileCY` above with the thousandths left in.
 *
 * It exists because a handle's place is decided by the *rule* and not by the
 * picture: where the hand took it, how far it carried it, and the edge it may
 * not pass are all `sim/handle-pull.ts`, so render is handed a point rather
 * than working one out.
 */
export function fieldPoint(l: Layout, milli: { x: number; y: number }): { x: number; y: number } {
  return {
    x: l.gridLeft + (milli.x * l.tile) / 1000,
    y: l.gridTop + (milli.y * l.tile) / 1000,
  };
}

/**
 * A handle's radius, and where it is decided.
 *
 * `cfg.handleRadiusMilli`, not a constant here, because the *rule* needs it:
 * a pull may not carry a handle off the field and what has to stay on is the
 * whole circle, so the clamp is inset by exactly this
 * (`sim/handle-pull.ts`). A control bounded at one size and drawn at another is
 * a control that leaves the screen anyway.
 */
export function handleRadius(l: Layout, cfg: SimConfig): number {
  return (l.tile * cfg.handleRadiusMilli) / 1000;
}

/**
 * The rope's own shape. Slack it sags off the straight line between its two
 * ends and a slow wave travels down it; taut it straightens out, and the sag
 * goes to nothing exactly as the tension goes to one.
 *
 * **The belly hangs across the line rather than sideways on the screen.** A
 * hand may now carry a handle in any direction at all, so a sag that was always
 * horizontal would lie flat along a rope pulled straight left and bulge out of
 * one pulled straight down. The perpendicular to the line between the two ends
 * is the same picture whichever way the hand went — and for a rope swung aside,
 * which is all this used to have to draw, it is the picture it always was.
 */
export function handleSag(opts: {
  anchor: Point;
  head: Point;
  held: boolean;
  pull: number;
  time: number;
  /** How many points the curve is built from — a longer line wants more. */
  segments: number;
  /** The tremble under a hand, and the slow travelling wave with none. */
  waveHeld: number;
  waveSlack: number;
}): Point[] {
  const { anchor, head, held, pull, time } = opts;
  const pts: Point[] = [];
  const sag = (1 - pull) * (held ? 0.35 : 1);
  const dx = head.x - anchor.x;
  const dy = head.y - anchor.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 0; i <= opts.segments; i++) {
    const t = i / opts.segments;
    // A half-sine across the length, so both ends stay where they are anchored.
    const belly = Math.sin(t * Math.PI);
    const wave = held
      ? Math.sin(time * 30 + t * 9) * opts.waveHeld * (1 - pull)
      : Math.sin(t * Math.PI * 3 - time * 3) * opts.waveSlack * t;
    // The line bellies *behind* the hand: the straight line is what full
    // tension looks like.
    const off = belly * sag * len * 0.28 + wave;
    pts.push({ x: anchor.x + dx * t + nx * off, y: anchor.y + dy * t + ny * off });
  }
  return pts;
}

/** The column the handle hangs in, while it is not hanging in it — so the swing
 * reads as a distance from somewhere rather than as a handle that happens to be
 * over there. */
export function drawHandleRest(ctx: CanvasRenderingContext2D, rest: Circle, hex: string): void {
  const p = new Path2D(circleSubpath(rest.x, rest.y, rest.r * 0.9));
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(p);
  ctx.restore();
}

/**
 * The handle, and the gauge closing around it.
 *
 * Empty and breathing it says *take hold of me*; filled it says *somebody has*;
 * and the arc sweeping round its edge is how much of the pull is in, drawn as a
 * continuous quantity rather than as a lamp that comes on at a threshold. The
 * player who is not holding it reads that arc, and it closes into a whole circle
 * at the instant the thing behind it gives.
 */
export function drawHandleRing(
  ctx: CanvasRenderingContext2D,
  opts: {
    x: number;
    y: number;
    r: number;
    hex: string;
    rim: string;
    held: boolean;
    pull: number;
    time: number;
  },
): void {
  const { x, y, r, hex, rim, held, pull, time } = opts;
  const breathe = held ? 1 : 1 + 0.08 * Math.sin(time * 4);
  const p = new Path2D(circleSubpath(x, y, r * breathe));
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = hex;
  ctx.globalAlpha = held ? 0.55 + pull * 0.45 : 0.18;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, held ? rim : hex, STROKE.inner, held ? 1.2 : 0.8);

  if (pull <= 0) return;
  ctx.save();
  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.lineCap = "butt";
  ctx.beginPath();
  // From the top, clockwise, so it fills the way a dial does.
  ctx.arc(x, y, r * 1.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pull);
  ctx.stroke();
  ctx.restore();
}

/** How loud the word under a handle is. The tether and the string share one
 * set of figures; the lid's is a shade smaller, because its handle hangs off a
 * body rather than out of the hull. */
export interface HintStyle {
  fontTiles: number;
  mine: number;
  theirs: number;
}

export const HINT_LOUD: HintStyle = { fontTiles: 0.3, mine: 0.9, theirs: 0.45 };
export const HINT_SOFT: HintStyle = { fontTiles: 0.26, mine: 0.8, theirs: 0.4 };

/**
 * Whose handle it is, in words, and only while nobody has hold of it.
 *
 * The pair cannot see each other's thumbs, so the one thing the picture cannot
 * say by itself is which of the two of them is supposed to reach for it — and
 * that is the whole coupling. Every handle on this field is the pilot's, so
 * player 2 is told whose hand it is rather than waiting for a turn that never
 * comes. It goes as soon as a hand lands: from then on the handle's own
 * position says it.
 */
export function drawHandleHint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  role: ViewRole,
  x: number,
  y: number,
  style: HintStyle,
): void {
  const mine = role !== "p2";
  ctx.save();
  ctx.font = `600 ${Math.round(l.tile * style.fontTiles)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.globalAlpha = mine ? style.mine : style.theirs;
  ctx.fillText(mine ? "PULL" : "PILOT'S", x, y);
  ctx.restore();
}
