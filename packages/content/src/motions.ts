import type { OwnMotion } from "./own-motion.js";

/**
 * The motions themselves: one record per body that has one.
 *
 * Split out of `own-motion.ts` the day THE DART pushed that file past its
 * 250-line limit, along the seam that file's own doc already described. What
 * stayed there is the *machinery* — what a pose is, what a beat is, where a
 * body sits in the cycle. This is the half that grows by a record every time a
 * creature gets a body, and every name is re-exported from `own-motion.ts`, so
 * nothing that reaches for one through that file had to move.
 *
 * Two files sit beside it. `motions-event.ts` holds the two that are built out
 * of an attack and a rest rather than out of sines, and `motions-retired.ts`
 * holds what a body used to be drawn with before those two replaced it.
 *
 * The rules the records here are held to are all stated next door and none of
 * them changed with the address: a motion may touch nothing, it is measured in
 * tiles rather than pixels, and its clock is beats rather than seconds.
 */

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

/**
 * The beatbox: a cabinet with something heavy moving inside it, and the
 * smallest motion in this file after HOLD's.
 *
 * `HOLD` makes the argument and this is the same one about a different signal.
 * The whole of what this body says is **how big it is right now** — it swells
 * on every beat and swells much harder on a tap, and the pair reads the run
 * off exactly that (`render/beatbox.ts`). So there is no scale here at all: a
 * pump in the own-motion would be a second size signal running on a clock the
 * beat does not own, and the one thing the navigator has to judge is *whether
 * that swell was the beat*. No rotation either — a box has flats and corners,
 * and a contour that turned would put a corner where the eye is expecting an
 * edge, which is a different body every quarter turn.
 *
 * What is left is a shudder, and it is deliberately fast, tiny and not
 * commensurate with the beat: three frequencies with no common period, so the
 * cabinet never settles into a rhythm of its own beside the one it is beating.
 * That is TREMBLE's arithmetic at a third of its excursion — there it says
 * *too small to do more than shake*, here it says *there is a driver in this
 * thing and it is idling*.
 */
export const RUMBLE: OwnMotion = {
  name: "RUMBLE",
  note: "a fast, tiny, arrhythmic shudder — no scale and no turn, so the swell on the beat is the only size it says",
  poseAt(t) {
    return {
      dx: Math.sin(t * 6.3125) * 0.012 + Math.sin(t * 9.4375) * 0.008,
      dy: Math.sin(t * 4.6875) * 0.01,
      rot: 0,
      sx: 1,
      sy: 1,
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
