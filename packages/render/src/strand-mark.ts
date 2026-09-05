import { beadIsActive, type Creature, type World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { depthScale, drawnRow, hazed, nearness } from "./depth.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * THE STRAND's two marks: the bead that has to be shot next on the navigator's
 * screen, and the two it could be on the pilot's.
 *
 * ## The navigator's, and it is three things at once
 *
 * A glow behind the body, the shared **target lock** over it, and an arrow
 * standing above it pointing down. Three, because one was not enough: a glow
 * alone is a body that happens to be brighter, on a field where bodies glow,
 * and the owner said plainly that the picture was confusing. What each one
 * does is different —
 *
 * - the **glow** is found in the corner of an eye, from anywhere on the
 *   screen, and it blinks, so it is never mistaken for a body's own light;
 * - the **frame** is `drawTargetLock`, the one marking in this game that means
 *   *an instrument has picked this body out* (`target-lock.ts`). It is drawn
 *   identically over a lure, a dart, a cloud and the queen's marks, and that
 *   sameness is the point: the navigator already knows what a frame means;
 * - the **arrow** says *this one*, unambiguously, in the one direction a
 *   pointer can be read without a word. A frame around a body in a row of
 *   bodies still has to be found; an arrow hanging over it has already been
 *   read by the time the eye arrives.
 *
 * ## The pilot's, and it is the same instrument guessing
 *
 * The pilot gets the **same frame**, hopping fast between the two ends of the
 * live run — and the bead it is over is the one bead on their screen without a
 * cage on it (`strand-armour.ts`), so the two ends flick between armoured and
 * open several times a second. Over it stands a **question mark**, where the
 * navigator's frame has an arrow: the two glyphs are one sentence split across
 * the two screens, and the pilot's half of it is the one they have to say out
 * loud.
 *
 * That is the owner's picture and it says the right thing. A steady mark on
 * two beads says *one of these two*, which is true and calm; a frame that
 * cannot decide between them says *and I cannot tell you which*, which is the
 * actual state of that screen. It is the same instrument the navigator has,
 * shown failing to lock, so the pair learns one picture with two states rather
 * than two pictures.
 *
 * It never lands on the truth in a way that could be read: the hop is the wall
 * clock and nothing else, so it is over the lit bead about half the time and
 * over the other end the rest, and neither the pilot nor a stopwatch can tell
 * those apart.
 *
 * Cut out of `strand.ts` when the frame and the arrow took that file past its
 * 250-line limit, along the seam it already had: next door is the *thread* —
 * which beads are on one and the line drawn through them — and this is what is
 * drawn about one bead on one screen.
 */

/** How fast the lit bead blinks, in swells a second, and how far its light
 * reaches at the top of one. Faster than a heartbeat and slower than the reel
 * inside it, so the two are plainly two things. */
const BLINK_HZ = 2.2;
const LIT_REACH = 3.0;

/** And the pilot's: the same frame, hopping between the two ends this many
 * times a second. Fast enough to read as *unable to choose* rather than as
 * pointing at one and then the other, and slow enough that each stop is a
 * whole frame or two of a phone's own refresh. */
const HOP_HZ = 4;

/** The light under the pilot's frame. Dimmer than the navigator's blink and
 * not blinking at all: what is moving there is the frame, and a glow keeping
 * its own time under it would be a second clock. */
const GUESS_REACH = 2.0;
const GUESS_ALPHA = 0.18;

/** How far the lock's box stands off the body's own drawn radius — outside the
 * armour ring, which nothing wears on a lit bead but which sets the scale the
 * eye is reading these at (`strand-armour.ts`). */
const BOX_MUL = 1.75;

/** Where the arrow hangs above the box and how big it is, both in tiles, and
 * how far it bobs. It bobs on the blink's own clock, so the two halves of the
 * mark move as one thing rather than beating against each other. */
const ARROW_LIFT = 0.5;
const ARROW_SIZE = 0.2;
const ARROW_BOB = 0.08;

/** And where the pilot's question mark hangs above theirs, and how big it is.
 * A little larger than the arrow because a glyph read as a *word* has to be
 * legible where a triangle only has to be seen, and lifted the same amount so
 * the two seats' marks sit at the same height on the two screens.
 *
 * It does not bob and it does not blink. The one thing moving in the pilot's
 * mark is the frame hopping between the two ends, and a second clock over it
 * would be a second statement — this glyph is the *caption* on that hop, and a
 * caption holds still. It hops with the frame because it is drawn over
 * whichever bead the frame is on, which is the only motion it is owed. */
const QUERY_LIFT = 0.5;
const QUERY_SIZE = 0.3;

/** The mark's colour: the palette's violet rim, which is neither ammunition
 * colour — a mark in red or cyan would be saying one of the two words the
 * navigator is not allowed to know. */
const MARK = PALETTE.wispRim;

/**
 * The bead that has to be shot next, on the one screen that may know it.
 */
export function drawLit(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  on: Creature[],
  beatPhase: number,
  time: number,
): void {
  const lit = on.find((c) => beadIsActive(world, c));
  if (!lit) return;
  const { x, y } = creatureCenter(l, lit, beatPhase);
  const row = drawnRow(lit, beatPhase);
  const near = nearness(l, row);
  const k = depthScale(world.cfg, l, row);
  const hex = hazed(world.cfg, MARK, near);
  const beat = swell(time, BLINK_HZ, lit.id);

  halo(ctx, x, y, l.tile * 0.4 * LIT_REACH * k, hex, 0.24 + 0.4 * beat);
  const half = l.tile * 0.4 * BOX_MUL * k;
  drawTargetLock(ctx, x, y, half, half, hex, time, 0.85 + 0.15 * beat, lit.id);
  drawArrow(ctx, x, y - half - (ARROW_LIFT + ARROW_BOB * beat) * l.tile * k, l.tile * k, hex);
}

/**
 * A head pointing down at the bead, with a short stem above it.
 *
 * Filled rather than stroked, and that is the difference between it and the
 * frame: the lock is an instrument's readout and flickers like one, and this
 * is a solid thing hanging in the field saying *that one*. Two pictures, two
 * weights, so a pair reads them as two statements rather than one busy mark.
 */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  hex: string,
): void {
  const w = tile * ARROW_SIZE;
  const head = new Path2D();
  head.moveTo(x, y + w);
  head.lineTo(x - w * 0.8, y - w * 0.5);
  head.lineTo(x + w * 0.8, y - w * 0.5);
  head.closePath();
  ctx.fillStyle = hex;
  ctx.fill(head);
  ctx.strokeStyle = hex;
  ctx.lineWidth = Math.max(1, w * 0.28);
  const stem = new Path2D();
  stem.moveTo(x, y - w * 0.5);
  stem.lineTo(x, y - w * 1.6);
  ctx.stroke(stem);
}

