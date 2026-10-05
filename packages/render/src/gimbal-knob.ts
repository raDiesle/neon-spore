import {
  BEARING_TURN,
  type GimbalRing,
  type GimbalState,
  OUTER,
  type SimConfig,
} from "@neon-spore/sim";
import {
  gimbalFaceMilli,
  gimbalPoint,
  gimbalRingFace,
  gimbalRingR,
  type Point,
} from "./gimbal-shape.js";
import { handleRadius } from "./handle-draw.js";
import { drawHandleHint, type HandleWords, HINT_LOUD } from "./handle-word.js";
import type { Layout } from "./layout.js";
import { drawMazeLever } from "./maze-lever.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { drawPullTrack, PULL_TRACK_W, type PullTrack, pullWay } from "./pull-track.js";

/**
 * **THE GIMBAL's ring turned the way THE MAZE's wheel is**: a knob on a lever
 * bolted to the rim, running in a closed channel round it that fills green
 * from the rest, with the arrow of the way in the knob and the word under it
 * (`maze-string.ts`, `maze-lever.ts`, `pull-knob.ts`, `pull-track.ts`).
 *
 * The owner, 5 October 2026, by name: the gimbal's turn *is the exact same*
 * as the maze's, the maze's is the one preferred, and the point is *a set of
 * reusable consistent controls across all waves, which players can learn if
 * they repeat and follow same visuals*. So nothing here is drawn its own
 * way: the knob is every pull handle's at the handle's own radius, the lever
 * is THE MAZE's, and the channel stands off the rim by the distance THE
 * MAZE's stands off its drum — clear of the teeth, which are the health.
 *
 * **The knob is bolted to the ring**, `KNOB_OFF` round from its bearing on
 * this seat's face, so it moves with the ring, under the thumb that turns it,
 * and is carried when the outer ring carries the inner. A ring let go drifts
 * home to true nought (`gimbal-step.ts`), and the green runs from the knob's
 * place at that rest to where it is the short way round, which is the way it
 * would drift back.
 */

/**
 * How far round from the ring's own bearing the knob is bolted, in thousandths
 * of a turn on this seat's face: 40° to the left of the top.
 *
 * **Off the top on purpose**, for THE MAZE's reason (`STRING_ANGLE`): the top
 * is where every ring rests, and the yoke hangs the cradle from exactly
 * there — a knob at rest under it was a knob hidden by the hanger. 40° is
 * THE MAZE's own figure, off the place it must not sit.
 */
const KNOB_OFF = -(40 / 360) * BEARING_TURN;

/** How far the channel stands out of the rim, in tiles: THE MAZE's lever
 * (`mazeLeverOutMilli`), so a turn stands as far off what it turns on both. */
const OUT_TILES = 0.45;

/** The circle the knob runs round: the ring's own, a lever's length out. */
export function gimbalKnobR(l: Layout, ring: GimbalRing): number {
  return gimbalRingR(l, ring) + l.tile * OUT_TILES;
}

/** The knob's radius: every pull handle's (`handleRadius`). */
export function gimbalKnobSize(l: Layout, cfg: SimConfig): number {
  return handleRadius(l, cfg);
}

/** Where the knob stands this frame: bolted to the ring, `KNOB_OFF` round from its bearing. */
export function gimbalKnobAt(l: Layout, at: Point, s: GimbalState, ring: GimbalRing): Point {
  return gimbalPoint(at, gimbalKnobR(l, ring), gimbalRingFace(l, s, ring) + KNOB_OFF);
}

/** The ring's rest on this seat's face, in thousandths. */
function restFace(l: Layout, ring: GimbalRing): number {
  return gimbalFaceMilli(l, 0, ring);
}

/**
 * How far round from the rest the ring stands, as a share of a turn, the short
 * way: positive clockwise on this face, in [-0.5, 0.5).
 */
export function gimbalKnobThrough(l: Layout, s: GimbalState, ring: GimbalRing): number {
  const off = gimbalRingFace(l, s, ring) - restFace(l, ring);
  const half = BEARING_TURN / 2;
  const wrapped = (((off + half) % BEARING_TURN) + BEARING_TURN) % BEARING_TURN;
  return (wrapped - half) / BEARING_TURN;
}

/** The channel: the knob's whole circle, from where it rests, clockwise on this face. */
function knobTrack(l: Layout, at: Point, ring: GimbalRing, w: number): PullTrack {
  const r = gimbalKnobR(l, ring);
  const rest = restFace(l, ring) + KNOB_OFF;
  const pts: Point[] = [];
  for (let i = 0; i <= 72; i++) pts.push(gimbalPoint(at, r, rest + (i / 72) * BEARING_TURN));
  return { pts, w, closed: true };
}

/** The word under a knob, per ring: each seat is only ever shown its own. */
function wordsOf(ring: GimbalRing): HandleWords {
  return ring === OUTER
    ? { seat: 1, mine: "PULL", theirs: "P1'S" }
    : { seat: 2, mine: "PULL", theirs: "P2'S" };
}

/**
 * The channel, the lever, the knob and the word, on the screen of the seat
 * that grips this ring, while the rings are being turned. Laid on through the
 * same tilt as the rim (`gimbal-draw.ts`), so the lever stays bolted to it.
 */
export function drawGimbalKnob(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: GimbalState,
  ring: GimbalRing,
  at: Point,
  held: boolean,
  time: number,
): void {
  const r = gimbalKnobSize(l, cfg);
  const knob = gimbalKnobAt(l, at, s, ring);
  const through = gimbalKnobThrough(l, s, ring);
  const track = knobTrack(l, at, ring, r * PULL_TRACK_W);
  drawPullTrack(ctx, track, { ...LOOK, held, origin: 0, at: through, time });
  const way = pullWay(track, through, through < 0 ? 0 : 1);
  drawMazeLever(ctx, { cx: at.x, cy: at.y, r: gimbalRingR(l, ring) }, knob, r, held);
  drawPullKnob(ctx, knob, r, { ...LOOK, held, time, way, either: through === 0 });
  // The word goes as soon as a hand lands, as THE MAZE's does.
  if (held) return;
  drawHandleHint(ctx, l, l.role, knob.x, knob.y + l.tile * 0.75, HINT_LOUD, wordsOf(ring));
}

/** The handle's colours: THE MAZE's — the hull's rim, lit to the text colour while held. */
const LOOK = { hex: PALETTE.hullRim, rim: PALETTE.text } as const;
