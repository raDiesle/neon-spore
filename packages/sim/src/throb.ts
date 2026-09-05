import { metColor, missedColor } from "./balance.js";
import { type SimConfig, ticksPerBeat } from "./config.js";
import { removeCreature } from "./field.js";
import { otherColor } from "./kinds.js";
import type { Bullet, Color, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE THROB: a body cut in half down the middle, red on one side and cyan on
 * the other. It turns clockwise the whole way down, so *which trigger* answers
 * it is a fact about **when** rather than about where — and the pair has to
 * say the colour and the moment in one sentence.
 *
 * **It used to swell and shrink on the beat**, open one beat in four and
 * answerable by either colour while it was. That version asked for a count and
 * nothing else; the ammunition was never the question, so the navigator's half
 * of the exchange was "now". The turn puts the colour back into it: the pilot
 * is the one who can see which way round the body is, the navigator is the one
 * holding two triggers, and neither half of that is worth anything alone.
 *
 * **The far half used to be shield plating and is not any more.** Green armour
 * made the turn a window: half of every turn was a body nothing reached, and a
 * pair with the wrong moment had nothing to do but wait. Both halves are live
 * now and each takes its own colour, so the turn never closes the creature —
 * it swaps which of the two triggers is the right one. The exchange is the
 * same shape and there is no dead half of it: player 1 says which colour is
 * round, player 2 presses that one. `throbSpinBeats` came down from four to
 * three at the same time, for the same reason: nothing about the turn shuts
 * the body any more, so a slow one only buys the pair time standing still
 * with the answer already said out loud.
 *
 * **Nothing is stored on the creature.** The spin is a pure function of the
 * shared clock — `world.tick / ticksPerBeat`, which is exactly the
 * `world.beat + beatPhase` render draws on (`apps/game/src/main.ts`) — so both
 * devices and both surfaces read one number and there is no per-body phase to
 * disagree about. The old `Creature.throbOpen` existed because the answer
 * changed on the beat and had to be latched once; an answer that changes every
 * tick and is a function of a hashed counter cannot be latched without
 * becoming a second copy of itself.
 */

/** A whole clockwise turn, in thousandths. What `throbTurnMilli` wraps at. */
export const THROB_TURN_MILLI = 1000;

/**
 * The shared clock the spin is read off: whole beats plus the fraction of the
 * one in progress. Byte for byte what render is handed as `beats`, which is
 * the whole reason the picture and the rule can never be a tick apart.
 */
export function throbBeats(world: World): number {
  return world.tick / ticksPerBeat(world.cfg);
}

/**
 * How far round the body has turned, in thousandths of a clockwise turn.
 * Zero is the authored half pointing straight down the column at the cannon.
 *
 * Integer arithmetic on an integer tick, so two devices land on the same
 * thousandth; render passes a fraction of a beat in and gets a smooth angle
 * out of the same expression, because a thousandth of a turn is a third of a
 * degree and nothing on a phone can see the step.
 */
export function throbTurnMilli(cfg: SimConfig, beats: number): number {
  const period = Math.max(1, cfg.throbSpinBeats);
  const turned = ((beats % period) + period) % period;
  return Math.floor((turned * THROB_TURN_MILLI) / period) % THROB_TURN_MILLI;
}

/**
 * Whether the half the creature was authored in is the half the cannon is
 * looking at. True over `throbFaceMilli` thousandths of every turn, centred on
 * straight down; the rest of the turn is the other colour's half.
 *
 * The one place this question is answered. A site that wrote the modulo out
 * again would be a second copy of which trigger kills a body, and the two
 * would part on the frame it matters (`packages/sim/test/purity.test.ts`).
 */
export function throbFacing(cfg: SimConfig, beats: number): boolean {
  const half = Math.floor(cfg.throbFaceMilli / 2);
  const turn = throbTurnMilli(cfg, beats);
  return turn < half || turn >= THROB_TURN_MILLI - half;
}

/**
 * The colour that kills this body right now: the authored one while its own
 * half is square to the cannon, and the other one for the rest of the turn.
 *
 * The one copy of "which trigger, at this instant", called by the shot and by
 * the picture (`render/living-draw.ts`) so the half the pair can see and the
 * half the bullet meets are one fact. A body with no colour authored on it at
 * all answers neither trigger, which is what it did before both halves were
 * live and is a mis-authored wave rather than a rule.
 */
export function throbColorAt(cfg: SimConfig, beats: number, c: Creature): Color | null {
  if (c.color === null) return null;
  return throbFacing(cfg, beats) ? c.color : otherColor(c.color);
}

/**
 * A shot met a throb. Two answers, and the pair can tell them apart by looking
 * at the body rather than at the score.
 *
 * **Every half is an ordinary body now, in whichever of the two colours is
 * round.** The matching colour kills it and the wrong one is a colour miss,
 * exactly as a slick's is, because by then it *is* a slick's problem — the
 * only thing the turn decides is which of the two that colour is.
 *
 * It deliberately does not open the wrong-colour window `colourIsArmoured`
 * gives every other body: this creature already carries a clock of its own
 * that the pair is reading off the picture, and a second one laid over it
 * would leave them with no way to know which of the two was refusing the shot.
 */
export function throbStruck(world: World, b: Bullet, hit: Creature): void {
  if (throbColorAt(world.cfg, throbBeats(world), hit) !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return;
  }
  metColor(world);
  world.score += world.cfg.scoreThrobHit;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: b.color });
  removeCreature(world, hit.id);
}
