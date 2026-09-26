import { instarHand } from "@neon-spore/hands";
import { slowing, type World } from "@neon-spore/sim";
import { EVENT_CADENCE_SECONDS, type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossWorld, runHand } from "./poses-bosses-kit.js";

/**
 * **THE SLOW, with a window actually open**, which is the one state in this
 * game a picture has never been drawn of.
 *
 * A window is two hashed beats and a stretched `tickMs` (`sim/slow.ts`,
 * `apps/game/src/tick-rate.ts`): the pair feel the game take a breath and
 * nothing on the screen says so. `render/slow-look.ts` is the seam a candidate
 * patches, and this is what it is judged on — the `slow:window` slot's pose,
 * and the only place on the whole sheet where `slowing(world)` is true.
 *
 * **THE INSTAR, because the window is its gesture.** THE SLOW opens where a
 * step of marks has to be answered together, and the boss that asks for that
 * twice a round is the one the owner named when he asked for the pressure to
 * be seen (`docs/queue.md`, 19 September 2026). So the pose is THE INSTAR's own
 * wave with `instarHand` on it — the same hand the boss's state poses use — run
 * until a window opens, and the hand kept on afterwards so the next step lands
 * and opens another one while the page is being looked at.
 *
 * **It is an event and carries the ordinary cadence.** A window is two beats
 * wide, spent at `slowRateMilli` — near four seconds in the hand — and what a
 * candidate is judged on is the whole of it: the moment it opens, the way it
 * runs down, and the frame after it shuts. Six seconds holds all three with the
 * ordinary field either side of it to compare against (`pose-type.ts`).
 *
 * Its own file rather than a row in `poses-versus.ts`, which is at the line
 * ceiling — CLAUDE.md's *split rather than grow* — and it is the only pose that
 * needs both a boss's wave and a boss's hand to reach a state that is not the
 * boss's at all.
 */
export const SLOW_WINDOW_POSE: Pose = {
  name: "THE SLOW · A WINDOW OPEN",
  note: "THE INSTAR's step has gone up and the pair have two beats to answer every mark of it together. The game is running at a third of its rate for the length of that answer, and today the picture says nothing at all about it — the whole difference a candidate makes is on this frame.",
  lookAt:
    "the field while the game is slowed — whatever says that the next two beats are wider than the two before them, and how it ends",
  crop: "full",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: (): World => {
    const world = bossWorld("instar");
    // Never assigned: `openSlow` is not even exported from the simulation, so
    // the only way to this state is the boss reaching it (`pose-kit.ts`).
    runHand(world, "a window THE SLOW opened", instarHand, slowing, TPB * 60);
    return world;
  },
  hand: (world) => instarHand(world).map((c) => ({ ...c, tick: world.tick })),
};

/**
 * **THE SLOW, with a window nobody answers** — what a measure of the time left
 * is judged on. `A WINDOW OPEN` keeps THE INSTAR's hand on, and the hand
 * answers the step on the first tick of the pair, so the window shuts before a
 * measure has drawn one beat of itself. This one builds the same world and
 * takes the hand away: the step's eight beats run out and the strike lands,
 * which is the whole promise a measure makes — how long, and then what.
 *
 * **Its own cadence, and a long one.** The pair spends a window at the rate
 * the phone does (`versus-pair.ts`, `stageTickHz`), so eight beats at a
 * quarter rate are twenty seconds of the pair's clock; the ordinary six
 * rebuilt the pose with a third of the window burned and the strike never
 * reached. Two seconds past it keep the frame after the hit on the page.
 */
/** THE INSTAR's step window at the slowed rate, and the strike after it. */
const RUNS_OUT_SECONDS = 22;

export const SLOW_RUNS_OUT_POSE: Pose = {
  name: "THE SLOW · A WINDOW RUNNING OUT",
  note: "THE INSTAR's step has gone up and nobody answers it. The window runs its eight beats at a quarter of the game's rate and the strike lands at the end — a measure has to say how long is left, and turn urgent before the hit, not after.",
  lookAt:
    "whatever counts the window down — can a pair read how long is left, and does it say so before the strike",
  crop: "full",
  cadenceSeconds: RUNS_OUT_SECONDS,
  build: SLOW_WINDOW_POSE.build,
};
