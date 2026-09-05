import { beadIsActive, beadIsSpent, beadStrand, type Creature, type World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { depthScale, drawnRow, hazed, nearness } from "./depth.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE STRAND's thread, and the mark on the bead that has to be shot next.
 *
 * **The line is the creature and it is drawn, not implied.** What the pair is
 * counting along is a *sequence*, and a sequence drawn as several bodies
 * standing in a row is a sequence either of them can read the wrong way round
 * — "third from the left" means nothing once a bead in the middle is a raisin
 * unless the thing joining them is on the screen. So the thread runs through
 * every bead's own drawn centre, spent ones included, and it glides with them
 * between beats because it is built out of where they actually are.
 *
 * **Two marks, one for each seat, and neither is the other's.** The navigator
 * gets the bead that is lit; the pilot gets the **two candidates** — the ends
 * of what is still alive, which are the only two beads the next roll can
 * choose between. Both are light rather than a ring or a box: a ring reads as
 * a target on a field whose only other ring is the ship's own shield, and a
 * frame around a body is a label rather than a thing in the world. So the lit
 * bead simply *blinks*, and the candidates simply *breathe*.
 *
 * The pilot's pair is not a leak and it is worth saying why. The ends of a run
 * are already on their screen — they can see which beads are raisins — so what
 * this draws is nothing they could not work out, and what it does not draw is
 * the one thing they must not know: which of the two it is. What it buys is
 * that the pilot can have the cannon between the two candidates before the
 * navigator has finished saying which, which is the difference between a call
 * that arrives in time and one that does not.
 *
 * Both are drawn here rather than one here and one in the body pass, because a
 * mark that lived with the body would have to be drawn three times — over a
 * reel, over a slick and over a bulb — and the third copy is where a mark comes
 * to be missing from one of them.
 *
 * It is a pass of its own, **before** the bodies rather than inside their
 * loop, for `drawGyres`' reason: a thread spans up to five columns, `byDepth`
 * sorts body by body, and a line taking its turn in that order would be over
 * some of the beads it joins and under the others.
 */

/**
 * Whether this screen may see what colour a bead is. Player 2 never can — that
 * is half the creature — and `test` can, because it is both halves at once on
 * one screen and a rig that hid one would be no rig.
 *
 * The mirror image of `showsBeadMark` below, deliberately and to the letter:
 * this one is `role !== "p2"`, that one is `role !== "p1"`, and no creature
 * before this one has needed both at once.
 */
export function showsBeadColor(l: Layout): boolean {
  return l.role !== "p2";
}

/** Whether this screen may see which bead is next. Player 1 never can, and
 * that is the other half. */
export function showsBeadMark(l: Layout): boolean {
  return l.role !== "p1";
}

/** Every bead on the field, in no particular order. */
function beads(world: World): Creature[] {
  return world.creatures.filter((c) => c.kind === "strand");
}

/** The threads on the field, each as its own beads sorted along the line — by
 * column, which is the order an eye reads them in and the order the pair
 * counts in. `beadOrder` would give the same answer today and is the rule's
 * own field rather than the picture's; a line is drawn between the things on
 * the screen, so it is sorted by where they are. */
function threads(world: World): Creature[][] {
  const byId = new Map<number, Creature[]>();
  for (const c of beads(world)) {
    const id = beadStrand(c);
    const on = byId.get(id);
    if (on) on.push(c);
    else byId.set(id, [c]);
  }
  return [...byId.values()].map((on) => on.sort((a, b) => a.col - b.col));
}

/**
 * How far the thread sags between two neighbours: the control point of the
 * curve, in tiles, so the line actually dips half of it at the midpoint.
 *
 * **It has to clear the bodies, and that is what sets the number.** Two beads
 * stand in neighbouring columns and each is drawn about eight tenths of a tile
 * across, so a line straight between their centres is a line behind them: the
 * first frame of this creature had a thread nobody could see, on both screens.
 * At 0.62 the dip is a little under a third of a tile, which is below the
 * lowest point of a bulb and plainly a *line* rather than a gap between two
 * bodies.
 *
 * And no further. A real catenary over five beads is a whole tile of droop,
 * and a thread hanging a tile below the row its beads stand in is a thread the
 * pair would count in the wrong row — the bodies are on tiles and the line is
 * the only thing here that is allowed not to be.
 */
const SAG = 0.62;

/** The thread's own colour, and the palette's "no colour": violet, chosen for
 * a body either shot kills and right again here — a line that was red or cyan
 * would be saying one of the two words the pair has to say about the beads. */
const LINE = PALETTE.wisp;
const LINE_LIT = PALETTE.wispRim;

/**
 * Every thread on the field, and whichever mark this seat is owed.
 *
 * Called from `frame-field.ts` before `drawCreatures`, so the line lies behind
 * the bodies it joins and the light behind them is light rather than a lid.
 */
export function drawStrands(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  for (const on of threads(world)) {
    if (on.length === 0) continue;
    drawThread(ctx, l, world, on, beatPhase);
    if (showsBeadMark(l)) drawLit(ctx, l, world, on, beatPhase, time);
    else drawCandidates(ctx, l, world, on, beatPhase, time);
  }
}

/** One line through the beads of a thread, sagging between each pair. */
function drawThread(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  on: Creature[],
  beatPhase: number,
): void {
  if (on.length < 2) return;
  const line = new Path2D();
  const first = on[0]!;
  const start = creatureCenter(l, first, beatPhase);
  line.moveTo(start.x, start.y);
  for (let i = 1; i < on.length; i++) {
    const prev = creatureCenter(l, on[i - 1]!, beatPhase);
    const here = creatureCenter(l, on[i]!, beatPhase);
    // The sag is a quadratic through the midpoint rather than a curve fitted
    // to the whole run: two beads that end up in the same column — which
    // cannot happen today and would if a thread ever moved — still get a line
    // that goes somewhere rather than a control point at infinity.
    line.quadraticCurveTo(
      (prev.x + here.x) / 2,
      (prev.y + here.y) / 2 + l.tile * SAG,
      here.x,
      here.y,
    );
  }
  const near = nearness(l, drawnRow(first, beatPhase));
  strokeGlow(ctx, line, hazed(world.cfg, LINE, near), STROKE.outline);
}

/** How fast the lit bead blinks, in swells a second, and how far its light
 * reaches at the top of one. Faster than a heartbeat and slower than the reel
 * inside it, so the two are plainly two things — and bright enough at the peak
 * that one bead of five is found without being hunted for. */
const BLINK_HZ = 2.2;
const LIT_REACH = 3.0;

/** And the pilot's pair: half the reach, a third of the rate, and in step with
 * each other rather than with the blink. Two beads breathing together read as
 * *these two*; two beads blinking would read as two answers. */
const CANDIDATE_REACH = 2.0;
const CANDIDATE_HZ = 0.7;

/**
 * The bead that has to be shot next, on the one screen that may know it: light
 * behind the body, swelling and falling.
 *
 * Light and not a colour, an arrow, a ring or a number. A colour is the other
 * seat's half and cannot appear here at all. An arrow would have to point along
 * the thread and would therefore say which end the roll came out at, which is a
 * fact about the next bead as well as this one. A ring is what the ship's own
 * shield is, at the bottom of the same screen. And a number is a label on the
 * game's own field, which this game does not carry.
 */
function drawLit(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  on: Creature[],
  beatPhase: number,
  time: number,
): void {
  const lit = on.find((c) => beadIsActive(world, c));
  if (!lit) return;
  glowAt(ctx, l, world, lit, beatPhase, LIT_REACH, 0.24 + 0.4 * swell(time, BLINK_HZ, lit.id));
}

/**
 * The two beads the next roll can choose between, on the pilot's screen: the
 * ends of the live run, breathing together.
 *
 * The same bead twice when one is left, which draws once and is right — with
 * one bead alive there is nothing to choose between, and the pilot knowing
 * that is not knowing anything the field does not already say.
 */
function drawCandidates(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  on: Creature[],
  beatPhase: number,
  time: number,
): void {
  const live = on.filter((c) => !beadIsSpent(c));
  if (live.length === 0) return;
  const alpha = 0.14 + 0.16 * swell(time, CANDIDATE_HZ, 0);
  for (const end of new Set([live[0]!, live[live.length - 1]!])) {
    glowAt(ctx, l, world, end, beatPhase, CANDIDATE_REACH, alpha);
  }
}

/** One swell, 0 at rest and 1 at the top. Spread by an id so two threads on a
 * field are never one picture drawn twice. */
function swell(time: number, hz: number, id: number): number {
  return (1 - Math.cos(Math.PI * 2 * (time * hz + id * 0.13))) / 2;
}

/** Light behind one bead, at the size the row draws it and hazed by the same
 * distance the body is — a mark that stayed bright at the top of the field
 * would be brighter than the thing it is marking. */
function glowAt(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  beatPhase: number,
  reach: number,
  alpha: number,
): void {
  const { x, y } = creatureCenter(l, c, beatPhase);
  const row = drawnRow(c, beatPhase);
  const near = nearness(l, row);
  const k = depthScale(world.cfg, l, row);
  halo(ctx, x, y, l.tile * 0.4 * reach * k, hazed(world.cfg, LINE_LIT, near), alpha);
}
