import { DEFAULT_CONFIG, type SpawnEntry } from "@neon-spore/sim";
import { firstOfKind, fresh, type Pose, type PoseGroup, run, POSE_TPB as TPB } from "./pose-kit.js";

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
 * **Both are cropped to a tile, and the tile follows.** A crop used to be
 * worked out once, from the world as it was handed over, which was right only
 * for a pose replayed every two seconds — a body falls a third of a tile in
 * that time. These fall for nine seconds, so both were written with
 * `crop: "tile"`, both showed an empty lane for eight of their ten seconds,
 * and both had to be widened to the whole field. `versus-crop.ts`'s
 * `CropWindow` re-derives the rectangle from the world each frame is drawn
 * from, so they are back on a tile: the magnification a surface is judged at,
 * held on the body for the whole fall.
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
  crop: "tile",
  at: firstOfKind("choir"),
  // Wider than the default 3.4: a membrane is judged on what is happening
  // *inside* one skin, and a window fitted to the outline leaves the eye no
  // margin to read a bulge against.
  span: 4.5,
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
  crop: "tile",
  at: firstOfKind("throb"),
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

/**
 * A wisp standing on the field with nothing else on it.
 *
 * **It is the one body in this game that does not fall**, so it is also the one
 * pose here that needs no replay at all: it stands, it jumps to another tile
 * every `wispDwellBeats`, and it is still there when the pair has finished
 * looking. That is exactly the state a fringe wants to be judged in — the jump
 * is what the streamers read, and a surface needs every second it can get.
 *
 * **Only player two is shown one**, which is the creature rather than an
 * omission (`showsWisp`). The pair draws both seats' screens one above the
 * other, so the row that matters is the lower one; player one's is a correct
 * picture of an empty field and is part of what this body *is*.
 */
const WISP_POSE: Pose = {
  name: "WISP · STANDING",
  note: "One wisp on an otherwise empty field. It never comes down a column: it stands, and every few beats it is somewhere else entirely — so the wave stays open until it is shot, and only player two is ever shown one.",
  lookAt:
    "what hangs under the bell — whether the streamers read as a fringe round it or as a comb across the front of it",
  crop: "field",
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "wisp", color: "cyan" };
    const w = fresh([entry]);
    // Four beats, so it has made at least one jump and the streamers have been
    // through a gather, a flight and a splash before anybody is looking.
    run(w, TPB * 4);
    return w;
  },
};

/**
 * One wheel, turning, with its six bodies on it.
 *
 * A gyre walks a diamond and sinks as it goes, and then it stays: at twenty
 * beats it is still on the field with all six mounts up, which is what makes it
 * the second pose here that can be held rather than replayed. The middle of it
 * turns at the wheel's *true* rate while the rim ratchets, so the organelle a
 * candidate argues about is the one part of this picture that never stops
 * moving — and a candidate that claims a surface is turning needs to be watched
 * turning for longer than two seconds.
 */
const GYRE_POSE: Pose = {
  name: "GYRE · TURNING",
  note: "A wheel of six bodies on a turning rim, with the organelle in the middle. The rim ratchets because bodies stand on tiles; the middle is free to turn at the wheel's true rate, which is why it is the readout a pair checks when they cannot tell whether the maw's pull landed.",
  lookAt:
    "the surface in the middle of the wheel — whether the swim reads as fluid inside something or as a pattern going round",
  crop: "field",
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "gyre", color: null };
    const w = fresh([entry]);
    // Long enough that the wheel has sunk to where it settles and all six
    // mounts are on the field — a wheel half off the top is a wheel with three
    // bodies on it.
    run(w, TPB * 12);
    return w;
  },
};

export const SURFACE_POSES: Pose[] = [CHOIR_POSE, THROB_POSE, WISP_POSE, GYRE_POSE];

export const SURFACE_GROUP: PoseGroup = {
  title: "SURFACES",
  note: "the state each open VERSUS slot about a surface is judged on — style-guide.md, Depth",
  poses: SURFACE_POSES,
};
