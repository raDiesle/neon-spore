import { fire } from "./bullets.js";
import { clampCol } from "./config-derived.js";
import { armShield } from "./hull-guard.js";
import { spillPrime } from "./lance.js";
import type { Color, Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MALFUNCTION: a wave in which one of the two seats does not have its
 * control any more — the control has it.
 *
 * Everything else that takes a control away takes it away *from both of them*
 * and leaves the field alone: THE MIRROR locks the whole panel for a few beats
 * while it presents, and the standard ladder simply has not handed a button
 * out yet. This is the third thing, and it is the opposite of both: the button
 * is on the panel, the pair can see it, and it fires without being asked.
 *
 * **The broken half is never the half that moves.** A cannon malfunction takes
 * the two colours off player 2 and leaves player 1 sliding the cannon; a
 * shield malfunction takes the trigger off player 1 and leaves player 2
 * sliding the plate. So the seat that still has a strip has to *aim the fault
 * somewhere harmless* — which is the whole reason the mechanic exists, and why
 * it is written for the two creatures whose answer is "not here": THE LURE, on
 * which a shot is the mistake.
 *
 * **There is no brake, and that is the owner's decision.** The seat whose
 * control broke used to get one lobe back in its place — a relief, two words
 * on a face that fits nine characters — and on 6 September 2026 he took it
 * out: he did not want the button. So a fault runs for the whole wave and the
 * only answer to it is where the other seat stands. That is a harder wave and
 * a plainer one: the seat that can still move has to aim the fault somewhere
 * harmless every beat rather than buy two beats of quiet at the moment of a
 * crossing.
 *
 * **It is the wave's, not the panel's.** `packages/content/src/control-sets.ts`
 * is emphatic that a set is a whole panel and that sets do not compose, and a
 * malfunction is not a counter-example: the buttons are the ones the set
 * names, in the places the set puts them. What has changed is what pressing
 * one *does*, which is a fact about the wave — so it sits on `Wave` beside
 * `boss` and `controls`, and `startWave` installs it the way it installs a
 * boss.
 */

/**
 * Which control is broken. `cannon` is the trigger, `shield` the guard — and
 * `steer` is the cannon **strip**, THE CHOKE: the one fault that breaks the
 * half that moves. The strip answers nobody and the cannon walks wall to
 * wall a column every `chokeSweepBeats` beats, and player 2 goes on firing
 * from wherever it is. It was a body once, a strand that fell, took the
 * cannon and was tapped off; the owner made it a fault on 12 September 2026
 * — the same kind of thing as the other two, authored on the wave, with the
 * emitter as its cause and no brush — and, like them, it runs the whole wave.
 */
export const MALFUNCTION_KINDS = ["cannon", "shield", "steer"] as const;
export type MalfunctionKind = (typeof MALFUNCTION_KINDS)[number];

/**
 * What a runaway cannon loads, and the third answer is the interesting one.
 *
 * A fault that always fired red is a fault the pair can plan around once and
 * then stop thinking about. `alternating` makes the ammunition itself a thing
 * somebody has to call out — the colour changes on the beat, so a body that
 * was safe to be standing over is not safe on the next one, and the number
 * player 1 is reading off the strip has a colour attached to it now.
 */
export const MALFUNCTION_COLORS = ["red", "cyan", "alternating"] as const;
export type MalfunctionColor = (typeof MALFUNCTION_COLORS)[number];

/**
 * A wave's fault. A union rather than a record with an ignored field: a shield
 * that arms itself carries no ammunition, and a `color` on one would be a
 * number an author could set and never see the effect of — the same argument
 * `cell-config.ts` makes about drawing no speed row on a shell.
 */
export type Malfunction =
  | { kind: "cannon"; color: MalfunctionColor }
  | { kind: "shield" }
  | { kind: "steer" };

/**
 * Whether this press falls into a control the fault has taken over.
 *
 * **In the simulation and not in the panel**, which is the whole point of it
 * being here. render/ draws a dead button dead, but a button is not the only
 * way into either of these commands — the ship itself is a second one
 * (`render/src/touch-ship.ts`), a guide's rehearsal is a third, and the wire
 * is a fourth. A rule enforced only where it is drawn is a rule a swipe on the
 * hull walks straight past, and two devices that disagree about whether a shot
 * happened have desynced.
 */
export function faultSwallows(world: World, c: Command): boolean {
  const m = world.malfunction;
  if (m === null) return false;
  // `prime` as well as `fire`: the trigger is a hold now, so a lobe a cannon
  // fault has taken over is pressed as a `prime` and would otherwise fill and
  // fire a lance out of a button the panel is drawing dead (`lance.ts`).
  if (m.kind === "cannon") return c.kind === "fire" || c.kind === "prime";
  // The strip, the swipe on the hull and the wire are all one door to the
  // cannon's column, and under THE CHOKE that door is shut.
  if (m.kind === "steer") return c.kind === "cannonCol";
  return c.kind === "guard";
}

/**
 * How many steps the steered cannon has taken by this beat: none until the
 * wave's second beat, then one every `chokeSweepBeats`.
 */
function steerSteps(world: World): number {
  const every = Math.max(1, Math.round(world.cfg.chokeSweepBeats));
  return Math.floor(faultStep(world) / every);
}

/**
 * **Where the steered cannon stands after `steps` steps**, and no state
 * behind it. `startWave` puts the cannon in the middle of every wave, and
 * from there the walk is a triangle wave: right to the wall, back to the
 * other, and again — a function of the wave's beat, so nothing is added to
 * the world or the hash. Away from the nearer wall first is what the middle
 * gives for free: the first thing the pair sees is the cannon leaving.
 */
export function steerCol(cols: number, steps: number): number {
  const last = cols - 1;
  const period = Math.max(1, last * 2);
  const x = (Math.floor(last / 2) + steps) % period;
  return x <= last ? x : period - x;
}

/** Which way the steered cannon steps next, `1` toward the right wall. */
export function steerHeading(world: World): -1 | 1 {
  const cols = world.cfg.cols;
  const steps = steerSteps(world);
  return steerCol(cols, steps + 1) >= steerCol(cols, steps) ? 1 : -1;
}

/** Whether this wave's fault is THE CHOKE — the strip dead, the cannon walking. */
export function steered(world: World): boolean {
  return world.malfunction?.kind === "steer";
}

/**
 * How many beats into the wave a fault is, counted from the first one it acts
 * on rather than from zero.
 *
 * `onBeat` moves `waveBeat` before the fault reads it, so the first beat a
 * wave has is 1 and never 0 — and a sequence counted from 0 would open on the
 * *second* member of itself, which for an alternating cannon means the first
 * shot of the wave is cyan for no reason anybody could name. One subtraction,
 * in one place, read by both of the two things that need it.
 */
function faultStep(world: World): number {
  return Math.max(0, world.waveBeat - 1);
}

/**
 * What the runaway cannon has loaded on this beat.
 *
 * Counted in **steps of the fault** rather than in beats, so an author who
 * lengthens `malfunctionEveryBeats` gets one colour per shot rather than a
 * colour that flips between two shots and is never seen to. `waveBeat` and not
 * `beat`, because the fault belongs to the wave: a pair replaying one meets
 * the same sequence in the same order, and it opens on red.
 */
export function malfunctionColor(world: World, m: Malfunction): Color {
  if (m.kind !== "cannon") return "red";
  if (m.color !== "alternating") return m.color;
  const every = Math.max(1, Math.round(world.cfg.malfunctionEveryBeats));
  return Math.floor(faultStep(world) / every) % 2 === 0 ? "red" : "cyan";
}

/**
 * The fault, on the beat. Called from `step` where the beat is counted, so a
 * runaway control does exactly what the metronome does and nothing else in the
 * tick has to know it exists.
 *
 * A run that is over never reaches it, and neither does a wave still holding
 * its guide — `step` has already returned in both cases. That is inherited
 * from the shape of the tick rather than checked here, the same way
 * `regenerateHull` inherits THE FORK's rule.
 */
export function stepMalfunction(world: World): void {
  const m = world.malfunction;
  if (m === null) return;
  if (m.kind === "steer") {
    const from = world.cannonCol;
    world.cannonCol = clampCol(world.cfg, steerCol(world.cfg.cols, steerSteps(world)));
    if (from !== world.cannonCol && spillPrime(world))
      world.events.push({ type: "lanceSpilled", col: from });
    return;
  }
  const every = Math.max(1, Math.round(world.cfg.malfunctionEveryBeats));
  if (faultStep(world) % every !== 0) return;
  if (m.kind === "cannon") fire(world, malfunctionColor(world, m));
  else armShield(world);
}
