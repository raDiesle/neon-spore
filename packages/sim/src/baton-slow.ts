import type { BatonState } from "./baton.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * **THE SLOW on THE BATON spans its asks exactly** (`docs/decisions.md` #33,
 * `undertow-slow.ts`' pattern), and there are three: a shell swelling for
 * its strips, the two beads hung for the draw, and the crossing's acts. Each
 * closes on its own clock — the shell stripped or let go, the draw made or
 * run out, the bead dropped or missed — and a handover asks nothing slowly:
 * it is the metronome the whole fight is played at.
 *
 * Read off the state, on every beat and after every press that ends an ask,
 * so a swell left frozen through a draw is only an ask again once the arm is
 * passing, and then only for what is left of it.
 */
export function batonSlow(world: World, b: BatonState): void {
  const cfg = world.cfg;
  let end = -1;
  if (b.stage === "passing" && b.swellSocket >= 0) end = b.swellBeat + cfg.batonSwellBeats;
  else if (b.stage === "merging") end = b.stageBeat + cfg.batonMergeWindowBeats;
  else if (b.stage === "crossing") end = b.stageBeat + cfg.batonFinalBeats;
  if (end > world.beat) openSlow(world, end - world.beat, "ask");
  else closeSlow(world);
}
