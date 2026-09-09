import type { Creature, SimConfig, World } from "@neon-spore/sim";
import {
  beatboxHitsMade,
  beatboxIsBox,
  beatboxMissAge,
  beatboxTapAge,
  beatboxWrongAge,
  ticksPerBeat,
} from "@neon-spore/sim";

/**
 * **What a soundbox is drawn as, this instant** — how big it is, how many arms
 * it has grown, and how far through its three timed pictures it is.
 *
 * A box swells on every beat and shrinks between them — a bass cabinet with a
 * cone in it — and swells much harder on the beat a thumb landed. It also
 * **grows**: it arrives small, it is a little bigger for every beat the pair
 * got right, and each of those beats puts an arm out of its rim. So a box near
 * the hull with four arms on it is a run four deep, readable across a room
 * with no number anywhere near it.
 *
 * **It is not the own-motion, and it must not be.** `RUMBLE` is deliberately
 * flat in `sx` and `sy` (`content/motions.ts`), and the reason is here: a pose
 * is sampled at `poseClock`, which spreads every body by its own id over eight
 * beats so a field does not breathe as one object (`content/own-motion.ts`).
 * That spread is exactly right for a slick and exactly wrong for this — a box
 * whose swell landed a third of a beat off the beat would be a metronome
 * lying, and the one judgement the navigator has to make is *was that the
 * beat*. So the swell is read off `world.beat` and `beatPhase` directly, with
 * no per-body offset, and every box on the field pulses together.
 *
 * **Some of it is a picture and some of it is a size, and the split is the
 * hit test.** The swell changes several times a beat and is a picture only:
 * nothing in the simulation reads it, and a thumb is not tested against it —
 * `creatureAt` reaches 1.6 radii, which covers the swell at its largest. The
 * *growth* is the other kind: it changes only when a tap lands, so it belongs
 * in `livingBodyMul` beside THE ECHO's and THE RIND's, where the ring a thumb
 * grips and the body it is drawn around are one number.
 */

/** How much bigger a box is on the beat itself, as a share of its footprint.
 * A fifth: plainly a pulse from across a room, and not so much that the body
 * looks like a different size of creature every other frame. */
const BEAT_SWELL = 0.2;

/** And on a beat a tap landed on. Two and a half times the idle pulse, which
 * is the owner's *"it beats bigger and more visual"* — the difference has to
 * be readable at a glance, because it is the navigator's only receipt that the
 * press was inside the window. */
const TAP_SWELL = 0.5;

/** How sharply the swell falls away over the beat. Above 1, so the attack is
 * on the beat itself and the decay is quick — a linear fall would put the body
 * at half size half way through, which reads as a slow breath rather than as a
 * hit. */
const DECAY = 1.6;

/**
 * The footprint a box arrives at, before any tap has landed. Under two thirds
 * of an ordinary body, and it is the smallest thing on the field that is not
 * an echo.
 *
 * The owner asked for it: *once clicked, it should grow a little bit, so it
 * also should start smaller*. Growth needs somewhere to grow from, and a body
 * that started at full size and got bigger would end its run as the largest
 * thing on the field — which reads as a boss rather than as a thing being
 * answered.
 */
export const BEATBOX_START_MUL = 0.62;

/**
 * And what one counted beat adds. Small on purpose: this is the *quiet* half
 * of the receipt and the arm is the loud one. Four beats — the longest run any
 * wave authors — takes the box from well under an ordinary body to a little
 * over one, so the pair reads a long run as a thing that has grown into the
 * lane rather than as a body that suddenly changed size.
 */
export const BEATBOX_PER_HIT_MUL = 0.14;

/**
 * How much of a beat an arm takes to come out of the rim. Half: fast enough
 * that it is plainly the thumb that did it, slow enough to be seen doing it
 * rather than to appear. It also has to finish inside a beat — the next tap is
 * one beat away, and two arms growing at once would be the count unreadable at
 * exactly the moment it is highest.
 */
const ARM_GROW_BEATS = 0.5;

/**
 * How long the body stays lit red after a run comes apart, in beats. Two: long
 * enough to be certain from across a room that something went wrong, and over
 * before the pair's next run could have started — a box still red on the beat
 * a new run opens would be the old mistake reading as this one's.
 */
