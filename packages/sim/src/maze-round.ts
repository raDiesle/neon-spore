import {
  MAZE_APPROACH_BEATS,
  MAZE_LEAD_BEATS,
  MAZE_TRAVEL_BEATS,
  MAZE_VERDICT_BEATS,
  mazeReadBeats,
} from "./maze-clock.js";
import { enterMazePhase, type MazeState, mazeCurrent } from "./maze-state.js";
import { mazeRight, mazeSettle, mazeWrong } from "./maze-verdict.js";
import { type MazeWheel, mazeReachesCore } from "./maze-wheel.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * The round the pair plays against THE MAZE, and what it costs them.
 *
 * `maze.ts` next door is the wheel as arithmetic and knows nothing about a
 * world, and `maze-state.ts` is what the boss remembers between ticks and how
 * a phase wipes it; everything here is the fight — the four phases, the shot
 * walking the corridor, and the two ways an attempt can end.
 *
 * **Nothing in this round travels.** The wheel turns in place and the cannon
 * slides on the hull as it always did, so `CLAUDE.md`'s field rule is not in
 * play and the next reader does not have to re-derive that.
 *
 * **The string has two gestures and one detent** (`maze-controls.ts`). The
 * pilot drags the handle on it, or holds `valve` — THE GAUGE's own control, and
 * the keyboard's. Either way the wheel turns until a way in clicks onto a
 * column, where it stops itself, so the pair counts clicks rather than
 * describing an angle — the only thing that survives half a second to two of
 * voice delay (`docs/spec/latency.md`).
 *
 * **Failure arrives through the door that already exists.** A shot down a way
 * in that dead-ends comes back out of the column it went up: `breachHull`, the
 * ordinary crater-and-crack every missed rock already is, which is how THE
 * MIRROR answers a wrong step — and a hit is the wave lost (`wave-fail.ts`),
 * so the field holds where it was struck and the whole wave is played again.
 *
 * **A dead end brings the drum down.** Exactly one gap in each rim reaches
 * the middle (`content/maze-drawn.ts`); the rest open onto regions walled off
 * from it, and a shot sent down one of those is lost. The maze comes apart
 * over the ship, and the stage seen again is the wave's own second try, not
 * the round's (`maze-verdict.ts`). Only the middle moves the fight on, and
 * the next wheel comes up with a gap more.
 */

/**
 * The colour the heart is running this round, and therefore the only colour a
 * shot that reaches it counts in.
 *
 * **It alternates, and that is the round's second half.** A slick's red, then
 * a bulb's cyan, then red again — the two colours the field already carries,
 * so player 2 is choosing between the two she has rather than learning a third.
 * The heart is drawn in it (`render/maze-heart.ts`), so neither player is
 * being asked to remember anything: the answer is in the middle of the drum,
 * beating, on both screens.
 *
 * A rule rather than a look, which is why it is here. The picture calls this;
 * a second copy of it in `render/` is how a heart comes to be drawn one colour
 * and to accept the other.
 */
export function mazeHeartColor(round: number): Color {
  return round % 2 === 0 ? "red" : "cyan";
}

/** That colour as `MazeState.shotColor` records one: 0 red, 1 cyan. */
export function mazeHeartShot(round: number): number {
  return mazeHeartColor(round) === "red" ? 0 : 1;
}

/** One beat of the boss. A phase that ends on this beat hands it straight to
 * the next rather than to the next beat, so the beat a shot sets off on is the
 * beat it takes its first cell — the same off-by-one `stepMirror` avoids, and
 * the same at-most-one-transition-per-hop loop that makes it safe. */
export function stepMaze(world: World, m: MazeState): void {
  const wheel = mazeCurrent(m);
  if (wheel === null) return;

  for (let hop = 0; hop < 4; hop++) {
    const since = world.beat - m.phaseBeat;

    if (m.phase === "lead") {
      if (since < MAZE_LEAD_BEATS) return;
      enterMazePhase(m, "read", world.beat);
      continue;
    }
    if (m.phase === "read") {
      // Silence is an answer too, and it is the wrong one.
      if (since >= mazeReadBeats(wheel.entrances.length)) mazeWrong(world, m, "silence");
      return;
    }
    if (m.phase === "travel") {
      // The climb up the column. The shot is not in the drum yet and there is
      // nothing to report about where it stands inside one.
      if (since < MAZE_APPROACH_BEATS) return;
      const inside = since - MAZE_APPROACH_BEATS;
      const route = wheel.entrances[m.way]?.route ?? [];
      const step = Math.floor(inside / MAZE_TRAVEL_BEATS);
      if (step >= route.length) {
        // The end of the walk, and two ways to have got it wrong: a corridor
        // that went nowhere, or the wrong colour arriving at a heart that only
        // takes its own. Both cost the hull; only the right colour in the
        // middle takes a share of the boss.
        const home = mazeReachesCore(wheel.entrances[m.way]!);
        if (home && m.shotColor === mazeHeartShot(m.round)) mazeRight(world, m);
        else mazeWrong(world, m, home ? "color" : "mouth");
        continue;
      }
      if (inside % MAZE_TRAVEL_BEATS === 0) advance(world, m, wheel, step);
      return;
    }
    if (since < MAZE_VERDICT_BEATS) return;
    mazeSettle(world, m);
    return;
  }
}

/** The shot, one corridor further along. Where it stands is what both see. */
function advance(world: World, m: MazeState, wheel: MazeWheel, step: number): void {
  const route = wheel.entrances[m.way]?.route ?? [];
  const cell = route[step];
  if (cell === undefined) return;
  m.step = step;
  world.events.push({
    type: "mazeProbe",
    ring: cell.ring,
    angleMilli: cell.angleMilli,
    of: route.length,
  });
}
