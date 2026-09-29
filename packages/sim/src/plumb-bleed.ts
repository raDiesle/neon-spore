import { midCol } from "./config.js";
import type { PlumbState } from "./plumb.js";
import { openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * **THE PLUMB's bleed** (§31 row 11): the last shot is in, and the spent
 * core's light runs down the chains for `plumbBleedBeats` while both stones
 * are left alone — after ten beats of pulling and firing, the fight's last
 * beat asks the pair to let go. THE KEEL's cooldown (`keel-story.ts`) is the
 * same shape.
 *
 * **A pull draws the light back up**, and the bleed takes a beat longer, at
 * most `plumbBleedFlares`. It costs a beat, not a pull: a thumb dragging
 * through one beat sends a command every frame, and it is the one reflex
 * (`stirred`). A stone still held pulled when a beat turns costs the next one
 * too, so a thumb left on is not free just because it has stopped moving.
 * A lift is a pull of nought and costs nothing.
 *
 * Nothing is lost by it: the core is spent and the wave is won either way.
 * What the bleed asks for is the pair's hands, and all it can do is wait.
 */

/** The script is done: the spent core's light starts down the chains, under THE SLOW. */
export function openBleed(world: World, s: PlumbState): void {
  s.phase = "bleed";
  s.phaseBeat = world.beat;
  s.flares = 0;
  s.stirred = false;
  openSlow(world, world.cfg.plumbBleedBeats, "ask");
  world.events.push({ type: "plumbBleed", col: midCol(world.cfg) });
  stillPulled(world, s);
}

/**
 * A beat of the bleed: done once its beats and any flares are spent, which
 * the caller swings free; otherwise a fresh beat to be stirred, and a stone
 * still pulled stirs it at once.
 */
export function stepBleed(world: World, s: PlumbState, since: number): boolean {
  if (since >= world.cfg.plumbBleedBeats + s.flares) return true;
  s.stirred = false;
  stillPulled(world, s);
  return false;
}

/** A pull on side `side`'s stone while the light bleeds: the first this beat draws it back up. */
export function plumbStirred(world: World, s: PlumbState, side: 0 | 1): void {
  if (s.phase !== "bleed" || s.stirred || s.flares >= world.cfg.plumbBleedFlares) return;
  s.stirred = true;
  s.flares += 1;
  const since = world.beat - s.phaseBeat;
  openSlow(world, world.cfg.plumbBleedBeats + s.flares - since, "ask");
  world.events.push({ type: "plumbFlare", side, col: midCol(world.cfg) });
}

function stillPulled(world: World, s: PlumbState): void {
  for (const side of [0, 1] as const) {
    if (s.pullMilli[side] !== 0) plumbStirred(world, s, side);
  }
}
