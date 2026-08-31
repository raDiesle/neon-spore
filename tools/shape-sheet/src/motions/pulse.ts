import type { OwnMotion } from "@neon-spore/content";
import { pose } from "./pose.js";

/**
 * The four that pulse, as opposed to the one that breathes.
 *
 * `SWELL` is `1 + sin(t·0.71875)·0.16` and it stays exactly as it is: a body
 * breathing is a fine thing for a body to do. It is not a pulse, and the
 * difference is the envelope rather than the amplitude. A sine spends as long
 * getting big as it spends getting small, so there is no instant in it — the
 * eye reads the **attack** as the event, and a curve with no attack is a
 * bellows however far it travels. Everything below is therefore asymmetric in
 * time, and the numbers that matter are the attack and release rather than the
 * peak. `LURCH` and `HEAVE` are the file's existing arguments for this;
 * `stroke` below is that argument written once.
 *
 * **This is a card and it is not a promise about creatures.** Every motion
 * here is beat-synchronous scale change, and `docs/alive.md` gives the throb a
 * monopoly on exactly that: `throbOpen` is a gameplay signal telling the pair
 * when to fire, so no other body may express the beat in size. That rule is
 * about the field and this is a catalogue page — nothing votes a spare motion
 * into a wave, and nothing here weakens it. What a shipped version would clear
 * first is that monopoly: on a body carrying ammunition colour at 26 px, a
 * swell on the beat is a fire cue whether or not it was meant as one.
 *
 * Time is beats, like everywhere `poseAt` is called, so the whole page pulses
 * on one clock and the three can be told apart by rhythm alone.
 */

/**
 * One percussive stroke: up in `attack`, down over `release`, then nothing.
 *
 * The rise is a quarter sine, which is steepest at the onset and flattens into
 * the peak — the shape of something struck. The fall is `(1−v)²`, which leaves
 * fast and settles slow, and which reaches exactly zero with zero slope, so a
 * stroke ends rather than being cut off. The silence after it is the point:
 * a swell that never returns to rest has nothing to be an event against.
 *
 * Exported because a swimming bell is the same envelope in a different place:
 * `parts/swim.ts` drives a contour with it rather than a pose, and a second
 * copy of "fast in, slow out" would be two answers to what an attack is. It
 * is the only thing this file lets out.
 */
export function stroke(p: number, attack: number, release: number): number {
  if (p < 0 || p >= attack + release) return 0;
  if (p < attack) return Math.sin((p / attack) * Math.PI * 0.5);
  const v = (p - attack) / release;
  return (1 - v) ** 2;
}

/**
 * BEAT — one sharp swell per beat, and the control the other two are judged
 * against. The plainest possible statement of the clock in a body: uniform in
 * both axes, so it is SWELL's own gesture with SWELL's symmetry removed, and
 * putting the two side by side is the whole test of whether an attack reads.
 *
 * Attack 0.09 beats, release 0.55, then 0.36 beats of rest — a 6.1 : 1 rise to
 * fall, against a sine's 1 : 1. **It inflates and does not preserve volume.**
 * That is the choice: growing in both axes at once reads as something filling,
 * and a body that widened as it shortened would be saying "squeeze", which is
 * HEART's word and not this one.
 */
const BEAT_ATTACK = 0.09;
const BEAT_RELEASE = 0.55;

export const BEAT: OwnMotion = {
  name: "BEAT",
  note: "one sharp swell a beat, sudden then settling — the clock, in a body",
  poseAt(t) {
    const s = 1 + stroke(t % 1, BEAT_ATTACK, BEAT_RELEASE) * 0.17;
    return pose(0, 0, 0, s, s);
  },
};

