import { midCol } from "./config.js";
import type { SlingState } from "./sling.js";
import { openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * **THE SLING's cool** (§32 row 11): the last shot is in, and the spent yoke
 * ticks as it cools for `slingCoolBeats` while both draws are left alone —
 * after ten beats of holding and loosing, the fight's last beat asks the pair
 * to send nothing. THE PLUMB's bleed (`plumb-bleed.ts`) is the same shape.
 *
 * **A draw snaps the catch loose early**, and the cool takes a beat longer,
 * at most `slingCoolSnaps`. It costs a beat, not a draw: two fingers going
 * down in one beat are one reflex (`stirred`). A finger still down when a
 * beat turns costs the next one too, so a hold left on is not free just
 * because it came before the cool. A lift costs nothing.
 *
 * Nothing is lost by it: the yoke is spent and the wave is won either way.
 * What the cool asks for is the pair's hands, and all it can do is wait.
 */

/** The script is done: the spent yoke starts to cool, under THE SLOW. */
export function openCool(world: World, s: SlingState): void {
  s.phase = "cool";
  s.phaseBeat = world.beat;
  s.snaps = 0;
  s.stirred = false;
  openSlow(world, world.cfg.slingCoolBeats, "ask");
  world.events.push({ type: "slingCool", col: midCol(world.cfg) });
  stillHeld(world, s);
}

/**
 * A beat of the cool: done once its beats and any snaps are spent, which the
 * caller snaps free; otherwise a fresh beat to be stirred, and a finger still
 * down stirs it at once.
 */
export function stepCool(world: World, s: SlingState, since: number): boolean {
  if (since >= world.cfg.slingCoolBeats + s.snaps) return true;
  s.stirred = false;
  stillHeld(world, s);
  return false;
}

/** A draw on side `side` while the yoke cools: the first this beat snaps the catch loose. */
export function slingStirred(world: World, s: SlingState, side: 0 | 1): void {
  if (s.phase !== "cool" || s.stirred || s.snaps >= world.cfg.slingCoolSnaps) return;
  s.stirred = true;
  s.snaps += 1;
  const since = world.beat - s.phaseBeat;
  openSlow(world, world.cfg.slingCoolBeats + s.snaps - since, "ask");
  world.events.push({ type: "slingSnap", side, col: midCol(world.cfg) });
}

function stillHeld(world: World, s: SlingState): void {
  for (const side of [0, 1] as const) {
    if (s.holding[side]) slingStirred(world, s, side);
  }
}
