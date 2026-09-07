import type { Creature } from "@neon-spore/sim";
import { beatboxIsBox } from "@neon-spore/sim";

/**
 * **How big a soundbox is drawn this instant**, which is the whole of what
 * this creature says.
 *
 * A box swells on every beat and shrinks between them — a bass cabinet with a
 * cone in it — and swells much harder on the beat a thumb landed. Nothing else
 * about the body changes at all: no colour, no rotation, no second marking. So
 * this one number carries two facts at once, and the pair reads both off it
 * without being told which is which. *It is alive and this is the beat* is the
 * small pulse; *that one counted* is the large one.
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
 * **It is a picture and not a rule**, which is why it lives here and not in
 * `packages/sim`. Nothing in the simulation reads it: whether a tap counted is
 * decided from the tick it arrived on (`beatboxBeatFor`), never from how big
 * the body happened to be drawn. The hit test is generous enough to cover the
 * whole swell at its largest (`creatureAt` reaches 1.6 radii), so a thumb
 * aimed at the picture always finds the body.
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
