import { MAZE_ROUNDS, PINBALL_ROUNDS } from "@neon-spore/content";
import { mazeRound, pinballRound } from "@neon-spore/sim";
import { fresh, type Pose, type PoseGroup, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * The states a candidate for an **interlude** is judged on, and the first
 * poses on this page that are not the field.
 *
 * Every VERSUS slot that had ever been opened before 9 September 2026 was a
 * creature, the ship, a control or a boss's armour. The interludes are whole
 * screens with their own walls, tables, ribbons and pieces; they are what a
 * pair looks at for a minute at a time with nothing falling; and not one of
 * them had ever had a second answer offered to anything it draws. That was not
 * because they are finished — it is that `versus-pose.ts` maps a slot to a
 * pose, every pose was a *field* pose, and nobody had written one that hands
 * the pair a round.
 *
 * **Nothing here needs machinery to do it.** A round is installed the way any
 * boss is, off a wave's own `boss:` entry (`docs/decisions.md` #20), so
 * `fresh([], [], { kind, … })` is the whole of it and the renderer routes to
 * the round's own drawing on its own. That was the thing worth checking before
 * a line of paint was written, and it holds: the file below is short because
 * the answer was that no mechanism was missing.
 *
 * **A round is held, not replayed.** `EVENT_CADENCE_SECONDS` is the number for
 * watching a thing happen and then happen again, and a
 * round is not an event — it is a screen a pair reads for a minute, and the
 * question a candidate asks about one is whether it can be read at all. So
 * these carry no cadence and stand until the tab is closed, which is
 * `poses-surface.ts`'s argument arrived at from the other side.
 */

const NOTHING: [] = [];

/**
 * THE MAZE turning over the ship, with the pair still reading it.
 *
 * Handed over in the `read` phase, which is where the round spends nearly all
 * of its time and the only phase in which the drum is the whole question: the
 * wheel is up, every wall and every gap is on it, and nothing has been fired
 * yet. A pose held during a shot would be a pose about the shot.
 *
 * Both seats draw the same frame here — with the maze, the shot and the middle
 * on both of them there is no seat to draw the round *for*, which is a decision
 * the owner made three times (`packages/sim/src/maze.ts`). The string under the
 * drum is the one exception and belongs to the pilot.
 */
const MAZE_POSE: Pose = {
  name: "MAZE · THE WHEEL TO READ",
  note: "A drum of rings turning over the ship, with gaps cut in every circle and radial walls making the corridors turn. The pair has to find a way in from the rim to the middle before the shot goes, and both of them are looking at the same picture — the only round in the game where neither seat is holding half of it.",
  lookAt:
    "the corridors between the rings — whether it is possible to tell which wall is nearer and which way a corridor turns, at the speed the wheel moves",
  crop: "field",
  build: () => {
    const w = fresh(NOTHING, NOTHING, { kind: "maze", rounds: MAZE_ROUNDS });
    // Four beats past the opening, so the drum has turned far enough that the
    // gaps are nowhere near where they started and the picture is the ordinary
    // one rather than the first frame of it.
    run(w, TPB * 4);
    const m = mazeRound(w);
    if (m === null || m.phase !== "read") {
      throw new Error(`the maze is not being read: ${m === null ? "no round" : m.phase}`);
    }
    return w;
  },
};

/**
 * PINBALL's table, with the ball on it and the pair still playing.
 *
 * The second round posed, and it is here to prove the first one was not a
 * special case: an interlude is installed off a wave's `boss:` entry like any
 * other, so a second one costs a wave entry and four beats. It is also the
 * round that looks least like the field — a table with its own bumpers,
 * lanes and flippers where the ship's own furniture would be — which is
 * exactly the sort of picture that has never had a second answer offered to
 * anything on it.
 *
 * It is handed over **past the morph**, because the morph is the field
 * becoming the table and a look about the table would be judged on half of
 * one. The wave names its own control set, and the pose takes it: this round
 * is played on buttons the pair does not have anywhere else.
 */
const PINBALL_POSE: Pose = {
  name: "PINBALL · THE TABLE",
  note: "The field folded into a table: bumpers, lanes and two flippers where the band would be. Both seats see the same table and each holds one flipper, so a rally is two people taking turns at one ball rather than one person playing both sides.",
  lookAt:
    "the table itself — the bumpers, the lanes and what a ball is drawn against, before anything about the flippers",
  crop: "field",
  build: () => {
    const w = fresh(NOTHING, NOTHING, { kind: "pinball", rounds: PINBALL_ROUNDS });
    // Past the morph, so the table is a table rather than a field halfway to
    // being one.
    run(w, TPB * 8);
    const p = pinballRound(w);
    if (p === null || p.phase === "morph") {
      throw new Error(`the table has not settled: ${p === null ? "no round" : p.phase}`);
    }
    return w;
  },
};

export const ROUND_POSES: Pose[] = [MAZE_POSE, PINBALL_POSE];

export const ROUND_GROUP: PoseGroup = {
  title: "ROUNDS",
  note: "the state each open VERSUS slot about an interlude is judged on — interludes.md",
  poses: ROUND_POSES,
};
