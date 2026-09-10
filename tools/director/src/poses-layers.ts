import { DEFAULT_CONFIG, type SpawnEntry, type TimedCommand } from "@neon-spore/sim";
import {
  aim,
  EVENT_CADENCE_SECONDS,
  firstOfKind,
  fresh,
  type Pose,
  type PoseGroup,
  pullCord,
  run,
  shoot,
  POSE_TPB as TPB,
} from "./pose-kit.js";

/**
 * The states a candidate for a **layer over a body** is judged on — a skin
 * coming off THE RIND, the armour parting on THE LID.
 *
 * Its own file for the reason every pose file since `poses-versus.ts` has
 * been: the one these would have gone in is at the line ceiling. But the two
 * here also share something the others do not, and it is what `Pose.hand`
 * exists for. Neither state is reached once and then watched. A rind sheds on
 * a *shot* and a lid opens under a *pull*, and both are over in well under a
 * second — so a pose that built the moment and handed it over would show one
 * shed, or an eye standing open, and then nothing for the rest of the window.
 * These keep a hand on the world instead: the cannon fires again two beats
 * later, the cord is pulled, held and let go on a clock of its own, and the
 * pair sees the thing happen several times at the size it happens at.
 */

const COL = 5;

/**
 * A rind losing both its layers and then its life, one shot every two beats.
 *
 * Three beats in before the first shot, so the body is well onto the field at
 * its full three sizes when the first skin comes off; two beats between shots,
 * which is long enough for one shed to finish (`rind-shed.ts`'s `LIFE` is
 * under half a second) and for the eye to read the smaller body before the
 * next one lands. The third shot kills what is left, which is the creature's
 * own sentence ending — a rind cut down to size dies to an ordinary shot — and
 * the six-second window then holds an empty lane for a beat or two before the
 * next rind comes down.
 */
const RIND_POSE: Pose = {
  name: "RIND · SHEDDING",
  note: "One red rind coming down a lane, three bodies wide, shot every two beats by a cannon aimed up its column. Each hit takes a layer off: the outline it wore collapses onto the smaller body and the skin is thrown out into the space around it. The third shot kills the ordinary body left at the end. It replays every six seconds.",
  lookAt:
    "the body at the moment a shot lands — whether what comes off it reads as a skin leaving a solid thing, or as a ring drawn around a sprite",
  crop: "tile",
  span: 5,
  at: firstOfKind("rind"),
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "rind", color: "red" };
    const w = fresh([entry]);
    run(w, TPB * 3, [aim(0, COL)]);
    return w;
  },
  hand: (w) => {
    const since = w.tick - TPB * 3;
    if (since < 0 || since % (TPB * 2) !== 0) return [];
    if (!w.creatures.some((c) => c.kind === "rind")) return [];
    return [shoot(w.tick, "red")];
  },
};

/** How long the lid's hand takes over one pull: half a beat shut, pulled over
 * a beat, held a beat and a half, let go, and a beat shut before the next
 * grab — so every cycle starts and ends on a lid nobody is holding. */
const REST_BEATS = 0.5;
const PULL_BEATS = 1;
const HOLD_BEATS = 1.5;
const CYCLE_BEATS = 4;
/**
 * Two cycles and then the lid is built again at the top. Not a whole fall,
 * which is what `LID · THE EYE OPEN` holds for: a cord is bounded by the
 * field (`handle-pull.ts`), so a lid past the middle of the field has no room
 * under it for a taut pull, and a third cycle would open the plates part-way
 * and stop — a picture of the clamp rather than of the armour.
 */
const LID_CADENCE_SECONDS = (CYCLE_BEATS * 2 * 60) / DEFAULT_CONFIG.bpm;

/** The hand coming off the cord. `pullCord` is the hand going on. */
const letGo = (tick: number, id: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "drag", target: "lidString", on: false, fromMilli: 0, id },
});

/**
 * A lid whose cord is pulled, held taut and let go, over and over.
 *
 * The pull ramps a tick at a time, which is what a finger on glass actually
 * sends, so the plates are seen to *part* rather than to be open; it goes a
 * little past taut for `LID · THE EYE OPEN`'s reason — a pull stopping exactly
 * on the threshold is one rounding from a shut eye. The hold is long enough
 * to read the open state, and the release is one message, because a hand
 * lifting is one event and the plates close on the rule with no easing
 * anywhere between it and the picture (`lid.ts` in sim).
 */
const LID_POSE: Pose = {
  name: "LID · OPENING",
  note: "One armoured eye coming down a lane. The pilot's thumb takes the cord under it, pulls it down over one beat until the plates are fully back, holds it there, and lets go — and the plates shut on the instant. Then the hand takes the cord again. Two of those and the lid is built again at the top.",
  lookAt:
    "the two grey plates over the eye — how they part as the cord is pulled, what their edges look like while the gap is opening, and how they meet again when the hand lets go",
  crop: "tile",
  span: 3,
  at: firstOfKind("lid"),
  cadenceSeconds: LID_CADENCE_SECONDS,
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "lid", color: "red" };
    const w = fresh([entry]);
    run(w, TPB);
    return w;
  },
  hand: (w) => {
    const lid = w.creatures.find((c) => c.kind === "lid");
    if (lid === undefined) return [];
    const since = w.tick - TPB;
    if (since < 0) return [];
    // Whole ticks throughout: a half-beat rest is 37.5 ticks at this tempo, and
    // a release scheduled on a tick and a half never fires.
    const inCycle = (since % (TPB * CYCLE_BEATS)) - Math.round(TPB * REST_BEATS);
    const pullTicks = Math.round(TPB * PULL_BEATS);
    if (inCycle < 0) return [];
    if (inCycle < pullTicks) {
      const reach = Math.round((w.cfg.lidTautMilli * 1.2 * (inCycle + 1)) / pullTicks);
      return [pullCord(w.tick, lid.id, reach)];
    }
    if (inCycle === Math.round(TPB * (PULL_BEATS + HOLD_BEATS))) return [letGo(w.tick, lid.id)];
    return [];
  },
};

export const LAYER_POSES: Pose[] = [RIND_POSE, LID_POSE];

export const LAYER_GROUP: PoseGroup = {
  title: "LAYERS",
  note: "a layer over a body giving way — a skin shed, armour parted — with a hand kept on the world so it happens again",
  poses: LAYER_POSES,
};
