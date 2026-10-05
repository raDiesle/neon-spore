import { nextInt } from "./rng.js";
import { type SinewState, sinewGone } from "./sinew.js";
import type { World } from "./world.js";

/**
 * **THE SINEW's shifting fibre**: one fibre of the fight on which each hand's
 * pull is worth more or less than it was (the owner, 5 October 2026: *every 2
 * seconds the power of pull … is shifting to be reduced or increased … either
 * for p1 or p2 or at the same time in combinations … with some 1 beat
 * announcement for which player and if reducing or increasing*).
 *
 * While `sinewShiftFibre` fibres are parted, every `sinewShiftBeats` beats each
 * hand's **power** is rolled again from three — weak, normal, strong — and
 * the sum is the two pulls *at their power* (`sinewPower`). The thumb has not
 * moved and the number has: a pair holding the zone has to re-say it, one
 * hand easing off as the other's goes weak, on a beat they were warned of.
 *
 * **The roll never stands still**: of the nine pairs of powers, the eight
 * that are not the one in force, so every shift changes one hand at least —
 * sometimes one, sometimes both, sometimes both the same way.
 *
 * **One beat's warning, always**: the beat before a shift the coming powers
 * are rolled and *called* — `callP1Permille`, `callP2Permille`, a
 * `sinewPower` event with `called: true` — and on the shift's beat they are
 * put in force before the sum is read. Nothing else in the fight waits on
 * this clock: a snap, a swing, a catch all run as they always do over it.
 */

/** The three powers a hand can be at, in thousandths of its pull. */
function powers(cfg: World["cfg"]): readonly number[] {
  return [cfg.sinewShiftWeakPermille, 1000, cfg.sinewShiftStrongPermille];
}

/** Whether the fibre now hanging by is the shifting one. */
export function sinewShifting(s: SinewState, cfg: World["cfg"]): boolean {
  return s.fibres > 0 && sinewGone(s, cfg) === cfg.sinewShiftFibre;
}

/**
 * Start the shifting clock, or stop it and put both hands back at their
 * whole pull — at the install and at every part, after the fibre count has
 * moved. The first shift is `sinewShiftBeats` from here, so the slow beats a
 * part is watched at are not spent on a call nobody can act on.
 */
export function seatShift(world: World, s: SinewState): void {
  s.powerP1Permille = 1000;
  s.powerP2Permille = 1000;
  s.callP1Permille = 0;
  s.callP2Permille = 0;
  const beats = Math.max(2, world.cfg.sinewShiftBeats);
  const delay = s.fibres === world.cfg.sinewFibres ? world.cfg.sinewEnterBeats : 0;
  s.shiftBeat = sinewShifting(s, world.cfg) ? world.beat + delay + beats : -1;
}

/**
 * One beat of the clock, from `stepSinew` before the sum is read: the call on
 * the beat before a shift, the shift on its own beat.
 */
export function stepShift(world: World, s: SinewState): void {
  if (s.shiftBeat < 0) return;
  const cfg = world.cfg;
  if (world.beat >= s.shiftBeat) {
    const called = s.callP1Permille > 0;
    if (called) {
      s.powerP1Permille = s.callP1Permille;
      s.powerP2Permille = s.callP2Permille;
    }
    s.callP1Permille = 0;
    s.callP2Permille = 0;
    s.shiftBeat = world.beat + Math.max(2, cfg.sinewShiftBeats);
    // Never a shift nobody was warned of: a beat with no call before it
    // (the clock set by hand, a debug page) only starts the count again.
    if (called) world.events.push(powerEvent(s, false));
    return;
  }
  if (world.beat !== s.shiftBeat - 1 || s.callP1Permille > 0) return;
  const p = powers(cfg);
  const now = p.indexOf(s.powerP1Permille) * 3 + p.indexOf(s.powerP2Permille);
  let pick = nextInt(world.rng, 8);
  if (pick >= now) pick++;
  s.callP1Permille = p[Math.floor(pick / 3)] ?? 1000;
  s.callP2Permille = p[pick % 3] ?? 1000;
  world.events.push(powerEvent(s, true));
}

function powerEvent(s: SinewState, called: boolean) {
  return {
    type: "sinewPower" as const,
    col: s.massCol,
    called,
    p1Permille: called ? s.callP1Permille : s.powerP1Permille,
    p2Permille: called ? s.callP2Permille : s.powerP2Permille,
  };
}
