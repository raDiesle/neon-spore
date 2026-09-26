import { midCol } from "./config.js";
import {
  halterBoss,
  halterGuarding,
  halterLitStep,
  halterPairing,
  halterResters,
  halterSeatIndex,
  halterSettled,
} from "./halter.js";
import { halterSeal } from "./halter-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Every command either seat sends while THE HALTER is up — **all of them**,
 * which no other hand in the game hears.
 *
 * `RestraintGate` is a count of beats with nothing in them, so what it has to
 * hear is *anything*: a drag, a press, the cannon slid, a colour primed. Each
 * one zeroes its seat's rest and marks the beat it arrived in as not counted
 * (`halter-step.ts`). Nothing is read from the command but whose it was,
 * except a chord's grip.
 *
 * **The chord is THE TRIVET's reading** (`trivet-hand.ts`): `halterChordLeft`
 * and `halterChordRight`, `on` the thumb down and a lift the thumb up, kept
 * as a mask a seat. Either seat's are heard, whatever the step — the grips a
 * seat holds when a step lights are counted from its first beat.
 *
 * What is heard here is the instant the beat cannot see: **the pair coming
 * apart** while it held. Both counts go back to nought, a guard shuts the
 * plating, and the sound says which half failed — the rester startled, or the
 * chord slipped. A rester who was settled and stirs before the chord arrived
 * is startled too, and costs only its own count.
 */
export function halterHeard(world: World, player: 1 | 2, command: Command): void {
  const s = halterBoss(world);
  if (s === null) return;
  const i = halterSeatIndex(player);
  const pairWas = halterPairing(world, s);
  const settledWas =
    halterLitStep(s)?.ask !== "fire" &&
    halterResters(s).includes(player) &&
    halterSettled(world, s, player);
  s.restBeats[i] = 0;
  s.stirred[i] = true;
  const chord = chordBit(command);
  if (chord !== 0 && command.kind === "drag") {
    s.grips[i] = command.on ? s.grips[i] | chord : s.grips[i] & ~chord;
  }
  const col = midCol(world.cfg);
  if (pairWas !== null && halterPairing(world, s) === null) {
    s.heldBeats = 0;
    s.restBeats = [0, 0];
    halterSeal(world, s);
    const type = player === pairWas ? "halterStartle" : "halterSlip";
    world.events.push({ type, seat: player, col });
    return;
  }
  // In a guard either seat may chord, so a settled seat taking a grip there
  // is choosing its half rather than giving its rest away.
  if (settledWas && !(chord !== 0 && halterGuarding(s))) {
    world.events.push({ type: "halterStartle", seat: player, col });
  }
}

/** The grip a command is on, as its bit in the chord's mask; nought for anything else. */
function chordBit(command: Command): number {
  if (command.kind !== "drag") return 0;
  if (command.target === "halterChordLeft") return 1;
  if (command.target === "halterChordRight") return 2;
  return 0;
}
