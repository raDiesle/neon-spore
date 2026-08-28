import type { WardenState } from "./boss-state.js";
import { gripsCreature } from "./grip.js";
import { NO_SHELL } from "./shell.js";
import { type Creature, WARDEN_COLS } from "./types.js";
import {
  NO_TETHER,
  WARDEN_OPEN_BEATS,
  type WardenControl,
  type WardenPhase,
  wardenClampedControl,
  wardenClampedPlayer,
  wardenColor,
  wardenCycle,
  wardenCycleBeat,
  wardenPhase,
  wardenPullTicks,
  wardenReachBeats,
  wardenRescuer,
} from "./warden-cycle.js";
import type { World } from "./world.js";

/**
 * THE WARDEN's whole choreography: an eye that takes a hand off you.
 *
 * It splits no information — both screens show everything it does — because
 * the Bulb Queen already owns that coupling. What it takes is the *use* of a
 * control: every cycle a line comes out of the rim and freezes one of them,
 * and only the player it is not holding can pull it free, at the cost of their
 * own hand. For those beats there is one working control between two people.
 *
 * Nothing here is random. The alternation, the drift, the colour and the vent
 * all follow from the cycle count, so the fight is the same fight on both
 * devices without a single draw from the rng.
 *
 * `docs/spec/bosses.md` 11.4 is the design; this is only the clock.
 */

/** The tether hanging right now, or null. */
export function wardenTether(world: World): Creature | null {
  const b = world.boss;
  if (b === null || b.kind !== "warden" || b.tetherId === NO_TETHER) return null;
  return world.creatures.find((c) => c.id === b.tetherId) ?? null;
}

/**
 * Which control is frozen right now, or null. Derived from the line still
 * being on the field rather than from a stored flag, so a tether that reached
 * the hull, was torn, or went down with the boss lets go by the same rule
 * three times over instead of by three separate ones remembering to.
 */
export function wardenClamp(world: World): WardenControl | null {
  const b = world.boss;
  if (b === null || b.kind !== "warden") return null;
  if (wardenTether(world) === null) return null;
  return wardenClampedControl(wardenCycle(world.cfg, world.waveBeat));
}

/**
 * Whether this player's hand on this creature is refused. You get no leverage
 * on your own tether: the rescue falls to the other one every cycle, and that
 * is the whole coupling. Asked by `applyCommand` before the grip is taken, so
 * a refused hand never lands rather than landing and doing nothing — the drag
 * on the line is a real effect and it must not be available to the player the
 * line is holding.
 */
export function wardenRefusesGrip(world: World, player: 1 | 2, id: number): boolean {
  const b = world.boss;
  if (b === null || b.kind !== "warden" || id === NO_TETHER || id !== b.tetherId) return false;
  return player === wardenClampedPlayer(wardenCycle(world.cfg, world.waveBeat));
}

/** Whether the core is exposed this instant. The only window a shot counts in. */
export function wardenEyeOpen(world: World, b: WardenState): boolean {
  return b.openBeat !== -1 && world.beat - b.openBeat < WARDEN_OPEN_BEATS;
}

/** How far the hold has got, 0..1000. Read by render/ to draw the line's own progress bar. */
export function wardenPullMilli(world: World, b: WardenState): number {
  const full = wardenPullTicks(world.cfg);
  return Math.min(1000, Math.round((b.pullTicks * 1000) / full));
}

/**
 * One tick of the hold. It lives on the tick counter and not on the beat
 * because the hold accumulates: a thumb that slips for a moment loses that
 * moment and nothing else, which is what `wardenPullBeats` promises.
 */
export function pullTether(world: World): void {
  const b = world.boss;
  if (b === null || b.kind !== "warden") return;
  const tether = wardenTether(world);
  if (tether === null) return;
  const rescuer = wardenRescuer(wardenCycle(world.cfg, world.waveBeat));
  if (!gripsCreature(world, rescuer, tether.id)) return;
  b.pullTicks += 1;
  if (b.pullTicks < wardenPullTicks(world.cfg)) return;
  b.tornBeat = world.beat;
  cutTether(world, b);
  world.events.push({ type: "tetherTorn", col: tether.col, row: tether.row, player: rescuer });
}

