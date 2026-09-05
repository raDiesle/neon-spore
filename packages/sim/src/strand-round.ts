import { metColor, missedColor } from "./balance.js";
import { hullRow } from "./config.js";
import { removeCreatures } from "./field.js";
import {
  beadIsActive,
  beadIsSpent,
  beadOrder,
  beadStrand,
  lightStrandEnd,
  strandLeft,
} from "./strand.js";
import { beadDrop, strandFalls } from "./strand-shape.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * What **happens** to a thread: one beat of a bead, what a shot that meets one
 * does, and the thread parting once nothing on it is alive.
 *
 * How a thread comes onto the field at all is `strand-spawn.ts`, cut out when
 * the wave took this file over its limit — one arrival being assembled, against
 * everything that happens to it afterwards.
 *
 * Its own file beside `strand.ts`, the split `shell.ts` and `shell-round.ts`
 * already make and for their reason: next door is what a strand *is* — where
 * its beads hang, what colour each carries, which one is lit — and none of it
 * touches a world. This is the half that mutates one, and it is the half a
 * reviewer opens when they want to know what a press costs.
 */

/**
 * One beat of a bead: the wave, and the step down on the beats it takes one.
 *
 * Called from `onBeat` in place of the fall every other body takes, for
 * `stepDart`'s reason — a bead that both waved and fell through the ordinary
 * line would move two rows on the beats it does both.
 *
 * The wave is the difference between where `beadDrop` says this bead hangs now
 * and where it said a beat ago, which is always one row up or one row down.
 * Nothing is stored: both devices read it off the shared beat, so a thread
 * eleven beats old is in the shape its rule says and not in the shape a
 * remembered phase drifted into.
 */
export function stepStrand(world: World, c: Creature): void {
  const place = beadOrder(c);
  const wave = beadDrop(place, world.beat) - beadDrop(place, world.beat - 1);
  const fall = strandFalls(world.cfg, world.beat) ? 1 : 0;
  c.row = Math.min(c.row + wave + fall, hullRow(world.cfg));
}

/**
 * The raisin nearest a bead, and the one a wrong shot at that bead brings back.
 *
 * Nearest **along the thread**, which — with the contiguous run `strand.ts`
 * argues for — means one of the two hanging off its ends. So the thread grows
 * back at the end the pair was closest to working on rather than somewhere
 * they had stopped looking, and the mistake is undone where they are looking.
 * Ties go to the left, and a tie is a coin either way.
 */
function nearestSpent(world: World, strandId: number, from: number): Creature | null {
  let back: Creature | null = null;
  for (const c of world.creatures) {
    if (beadStrand(c) !== strandId || !beadIsSpent(c)) continue;
    if (back === null || Math.abs(beadOrder(c) - from) < Math.abs(beadOrder(back) - from)) back = c;
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
 * A live bead that is **not** the lit one is the mistake, and the colour is
 * deliberately not consulted — there is no right colour for the wrong bead,
 * exactly as there is no right shot at a lure. What it costs is the nearest
 * raisin swelling back into a bead, so the thread is longer than it was and
 * the pair has to say the whole sentence again. With nothing yet shrivelled
 * there is nothing to give back and it is an ordinary miss, which is right:
 * the first bead of a thread is the one guess this creature forgives.
 *
 * Only the lit bead is answered by the ordinary rule, which is the matching
 * colour and nothing else. It does not leave the field — that is what makes
 * the raisin a readout — so there is no `destroy` here and no `removeCreature`:
 * the whole thread goes at once, a beat later, in `breakSpentStrands`.
 *
 * **Both branches that change the run re-light an end**, and that is the
 * creature rather than tidiness: which bead is next is rolled afresh every
 * time, so neither seat can work out the other's half from what has already
 * happened (`lightStrandEnd`).
 */
export function beadStruck(world: World, b: Bullet, hit: Creature): boolean {
  const strandId = beadStrand(hit);
  if (beadIsSpent(hit)) {
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }
  if (!beadIsActive(world, hit)) {
    missedColor(world);
    const back = nearestSpent(world, strandId, beadOrder(hit));
    if (back === null) {
      world.events.push({ type: "reject", col: hit.col, row: hit.row });
      return false;
    }
    back.strandSpent = false;
    lightStrandEnd(world, strandId);
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
  lightStrandEnd(world, strandId);
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
