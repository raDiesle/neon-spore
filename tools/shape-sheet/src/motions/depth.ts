import type { OwnMotion } from "@neon-spore/content";
import { smoothstep } from "@neon-spore/render";
import { pose } from "./pose.js";

/**
 * The motions that claim a third dimension, out of four numbers that have none.
 *
 * A pose is `{ dx, dy, rot, sx, sy }` — a flat affine transform with no z in
 * it anywhere. So nothing here rotates in depth; each of these *projects* a
 * body that does, and hands the projection to a transform that can only scale
 * and slide. `docs/dimensional.md` is what came out of writing them: what the
 * stack can do for depth, what it cannot, and which of `plane.ts`'s eleven
 * have no dimensional counterpart at all.
 *
 * Two rules hold across all four, and they are the difference between a depth
 * variant and a body being resized.
 *
 * **One angle, every number derived from it.** A scale curve and an offset
 * curve authored separately are two oscillations that happen to share a
 * period, and an eye reads them as two. TOLL already knew this — its `dx` and
 * `dy` come out of its own swing angle — and every motion below does the same:
 * one longitude, one tip, one distance, and the pose falls out of it.
 *
 * **Each stands beside its original in `MOTIONS`, never in place of it.** The
 * whole point is choosing between them on one page and one clock, so a variant
 * keeps its original's period wherever the period is not the thing that
 * changed: TURN IN DEPTH turns at TURN's own rate, PITCH holds for CANT's
 * eight beats, CRAWL runs SLITHER's wave.
 *
 * And one warning, because it is cheaper here than in the bestiary. The
 * nameability gate's first axis is drawn aspect across a beat, and an `sx`
 * that runs from 1 down to 0.55 takes aspect further off on its own than the
 * whole of the round three differ by. So these are **card motions** until
 * something measures otherwise: fine on a catalogue card at 92 px, unproven on
 * a creature at 26 px whose kind has to stay one word.
 */

/**
 * TURN, in depth. The one the whole set was written to make possible, and the
 * sharpest thing on the page beside its original: TURN is `rot`, a spin in the
 * picture plane that reads as a pinwheel, and this touches `rot` not at all.
 *
 * The body is an ellipse in plan — as wide as its silhouette and `DEPTH` as
 * deep — turning at TURN's own rate about a vertical axis that stands `AXIS`
 * to one side of it. Both numbers are then forced:
 *
 * - **Width** is the ellipse's own shadow, `√(cos²α + DEPTH²sin²α)`. It never
 *   reaches zero, so the body never flips inside out and never has to be
 *   clamped, and it *dwells* near full width instead of easing like a sine —
 *   which is what separates a body coming round from a body being squeezed.
 * - **Sideways** is `AXIS·sin α`, the body's own centre going round the axis.
 *   It is the cheapest cue here and the least deniable: the width cycle repeats
 *   twice per revolution and this one only once, so a squash — one period, no
 *   travel — cannot produce it however hard it tries.
 *
 * What no pose can supply is the third cue, and `docs/dimensional.md` measures
 * the gap: a true projection carries a feature across the facing meridian 23
 * times faster than one at the limb, and an affine transform moves every
 * painted point at one rate, because that is what affine means. The light is
 * what stands in for it — `tools/director/src/skins/light.ts` keeps `KEY`
 * still while this widens and narrows underneath it.
 */
const DEPTH = 0.55;
const AXIS = 0.13;
/** TURN's rate, exactly. Two cards, one clock, one difference. */
const SPIN = 0.34375;

export const TURN_IN_DEPTH: OwnMotion = {
  name: "TURN IN DEPTH",
  note: "all the way round about an upright axis — width on a cosine, no rotation at all",
  poseAt(t) {
    const a = t * SPIN;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return pose(AXIS * s, 0, 0, Math.hypot(c, DEPTH * s), 1);
  },
};

/**
 * SWELL, in depth: not a body inflating but a body coming at you.
 *
 * They differ in exactly one thing and it is not the scale curve. **An
 * inflating body keeps its footing and an approaching one does not.** A lens
 * looking slightly down at a body sees it drop through the frame as it nears,
 * because the body is below the axis of the lens and gets further below it in
 * screen terms the closer it comes — so `dy` here is not a second wave, it is
 * `STOOP` times the scale the perspective already worked out.
 *
 * The scale is `1/z` rather than a sine, which is the second tell and costs
 * nothing: the same swing in depth grows the body by 19% coming and shrinks it
 * by 14% going, so the approach accelerates into the frame the way an approach
 * does. SWELL's own frequency, so the two sit side by side on one clock.
 */
const REACH = 0.16;
const STOOP = 0.5;

