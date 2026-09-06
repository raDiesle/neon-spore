import { fire } from "./bullets.js";
import { armShield } from "./hull-guard.js";
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

/** Which control is broken. Two, because the field has two strips. */
export const MALFUNCTION_KINDS = ["cannon", "shield"] as const;
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
export type Malfunction = { kind: "cannon"; color: MalfunctionColor } | { kind: "shield" };

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
  if (m.kind === "cannon") return c.kind === "fire";
  return c.kind === "guard";
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
  const every = Math.max(1, Math.round(world.cfg.malfunctionEveryBeats));
  if (faultStep(world) % every !== 0) return;
  if (m.kind === "cannon") fire(world, malfunctionColor(world, m));
  else armShield(world);
}
