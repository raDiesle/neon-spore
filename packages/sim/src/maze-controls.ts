import { mazeClickAngle, mazeEntranceCol, mazeWrap } from "./maze.js";
import { enterMazePhase, type MazeState, mazeCurrent } from "./maze-round.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MAZE's two verbs, and they are the whole of what the pair can do.
 *
 * One turns and cannot fire; the other fires and cannot turn. With the light
 * on both screens and the shot's journey on both screens there is no knowledge
 * split left in this round at all (`maze.ts`), so the verbs are what the pair
 * has to divide — which is why both of them live in one file rather than in
 * the round's clock next door. Neither seat can reach the other's.
 */

/** The round, if it is the one running. Narrowing in one place rather than six. */
export function mazeRound(world: World): MazeState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "maze" ? boss : null;
}

/**
 * The string, as the pilot's thumb sends it. `valve` is THE GAUGE's control
 * and it is deliberately the same one: the same held verb answered by the same
 * seat, and a second command kind for "turn something" would be a second
 * vocabulary for a thing the pair already understands.
 *
 * The seat check is a rule of the simulation rather than a coat of paint, for
 * the reason THE GAUGE's is: a player 2 who could turn would be playing both
 * halves of a round whose whole content is that they cannot.
 */
export function mazeStringHeard(world: World, player: 1 | 2, command: Command): void {
  const m = mazeRound(world);
  if (m === null || m.phase !== "read" || player !== 1 || command.kind !== "valve") return;
  if (!command.on) {
    if (m.turn === command.dir) m.turn = 0;
    return;
  }
  // A press while a way in is clicked breaks the click and moves on. That is
  // the whole of "pull again": the detent holds until somebody pulls out of it.
  // The wheel is disarmed until the rim is clear of every column, or it would
  // click straight back into the detent it was just pulled out of.
  if (m.lockedWay >= 0) m.armed = false;
  m.lockedCol = -1;
  m.lockedWay = -1;
  m.turn = command.dir;
}

/**
 * The wheel, one tick further round.
 *
 * On the tick and not on the beat, for the reason THE GAUGE's needle is: a
 * string that only answered on the beat would feel like a queue rather than a
 * hand on something. The click is checked after the step and never before it,
 * so a wheel that opens with a way in already on a column still has to be
 * pulled out of it before it can be pulled into another.
 */
export function stepMazeTurn(world: World): void {
  const m = mazeRound(world);
  if (m === null || m.phase !== "read" || m.turn === 0) return;
  const wheel = mazeCurrent(m);
  if (wheel === null) return;

  m.angleMilli = mazeWrap(m.angleMilli + m.turn * world.cfg.mazeTurnMilli);
  let clear = true;
  for (const [way] of wheel.entrances.entries()) {
    const col = mazeEntranceCol(world.cfg, wheel, m.angleMilli, way);
    if (col < 0) continue;
    clear = false;
    if (!m.armed) continue;
    // Pulled exactly onto the column rather than merely near it: the light has
    // to read as standing *on* the column the pair is about to say out loud.
    m.angleMilli = mazeClickAngle(world.cfg, wheel, m.angleMilli, way, col);
    m.lockedWay = way;
    m.lockedCol = col;
    m.turn = 0;
    world.events.push({ type: "mazeCommit", mouth: way, col });
    return;
  }
  // Between two columns the wheel is armed again, and the next one catches.
  if (clear) m.armed = true;
}

/**
 * The pair fired. Called from `applyCommand` for every shot, whether or not
 * the ship let one out — a shot swallowed by the cooldown was still a shot
 * they meant to take, and judging the ship's reaction instead of the players'
 * intent would end an attempt for a reason nobody at either screen can see.
 *
 * It counts only when a way in is clicked onto a column **and the cannon is
 * standing in it**. Anywhere else there is nothing above the cannon to go into,
 * so the shot is an ordinary one up an empty field and the only pressure is the
 * clock — the same answer the old maze gave a column between its mouths.
 */
export function mazeHeard(world: World): void {
  const m = mazeRound(world);
  if (m === null || m.phase !== "read") return;
  if (m.lockedWay < 0 || m.lockedCol !== world.cannonCol) return;
  const wheel = mazeCurrent(m);
  const route = wheel?.entrances[m.lockedWay]?.route ?? [];
  const mouth = route[0];
  if (mouth === undefined) return;
  m.way = m.lockedWay;
  m.step = 0;
  if (!m.tried.includes(m.way)) m.tried.push(m.way);
  enterMazePhase(m, "travel", world.beat);
  // The shot is in the mouth on the beat it was fired. The beats after it are
  // the round's clock (`stepMaze`); this one belongs to the trigger.
  world.events.push({ type: "mazeProbe", row: mouth.ring, lane: mouth.sector, of: route.length });
}
