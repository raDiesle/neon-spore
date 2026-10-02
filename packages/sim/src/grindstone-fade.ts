import { midCol } from "./config.js";
import type { GrindstoneState } from "./grindstone.js";
import { openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * **THE GRINDSTONE's fade** (§33 row 11): the last shot is in, and the spent
 * axle grinds faintly against the locked caliper for `grindstoneFadeBeats`
 * while both hands are left off it — after ten beats of grinding and
 * clamping, the fight's last beat asks the pair to do neither. THE PLUMB's
 * bleed (`plumb-bleed.ts`) and THE SLING's cool (`sling-cool.ts`) are the
 * same shape.
 *
 * **A grind or a chord jars the caliper loose**, and the fade takes a beat
 * longer, at most `grindstoneFadeJars`. It costs a beat, not a touch: a thumb
 * rubbing sends a reversal four times a beat, and it is the one reflex
 * (`stirred`). A pad still down when a beat turns costs the next one too, so a
 * chord left on is not free just because it came before the fade. A thumb
 * resting on a flat without turning back is not a grind, and a lift costs
 * nothing.
 *
 * Nothing is lost by it: the axle is spent and the wave is won either way.
 * What the fade asks for is the pair's hands, and all it can do is wait.
 */

/** The script is done: the spent axle's grind starts to die out, under THE SLOW. */
export function openFade(world: World, s: GrindstoneState): void {
  s.phase = "fade";
  s.phaseBeat = world.beat;
  s.jars = 0;
  s.stirred = false;
  openSlow(world, world.cfg.grindstoneFadeBeats, "hold");
  world.events.push({ type: "grindstoneFade", col: midCol(world.cfg) });
  stillHeld(world, s);
}

/**
 * A beat of the fade: done once its beats and any jars are spent, which the
 * caller snaps free; otherwise a fresh beat to be stirred, and a pad still
 * down stirs it at once.
 */
export function stepFade(world: World, s: GrindstoneState, since: number): boolean {
  if (since >= world.cfg.grindstoneFadeBeats + s.jars) return true;
  s.stirred = false;
  stillHeld(world, s);
  return false;
}

/** A grind or a pad on side `side` while the grind dies out: the first this beat jars the caliper. */
export function grindstoneStirred(world: World, s: GrindstoneState, side: 0 | 1): void {
  if (s.phase !== "fade" || s.stirred || s.jars >= world.cfg.grindstoneFadeJars) return;
  s.stirred = true;
  s.jars += 1;
  const since = world.beat - s.phaseBeat;
  openSlow(world, world.cfg.grindstoneFadeBeats + s.jars - since, "hold");
  world.events.push({ type: "grindstoneJar", side, col: midCol(world.cfg) });
}

function stillHeld(world: World, s: GrindstoneState): void {
  for (const side of [0, 1] as const) {
    if (s.padsDown[side] !== 0) grindstoneStirred(world, s, side);
  }
}