export const APPROACH: OwnMotion = {
  name: "APPROACH",
  note: "nearer and further, not bigger and smaller — it drops through the frame as it comes",
  poseAt(t) {
    const z = 1 + REACH * Math.sin(t * 0.71875);
    const s = 1 / z;
    return pose(0, STOOP * (s - 1), 0, s, s);
  },
};

/**
 * CANT, in depth: a body tipping away rather than leaning.
 *
 * CANT is a held `rot`, and a held lean says which way a body is *pointing*.
 * This is a held tip, and it says which way a body is *facing* — the same
 * eased square wave, so the pair can be read against each other with nothing
 * differing but the axis the body turns about.
 *
 * `LENS` is what makes it a tip and not a squash, and it is one number. A lens
 * looking down by `LENS` sees a body's height foreshortened by `cos(tip +
 * LENS)`: tipping *away* piles the two angles up and the body loses two fifths
 * of its height, tipping *toward* cancels them and it gains a little. So the
 * two ends of the cycle are not mirror images the way a lean's are, and the
 * asymmetry is the whole cue.
 *
 * The same angle's sine is how far the body has *gone*, and it is why this
 * touches `sx` at all. A body pivoting on its base does not tip in place: its
 * centre swings away from the lens going over and toward it coming back, so
 * the whole body shrinks and grows by `AWAY` on top of the foreshortening. It
 * is a small term and it is the one that stops a tip reading as a body being
 * stood on. `dy` is then the two of them together — the centre stands `RISE`
 * above the point it pivots on. Four numbers, one angle, nothing authored
 * twice.
 */
const LENS = 0.35;
const TIP = 0.62;
const RISE = 0.32;
const AWAY = 0.16;
const FLAT = Math.cos(LENS);
const STANDING = Math.sin(LENS);

export const PITCH: OwnMotion = {
  name: "PITCH",
  note: "tips away, holds there, tips back — foreshortened, so the two ends do not match",
  poseAt(t) {
    const period = 8;
    const p = (t % period) / period;
    const edge = smoothstep;
    // CANT's square wave with eased shoulders, driving an angle instead of rot.
    const lean = (edge(p / 0.12) - edge((p - 0.5) / 0.12)) * 2 - 1;
    const over = TIP * lean + LENS;
    const f = Math.cos(over) / FLAT;
    const g = 1 / (1 + AWAY * (Math.sin(over) - STANDING));
    return pose(0, RISE * (1 - f * g), 0, g, f * g);
  },
};

/**
 * SLITHER, in depth — the worm, and the one variant whose original cannot be
 * translated directly.
 *
 * SLITHER is a wave running *along* a body, and an affine transform has one
 * `sx` for the whole of it: a travelling wave is the one thing in this
 * vocabulary that is flatly impossible. So the worm turns to face you. What is
 * left of a peristaltic wave seen end-on is a ratchet in depth — gather, lunge,
 * slide — and that survives, because depth is the axis a single scale can say
 * something about.
 *
 * `grip` is the speed of the lunge, normalised, and everything hangs off it.
 * The body extends toward the lens while it surges, so its length goes into
 * depth where the lens cannot see it and the drawn body squats; it gathers
 * while it slides back and stands up again. Girth moves the other way and less,
 * the way SWAY_PUMP holds volume. The perspective and the stoop are APPROACH's,
 * because it is the same lens looking at the same body.
 */
const CRAWL_PERIOD = 5.92;
const LUNGE = 0.32;
const CREEP = 0.13;
/**
 * How fast the slide back runs against the lunge, derived rather than typed:
 * both phases are the same eased ramp, so their rates are in the inverse ratio
 * of the time each is given. A wider lunge narrows the gap on its own, and
 * there is no second number to forget to move with it.
 *
 * The slide is eased at both ends like the lunge for one reason, and it is not
 * taste: `grip` below is a *rate*, and it goes straight into the scale. A
 * linear return would hand it a step at the top of the reach — the body would
 * visibly jump on the beat it stopped lunging.
 */
const SLIDE = LUNGE / (1 - LUNGE);

export const CRAWL: OwnMotion = {
  name: "CRAWL",
  note: "gathers, lunges at you, slides back — a wave along a body that is pointing at you",
  poseAt(t) {
    const p = (t % CRAWL_PERIOD) / CRAWL_PERIOD;
    const lunging = p < LUNGE;
    const x = lunging ? p / LUNGE : (p - LUNGE) / (1 - LUNGE);
    const ease = smoothstep(x);
    // Reach out over a third of the cycle and lose it over the rest, with the
    // speed of the reach — not its extent — driving the stretch.
    const out = lunging ? ease : 1 - ease;
    const speed = 4 * x * (1 - x);
    const grip = lunging ? speed : -speed * SLIDE;
    const s = 0.97 / (1 - CREEP * out);
    return pose(0, STOOP * (s - 1), 0, s * (1 + 0.04 * grip), s * (1 - 0.13 * grip));
  },
};
