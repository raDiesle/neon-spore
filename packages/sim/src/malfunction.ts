import { fire } from "./bullets.js";
import { stepChoke } from "./choke.js";
import { faultEvery, faultFiresThisBeat, faultStep } from "./fault-clock.js";
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

/**
 * Which control is broken. `cannon` is the trigger, `shield` the guard — and
 * `steer` is the cannon **strip**, THE CHOKE: the one fault that breaks the
 * half that moves. The strip answers nobody and the cannon walks wall to
 * wall a column every `chokeSweepBeats` beats, and player 2 goes on firing
 * from wherever it is. It was a body once, a strand that fell, took the
 * cannon and was tapped off; the owner made it a fault on 12 September 2026
 * — the same kind of thing as the other two, authored on the wave, with the
 * emitter as its cause and no brush — and, like them, it runs the whole wave.
 * Its arithmetic is `choke.ts`, which is the only fault here with enough of it
 * to be worth a file.
 *
 * **`codex` is the fourth and it breaks none of them.** Every fault above takes
 * a control away: the button is on the panel, the pair can see it, and it
 * answers nobody. THE CODEX leaves both colours working and changes **what they
 * mean** — a bolt fired red kills what cyan kills and the other way round — and
 * it is the first fault that is *not announced to the seat it acts on*. The
 * navigator presses red, a red bolt leaves the muzzle, and a cyan body comes
 * apart. What says so is a shimmer across the field and the emitter's beam, and
 * both are drawn on the **pilot's** screen only (`render/codex.ts`), so the one
 * who can see the key cannot fire and the one who fires cannot see it. It turns
 * over every `codexHoldBeats`, so the key is a thing to keep calling rather than
 * a fact to learn once — `alternating`'s argument, one fault along.
 *
 * **`handover` is the fifth and it breaks nothing either.** All four controls go
 * on working; what the fault moves is *which screen each pair of them is on*,
 * for a window in the middle of the wave and then back. It is the first fault
 * that ends before the wave does and the first with no seat of its own — both
 * phones are in the other seat at once — and the whole of it is a clock the two
 * hosts read: `handover.ts` has the argument, and nothing here acts on a beat
 * for it.
 *
 * **`leak` is the sixth, and it takes away a *gesture* rather than a control.**
 * THE LEAK: the cannon lobe will not hold a charge. Both colours answer the
 * thumb and a tap is the bolt it always was; what is gone is the **hold** — the
 * lobe fills nothing, so no lance comes and a column of one colour has to be
 * taken a body at a time (`lance.ts`). It is the first fault that leaves every
 * button on the panel working and still costs the pair a weapon, and the pair
 * find out from the emitter's beam standing on both colours rather than from a
 * button drawn dead: there is nothing dead to draw.
 */
export const MALFUNCTION_KINDS = [
  "cannon",
  "shield",
  "steer",
  "codex",
  "handover",
  "leak",
] as const;
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
  | { kind: "steer" }
  | { kind: "codex" }
  | { kind: "leak" }
  /**
   * THE HANDOVER, and the one fault an author writes numbers on — the owner's
   * answer of 13 September 2026, asked whether the panels trade once or keep
   * trading: **both, defined on the wave, over a period of beat rows.** `at` is
   * the beat the first trade happens on, `beats` how long it holds, `every` the
   * period after which it happens again — absent, once. All three optional and
   * falling back to `config-malfunction.ts` (`handover.ts`).
   */
  | { kind: "handover"; at?: number; beats?: number; every?: number };

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
  // The last three swallow nothing at all, and in all three that is the fault:
  // every button works and answers the thumb, and what has changed is what it
  // means (`codex.ts`), whose screen it is on (`handover.ts`), or what holding
  // one down is worth (`lance.ts`). THE LEAK in particular must not swallow
  // `prime`: the press is what the lift's ordinary bolt is owed from, and a
  // fault that ate it would take the trigger away rather than the beam.
  if (m.kind === "codex" || m.kind === "handover" || m.kind === "leak") return false;
  return c.kind === "guard";
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
  return Math.floor(faultStep(world) / faultEvery(world)) % 2 === 0 ? "red" : "cyan";
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
  // The last three act on no beat of their own. THE CODEX does what it does at
  // the moment a bolt meets a body, THE HANDOVER does it in render/ and in a
  // host, and THE LEAK does it at the moment a thumb asks how full the lobe is;
  // whether any of them is doing it is a function of the wave rather than of
  // state anybody steps (`codexSwapped`, `handedOver`, `lanceLeaks`).
  if (m.kind === "codex" || m.kind === "handover" || m.kind === "leak") return;
  if (m.kind === "steer") {
    stepChoke(world);
    return;
  }
  if (!faultFiresThisBeat(world)) return;
  if (m.kind === "cannon") fire(world, malfunctionColor(world, m));
  else armShield(world);
}
