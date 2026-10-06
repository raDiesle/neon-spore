import { GOVERNOR_TURN_MILLI, governorBoss, governorDone, governorPace } from "./governor.js";
import type { World } from "./world.js";

/**
 * **THE GOVERNOR's needle, turned**, once a tick after the commands are
 * heard.
 *
 * On the tick and not the beat, unlike THE BURGEE's flag (`burgee-step.ts`):
 * a mark is crossed in a fraction of a beat, and a needle that jumped a
 * beat's worth at a time would step clean over it on some laps and not
 * others, which is a rule nobody could learn.
 *
 * It turns the lit step's pace, or the idle pace between steps. Spent, it
 * stalls where it is. The pace does not change while a step is lit, which is
 * what lets a shot be judged by where the needle was when it left the cannon
 * (`governorDownAgo`).
 */
export function governorTurned(world: World): void {
  const s = governorBoss(world);
  if (s === null || governorDone(s)) return;
  s.needleMilli = (s.needleMilli + governorPace(world, s)) % GOVERNOR_TURN_MILLI;
}
