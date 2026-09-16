import { reachesShip } from "./ship-verbs.js";
import type { Command } from "./types.js";

/**
 * THE STARE: a thing in the sky that looks at one of you, and whatever it
 * catches the hull pays for.
 *
 * The wave underneath is an ordinary wave — the hull, the cannon, the shield
 * and whatever its author sent down the columns. What this boss adds is a
 * clock nobody controls. The eye is turned away, then it **turns** — four
 * beats of warning, and that turn is the whole fairness of it — and then it
 * **looks**, at one seat, for a span that grows every time. A watched seat
 * that presses anything while it is being looked at breaks the hull, and a
 * broken hull is the wave lost (`wave-fail.ts`).
 *
 * **It looks at one of you, and the other one is told.** Which seat the eye
 * has chosen is rolled from the seeded rng when the turn begins and is shown
 * on the *other* seat's screen — the one that is not about to be frozen. That
 * is `docs/spec/structure.md`'s randomness rule kept exactly: what is random
 * is what one player knows and the other does not, so the four beats of
 * warning are four beats in which somebody has to say **it is you**. A pair
 * that says nothing has a fifty-fifty chance and a hull that pays for it.
 *
 * **The seat that is not watched plays on.** It is not a pause: rocks keep
 * falling and the wave keeps its own clock, so a look is one player holding
 * the field alone while the other sits on their hands. That is the difference
 * between this boss and a cutscene, and it is why the away window is long
 * enough to get ahead in.
 *
 * **It is not the whole wave** (`bossFillsWave`): THE VANE and THE WELL bend
 * what a wave sends without being the encounter, and this is the third of
 * them. There is nothing to shoot at — the eye takes no damage, has no plates
 * and cannot be answered. The wave is won the ordinary way, by answering
 * everything its author sent, and lost the two ordinary ways plus this one.
 *
 * The clock is `stare-step.ts` and what it puts into the fingerprint is
 * `stare-hash.ts`. This file is the shape, the questions asked of it, and the
 * one rule that decides what a press costs.
 */

/**
 * The phases, in the order `stare-hash.ts` numbers them by.
 *
 * A list rather than a bare union for `SNAKE_PHASES`' reason: a phase goes
 * into `hashWorld` as its index, so the order is a wire value and a name
 * inserted in the middle would renumber the ones after it.
 */
export const STARE_PHASES = ["away", "turning", "looking", "back"] as const;

/** Where the eye is in its cycle. */
export type StarePhase = (typeof STARE_PHASES)[number];

/** Everything THE STARE remembers between beats. */
export interface StareState {
  kind: "stare";
  phase: StarePhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /**
   * The seat this look is for, rolled when the turn begins.
   *
   * 0 while the eye is away and nothing has been chosen, which is a state the
   * picture needs as much as the simulation does: an eye that already knew who
   * it would look at next would have to draw something, and there is nothing
   * to draw yet.
   */
  watching: 0 | 1 | 2;
  /** How long this look lasts, in beats. Grown by `stareLookGrowBeats` each time. */
  lookBeats: number;
  /** How many looks have landed. The picture counts them and so does the growth. */
  looks: number;
  /**
   * `world.tick` the watched seat was caught pressing something, or -1.
   *
   * A tick and not a beat because a press lands on one: the picture flashes
   * the button that did it, and a beat would put the flash up to three quarters
   * of a second away from the thumb that earned it.
   */
  caughtTick: number;
  /** Which seat was caught, or 0. Said out loud by the picture, so it is stored. */
  caughtPlayer: 0 | 1 | 2;
}

/** Whether the eye is looking at this seat *now*. */
export function stareWatches(stare: StareState, player: 1 | 2): boolean {
  return stare.phase === "looking" && stare.watching === player;
}

/** Whether the eye is looking at all. What the field's own picture dims on. */
export function stareLooking(stare: StareState): boolean {
  return stare.phase === "looking";
}

/**
 * Whether the eye is mid-turn — the warning, and the only part of the cycle
 * with anything to say.
 */
export function stareTurning(stare: StareState): boolean {
  return stare.phase === "turning";
}

/**
 * Beats of warning left before the look lands, or -1 when the eye is not
 * turning.
 *
 * Counted down rather than up, because the sentence it is under is *three
 * beats and it is you*: a number that grew would have to be subtracted from
 * something before it meant anything, and the pair is already talking.
 */
export function stareTellLeft(stare: StareState, beat: number, tellBeats: number): number {
  if (stare.phase !== "turning") return -1;
  return Math.max(0, tellBeats - (beat - stare.phaseBeat));
}

/**
 * **What a watched seat may not do**, and it is every verb that reaches the
 * ship.
 *
 * The owner's rule, in his own words: *when the boss looks at you, you are not
 * allowed to shoot or move or use shield*. So the list is the three he named
 * and everything of the same kind — a strip slid, a trigger, a fill, a mouth,
 * an arm, a hand on the field — because a boss that punished the trigger and
 * not the swipe would be a boss two people learn to play around rather than a
 * boss they have to sit still for.
 *
 * What is **not** here is the host talking to the run rather than a seat
 * talking to the ship: leaving, retrying, the guide's own steps and the ready
 * gate. The list itself is `reachesShip` (`ship-verbs.ts`), since THE BATON
 * forbids a seat the same verbs and two copies of it would drift.
 */
export function stareForbids(c: Command): boolean {
  return reachesShip(c);
}