/**
 * Which end the pilot's frame is over this instant, or null when the thread has
 * nothing alive left on it.
 *
 * The same bead twice when one is left, which is right: with one bead alive
 * there is nothing to choose between, and the pilot knowing that is not knowing
 * anything the field does not already say.
 *
 * Exported because two pictures read it — the frame here and the one bead
 * `strand-armour.ts` leaves uncaged — and a second copy of the clock would put
 * the cage and the frame on different beads.
 */
export function hoppedEnd(live: Creature[], time: number): Creature | null {
  if (live.length === 0) return null;
  const ends = [live[0]!, live[live.length - 1]!];
  return ends[Math.floor(time * HOP_HZ) % ends.length]!;
}

/** The pilot's guess: the navigator's own frame, over whichever end the hop is
 * on this instant. */
export function drawGuess(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  guess: Creature | null,
  beatPhase: number,
  time: number,
): void {
  if (!guess) return;
  const { x, y } = creatureCenter(l, guess, beatPhase);
  const row = drawnRow(guess, beatPhase);
  const k = depthScale(world.cfg, l, row);
  const hex = hazed(world.cfg, MARK, nearness(l, row));
  halo(ctx, x, y, l.tile * 0.4 * GUESS_REACH * k, hex, GUESS_ALPHA);
  const half = l.tile * 0.4 * BOX_MUL * k;
  drawTargetLock(ctx, x, y, half, half, hex, time, 0.8, guess.id);
  drawQuery(ctx, x, y - half - QUERY_LIFT * l.tile * k, l.tile * k, hex);
}

/**
 * A question mark standing over the pilot's frame, where the navigator's
 * screen has an arrow.
 *
 * **The two glyphs are one sentence between the two screens.** An arrow over a
 * bead says *that one*; a question mark over a frame that cannot settle says
 * *which one?* — and the pilot's whole job on this creature is to ask it out
 * loud and wait to be answered. Before this the pilot had a frame flicking
 * between two bodies and nothing saying what the flicking meant, which is a
 * picture a pair reads as an instrument being broken rather than as a question
 * being put.
 *
 * Stroked rather than filled, unlike the arrow: the arrow is a solid thing
 * hanging in the field and this is a mark *written* over one, and the weight
 * is the difference a glance reads before the shape is.
 */
function drawQuery(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  hex: string,
): void {
  const s = tile * QUERY_SIZE;
  const hook = new Path2D();
  // The bowl runs left, over the top and down the right of a circle sitting a
  // size and a half above the anchor, then falls to the stem's head on the
  // centre line — the diagonal that makes a question mark rather than a hook.
  hook.arc(x, y - s * 1.5, s * 0.55, Math.PI, Math.PI * 2);
  hook.lineTo(x, y - s * 0.95);
  const prevCap = ctx.lineCap;
  ctx.lineCap = "round";
  ctx.strokeStyle = hex;
  ctx.lineWidth = Math.max(1, s * 0.26);
  ctx.stroke(hook);
  ctx.lineCap = prevCap;
  const dot = new Path2D();
  dot.arc(x, y - s * 0.2, s * 0.17, 0, Math.PI * 2);
  ctx.fillStyle = hex;
  ctx.fill(dot);
}

/** One swell, 0 at rest and 1 at the top. Spread by an id so two threads on a
 * field are never one picture drawn twice. */
function swell(time: number, hz: number, id: number): number {
  return (1 - Math.cos(Math.PI * 2 * (time * hz + id * 0.13))) / 2;
}
