import { type SimConfig, ticksPerBeat } from "./config.js";
import type { Color } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * The shot is laid, not fired.
 *
 * Player 2 presses and, for a moment, nothing leaves. The cannon works — the
 * opening dilates, the skin at the muzzle parts — and then the shot goes.
 * Until now a press *was* a bullet: player 1 saw only the result, never the
 * act, so "I fire on the three" was an announcement rather than something both
 * of them watched happen. A wind-up puts the press on player 1's screen, in
 * the one place he is already looking, and buys the tell THE OTHER HAND buys,
 * for nothing.
 *
 * **The delay lands on the beat, and that is the whole design.** A delay
 * measured in ticks is lag: it moves the shot by an amount nobody can name and
 * makes the trigger feel dead. A delay that lands on the beat is rhythm — it
 * makes "on the three" *literally* true instead of approximately true, which
 * matters because the beat is the one shared clock that survives two seconds
 * of voice delay (docs/spec/latency.md). Player 2 presses somewhere inside the
 * beat before the three; the shot leaves exactly on the three, however her
 * thumb was placed.
 *
 * **Half a beat, not a beat.** `shotChargeBeats` is a grid, and its useful
 * values are the ones that divide a beat; the game runs it at a half. Three
 * reasons, and each of them is a number rather than a taste:
 *
 *  - `fireEveryBeats` is half a beat, so a half-beat grid and the reload gap
 *    coincide exactly and the rate of fire does not change at all. A whole-beat
 *    grid would halve it — the grid is a floor on the rate, because a second
 *    shot cannot leave on a point the first one already left on.
 *  - A Throb's coloured half is square to the cannon for half of every turn,
 *    two beats at `throbSpinBeats`. A half-beat grid puts four departures
 *    inside that window, so a Throb stays answerable; a whole-beat grid halves
 *    them, and a body turning past its window is not a body to hang a wave on.
 *  - At 96 BPM a beat is 625 ms. Half of that is 312 ms at worst and 156 ms on
 *    average, which is anticipation. A whole beat is over half a second of
 *    nothing after a press, which is a dead trigger.
 *
 * **Every beat is a grid point, whatever the value.** The grid is measured
 * from the start of the beat, never from tick 0, and the beat always closes
 * it — see `chargeDueTick`. At the defaults half a beat is 37.5 ticks, so a
 * plain "every 38 ticks" would drift off the beat within two bars and take the
 * entire argument above with it.
 *
 * **Nothing here decays.** A charge leaves or it is thrown away; it is never
 * shortened, lengthened or re-aimed in time. What it *does* follow is the
 * cannon: the column is read when the shot leaves, not when it was laid, so
 * player 1 has to keep holding the column through the wind-up. That is the
 * coupling getting stronger rather than a detail — a shot appearing out of a
 * column the cannon has left would be a shot coming out of nothing, and
 * freezing the column at the press would hand player 2 the aim for half a beat.
 */

/**
 * A shot that has been pressed and has not left the muzzle yet. One object
 * rather than three fields on the world, for the reason `boss` is an object:
 * it is one thing with parts, and every part of it is settled at
 * the press. There is deliberately no column in it — the muzzle's column is
 * read when the shot goes, so a second copy could only ever disagree.
 */
export interface ShotCharge {
  /** Ticks left before it goes. Zero means this tick. */
  left: number;
  color: Color;
  lance: boolean;
}

/**
 * Ticks in one part of a beat — the spacing of the grid a shot may leave on.
 * Zero means there is no grid and a press is a bullet, which is what
 * `DEFAULT_CONFIG` ships so that every replay keeps its exact timing.
 *
 * Capped at a whole beat: a grid coarser than the beat could not contain the
 * beat, and the beat is the point.
 */
export function chargePartTicks(cfg: SimConfig): number {
  const tpb = ticksPerBeat(cfg);
  const ticks = Math.round(cfg.shotChargeBeats * tpb);
  return ticks <= 0 ? 0 : Math.min(ticks, tpb);
}

/**
 * The tick a press on `tick` sends its shot out on: the next grid point
 * *after* it, never the one it is standing on.
 *
 * Strictly after, so the wind-up is never zero — a press that happened to land
 * on the beat would otherwise fire with no tell at all, and the one thing the
 * other player must always get to see is the cannon working.
 *
 * Measured from the start of the beat and clamped to its end, so the beat
 * itself is a grid point for every value of `shotChargeBeats`. A value that
 * does not divide a beat leaves a short last part before the beat rather than
 * walking off it.
 */
export function chargeDueTick(cfg: SimConfig, tick: number): number {
  const tpb = ticksPerBeat(cfg);
  const part = chargePartTicks(cfg);
  if (part === 0) return tick;
  const beatStart = Math.floor(tick / tpb) * tpb;
  const into = tick - beatStart;
  const next = (Math.floor(into / part) + 1) * part;
  return beatStart + Math.min(next, tpb);
}

/** Whether a shot has been pressed and has not left yet. */
export function laying(world: World): boolean {
  return world.charge !== null;
}

/**
 * Take the press. The countdown is worked out here, once, from the grid — so a
 * charge already in the lobe keeps the departure it was promised even if the
 * tuning slider moves `shotChargeBeats` underneath it.
 */
export function layShot(world: World, color: Color, lance: boolean): void {
  const left = chargeDueTick(world.cfg, world.tick) - world.tick;
  world.charge = { left, color, lance };
}

/**
 * Throw the charge away: by a `restart`, and by the release itself once the
 * shot is out. `startWave` nulls the field directly instead of calling this,
 * beside the bullets it is already throwing away in the same breath.
 */
export function endCharge(world: World): void {
  world.charge = null;
}

/**
 * Count this tick off the charge, and say whether the shot goes out on it.
 *
 * A countdown rather than a due tick on purpose: it is only ever stepped from
 * inside a running field, so a world that stops — a briefing card, THE GAUGE,
 * a run that is over — holds the charge exactly where it was,
 * which is what every bullet already in the air does. Nothing has to notice
 * that the clock stood still, because for the charge it did.
 */
export function chargeDue(world: World): boolean {
  const shot = world.charge;
  if (shot === null) return false;
  if (shot.left > 0) {
    shot.left -= 1;
    return false;
  }
  return true;
}

/**
 * How close the shot is to leaving, in thousandths: 0 the tick it was laid,
 * 1000 the tick it goes. render/ draws the opening from this and keeps no
 * second clock of its own — the same rule `primeChargeMilli` follows, and for
 * the same reason: a wind-up counted on the frame rate would have one device's
 * cannon working a frame ahead of the other's.
 *
 * The denominator is the whole part, not this charge's own span, so the
 * opening dilates as the *departure* approaches rather than as the press
 * recedes. A press late in a part starts its wind-up already half open, which
 * is what it should look like — there is less time left.
 */
export function chargeMilli(world: World): number {
  const shot = world.charge;
  if (shot === null) return 0;
  const part = chargePartTicks(world.cfg);
  if (part === 0) return MILLI;
  return Math.max(0, Math.min(MILLI, MILLI - Math.round((shot.left * MILLI) / part)));
}
