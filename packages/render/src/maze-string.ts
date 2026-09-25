import type { Point } from "@neon-spore/content";
import type { MazeState, SimConfig } from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import { drawHandleHint, type HandleWords, HINT_LOUD } from "./handle-word.js";
import type { Circle, Layout, ViewRole } from "./layout.js";
import { drawMazeLever } from "./maze-lever.js";
import { mazeDrum } from "./maze-walls.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob, PULL_GRAB } from "./pull-knob.js";
import { drawPullTrack, PULL_TRACK_W, type PullTrack } from "./pull-track.js";

/**
 * THE MAZE's lever, and the way it goes: the one thing in this round either
 * player can put a hand on.
 *
 * It is a file of its own rather than another section of `maze-draw.ts` for
 * the ordinary reason — that file was already at the limit — but the split
 * lands somewhere real. Everything next door is the drum *reporting*: rings,
 * spent cells, a lit mouth, a shot walking. This is the round's only control,
 * and the only thing here `touch.ts` has to agree with.
 *
 * **A lever clamped to the drum, and a channel round the rim** — the owner,
 * 25 September 2026, by name: the path to turn the maze *should be a path
 * around the maze's outer border*, with *a visual like a lever* joining the
 * place to take hold to the drum, *so the gauge rotating is the logical
 * consequence*. So the handle is the knob of an arm bolted to the rim, the
 * arm swings round the drum with the hand, and the channel it runs in is a
 * whole ring round the drum, hard against its rim — the wheel turns without
 * end, so the way to turn it has no end either (the owner, the same day) —
 * filling green from the rest either way, lap after lap (`pull-track.ts`). A
 * thumb going round the ring is read as the arc it went, not as the sideways
 * part of it (`rimFrom`, `touch-drag.ts`), and a press is taken well outside
 * the knob drawn (`PULL_GRAB`).
 */

/**
 * How far out from the rim the knob's middle stands, in tiles: its own radius
 * and a hair for the bezel, so the ring runs against the drum with no gap.
 */
const STRING_TILES = 0.45;

/**
 * Where round the drum the lever rests, as an angle off straight down.
 *
 * **It is off the bottom on purpose, and that is the whole of this constant.**
 * Only the bottom column counts (`mazeEntranceCol`), so the lowest point of
 * the rim is the one place a gap ever comes to rest — and a handle there sat
 * exactly on it, hiding the arrival the pilot is pulling *for*. So the lever
 * rests round to the side, far enough that the lit gap, the line it draws
 * down its column and the handle are three separate things on the screen.
 *
 * To the pilot's left rather than the right for no reason but that something
 * had to be chosen, and the left is the side the hull bar is not on.
 */
const STRING_ANGLE = (40 / 360) * Math.PI * 2;

/** The circle the knob runs round: the drum's centre, and the channel's radius. */
function knobRing(l: Layout, cfg: SimConfig): { cx: number; cy: number; r: number } {
  const d = mazeDrum(l, cfg);
  return { cx: d.cx, cy: d.cy, r: d.r + l.tile * STRING_TILES };
}

/** A point on a circle round the drum, `a` radians off straight down to the left. */
function round(c: { cx: number; cy: number }, r: number, a: number): Point {
  return { x: c.cx - r * Math.sin(a), y: c.cy + r * Math.cos(a) };
}

/**
 * Where the knob actually stands: the rest carried round the ring by however
 * far the hand has taken it — any distance, since the ring has no ends.
 *
 * The knob sits under the finger on **both** screens, so the navigator
 * watches the pilot pull rather than only the wheel's answer to it — and a
 * guide's rehearsal reads the same answer, so the thumb it draws is on the
 * handle rather than beside it (`handles.ts`). Moving right under the drum is
 * positive, as `rimFrom` reads it.
 */
export function mazeStringHandle(
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
): { x: number; y: number; off: number } {
  const ring = knobRing(l, cfg);
  const off = (m.dragFromMilli * l.tile) / 1000;
  return { ...round(ring, ring.r, STRING_ANGLE - off / ring.r), off };
}

