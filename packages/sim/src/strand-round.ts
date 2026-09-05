import { metColor, missedColor } from "./balance.js";
import { removeCreatures } from "./field.js";
import { beadIsActive, beadIsSpent, beadOrder, beadStrand, strandLeft } from "./strand.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * What **happens** to a thread: the shot that meets a bead, and the thread
 * parting once nothing on it is alive.
 *
 * Its own file beside `strand.ts`, the split `shell.ts` and `shell-round.ts`
 * already make and for their reason: next door is what a strand *is* — where
 * its beads stand, what colour each carries, which one is lit — and none of it
 * touches a world. This is the half that mutates one, and it is the half a
 * reviewer opens when they want to know what a press costs.
 */

/** The raisin nearest the head — the bead most recently shrivelled, and the
 * one a shot at the wrong bead brings back. */
function lastSpent(world: World, strandId: number): Creature | null {
  let back: Creature | null = null;
  for (const c of world.creatures) {
    if (beadStrand(c) !== strandId || !beadIsSpent(c)) continue;
    if (back === null || beadOrder(c) > beadOrder(back)) back = c;
  }
  return back;
}

/**
 * A shot met a bead. Returns whether the bullet goes on, the same contract
 * `resolve` has — and it never does: what stopped it is a body, and a lance
 * that tore along a thread would answer in one press the order this creature
 * exists to make the pair say out loud.
 *
 * Three answers, and the middle one is the creature.
 *
 * A raisin is inert: the shot is spent on it and nothing else happens. It is
 * still a target rather than something a bolt passes through, because a corpse
 * on a string is a mass in a lane and a shot fired up that lane has plainly
 * met something.
 *
 * A live bead that is **not** the head is the mistake, and the colour is
 * deliberately not consulted — there is no right colour for the wrong bead,
 * exactly as there is no right shot at a lure. What it costs is the last
 * raisin swelling back into a bead, so the thread is longer than it was and
 * the pair has to say the whole sentence again. With nothing yet shrivelled
 * there is nothing to give back and it is an ordinary miss, which is right:
 * the first bead of a thread is the one guess this creature is willing to
 * forgive.
 *
 * Only the head is answered by the ordinary rule, which is the matching colour
 * and nothing else. It does not leave the field — that is what makes the
 * raisin a readout — so there is no `destroy` here and no `removeCreature`:
 * the whole thread goes at once, a beat later, in `breakSpentStrands`.
 */
export function beadStruck(world: World, b: Bullet, hit: Creature): boolean {
  const strandId = beadStrand(hit);
  if (beadIsSpent(hit)) {
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }
  if (!beadIsActive(world, hit)) {
    missedColor(world);
    const back = lastSpent(world, strandId);
    if (back === null) {
      world.events.push({ type: "reject", col: hit.col, row: hit.row });
      return false;
    }
    back.strandSpent = false;
    world.events.push({
      type: "strandSwell",
      id: back.id,
      col: back.col,
      row: back.row,
      color: back.color ?? b.color,
      left: strandLeft(world, strandId),
    });
    return false;
  }
  if (hit.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }

  metColor(world);
  hit.strandSpent = true;
  world.score += world.cfg.scoreStrandBead;
  world.events.push({
    type: "strandBead",
    id: hit.id,
    col: hit.col,
    row: hit.row,
    color: b.color,
    left: strandLeft(world, strandId),
  });
  return false;
}

/**
 * Take away every thread with nothing alive left on it.
 *
 * Run on the beat rather than at the instant the last bead is shrivelled, and
 * the delay is the picture — `breakSpentGyres`' argument exactly: a whole
 * thread of raisins standing for the rest of a beat is the strand coming
 * apart, which is what the pair is owed for having kept the order. Anything
 * shorter and the last shrivel and the thread's own end are one frame, so the
 * thing they have been talking about for six beats disappears without being
 * seen to go.
 *
 * It has to happen *before* the wave asks whether the field is clear, or a
 * thread of raisins would hold a wave open with nothing left on it to shoot.
 */
export function breakSpentStrands(world: World): void {
  const threads = new Set<number>();
  for (const c of world.creatures) {
    const id = beadStrand(c);
    if (id !== -1) threads.add(id);
  }
  const gone: number[] = [];
  for (const id of threads) {
    if (strandLeft(world, id) > 0) continue;
    const beads = world.creatures.filter((c) => beadStrand(c) === id);
    for (const bead of beads) gone.push(bead.id);
    world.score += world.cfg.scoreStrandBreak;
    // The middle of what was hanging there rather than the tile of the last
    // shot: what goes is the whole arrival (`events-strand.ts`).
    const mid = beads[Math.floor(beads.length / 2)];
    if (mid) world.events.push({ type: "strandBroke", col: mid.col, row: mid.row });
  }
  if (gone.length > 0) removeCreatures(world, gone);
}
