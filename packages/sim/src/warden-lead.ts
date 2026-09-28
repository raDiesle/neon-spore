import type { WardenState } from "./boss-state.js";
import { hullRow, ticksPerBeat } from "./config.js";
import { chargeDueTick, chargePartTicks } from "./shot-charge.js";
import { wardenPupilStep } from "./warden.js";
import { wardenPhase } from "./warden-cycle.js";
import { MILLI, type World } from "./world.js";

/**
 * **Where THE WARDEN's pupil will be when a shot pressed now reaches it** —
 * the lead a pair gives a walking eye.
 *
 * The pupil takes a step every beat (`warden.ts`), and a bolt is most of a
 * beat on its way up: at the defaults eleven rows at twelve a beat. On the
 * game's half-beat grid (`shotChargeBeats`, `shot-charge.ts`) the shot also
 * waits in the muzzle for the next point, so a press the moment the eye opens
 * leaves on the half and arrives after the pupil has walked on — every shot a
 * `reject` on the rim, which is what AUTO was doing in `bun run frames` while
 * the headless hand, with no grid, happened to land just in time.
 *
 * Nothing here is more than the pair can see: the pupil walks one way at a
 * steady step and turns at the rim, and "one ahead, it's going right" is a
 * sentence the pilot says. So the look ahead is the walk itself
 * (`wardenPupilStep`), taken once for every beat that starts between now and
 * the landing — and none while a thumb pins it or GLARE stares.
 */

/** The tick a shot pressed on this one leaves the muzzle: now, or the grid's next point. */
function leavesTick(world: World): number {
  if (world.charge !== null) return world.tick + world.charge.left;
  if (chargePartTicks(world.cfg) === 0) return world.tick;
  return chargeDueTick(world.cfg, world.tick);
}

/** The tick a shot pressed now reaches a body standing on `row`. */
export function shotLandsTick(world: World, row: number): number {
  const cfg = world.cfg;
  const stepMilli = Math.round((cfg.bulletTilesPerBeat * MILLI) / ticksPerBeat(cfg));
  const climb = (hullRow(cfg) - 1 - row) * MILLI - Math.round(cfg.hitHeightMilli / 2);
  return leavesTick(world) + Math.ceil(Math.max(0, climb) / Math.max(1, stepMilli));
}

/**
 * The column the pupil stands on at `tick`, a tick at or after now, from the
 * walk as it stands. The body's own column where the body has gone.
 */
export function wardenPupilAt(world: World, b: WardenState, tick: number): number {
  const body = world.creatures.find((c) => c.id === b.creatureId);
  if (body === undefined || b.eyeHeld) return b.pupilCol;
  const tpb = ticksPerBeat(world.cfg);
  const beats = Math.floor(tick / tpb) - Math.floor(world.tick / tpb);
  const step = wardenPhase(b.plates).drift;
  let col = b.pupilCol;
  let dir = b.pupilDir;
  for (let i = 0; i < beats; i++) [col, dir] = wardenPupilStep(body.col, col, dir, step);
  return col;
}

/**
 * How near a beat a landing is too near to call: the walk and the bolt share
 * the tick, and a lead worked out that close to the step is a coin toss.
 */
export const WARDEN_LEAD_MARGIN_TICKS = 4;

/**
 * Where to put the cannon for a shot pressed now, or `null` when a shot
 * pressed now lands too near the pupil's next step to say which side of it.
 */
export function wardenLeadCol(world: World, b: WardenState): number | null {
  const body = world.creatures.find((c) => c.id === b.creatureId);
  if (body === undefined) return null;
  const lands = shotLandsTick(world, body.row);
  const tpb = ticksPerBeat(world.cfg);
  const off = lands % tpb;
  const near = Math.min(off, tpb - off);
  if (!b.eyeHeld && wardenPhase(b.plates).drift !== 0 && near < WARDEN_LEAD_MARGIN_TICKS) {
    return null;
  }
  return wardenPupilAt(world, b, lands);
}
