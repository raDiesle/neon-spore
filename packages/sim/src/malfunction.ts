import { fire } from "./bullets.js";
import { stepChoke } from "./choke.js";
import { faultEvery, faultFiresThisBeat, faultStepIn } from "./fault-clock.js";
import { faultsNow, type PlacedFault } from "./fault-placed.js";
import { isHarpoonKind } from "./harpoon.js";
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
 * **There was a sixth, `leak`, and the owner took it off this list on 15
 * September 2026.** THE LEAK is the wave where the cannon lobe will not hold a
 * charge: every button works, a tap is the bolt it always was, and what is
 * gone is the **hold**. That is not a fault. A fault is a control the pair
 * have and cannot trust, which is why every one above is aimed somewhere
 * harmless by the seat that still works; a gesture the panel never offered is
 * nothing to aim. So it became a rung — STANDARD 5, the full panel whose hold
 * fills nothing (`content/src/control-sets-table.ts`) — and with it went every
 * wave before THE LANCE, which used to be played on a panel carrying a weapon
 * nothing had taught. Nothing in this file acts on it any more and `lance.ts`
 * reads one field of the world.
 */
export const MALFUNCTION_KINDS = [
  "cannon",
  "shield",
  "steer",
  "codex",
  "handover",
  // **THE LEECH and THE LIMPET**, and they are the first two faults that put a
  // *body* on the field. Everything above takes a control away or changes what
  // it means; these two fire something at one and leave it there, and the
  // answer is neither to aim the fault somewhere harmless nor to press
  // differently but to **keep the control moving** (`harpoon.ts`). The owner
  // asked for both by name on 14 September 2026.
  "leech",
  "limpet",
  // **THE FLIP**, and it is the first fault that breaks nothing at all — no
  // button, no meaning, no panel. What it takes is the agreement between the
  // two screens: one seat's field is drawn about its middle and everything in
  // it is really in the mirrored column, so a column said out loud has to be
  // turned around by whoever is holding the turned picture. Its seat is
  // authored and hashed, and `flip.ts` is why it lives in the simulation at
  // all.
  "flip",
  // **THE DARK**: the field above the ship goes out on both screens, and a
  // finger from either seat lights the squares under it for two beats. It
  // swallows nothing — THE FLIP's kind again, where what has gone is the
  // picture — and the light is a command, so both screens show it (`dark.ts`).
  "dark",
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
  | { kind: "leech" }
  | { kind: "limpet" }
  | { kind: "dark" }
  /**
   * THE HANDOVER. It used to be the one fault an author wrote numbers on —
   * `at`, `beats` and `every`, because it was the only one that had ever
   * needed to say *when*. Every fault is placed on beat rows now
   * (`fault-placed.ts`), so `at` and `beats` are the placement's and a wave
   * that wants the panels traded three times places it three times. The owner
   * asked for that on 14 September 2026, and it is the same answer he gave on
   * the 13th about this fault, generalised to all five.
   */
  | { kind: "handover" }
  /**
   * THE FLIP, and the `seat` is the whole of what an author writes: **which
   * screen is turned**, never both (`flip.ts`). It is on the fault rather than
   * derived from the wave for THE MINE's reason — which seat is blind is the
   * author's decision, not a property of the thing on the field.
   */
  | { kind: "flip"; seat: 1 | 2 };

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
  // **Any of them**, not the one. A wave may place several and they may
  // overlap; a press is swallowed if a single fault in force this beat takes
  // it (`fault-placed.ts`).
  return faultsNow(world).some((m) => eats(m, c));
}

/** Whether one fault in force eats this press. */
function eats(m: Malfunction, c: Command): boolean {
  // `prime` as well as `fire`: the trigger is a hold now, so a lobe a cannon
  // fault has taken over is pressed as a `prime` and would otherwise fill and
  // fire a lance out of a button the panel is drawing dead (`lance.ts`).
  if (m.kind === "cannon") return c.kind === "fire" || c.kind === "prime";
  // The strip, the swipe on the hull and the wire are all one door to the
  // cannon's column, and under THE CHOKE that door is shut.
  if (m.kind === "steer") return c.kind === "cannonCol";
  // THE LEECH and THE LIMPET must not swallow the strip in particular: moving
  // it is the whole answer to them.
  // The last five swallow nothing at all, and in all five that is the fault:
  // every button works and answers the thumb, and what has changed is what it
  // means (`codex.ts`), whose screen it is on (`handover.ts`), what standing
  // still now costs (`harpoon.ts`), or where the field really is (`flip.ts`).
  if (m.kind === "codex" || m.kind === "handover" || isHarpoonKind(m.kind)) return false;
  if (m.kind === "flip" || m.kind === "dark") return false;
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
export function malfunctionColor(world: World, m: PlacedFault): Color {
  if (m.kind !== "cannon") return "red";
  if (m.color !== "alternating") return m.color;
  // The fault's own beat and not the wave's: a gun placed at beat 10 opens on
  // red like one placed at beat 0 (`fault-clock.ts` `faultStepIn`).
  const step = faultStepIn(world, m.at);
  return Math.floor(step / faultEvery(world)) % 2 === 0 ? "red" : "cyan";
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
  for (const m of faultsNow(world)) actOn(world, m);
}

/** One fault in force, on the beat. */
function actOn(world: World, m: PlacedFault): void {
  // The last five act on no beat of their own. THE CODEX does what it does at
  // the moment a bolt meets a body, THE HANDOVER does it in render/ and in a
  // host, THE FLIP is a picture and nothing else (`flip.ts`), and the two
  // harpoons are watched every *tick* rather than every beat — a count of a
  // beat and a half cannot be judged on the beat (`stepHarpoons`).
  if (m.kind === "codex" || m.kind === "handover" || isHarpoonKind(m.kind)) return;
  if (m.kind === "flip" || m.kind === "dark") return;
  if (m.kind === "steer") {
    stepChoke(world);
    return;
  }
  if (!faultFiresThisBeat(world, m.at)) return;
  if (m.kind === "cannon") fire(world, malfunctionColor(world, m));
  else armShield(world);
}
