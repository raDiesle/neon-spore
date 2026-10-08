import { midCol } from "./config.js";
import { openSlow } from "./slow.js";
import type { TrivetState } from "./trivet.js";
import type { World } from "./world.js";

/**
 * **THE TRIVET's ring** (§30 row 11): the last shot is in, and the planted
 * feet ring under the spent hub, straining loose on their own, for
 * `trivetRingBeats` while both seats send nothing — after ten beats spent
 * chording or firing, the fight's last beat asks the pair to let go of every
 * pad and trust the stand to settle. THE SLING's cool and THE PLUMB's bleed
 * are the same shape.
 *
 * **A reflex chord jolts a foot loose** and rings it again: the ring takes a
 * beat longer, at most `trivetRingJolts`. It costs a beat, not a pad — a
 * chord is two or three pads put down together, and it is the one reflex
 * (`stirred`). A pad still down when a beat turns costs the next one too, so
 * a chord left on from the last step is not free just because it came before
 * the ring. A lift costs nothing.
 *
 * Nothing is lost by it: the hub is spent and the wave is won either way.
 * What the ring asks for is the pair's hands, and all it can do is wait.
 */

/** The script is done: the feet start to ring under the spent hub, under THE SLOW. */
export function openRing(world: World, s: TrivetState): void {
  s.phase = "ring";
  s.phaseBeat = world.beat;
  s.jolts = 0;
  s.stirred = false;
  openSlow(world, world.cfg.trivetRingBeats, "ask");
  world.events.push({ type: "trivetRing", col: midCol(world.cfg) });
  stillHeld(world, s);
}

/**
 * A beat of the ring: done once its beats and any jolts are spent, which the
 * caller collapses; otherwise a fresh beat to be stirred, and a pad still
 * down stirs it at once.
 */
export function stepRing(world: World, s: TrivetState, since: number): boolean {
  if (since >= world.cfg.trivetRingBeats + s.jolts) return true;
  s.stirred = false;
  stillHeld(world, s);
  return false;
}

/** A pad put down on foot `side` while the feet ring: the first this beat jolts the foot loose. */
export function trivetStirred(world: World, s: TrivetState, side: 0 | 1): void {
  if (s.phase !== "ring" || s.stirred || s.jolts >= world.cfg.trivetRingJolts) return;
  s.stirred = true;
  s.jolts += 1;
  const since = world.beat - s.phaseBeat;
  openSlow(world, world.cfg.trivetRingBeats + s.jolts - since, "ask");
  world.events.push({ type: "trivetJolt", side, col: midCol(world.cfg) });
}

function stillHeld(world: World, s: TrivetState): void {
  for (const side of [0, 1] as const) {
    if (s.padsDown[side] !== 0) trivetStirred(world, s, side);
  }
}
