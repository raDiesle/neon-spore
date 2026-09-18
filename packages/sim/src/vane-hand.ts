import type { VaneState } from "./boss-state.js";
import type { Command } from "./types.js";
import { vanePhase } from "./vane-cycle.js";
import { vanePinned, vanePinSide, vaneSplitCol, vaneTipNow } from "./vane-open.js";
import type { World } from "./world.js";

/**
 * **THE VANE's two hands on the picture**, on the tick: the pilot's thumb that
 * pins the arm and the navigator's haul on the seized housing
 * (`docs/spec/bosses.md` §11.5, *Three phases, three gestures*).
 *
 * **The pin is the pilot's**, and it is the split of VEER. The ends of the
 * sweep stop giving him a window; what gives him one is holding the arm. His
 * thumb lands on it, it stops in the column it was in, the housing splits on
 * the side away from the load — and the fold line stands still for as long as
 * he keeps it there, which is the thing this boss has never let the pair have
 * except for the two beats at each end. He pays for it with the hand he
 * carries the cannon with, so the column he pins in is a column he has to
 * *reach*, and that is the sentence VEER makes him say.
 *
 * **The haul is the navigator's**, and it is the split of SEIZE. The bearing
 * has locked: a pinned arm is no longer an opening, only the chance of one.
 * She carries the housing off it — a lift whose travel is at least
 * `vaneHaulMilli` — and it stands open for the rest of his pin. A housing on a
 * moving arm cannot be hauled at all, so the last pin needs both their hands
 * on the picture and her shot after them.
 *
 * Nothing here can hurt the pair. A thumb lifted early, a haul on a sweeping
 * arm, a shot after the arm tore free — each is a window lost and nothing
 * more, which is what THE VANE is: the boss that attacks nobody and only
 * decides where the wave lands (§11.5).
 */
export function vaneHeard(world: World, player: 1 | 2, command: Command): void {
  const b = world.boss;
  if (b === null || b.kind !== "vane" || command.kind !== "drag") return;
  if (command.target === "vaneArm") armHeard(world, b, player, command.on);
  if (command.target === "vaneHousing") housingHeard(world, b, player, command);
}

function armHeard(world: World, b: VaneState, player: 1 | 2, on: boolean): void {
  if (player !== 1 || vanePhase(b.pins).asks === "shoot") return;
  if (!on) {
    releasePin(world, b);
    return;
  }
  if (vanePinned(world, b)) return;
  // The column first, and then the beat. `vaneTipNow` answers `pinCol` as soon
  // as there is a pin, so a `pinBeat` written before it would hand the arm its
  // own uninitialised column and fold every arrival about -1.
  b.pinCol = vaneTipNow(world, b);
  b.pinBeat = world.beat;
  b.pinSide = vanePinSide(world.waveBeat);
  b.hauled = false;
  world.events.push({ type: "vanePin", col: b.pinCol });
}

function housingHeard(
  world: World,
  b: VaneState,
  player: 1 | 2,
  command: Extract<Command, { kind: "drag" }>,
): void {
  if (player !== 2 || vanePhase(b.pins).asks !== "haul") return;
  // The press says nothing; the haul is the lift, and only one that travelled.
  if (command.on || b.hauled || !vanePinned(world, b)) return;
  if (Math.abs(command.fromYMilli ?? 0) < world.cfg.vaneHaulMilli) return;
  b.hauled = true;
  world.events.push({ type: "vaneHaul", col: vaneSplitCol(world, b) });
}

/**
 * The pin's own clock, on the beat from `stepVane`: an arm held past
 * `vanePinBeats` is torn out of the thumb by the sweep, and the window goes
 * with it. Nothing while nothing is pinned.
 */
export function stepVanePin(world: World, b: VaneState): void {
  if (b.pinBeat < 0 || vanePinned(world, b)) return;
  releasePin(world, b);
}

/** The arm let go: it sweeps on from wherever the cycle has got to, and the
 * housing shuts behind it. One place, because a lift and a tear are the same
 * loss and the pair has to hear them as one sound. */
function releasePin(world: World, b: VaneState): void {
  if (b.pinBeat < 0) return;
  const col = b.pinCol;
  b.pinBeat = -1;
  b.pinCol = -1;
  b.pinSide = 0;
  b.hauled = false;
  world.events.push({ type: "vaneSlip", col });
}