const WRONG_BEATS = 2;

/** How long the green rings and the glow of a counted beat last, in beats.
 * Under one, so the receipt for a beat is finished before the next beat's
 * window opens and the pair never sees two of them at once. */
const TAP_BEATS = 0.8;

/**
 * How long the counter's next dot stays red after a thumb landed between two
 * beats, in beats. Under a beat for TAP_BEATS' reason, and shorter still: what
 * it says is *not then*, and the useful moment to say it is before the next
 * beat the pair could get right.
 *
 * It must not last: on player 2's screen this dot is a slot that would not
 * otherwise be drawn, and one that stayed would be a slot they could count.
 */
const MISS_BEATS = 0.55;

/**
 * The footprint multiplier for this body: what it arrived at plus what the run
 * standing on it has added. One for anything that is not a box, so a caller may
 * ask about any creature.
 *
 * Called from `livingBodyMul` and nowhere else, so the size the body draws at,
 * the ring a hand is drawn at and the reach a thumb is tested against are one
 * number (`creature-place.ts`).
 */
export function beatboxBodyMul(c: Creature): number {
  if (!beatboxIsBox(c)) return 1;
  return BEATBOX_START_MUL + beatboxHitsMade(c) * BEATBOX_PER_HIT_MUL;
}

/**
 * The footprint multiplier for this body, this frame. One for anything that is
 * not a box, so a caller may ask about any creature.
 *
 * `beatboxBeat >= beat` rather than `=== beat` is the early tap: a thumb
 * inside the window *ahead* of a boundary is credited to the beat it was
 * reaching for (`beatboxBeatFor`), so between the press and that boundary the
 * body carries a beat number one ahead of the field's. The box should be
 * kicking through both — that is the same press.
 */
export function beatboxSwell(c: Creature, beat: number, beatPhase: number): number {
  if (!beatboxIsBox(c)) return 1;
  const fall = Math.max(0, 1 - Math.max(0, Math.min(1, beatPhase))) ** DECAY;
  const tapped = c.beatboxBeat !== undefined && c.beatboxBeat >= beat;
  return 1 + (tapped ? TAP_SWELL : BEAT_SWELL) * fall;
}

/**
 * How far through a timed picture this box is, 0 at the moment and 1 when it
 * is over — or null when there is nothing to draw.
 *
 * One function for the two of them because they are one question asked of two
 * ticks, and the ticks are the simulation's (`beatboxTapAge`,
 * `beatboxWrongAge`). It is the *tick* counter and not the wall clock on
 * purpose: what is being timed is a press and a discharge, both of which
 * happened on a tick, and a picture hung off `performance.now()` would drift
 * away from the beat it belongs to over a long wave.
 */
function through(age: number | null, cfg: SimConfig, beats: number): number | null {
  if (age === null || age < 0) return null;
  const life = ticksPerBeat(cfg) * beats;
  const t = age / life;
  return t >= 1 ? null : t;
}

/** How far through the receipt for the last counted beat this box is, or null.
 * Drives the glow under the thumb and the green rings going out of the body. */
export function beatboxTapThrough(world: World, c: Creature): number | null {
  return through(beatboxTapAge(world, c), world.cfg, TAP_BEATS);
}

/** How far through the red this box is after a run came apart, or null. */
export function beatboxWrongThrough(world: World, c: Creature): number | null {
  return through(beatboxWrongAge(world, c), world.cfg, WRONG_BEATS);
}

/** How far through the red on the counter's next dot this box is, after a thumb
 * landed between two beats, or null. */
export function beatboxMissThrough(world: World, c: Creature): number | null {
  return through(beatboxMissAge(world, c), world.cfg, MISS_BEATS);
}

/**
 * How far the newest arm has come out of the rim, 0..1.
 *
 * One when the last tap is old enough that the arm has finished growing, which
 * is every frame of a box standing between beats, and every frame of one
 * nobody has touched — there is no arm to grow.
 */
export function beatboxArmGrown(world: World, c: Creature): number {
  const age = beatboxTapAge(world, c);
  if (age === null || age < 0) return 1;
  return Math.min(1, age / (ticksPerBeat(world.cfg) * ARM_GROW_BEATS));
}
