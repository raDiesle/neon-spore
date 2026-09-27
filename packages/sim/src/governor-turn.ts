import {
  GOVERNOR_TURN_MILLI,
  governorBoss,
  governorBraked,
  governorDone,
  governorLitStep,
  governorTapping,
} from "./governor.js";
import type { World } from "./world.js";

/**
 * **THE GOVERNOR's needle, turned**, once a tick after the commands are
 * heard, so a pad lifted this tick is already speeding it.
 *
 * On the tick and not the beat, unlike THE BURGEE's flag (`burgee-step.ts`):
 * a mark is crossed in half a beat at 1× and a quarter at 2×, and a needle
 * that jumped a beat's worth at a time would step clean over it on some laps
 * and not others, which is a rule nobody could learn.
 *
 * The speed first, then the turn. `speedMilli` eases back toward 1× while the
 * brake is shut (`governorBraked`) and climbs toward `governorHotMilli` while
 * it is off; the needle then turns the lit tap step's pace, or the idle pace
 * between steps, times it. Spent, it stalls where it is.
 */
export function governorTurned(world: World): void {
  const s = governorBoss(world);
  if (s === null || governorDone(s)) return;
  const cfg = world.cfg;
  s.speedMilli = governorBraked(s)
    ? Math.max(1000, s.speedMilli - cfg.governorEaseMilli)
    : Math.min(cfg.governorHotMilli, s.speedMilli + cfg.governorClimbMilli);
  const pace = governorTapping(s)
    ? (governorLitStep(s)?.paceMilli ?? cfg.governorIdleMilli)
    : cfg.governorIdleMilli;
  const turn = Math.floor((pace * s.speedMilli) / 1000);
  s.needleMilli = (s.needleMilli + turn) % GOVERNOR_TURN_MILLI;
}
