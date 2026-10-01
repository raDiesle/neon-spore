import type { BurgeeStep, Color, SimConfig } from "@neon-spore/sim";
import { burgeePivot, burgeeTip, type Point } from "./burgee-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE BURGEE's marks**: what says what a step asks. A **ring** over the lit
 * column where the boom's tip would be, which is *tap it still here*; a
 * **track** running from the middle toward the lit column's side, which is
 * *hold, then swipe this way* — a swipe is a track and never a ring, so the
 * two hands cannot be mistaken for each other at a glance; and the spindle's
 * three **studs**, lit in the colour a shot must be, one going dark for each
 * shot taken.
 *
 * The ring and the track are the white of the hull's rim, full on the screen
 * of the seat whose hand it is and a faint plain line on the other's, so the
 * seat that is not asked still sees what its partner is being asked for and
 * can say it. The studs are the only cannon colour on the body,
 * `stepColour`'s, called rather than copied.
 */

/** How strong a hand's mark is on the screen of the seat it is not for. */
const OTHER = 0.3;
/** The freeze ring's radius, in tiles. */
const RING = 0.46;
/** How far below the boom's tip the draw's track runs, in tiles: under a flag hanging limp. */
const TRACK_BELOW = 1.75;
/** Studs up the spindle, top to bottom, as shares of its half-height. */
const STUDS = [-0.62, 0, 0.62] as const;

/**
 * Where a catching step's two marks stand: the ring over the lit column,
 * where the boom's tip would be, and the track from under the pivot to under
 * the ring. **One answer for the drawing and the thumb** (`burgee-grip.ts`),
 * so a mark is never drawn in one place and pressed in another. The fixture
 * is still only while it is catching, so no swing-in is folded in here.
 */
export function burgeeMarks(
  l: Layout,
  cfg: SimConfig,
  step: Pick<BurgeeStep, "offset">,
): { ring: Circle; from: Point; to: Point } {
  const at = burgeeTip(l, cfg, step.offset * 1000);
  const y = at.y + TRACK_BELOW * l.tile;
  const ring = { x: at.x, y: at.y, r: RING * l.tile };
  return { ring, from: { x: burgeePivot(l, cfg).x, y }, to: { x: at.x, y } };
}

/**
 * The freeze ring at `at`. On its seat's screen (`full`) it breathes on the
 * beat with a second ring closing as the window runs out, `left` of it
 * still to go, and fills while the flag is frozen; elsewhere it is faint.
 */
export function drawBurgeeRing(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  left: number,
  frozen: boolean,
  full: boolean,
  beatPhase: number,
): void {
  const r = at.r;
  const ring = new Path2D();
  ring.arc(at.x, at.y, r, 0, Math.PI * 2);
  if (!full) {
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.hullRim, OTHER);
    ctx.stroke(ring);
    return;
  }
  if (frozen) {
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.16);
    ctx.fill(ring);
  }
  const pulse = frozen ? 1 : 0.65 + 0.35 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlow(ctx, ring, PALETTE.hullRim, STROKE.outline, pulse, 1);
  const time = new Path2D();
  time.arc(at.x, at.y, r * 1.3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  strokeGlow(ctx, time, PALETTE.hullRim, STROKE.inner, 0.6, 1);
}

/**
 * The draw's track from `from` to `to`, a chevron at its head. On the aiming
 * seat's screen the track is filled from its tail by `drawn` — the beats the
 * finger has been down, over the beats a draw needs — and glows whole once
 * the draw is ready to swipe.
 */
export function drawBurgeeTrack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: Point,
  to: Point,
  drawn: number,
  full: boolean,
): void {
  const head = 0.18 * l.tile;
  const way = Math.sign(to.x - from.x) || 1;
  const track = new Path2D();
  track.moveTo(from.x, from.y);
  track.lineTo(to.x, to.y);
  track.moveTo(to.x - way * head, to.y - head);
  track.lineTo(to.x, to.y);
  track.lineTo(to.x - way * head, to.y + head);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (!full) {
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.hullRim, OTHER);
    ctx.stroke(track);
    return;
  }
  strokeGlow(ctx, track, PALETTE.hullRim, STROKE.inner, drawn >= 1 ? 1 : 0.45, 1);
  if (drawn <= 0 || drawn >= 1) return;
  const filled = new Path2D();
  filled.moveTo(from.x, from.y);
  filled.lineTo(from.x + (to.x - from.x) * drawn, from.y + (to.y - from.y) * drawn);
  strokeGlow(ctx, filled, PALETTE.hullRim, STROKE.outline, 1, 1);
}

/**
 * The spindle's three studs round its middle, `tall` its half-height: the
 * top `hits` spent and dark, the rest glowing faint by `glow` while the
 * spindle is lit, and lit in the step's colour with a ring closing while a
 * shot is owed, `left` of the step to go.
 */
export function drawBurgeeStuds(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  tall: number,
  hits: number,
  glow: number,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
): void {
  const r = 0.11 * l.tile;
  STUDS.forEach((share, i) => {
    const stud = new Path2D();
    stud.arc(0, share * tall, r, 0, Math.PI * 2);
    if (i < hits || (glow <= 0 && lit === null)) {
      ctx.fillStyle = PALETTE.burgeeSteelDark;
      ctx.fill(stud);
      return;
    }
    if (lit === null) {
      ctx.fillStyle = rgba(PALETTE.hullRim, 0.25 + 0.45 * glow);
      ctx.fill(stud);
      return;
    }
    const { body, rim } = stepColour(lit.color);
    ctx.fillStyle = rgba(body, 0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2));
    ctx.fill(stud);
    strokeGlow(ctx, stud, rim, STROKE.inner, 1.2);
  });
  if (lit === null) return;
  const ring = new Path2D();
  ring.arc(0, 0, tall * 1.35, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
  strokeGlow(ctx, ring, stepColour(lit.color).body, STROKE.outline, 1);
}
