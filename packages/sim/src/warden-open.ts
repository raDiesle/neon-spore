import type { WardenState } from "./boss-state.js";
import { pullIsTaut, pullOpenMilli } from "./handle-pull.js";
import { NO_TETHER, wardenPhase } from "./warden-cycle.js";
import type { World } from "./world.js";

/**
 * **Whether THE WARDEN's eye shows, and how far** — one place, read by the
 * shot (`bullet-hit-boss.ts`), the picture and the cues, because the three
 * phases answer it three ways and a rule spelled out at every call site would
 * drift apart (`docs/spec/bosses.md` §11.4, *Three phases, three gestures*).
 *
 * - Under **WATCH** the hatch is the rope: taut is open.
 * - Under **NARROW** the hatch is still the rope, but the lids behind it are
 *   player 2's thumb: the eye shows only while the line is taut **and** the
 *   thumb is down. Either lifted and it is shut.
 * - Under **GLARE** there is no line. The hatch is thrown by a swipe and
 *   stays open for `wardenThrowBeats`, then slams; the lids are wide the
 *   whole time, because the eye is glaring.
 *
 * Nothing here eases, lags or rounds: the openness is player 2's readout of a
 * hand they cannot see, and under NARROW it is player 1's readout of one too
 * (`handle-pull.ts`).
 */

/** Whether the hatch stands thrown open this beat, under GLARE. */
export function wardenThrown(world: World, b: WardenState): boolean {
  return b.throwBeat >= 0 && world.beat < b.throwBeat + world.cfg.wardenThrowBeats;
}

/** Whether the core is exposed this instant: the only window a shot counts in. */
export function wardenEyeOpen(world: World, b: WardenState): boolean {
  switch (wardenPhase(b.plates).asks) {
    case "pull":
      return tautLine(world, b);
    case "hold":
      return tautLine(world, b) && b.eyeHeld;
    case "throw":
      return wardenThrown(world, b);
  }
}

function tautLine(world: World, b: WardenState): boolean {
  if (b.tetherId === NO_TETHER) return false;
  return pullIsTaut({ x: b.pullMilli, y: b.pullYMilli }, world.cfg.wardenTautMilli);
}

/**
 * How far open the hatch stands, 0..1000. The rope's tension while there is a
 * rope; all or nothing under GLARE, because a thrown door has no degrees.
 */
export function wardenHatchMilli(world: World, b: WardenState): number {
  if (wardenPhase(b.plates).asks === "throw") return wardenThrown(world, b) ? 1000 : 0;
  return pullOpenMilli({ x: b.pullMilli, y: b.pullYMilli }, world.cfg.wardenTautMilli);
}

/**
 * How far the lids behind the hatch are parted, 0..1000. They follow the
 * hatch under WATCH — one number drawn twice, as it was built — and are
 * player 2's thumb under NARROW: shut until it lands, wide while it stays.
 * Wide under GLARE.
 */
export function wardenLidsMilli(world: World, b: WardenState): number {
  switch (wardenPhase(b.plates).asks) {
    case "pull":
      return wardenHatchMilli(world, b);
    case "hold":
      return b.eyeHeld ? 1000 : 0;
    case "throw":
      return 1000;
  }
}
