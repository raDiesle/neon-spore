import { beadIsActive, beadStrand, type Creature, type World } from "@neon-spore/sim";
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
 * **The mark is player 2's and nothing else on this creature is.** The
 * navigator is shown which bead is lit; the pilot is shown the colours. Both
 * halves are drawn here rather than one here and one in the body pass, because
 * a mark that lived with the body would have to be drawn three times — over a
 * sealed bead, over a slick and over a bulb — and the third copy is where a
 * mark comes to be missing from one of them.
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

/** The threads on the field, each as its own beads sorted along the line —
 * by column, which is the order an eye reads them in and the order the pair
 * counts in. Deliberately not `beadOrder`: that is the shooting order, and
 * which end it starts at is exactly what player 1 must not be able to see. */
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
 * Every thread on the field, and the mark on each one's next bead.
 *
 * Called from `frame-field.ts` before `drawCreatures`, so the line lies behind
 * the bodies it joins.
 */
export function drawStrands(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
): void {
  for (const on of threads(world)) {
    if (on.length === 0) continue;
    drawThread(ctx, l, world, on, beatPhase);
    if (showsBeadMark(l)) drawMark(ctx, l, world, on, beatPhase);
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

/**
 * The bead that has to be shot next, on the one screen that may know: a ring
 * standing off the body, and a lift of light behind it.
 *
 * A ring and not a colour, an arrow or a number. A colour is the other seat's
 * half and cannot appear here at all; an arrow would have to point along the
 * thread and would therefore say which end the order started at, which is a
 * fact about every bead still to come rather than about this one; and a number
 * is a label on the game's own screen, which this field does not carry.
 */
function drawMark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  on: Creature[],
  beatPhase: number,
): void {
  const lit = on.find((c) => beadIsActive(world, c));
  if (!lit) return;
  const { x, y } = creatureCenter(l, lit, beatPhase);
  const row = drawnRow(lit, beatPhase);
  const near = nearness(l, row);
  const k = depthScale(world.cfg, l, row);
  const color = hazed(world.cfg, LINE_LIT, near);
  const r = l.tile * 0.52 * k;
  const ring = new Path2D();
  ring.arc(x, y, r, 0, Math.PI * 2);
  strokeGlow(ctx, ring, color, STROKE.outline);
  halo(ctx, x, y, r * 1.8, color, 0.22);
}
