import type { OwnMotion } from "./own-motion.js";

/**
 * The motions themselves: one record per body that has one, and the pairing of
 * a kind to its own.
 *
 * Split out of `own-motion.ts` the day THE DART pushed that file past its
 * 250-line limit, along the seam that file's own doc already described. What
 * stayed there is the *machinery* — what a pose is, what a beat is, where a
 * body sits in the cycle — and it is a fixed set of ideas that has not changed
 * since it was written. This is the half that grows by a record every time a
 * creature gets a body, and it is the half nobody reads top to bottom. Every
 * name is re-exported from `own-motion.ts`, so nothing that already reaches
 * for one through that file had to move.
 *
 * The rules the records here are held to are all stated next door and none of
 * them changed with the address: a motion may touch nothing, it is measured in
 * tiles rather than pixels, and its clock is beats rather than seconds.
 */

/**
 * The bulb: a wide slow sway with a faster pump inside it. The pump is
 * volume-preserving — as wide as it gets, it gets that much flatter — so it
 * reads as something breathing rather than as a shape being resized.
 *
 * The frequencies are the seconds-era ones divided by 1.6, the beats per
 * second at the config's 96 BPM, so the body moves at exactly the rate it
 * moved at before the clock changed underneath it.
 */
export const SWAY_PUMP: OwnMotion = {
  name: "SWAY · PUMP",
  note: "slow sway, faster pump, volume held",
  poseAt(t) {
    const swing = Math.sin(t * 1.1875);
    const pump = Math.sin(t * 1.9375);
    return { dx: swing * 0.17, dy: 0, rot: swing * 0.18, sx: 1 + pump * 0.1, sy: 1 - pump * 0.1 };
  },
};

/**
 * The slick: a tilt whose rotation lags its own drift by half a radian, and a
 * ripple across the width. The lag is what makes it read as a flat thing being
 * dragged through something rather than a rigid body being rocked.
 *
 * The half-radian lag is an angle, not a duration, so it does not convert.
 */
export const TILT_RIPPLE: OwnMotion = {
  name: "TILT · RIPPLE",
  note: "drift, tilt lagging behind it, ripple across the width",
  poseAt(t) {
    return {
      dx: Math.sin(t * 0.84375) * 0.11,
      dy: Math.sin(t * 1.375) * 0.05,
      rot: Math.sin(t * 0.84375 + 0.5) * 0.22,
      sx: 1 + Math.sin(t * 1.375) * 0.09,
      sy: 1,
    };
  },
};

/**
 * Spare since the runt was retired for THE LURE, and kept: it is the one
 * motion here written for a body too small to glide, and the next creature
 * that is will want the argument below made again. A tight, arrhythmic tremor that never travels and never settles into a
 * rhythm. Three frequencies with no common period, so the body never completes
 * one clean rock the way the slick or the bulb does — that absence is the
 * whole point. A creature you must not shoot has to read as *helpless*, and a
 * glide or a lagging tilt both say "in control of where it is going." A
 * tremor says: too small to do more than shake.
 *
 * The three are the one set of numbers here that is not a straight unit
 * conversion: 5.3 rad/s sat within a few percent of the beat's own 5.03 rad/s
 * half-harmonic once the pose clock moved onto `world.beat`, so it went to
 * 5.9, with 8.7 and 13.1 nudged to 8.3 and 12.7 to keep the trio
 * incommensurable — debris caught in the wave, not part of it.
 */
export const TREMBLE: OwnMotion = {
  name: "TREMBLE",
  note: "tight, arrhythmic shiver, no drift and no lag — too small to glide",
  poseAt(t) {
    const jitter =
      Math.sin(t * 5.1875) * 0.035 + Math.sin(t * 7.9375) * 0.02 + Math.sin(t * 3.6875) * 0.02;
    return {
      dx: jitter,
      dy: Math.sin(t * 6.1875) * 0.02,
      rot: Math.sin(t * 7.0625) * 0.08,
      sx: 1,
      sy: 1,
    };
  },
};

/**
 * The throb: the smallest motion here, on purpose. The body already turns
 * clockwise the whole way down (`throbTurnMilli` in sim, `living-draw.ts` in
 * render), and that turn is load-bearing — it is what says which half is
 * pointing at the cannon. A tilt or a pump layered on top would read as a
 * second signal fighting the first: a body saying "the colour is out now"
 * cannot also be saying "and also this." **No rotation above all**, since a
 * second rotation is not a different signal from the first, it is the same
 * one made unreadable — and no scale either, which would move a silhouette
 * whose seam the pair is reading. What is left is a drift too small and too
 * slow to compete, there only so the throb is not a dead thing between beats.
 */
