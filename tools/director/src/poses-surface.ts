import { DEFAULT_CONFIG, type SpawnEntry } from "@neon-spore/sim";
import { fresh, type Pose, type PoseGroup, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * The states a candidate for a **surface** is judged on.
 *
 * Its own file rather than rows added to `poses-versus.ts`, which sits one line
 * under the ceiling — CLAUDE.md's *split rather than grow* — and its own group
 * on the STATES sheet, which is honest rather than incidental. Every pose next
 * door is a state in which something *happens*: a plate turns a shot away, a
 * hand shoves a rock, a shot arrives. A surface is not an event. What a
 * candidate for one needs is the opposite — a body standing still for long
 * enough that its far side has time to come round — and the two lists answer
 * different questions.
 *
 * **The rhythm is the one thing these poses do differently, and it is the
 * whole reason they are here.** `EVENT_CADENCE_SECONDS` is two, which is the
 * owner's number for watching a thing happen and then happen again. A turning
 * surface replayed every two seconds is a surface that never finishes a turn,
 * and the reveal — the far marks coming into view, which `docs/dimensional.md`
 * calls the one cue that is a difference in kind rather than of degree — is
 * precisely what a two-second window cuts off. So a pose here is held for as
 * long as its body is on the field and replayed when it leaves.
 *
 * **And that is why neither of them is cropped to a tile.** A crop is worked
 * out once, from the world as it is handed over (`pose-art.ts`'s `cropRect`),
 * and these bodies then fall for nine seconds — so a tile window centred on
 * where one started is a window the body drops straight out of, and the page
 * shows an empty lane for eight of its ten seconds. Both of these were written
 * with `crop: "tile"` first and both had to be widened. The whole field keeps
 * the body on screen for its whole fall at exactly the size a thumb meets it
 * at, and the controls bar's own 2× is the magnifier for anybody who wants
 * one. `docs/queue.md` carries the entry for making a tile crop follow.
 */

const COL = 5;

/**
 * How long a body spends falling from the top of the field to the ship, in
 * seconds, plus a moment.
 *
 * Derived rather than typed: a body falls a row a beat, the field is
 * `rows` deep and a beat is `60 / bpm` seconds, so the count comes off the
 * config the pose is built with and cannot drift when either number moves.
 * The half-beat is so the replay lands on an empty field rather than in the
 * middle of a body breaking up against the hull.
 */
function fallSeconds(): number {
  return ((DEFAULT_CONFIG.rows + 0.5) * 60) / DEFAULT_CONFIG.bpm;
}

/**
 * A membrane standing in one lane with nobody shaking anything at it.
 *
 * **This is the state THE CHOIR spends nearly all of its life in** and the one
 * no pose had ever put on a page: two grey bodies inside one skin, drifting
 * about each other, answered by neither trigger until a gesture that has not
 * happened yet. Everything a candidate surface for it could argue about is on
 * screen from the first frame and stays there — which is why it carries no
 * event cadence and a fall-length one instead.
 *
 * A colour is authored on it, because `authorsColor` is set on the kind and a
 * choir with none is a body nothing can build. It is not visible: until the
 * two have drawn together the skin is `PALETTE.rock`, and the colour is what
 * arrives *afterwards*.
 */
const CHOIR_POSE: Pose = {
  name: "CHOIR · TWO VOICES",
  note: "A membrane falling in one lane with no gesture made at it. Two grey bodies inside one traced skin, drifting about each other and turning slowly — the state this creature spends nearly all its life in, and the one in which neither trigger answers it.",
  lookAt:
    "the inside of the membrane — whether the two voices read as bodies or as a dent in one outline",
  crop: "field",
  cadenceSeconds: fallSeconds(),
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "choir", color: "cyan" };
    const w = fresh([entry]);
    // Two beats, so the body is clear of the top of the field and its drift has
    // started. Nothing is pressed: the gesture is exactly what this state is
    // the absence of.
    run(w, TPB * 2);
    return w;
  },
};

/**
 * One throb alone in a lane, turning.
 *
 * `BODIES · FOUR KINDS AT ONCE` already puts a throb on a page and is the
 * right pose for a **contour**: a shape has to stay tellable from the shapes it
 * could be mistaken for, and four kinds on one frame is the only way to see
 * that. It is the wrong pose for a *turn*. It is cropped to the whole field
 * with three other bodies moving on it and replayed every two seconds, and a
 * throb comes all the way round every `throbSpinBeats` — so what it shows of a
 * revolution is one revolution, in the corner of a busy frame.
 *
 * Here the body is alone on the field, and held for the whole fall: five turns
 * with nothing else moving on the frame, which is what it takes to see
 * whether a seam swells and shuts twice a revolution or simply sweeps round
 * once like the hand of a clock.
 */
const THROB_POSE: Pose = {
  name: "THROB · TURNING",
  note: "One throb falling in a lane with nothing else on the field. Half of it is one ammunition colour and half the other, and it turns clockwise the whole way down — which half is pointing at the cannon is what a shot meets, so the seam between them is the readout the pair fires against.",
  lookAt: "the cut between the two colours as the body turns — how wide it gets, and how often",
  crop: "field",
  cadenceSeconds: fallSeconds(),
  build: () => {
    // A colour is authored, because half of a throb is the colour it arrived
    // in and the other half is the one it did not (`throbColorAt`). The kind is
    // spelled out beside it rather than asked of `kindForColor`, which answers
    // a different question — the shape a colour implies — and would hand back
    // a slick.
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "throb", color: "red" };
    const w = fresh([entry]);
    run(w, TPB * 2);
    return w;
  },
};

export const SURFACE_POSES: Pose[] = [CHOIR_POSE, THROB_POSE];

export const SURFACE_GROUP: PoseGroup = {
  title: "SURFACES",
  note: "the state each open VERSUS slot about a surface is judged on — style-guide.md, Depth",
  poses: SURFACE_POSES,
};