/**
 * Where the handle rests, with no hand on it.
 *
 * **The one place it is written down.** `touch.ts` answers a press exactly
 * here and this file draws exactly here, for the reason `layout.ts` gives
 * about every other control: a button drawn in one place and answered in
 * another is a button that works until somebody moves one of them. It reads
 * the layout and the config and nothing in the round, so a press is tested
 * against the same circle whatever the wheel is doing.
 */
export function mazeStringCircle(l: Layout, cfg: SimConfig): Circle {
  const ring = knobRing(l, cfg);
  return { ...round(ring, ring.r, STRING_ANGLE), r: handleRadius(l, cfg) };
}

/**
 * What a press on the knob hands the drag: the circle the finger is read
 * round, and the angle it landed at, so the arc is measured from the grab.
 */
export function mazeStringRim(
  l: Layout,
  cfg: SimConfig,
  x: number,
  y: number,
): { cx: number; cy: number; r: number; angle: number } {
  const ring = knobRing(l, cfg);
  return { ...ring, angle: Math.atan2(y - ring.cy, x - ring.cx) };
}

/**
 * The circle a press is answered in: the knob widened by `PULL_GRAB`, since a
 * handle is hard to catch at the size it is drawn (the owner, generic).
 */
export function mazeStringGrab(l: Layout, cfg: SimConfig): Circle {
  const rest = mazeStringCircle(l, cfg);
  return { ...rest, r: rest.r * PULL_GRAB };
}

/**
 * The channel: the knob's whole ring, starting at the rest and going the way
 * a positive pull goes — right under the drum — back round to the rest.
 */
function mazeStringTrack(l: Layout, cfg: SimConfig, w: number): PullTrack {
  const ring = knobRing(l, cfg);
  const pts: Point[] = [];
  for (let i = 0; i <= 72; i++)
    pts.push(round(ring, ring.r, STRING_ANGLE - (i / 72) * Math.PI * 2));
  return { pts, w, closed: true };
}

/**
 * **The word is the seat's, and it is not the tether's answer.** `tether.ts`
 * shows PULL to whichever player may take the line this cycle and HELD to the
 * other, because the line changes hands. The wheel does not: only the pilot
 * may ever turn it (`mazeStringHeard`), so player 1 reads PULL and player 2 is
 * told whose hand it is rather than waiting for a turn that never comes.
 *
 * Drawn only while the wheel can actually be turned, and again under `grip`,
 * when the hand on it is the pilot's brace (`sim/maze-hand.ts`): the tear only
 * counts while his hand is on the lever, so the lever stays, lit while it is
 * held, and its word is HOLD rather than PULL — but the channel does not,
 * because nothing turns now and a way to pull would say otherwise. A handle
 * standing under a drum that is watching a shot walk is an invitation to press
 * something that does nothing.
 */
export function drawMazeString(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  role: ViewRole,
  time: number,
): void {
  if (m.phase !== "read" && m.phase !== "grip") return;
  const rest = mazeStringCircle(l, cfg);
  const knob = mazeStringHandle(l, cfg, m);
  const held = m.dragging;
  if (m.phase === "read") {
    const ring = knobRing(l, cfg);
    const track = mazeStringTrack(l, cfg, rest.r * PULL_TRACK_W);
    const at = knob.off / (2 * Math.PI * ring.r);
    drawPullTrack(ctx, track, { ...LOOK, held, origin: 0, at, time });
  }
  drawMazeLever(ctx, mazeDrum(l, cfg), knob, rest.r, held);
  drawPullKnob(ctx, knob, rest.r, { ...LOOK, held, time });

  // The word goes as soon as a hand lands, the way the tether's does: from
  // then on the knob's own place on the ring says it.
  if (held) return;
  const words = m.phase === "grip" ? BRACE_WORDS : undefined;
  drawHandleHint(ctx, l, role, knob.x, knob.y + l.tile * 0.75, HINT_LOUD, words);
}

/** The handle's colours: the hull's rim, lit to the text colour while held. */
const LOOK = { hex: PALETTE.hullRim, rim: PALETTE.text } as const;

/** The pilot's, still — but under `grip` the hand holds rather than pulls. */
const BRACE_WORDS: HandleWords = { seat: 1, mine: "HOLD", theirs: "P1'S" };