export const HOLD: OwnMotion = {
  name: "HOLD",
  note: "a small, slow drift and nothing else — the clockwise turn is the whole of what it says",
  poseAt(t) {
    return { dx: Math.sin(t * 0.375) * 0.04, dy: 0, rot: 0, sx: 1, sy: 1 };
  },
};

/**
 * The dart: a body holding station under thrust. Two fast, shallow frequencies
 * and no sway at all — where the bulb swings a fifth of a lane and the slick
 * drifts, this one barely leaves the middle of its tile, because *its* sideways
 * movement is a real move of two whole columns and a sway would be a smaller
 * version of the same word. A creature whose one signal is "which way next"
 * must not idle in a way that could be mistaken for an answer.
 *
 * So what is left is vertical: a quick hunting bob and a scale that trades
 * height for width on the opposite phase, which reads as something correcting
 * itself against a thrust it is holding. The rotation is a twitch rather than
 * a rock — a tenth of the slick's tilt, and fast — so the *lean*
 * `render/src/dart.ts` adds toward `dartDir` is never lost inside it. That
 * separation is the whole reason this motion is as small as it is.
 */
export const POISE: OwnMotion = {
  name: "POISE",
  note: "a tight vertical hunt under held thrust — no sway, so the lean is the only sideways thing it says",
  poseAt(t) {
    const hunt = Math.sin(t * 2.4375);
    return {
      dx: 0,
      dy: hunt * 0.05,
      rot: Math.sin(t * 3.3125) * 0.025,
      sx: 1 - hunt * 0.04,
      sy: 1 + hunt * 0.06,
    };
  },
};

/**
 * The wisp: the only body here that does not move at all, and the absence is
 * the whole record.
 *
 * `POISE` makes this argument for the dart and it goes further here. A dart's
 * one signal is which way it leans, so its own-motion must not sway; a wisp's
 * one signal is the *tile it is standing on*, and the pair is reading that
 * tile off a lettered grid drawn under it. A body that drifted a fifth of a
 * lane the way the bulb does would sit visibly between two letters for half of
 * every beat, and the one sentence this creature exists to be described by
 * would come out as a question.
 *
 * So `dx` and `dy` are flat zero — the only motion in this file where both
 * are — and what is left is a body rocking slowly on the spot with a small
 * counter-beat shiver in its size. A rotation cannot move a contour off its
 * own centre and cannot change any radius, so it costs the tile read nothing
 * and it is the one thing that says *alive* about something that otherwise
 * only ever stands and jumps.
 *
 * **A rock and not a turn, and that changed when the body did.** This used to
 * be `rot: t * 0.21875` — an unbounded spin, which is the honest own-motion
 * for a featureless blob and the wrong one for a body with a top and a hem.
 * A wisp now hangs its tentacles downward (`render/wisp-body.ts`); a bell that
 * rotated past a quarter turn would swing them sideways and then over itself,
 * which reads as tumbling rather than as floating. A shallow rock keeps every
 * frame the right way up.
 *
 * The rock is deliberately slow and the two frequencies are deliberately not
 * commensurate with the hop: a body that pulsed on the dwell would be a second
 * clock beside the one the pair is already counting.
 */
export const FLICKER: OwnMotion = {
  name: "FLICKER",
  note: "no drift at all — a slow rock on the spot and a shiver, so the tile it stands on is never in doubt",
  poseAt(t) {
    const shiver = Math.sin(t * 2.6875);
    return {
      dx: 0,
      dy: 0,
      rot: Math.sin(t * 0.6875) * 0.1,
      sx: 1 + shiver * 0.035,
      sy: 1 - shiver * 0.035,
    };
  },
};

// Which kind sways with which of the motions above is *not* here: it is one
// row per kind in `living-look.ts`, beside that kind's contour, because a body
// and its own-motion are one fact and were two hand-kept lists over it.
// `livingMotion` is exported from there, and re-exported by `own-motion.ts` and
// the package index, so nothing that already reached for it had to move. This
// file may not import it back — `living-look.ts` reads these records, and the
// arrow only points one way.
