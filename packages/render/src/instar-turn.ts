import { FRONT, see, view } from "@neon-spore/content";
import { smoothstep } from "./ease.js";
import { drawGlanced, type GlanceFrame, glancedPoint } from "./glance.js";
import { INSTAR_GLANCE } from "./instar-glance.js";
import type { Point } from "./instar-place.js";

/**
 * **THE INSTAR a third of the way round**: face-on it is never square to the
 * screen, but turned as a painter turns a head — the snout toward the left,
 * the body going away behind it to the right, so its flank is seen, the near
 * wing spreads larger than the far one, and the whole reads as a thing in the
 * round rather than a mask laid flat. The owner, 26 September 2026: *either
 * boss looks directly to us or to the side, but some half angle perspective
 * would make it look 3d*.
 *
 * The turn is toward the profile's own facing (head left, body right), so the
 * crossfade into the side view carries on the way it was already going.
 *
 * **The head turns without moving anything a thumb is on.** It is drawn as
 * two planes meeting down the snout, each foreshortened by its own affine
 * (`drawTurnedHead`), and the two affines are fitted so the two eyes land
 * where they always did: the snout swings toward the far side, the far cheek
 * is squeezed, the near one opens. The lips' marks sit near the midline and
 * move by less than the shove's own tremble.
 *
 * **Between the two views it keeps turning.** At rest the turn is `TURN`,
 * and as the figure's `side` runs toward the profile the face-on body, its
 * wings and its snout go on round the same way (`instarTurn`), still solid,
 * until the profile — which is where they were headed — takes over from
 * them across the middle of the turn (`instarHandover`). A crossfade of two
 * still views was two ghosts of one body; this is one body turning, with the
 * cut hidden where the two views nearly agree.
 *
 * The turn is read off the figure, not a clock: the body's far end is where
 * the slow's light is aimed (`slow-intake-aim.ts`), and at rest it is where it
 * always was.
 */

/** How far round from face-on the body and the wings are seen, in radians. */
export const TURN = 0.55;
/** How far round the face-on view has gone by the time the profile has it whole. */
const TURN_FAR = 1.3;
/** Where in the figure's `side` the profile takes over, and over how much of it. */
const HANDOVER_AT = 0.3;
const HANDOVER_SPAN = 0.4;
/** How deep the body runs behind the neck, and how far off the eye is, in head radii. */
export const BODY_DEPTH = 6;
export const BODY_LENS = 10;
/** How far the snout's midline swings toward the far side, in head radii. */
const SNOUT = 0.14;
const SNOUT_FAR = 0.3;
/** How dark the far cheek goes at its edge. */
const FAR_CHEEK = 0.35;
/** How far out each eye sits, in head radii — the two places the head's affines hold. */
export const EYE_X = 0.48;

/** How far round the face-on view is seen, with the figure `side` of the way to its profile. */
export function instarTurn(side: number): number {
  return TURN + (TURN_FAR - TURN) * side;
}

/** How much of the body the profile draws, 0..1: none until the turn is well under way. */
export function instarHandover(side: number): number {
  return smoothstep((side - HANDOVER_AT) / HANDOVER_SPAN);
}

/** Where the body leaves the back of the head. */
export function instarNeck(head: Point, r: number): Point {
  return { x: head.x, y: head.y - r * 0.95 };
}

/** The body's far end, `rear` as it is face-on, seen from `turn` round. */
export function turnedFarEnd(neck: Point, rear: Point, r: number, turn = TURN): Point {
  const s = BODY_LENS / (BODY_LENS + BODY_DEPTH);
  const c = { x: BODY_DEPTH * r, y: (rear.y - neck.y) / s, z: (rear.x - neck.x) / s };
  const p = see(c, view(FRONT - turn, 0, r * BODY_LENS));
  return { x: neck.x + p.x, y: neck.y + p.y };
}

/** How the head is turned and posed: its side-on share, and the clock its glance reads (`instar-glance.ts`). */
export interface HeadTurn {
  side: number;
  time: number;
}

/** The snout's swing off the midline, in pixels: the turn's, and the glance's on top. */
function snoutSwing(r: number, turn: HeadTurn): number {
  return (INSTAR_GLANCE.swing(turn.time) - (SNOUT + (SNOUT_FAR - SNOUT) * turn.side)) * r;
}

/** The head's glance this frame: its snout's swing about its centre, each eye held. */
function headFrame(head: Point, r: number, turn: HeadTurn): GlanceFrame {
  const swing = snoutSwing(r, turn);
  return { x: head.x, y: head.y, r, hold: EYE_X, swing, roll: INSTAR_GLANCE.roll(turn.time) };
}

/** Where `drawTurnedHead` draws a point `p` of the head about `head` — a bolt meets it there (`instar-head-stop.ts`). */
export function turnedHeadPoint(head: Point, r: number, turn: HeadTurn, p: Point): Point {
  return glancedPoint(headFrame(head, r, turn), p);
}

/**
 * The head `draw` draws about `head`, turned: once for each half, clipped at
 * the snout and squeezed or opened about it, so each eye stays where it was.
 * The far half — the one the snout has swung toward — goes into the cool dark
 * toward its edge over the plates `draw` answers with, as dark as the swing
 * is wide up to the turn's own. `side` swings the snout further round, and
 * the glance swings and rolls it on top (`instar-glance.ts`).
 */
export function drawTurnedHead(
  ctx: CanvasRenderingContext2D,
  head: Point,
  r: number,
  look: HeadTurn & { fade: number },
  draw: (half: -1 | 1) => readonly Path2D[],
): void {
  drawGlanced(ctx, headFrame(head, r, look), { dark: FAR_CHEEK * look.fade, full: SNOUT }, draw);
}
