import { beadIsActive, beadIsSpent, type Creature, type World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { depthScale, drawnRow, hazed, nearness } from "./depth.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE STRAND's armour: the cage around every bead a shot **cannot** answer
 * this instant.
 *
 * **The defect it repairs.** A thread of five live bodies is five bodies that
 * look shootable, and only one of them is. The pilot's screen showed the
 * colours and a soft light on the two candidate ends, and the three in the
 * middle sat there looking exactly like three ordinary arrivals — which is a
 * picture that invites the one shot this creature punishes. A mark saying
 * *this one* was never going to be enough on its own; what the field needed
 * was a mark saying *not these*.
 *
 * **Grey, and grey is a word the pair already has.** `PALETTE.rock` is the
 * meteor's colour, and a meteor is the one thing on this field the cannon has
 * nothing to say to. So plating in the rock's own grey says "shots do nothing
 * here" in the vocabulary the pair learned in the first act, without borrowing
 * THE CLASP's membrane — which would say *ward it*, and warding does nothing
 * to a bead.
 *
 * **What is locked is not the same on the two screens, and that is the whole
 * split drawn instead of said.** On the navigator's, exactly one bead is bare
 * and it is the lit one. On the pilot's, exactly one bead is bare too — but it
 * is whichever end the frame is hopping over this instant (`hoppedEnd`), so the
 * two ends flick between caged and open several times a second and the inner
 * beads never open at all. The pilot is shown *one of these two, and I cannot
 * tell you which*; the navigator is shown which. Neither picture contains the
 * other's half.
 *
 * **Indestructible for now**, which is the owner's phrase and an accurate one:
 * nothing takes a plate off. The cage is a statement about *this instant* and
 * it moves the moment the run changes, because which bead may be shot is
 * rolled again after every shot (`lightStrandEnd`).
 */

/** Plates in the ring, and the share of each one's slot left as a gap. Six is
 * enough to read as segmented at the size a phone draws a body and few enough
 * that each plate is a plate rather than a tick. */
const PLATES = 6;
const GAP = 0.24;

/** How far the ring stands off the body's own drawn radius. Outside the
 * contour at every size, so a cage never hides the shape it is holding — the
 * pilot still has to read a slick from a bulb through it. */
const RING_MUL = 1.42;

/** How thick a plate is drawn, as a share of a tile, and the floor under it in
 * pixels — a plate thinner than a line is a line. */
const PLATE_WIDTH = 0.075;

/**
 * The beads this screen must show as unanswerable: every live one that a shot
 * fired now would be refused.
 *
 * The pilot's list is deliberately **not** the truth, and it is not a lie
 * either. Four of a run of five really are locked, and which four is the
 * navigator's half — so what the pilot is shown instead is the hop: every bead
 * but one is caged, the uncaged one is always one of the two ends, and which
 * end changes several times a second. Nothing on that screen is wrong for
 * longer than a quarter of a second, and nothing on it can be read.
 */
export function lockedBeads(
  showsMark: boolean,
  world: World,
  on: Creature[],
  guess: Creature | null,
): Creature[] {
  const live = on.filter((c) => !beadIsSpent(c));
  if (showsMark) return live.filter((c) => !beadIsActive(world, c));
  return live.filter((c) => c.id !== guess?.id);
}

/** The cage around one bead: six plates in the rock's grey, standing off the
 * body far enough that the shape inside is still the shape the pair names. */
export function drawBeadArmour(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  beatPhase: number,
): void {
  const { x, y } = creatureCenter(l, c, beatPhase);
  const row = drawnRow(c, beatPhase);
  const k = depthScale(world.cfg, l, row);
  const r = l.tile * 0.4 * RING_MUL * k;
  const step = (Math.PI * 2) / PLATES;
  const span = step * (1 - GAP);
  const ring = new Path2D();
  for (let i = 0; i < PLATES; i++) {
    // One plate centred at the foot of the body, so a cage never reads as
    // hanging off the thread by a corner.
    const from = Math.PI / 2 + i * step - span / 2;
    ring.moveTo(x + Math.cos(from) * r, y + Math.sin(from) * r);
    ring.arc(x, y, r, from, from + span);
  }
  ctx.strokeStyle = hazed(world.cfg, PALETTE.rock, nearness(l, row));
  ctx.lineWidth = Math.max(1, l.tile * PLATE_WIDTH * k);
  ctx.stroke(ring);
}