/** One beat of the boss. Dispatched from `stepBoss`. */
export function stepWarden(world: World, b: WardenState): void {
  const body = world.creatures.find((c) => c.id === b.creatureId);
  if (body === undefined) return; // The last plate came off; it is gone.
  // A line that reached the hull was taken off the field by `resolveHull`, so
  // the id it left behind names nothing. Clearing it here rather than leaving
  // it to the next attach matters because `resetClock` puts `nextId` back to
  // 1: a stale id is a live id again the moment a run starts over.
  if (b.tetherId !== NO_TETHER && wardenTether(world) === null) cutTether(world, b);
  const cfg = world.cfg;
  const at = wardenCycleBeat(cfg, world.waveBeat);
  const phase = wardenPhase(b.plates);
  const reach = wardenReachBeats(cfg);

  if (at === 0) attach(world, b);
  drift(b, body, phase);
  if (at === reach) openEye(world, b);
  if (at === reach + WARDEN_OPEN_BEATS) ventRock(world, b, phase);
}

/**
 * The line comes out of the rim and takes the cycle's control where it stands.
 * It runs straight down that column from there: no homing and nothing to
 * outrun, so the column the pair will be stuck in is one they chose a cycle
 * earlier.
 */
function attach(world: World, b: WardenState): void {
  // Anything still hanging from the last cycle goes with it. One line at a
  // time, or "whose turn it is to be helpless" stops having an answer.
  cutTether(world, b);
  b.tornBeat = -1;
  b.openBeat = -1;
  b.eyeSpent = false;
  const cycle = wardenCycle(world.cfg, world.waveBeat);
  const control = wardenClampedControl(cycle);
  const col = control === "cannon" ? world.cannonCol : world.shieldCol;
  const id = world.nextId++;
  world.creatures.push({
    id,
    kind: "tether",
    col,
    row: world.cfg.wardenRow,
    fromRow: world.cfg.wardenRow,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    throbOpen: false,
    shell: NO_SHELL,
  });
  b.tetherId = id;
  world.events.push({ type: "tether", col, control, color: wardenColor(cycle) });
}

/** The line off the field and the hold spent, however it ended. */
function cutTether(world: World, b: WardenState): void {
  if (b.tetherId === NO_TETHER) return;
  const id = b.tetherId;
  b.tetherId = NO_TETHER;
  b.pullTicks = 0;
  world.creatures = world.creatures.filter((c) => c.id !== id);
}

/**
 * The pupil slides a column or two a beat, back and forth inside the rim, so
 * the column that matters changes while the body does not.
 *
 * It keeps sliding through the opening on purpose. The two beats the core is
 * exposed are too few to find a column in across a voice delay, so the aim has
 * to be a prediction agreed on beforehand — freeze the pupil for the window
 * and the drift stops meaning anything at all.
 */
function drift(b: WardenState, body: Creature, phase: WardenPhase): void {
  const lo = body.col;
  const hi = body.col + WARDEN_COLS - 1;
  let col = b.pupilCol + b.pupilDir * phase.drift;
  if (col < lo || col > hi) {
    b.pupilDir = b.pupilDir === 1 ? -1 : 1;
    col = b.pupilCol + b.pupilDir * phase.drift;
  }
  b.pupilCol = Math.max(lo, Math.min(hi, col));
}

/**
 * The rim's recoil snaps the pupil wide and the core stands in it — but only
 * for a cycle whose line was torn in time. A late pull still saves the hull;
 * it just opens nothing, which is what makes a late pull a trade rather than
 * a mistake.
 */
function openEye(world: World, b: WardenState): void {
  if (b.tornBeat === -1) return;
  b.openBeat = world.beat;
  b.eyeSpent = false;
  world.events.push({
    type: "eyeOpen",
    col: b.pupilCol,
    color: wardenColor(wardenCycle(world.cfg, world.waveBeat)),
  });
}

/**
 * The iris shuts and squeezes one rock out of the column it shut on, torn or
 * not. At a plain meteor's speed that rock takes exactly one cycle to reach
 * the hull, so it arrives on the vent beat of the *following* cycle — during
 * the next clamp, which on half the cycles is the shield's. The shield has to
 * be parked in the vent's column before it is taken, and that is planned out
 * loud a cycle ahead.
 */
function ventRock(world: World, b: WardenState, phase: WardenPhase): void {
  world.creatures.push({
    id: world.nextId++,
    kind: phase.vent,
    col: b.pupilCol,
    // Drawn full size behind the closing iris and emerging as the aperture
    // crosses it, so no glide in from above the field: it is squeezed out.
    row: world.cfg.wardenRow,
    fromRow: world.cfg.wardenRow,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    throbOpen: false,
    shell: NO_SHELL,
  });
  world.events.push({ type: "vent", col: b.pupilCol, kind: phase.vent });
}
