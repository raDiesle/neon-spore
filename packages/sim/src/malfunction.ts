import { fire } from "./bullets.js";
import { ticksPerBeat } from "./config.js";
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
 * **The other seat is not a spectator, it is the brake.** The seat whose
 * control broke gets one lobe back in its place — the relief — and a tap on it
 * holds the fault off for `reliefPauseBeats`. It is on the *broken* seat
 * deliberately: the seat that can still move has both hands full of a column,
 * and a brake either of them could reach would be a brake nobody has to ask
 * for. As it stands the crossing is a sentence — *hold it, I am going
 * through* — which is the only kind of coupling this game has ever wanted.
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

/** No relief has been pressed. Far enough back that every window is shut. */
export const NO_RELIEF = -1_000_000;

/**
 * Whose lobe the relief is. The seat whose control broke, which is the seat
 * that is **not** holding a strip this wave — see the header.
 *
 * One function, because three places ask it and each of them would otherwise
 * spell out the same ternary: the panel that draws the lobe, the hit test that
 * answers it, and `reliefHeard` below, which is the only one that matters.
 */
export function reliefSeat(m: Malfunction): 1 | 2 {
  return m.kind === "cannon" ? 2 : 1;
}

/** Ticks one tap of the relief buys. */
function pauseTicks(world: World): number {
  return Math.round(world.cfg.reliefPauseBeats * ticksPerBeat(world.cfg));
}

/** Ticks from one answered press to the next. */
function restTicks(world: World): number {
  return Math.round(world.cfg.reliefRestBeats * ticksPerBeat(world.cfg));
}

/**
 * Whether the fault is being held off right now — the one place it is decided.
 *
 * `stepMalfunction` reads it to know whether to act, the panel reads it to
 * know whether to draw the dead controls quiet, and the button's own glow
 * reads it to say how much of the pause is left. Three readings of one window,
 * the way `guardArmed` is one window read by four things.
 */
export function reliefHolds(world: World): boolean {
  return world.tick - world.reliefTick < pauseTicks(world);
}

/**
 * Whether a press would be answered. False for the whole rest, pause included,
 * so a thumb never buys a pause that was already running — which would make
 * the quiet arbitrarily long and the mechanic nothing at all.
 */
export function reliefReady(world: World): boolean {
  return world.malfunction !== null && world.tick - world.reliefTick >= restTicks(world);
}

/**
 * How much of the rest is still to run, 0..1, for the button to show.
 *
 * Read off the world every frame rather than eased, for the reason THE
 * FLEET's salvo rest is: it is the seat's only readout of whether the next
 * press will do anything, and a button that lied about that for a quarter of a
 * beat would lie at exactly the moment somebody is deciding to call a crossing.
 */
export function reliefRest(world: World): number {
  if (world.malfunction === null) return 0;
  const rest = restTicks(world);
  if (rest <= 0) return 0;
  return Math.max(0, Math.min(1, (rest - (world.tick - world.reliefTick)) / rest));
}

/**
 * A thumb on the relief. Which seat may send it is checked here rather than in
 * `applyCommand`, the way every round's own rule is: the command says what was
 * pressed, and whose press counts is the mechanic's business.
 */
export function reliefHeard(world: World, player: 1 | 2): void {
  const m = world.malfunction;
  if (m === null || player !== reliefSeat(m)) return;
  if (!reliefReady(world)) return;
  world.reliefTick = world.tick;
  world.events.push({ type: "relief", player, beats: world.cfg.reliefPauseBeats });
}

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
  if (m === null || reliefHolds(world)) return;
  const every = Math.max(1, Math.round(world.cfg.malfunctionEveryBeats));
  if (faultStep(world) % every !== 0) return;
  if (m.kind === "cannon") fire(world, malfunctionColor(world, m));
  else armShield(world);
}