/**
 * HEART — *lub-dub*. Two strokes at uneven spacing, and the spacing is the
 * whole of it: a `0.5` split is two beats, not a heartbeat. The pair spans
 * 0.42 beats and the wait after it is 1.32, so the gap between the pairs is
 * 3.1 times the gap inside one, which is what an ear and an eye both use to
 * hear two events as one. The second is smaller — 0.58 of the first — because
 * a second stroke of equal size is a metronome at double speed.
 *
 * Two beats a cycle rather than one. At 96 BPM a pair per beat is a frantic
 * double-tap with no wait in it, and the wait is where the aliveness sits.
 *
 * **It preserves volume exactly, and that is the argument.** `sy` is the
 * reciprocal of `sx`, so the area is held to the last digit and the body
 * *clenches* rather than inflating: a heart is a muscle that ejects something,
 * not a bag that fills. It is also the second thing separating this from BEAT,
 * so the two differ in kind and not only in rhythm.
 */
const HEART_PERIOD = 2;
/** Onset of the second stroke, in beats after the first. */
const DUB_AT = 0.42;

export const HEART: OwnMotion = {
  name: "HEART",
  note: "lub-dub — a tight pair, a long wait, and the body clenches rather than fills",
  poseAt(t) {
    const p = t % HEART_PERIOD;
    const e = stroke(p, 0.05, 0.26) + stroke(p - DUB_AT, 0.045, 0.22) * 0.58;
    const w = 1 + e * 0.15;
    return pose(0, 0, 0, w, 1 / w);
  },
};

/**
 * The swim stroke, as numbers rather than as a shape.
 *
 * They live here, beside `stroke`, because two things read them and neither
 * may own them: `parts/swim.ts` squeezes a *contour* with them, and `JET`
 * below moves a *pose* with them. That split is the whole design — a bell
 * contracting and the same animal rising are two halves of one gesture, and
 * only one of them is expressible as an affine transform. Sharing the
 * constants is what makes them halves rather than two gestures that happen to
 * look similar.
 *
 * The consequence is a rule, and it is not enforceable in a type: **a body
 * whose pulse changes `period` must not also carry JET**, because the bob
 * would then be answering a clock the bell is not keeping. Every jelly in
 * `jelly-bodies.ts` therefore differs in depth and shape, never in period.
 */
export const SWIM_PERIOD = 2;
export const SWIM_ATTACK = 0.16;
/**
 * Nearly all of what is left, so the cycle is a squeeze and then a recovery
 * that lasts until the next one. It was 1.15 and that left a third of the
 * cycle at dead rest — accurate for a struck object and wrong for this, since
 * an animal that has just ejected water is still opening right up to the
 * moment it shuts again. The strip in `swim-sheet.ts` is where that showed:
 * four of its nine frames were the same picture.
 */
export const SWIM_RELEASE = 1.6;
/** How far the bell narrows at full squeeze. */
export const SWIM_DEPTH = 0.18;

/**
 * JET — the half of a swim stroke that a pose can say.
 *
 * A jellyfish does not travel by changing shape; it travels because changing
 * shape moved water. So the contour squeezes (`parts/swim.ts`) and this rises,
 * on the same envelope and the same clock, and neither is the animal on its
 * own. It sets **no scale at all**, which is the point: a pose that also
 * squeezed would scale the tentacles with the bell, and tentacles that squeeze
 * with the bell is exactly the tell of a jellyfish nobody looked at.
 *
 * The stroke is offset by its own mean, so the body rises on the contraction
 * and sinks back through the glide instead of drifting off the card. Peak rise
 * is a tenth of a tile, which is well inside what an own-motion may spend
 * (spec 5.8) and about as much as a bell this size would actually gain.
 */
const JET_RISE = 0.16;
/**
 * The mean of the stroke over its own period, which is what makes the bob
 * level rather than a body slowly leaving the card.
 *
 * Worked out rather than tuned: the attack integrates to `attack·2/π` and the
 * release to `release/3`, so over a period of 2 that is
 * (0.16·0.6366 + 1.6/3) / 2 = 0.318.
 */
const JET_MEAN = 0.318;

