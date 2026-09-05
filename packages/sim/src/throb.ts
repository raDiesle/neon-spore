import { metColor, missedColor } from "./balance.js";
import { type SimConfig, ticksPerBeat } from "./config.js";
import { removeCreature } from "./field.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE THROB: a body cut in half down the middle. One half is a slick's red or
 * a bulb's cyan; the other is shield plating, and nothing goes through it. It
 * turns clockwise the whole way down, so which half is pointing at the cannon
 * is a fact about *when* rather than about where — and the pair has to say the
 * colour and the moment in one sentence.
 *
 * **It used to swell and shrink on the beat**, open one beat in four and
 * answerable by either colour while it was. That version asked for a count and
 * nothing else; the ammunition was never the question, so the navigator's half
 * of the exchange was "now". The turn puts the colour back into it: the pilot
 * is the one who can see which way round the body is, the navigator is the one
 * holding two triggers, and neither half of that is worth anything alone.
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
 * Zero is the coloured half pointing straight down the column at the cannon.
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
 * Whether the coloured half is the half the cannon is looking at. True over
 * `throbFaceMilli` thousandths of every turn, centred on straight down — the
 * shot has to arrive square into the colour, not glance the seam.
 *
 * The one place this question is answered. A site that wrote the modulo out
 * again would be a second copy of when a body can be killed, and the two would
 * part on the frame it matters (`packages/sim/test/purity.test.ts`).
 */
export function throbFacing(cfg: SimConfig, beats: number): boolean {
  const half = Math.floor(cfg.throbFaceMilli / 2);
  const turn = throbTurnMilli(cfg, beats);
  return turn < half || turn >= THROB_TURN_MILLI - half;
}

/** The same question at the world's own instant — what a shot and a frame ask. */
export function throbFaces(world: World): boolean {
  return throbFacing(world.cfg, throbBeats(world));
}

/**
 * A shot met a throb. Three answers, and the pair can tell them apart by
 * looking at the body rather than at the score.
 *
 * **The plating refuses everything.** Not a colour mistake and not booked as
 * one: the ammunition was never the question on that half, the moment was, and
 * charging it to the colour balance would read one mistake to the wrong player
 * twice — the argument `colour-armour.ts` makes next door about a window.
 *
 * **The coloured half is an ordinary body.** The matching colour kills it and
 * the wrong one is a colour miss, exactly as a slick's is, because by then it
 * *is* a slick's problem. It deliberately does not open the wrong-colour
 * window `colourIsArmoured` gives every other body: this creature already
 * carries a window of its own that the pair is reading off the picture, and a
 * second one laid over it would leave them with no way to know which of the
 * two was refusing the shot.
 */
export function throbStruck(world: World, b: Bullet, hit: Creature): void {
  if (!throbFaces(world)) {
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return;
  }
  if (hit.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return;
  }
  metColor(world);
  world.score += world.cfg.scoreThrobHit;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: b.color });
  removeCreature(world, hit.id);
}
