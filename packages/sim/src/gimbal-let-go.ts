import { NO_BEARING } from "./bearing.js";
import { midCol } from "./config.js";
import {
  type GimbalRing,
  type GimbalState,
  gimbalAligned,
  gimbalBoss,
  gimbalLettingGo,
  gimbalRingTrue,
  gimbalTurning,
  INNER,
  NO_LET_GO,
  OUTER,
} from "./gimbal.js";
import { shearGimbal } from "./gimbal-step.js";
import type { World } from "./world.js";

/**
 * **THE GIMBAL's let-go**: the one gesture that shears a tooth, and the
 * answer to the owner's *it must match in the exact same moment* (3 October
 * 2026).
 *
 * Bringing both rings true is the half the pair talk their way into; it lights
 * the pair (`gimbalTrue`) and takes nothing off the rim. A tooth goes when
 * **both hands come off a true pair within `gimbalLetGoTicks` of each other**.
 * The first hand off opens the window and its ring is latched where it stands
 * — no drift while the window is open, or a beat landing between two thumbs
 * would decide the shear rather than the thumbs. The second hand off inside
 * the window, with both rings still true, is the shear. The window running
 * out, or the second hand coming off a ring that has slipped, is the slip,
 * billed to the ring that was late or off.
 *
 * A hand put back on before the other lets go closes its own window and costs
 * nothing: thinking better of it is not a fault.
 *
 * The window is ticks rather than beats because a count down said out loud
 * lands in two thumbs a fraction of a second apart, and a beat is most of a
 * second; nothing in the window is judged on the beat (`gimbal-step.ts`).
 */

/** A held hand coming off ring `ring`: opens the window, or closes it. */
export function gimbalLetGo(world: World, s: GimbalState, ring: GimbalRing): void {
  if (!gimbalTurning(s)) return;
  if (!gimbalLettingGo(s)) {
    // The first hand off, and only off a true pair with the other still on —
    // a hand let go of anything else is a ring left to drift home.
    const other = ring === OUTER ? INNER : OUTER;
    if (!gimbalAligned(s, world.beat) || s.handMilli[other] === NO_BEARING) return;
    s.letGoTick = world.tick;
    s.letGoRing = ring;
    return;
  }
  if (ring === s.letGoRing) return;
  const late = world.tick - s.letGoTick > world.cfg.gimbalLetGoTicks;
  if (!late && gimbalAligned(s, world.beat)) {
    closeLetGo(s);
    shearGimbal(world, s);
    return;
  }
  slip(world, s, late ? ring : NO_LET_GO);
}

/** A hand going back on ring `ring`: a window it opened closes, unbilled. */
export function gimbalGrabbed(s: GimbalState, ring: GimbalRing): void {
  if (s.letGoRing === ring) closeLetGo(s);
}

/**
 * Every tick after the hands are heard: a window the second hand has not
 * answered in time is the slip, on the tick it runs out rather than on the
 * next beat, so the red lands while the pair are still saying *now*.
 */
export function stepGimbalLetGo(world: World): void {
  const s = gimbalBoss(world);
  if (s === null || !gimbalLettingGo(s)) return;
  if (world.tick - s.letGoTick <= world.cfg.gimbalLetGoTicks) return;
  slip(world, s, s.letGoRing === OUTER ? INNER : OUTER);
}

/**
 * The let-go missed. `late` names the ring whose hand never came off in
 * time; `NO_LET_GO` says the hands were together and a ring was off its mark,
 * and the event names whichever is. The hold is given back so the drift that
 * follows does not slip the pair a second time on the beat.
 */
function slip(world: World, s: GimbalState, late: number): void {
  closeLetGo(s);
  s.heldBeats = 0;
  world.events.push({
    type: "gimbalSlip",
    col: midCol(world.cfg),
    outer: late === OUTER || (late === NO_LET_GO && !gimbalRingTrue(s, world.beat, OUTER)),
    inner: late === INNER || (late === NO_LET_GO && !gimbalRingTrue(s, world.beat, INNER)),
  });
}

function closeLetGo(s: GimbalState): void {
  s.letGoTick = NO_LET_GO;
  s.letGoRing = NO_LET_GO;
}