export const JET: OwnMotion = {
  name: "JET",
  note: "rises on the squeeze and sinks through the glide — a swim, with no scale in it",
  poseAt(t) {
    const c = stroke(t % SWIM_PERIOD, SWIM_ATTACK, SWIM_RELEASE);
    return pose(0, -JET_RISE * (c - JET_MEAN), 0, 1, 1);
  },
};

/**
 * PERISTALSIS — the swell travels along the body instead of the body swelling.
 *
 * The owner's worm from the other side: `WIND` twists a body along its length
 * and this squeezes along it, and the two want picking together in the motion
 * bar to see whether they add or fight.
 *
 * **What a pose can and cannot say about a travelling wave.** A pose is an
 * affine transform, so it does one thing to the whole body; a ring of
 * thickening at one end and not the other is not in its vocabulary at all,
 * any more than depth is in `depth.ts`'s. What is left is the pair of
 * consequences a bounding box does see, and both are derived from one number —
 * the bulge's position `u` along the body:
 *
 * - **Cross-extent.** The silhouette is as wide as its widest point, so a
 *   bulge anywhere inside the body widens the drawn box even though the body's
 *   own volume never changes. `sy` carries it.
 * - **Centre.** Mass gathered at `u` drags the centroid to `u`, so `dx` is
 *   `SPAN · presence · (2u − 1)` — the offset is the bulge's position times how
 *   much of it is inside. It enters at the tail, sweeps through, and the body
 *   settles back as it leaves at the head.
 *
 * **Length is held at exactly 1**, which is the claim the other two do not
 * make: fluid moved along a tube does not shorten it. So this is the one of
 * the three that is neither an inflation nor a volume-preserving squeeze — the
 * *body* preserves its volume and the *drawing* does not, because a box is
 * fitted to the widest point rather than to the mean.
 *
 * **The axis is declared and then turned.** The pose below is written with x
 * running along the body, and `axis: "long"` is that written down where a
 * caller can read it: `poseOn` turns the whole gesture a quarter turn on a
 * body whose long axis is vertical, so the squeeze runs along the body rather
 * than across it. It used to be a declaration and nothing else, because
 * `poseAt(t: Beats)` is handed a clock and no motion in this folder can see
 * its carrier. Measured over the sixty catalogue entries at the shared 1.25
 * threshold, 24 are wide and x was already right, 28 are round to within a
 * quarter and have no long axis to be wrong about — and 8 are tall: TENDRIL,
 * THE NEEDLE, RIBBON, THE SPLICE, THE CLAW, POD and the two HUSKs, where the
 * swell used to travel the short way across the body. Those eight are the
 * whole of what the field changes, and `long-axis.ts` argues the shape of it.
 *
 * Three beats of traverse, then a beat of rest. The bulge arrives over 15% of
 * the traverse and leaves over 30%, so it is swallowed and then dissipates —
 * asymmetric like the other two, and the rest is what keeps the next arrival
 * an event.
 */
const PERISTALSIS_PERIOD = 4;
const TRAVERSE = 3;
/** How much of the traverse the bulge spends arriving, and leaving. */
const IN = 0.15;
const OUT = 0.3;
/** Peak centroid travel in tiles, and how far the widest point widens. */
const SPAN = 0.13;
const BULGE = 0.14;

/** Smoothstep, clamped — `LURCH`'s ramp, which is where this shape came from. */
function ramp(x: number): number {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
}

export const PERISTALSIS: OwnMotion = {
  name: "PERISTALSIS",
  note: "a bulge swallowed at one end and squeezed to the other — width travels, length does not",
  axis: "long",
  poseAt(t) {
    const p = t % PERISTALSIS_PERIOD;
    if (p >= TRAVERSE) return pose(0, 0, 0, 1, 1);
    const u = p / TRAVERSE;
    const presence = ramp(u / IN) - ramp((u - (1 - OUT)) / OUT);
    return pose(SPAN * presence * (2 * u - 1), 0, 0, 1, 1 + presence * BULGE);
  },
};
