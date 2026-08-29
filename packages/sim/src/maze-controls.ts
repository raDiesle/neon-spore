import { mazeClickAngle, mazeEntranceCol, mazeWrap } from "./maze.js";
import { enterMazePhase, type MazeState, mazeCurrent } from "./maze-round.js";
import type { MazeWheel } from "./maze-wheel.js";
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
 * The string, and the two gestures that pull it.
 *
 * **`valve` is the thumb**, THE GAUGE's own control and deliberately the same
 * one: the same held verb answered by the same seat, and a second command kind
 * for "turn something" would be a second vocabulary for a thing the pair
 * already understands. It is how Z and X drive the wheel at a desk.
 *
 * **`drag` is the hand on the handle**, and it is the gesture the round is
 * meant to be played with: grab the circle on the string and pull. The two are
 * not alternatives to be chosen between — a hand landing on the string takes
 * the wheel off whatever the thumb was holding, and that is all the
 * arbitration either of them needs.
 *
 * The seat check is a rule of the simulation rather than a coat of paint, for
 * the reason THE GAUGE's is: a player 2 who could turn would be playing both
 * halves of a round whose whole content is that they cannot.
 */
export function mazeStringHeard(world: World, player: 1 | 2, command: Command): void {
  const m = mazeRound(world);
  if (m === null || player !== 1) return;
  if (command.kind === "valve") valveHeard(m, command.on, command.dir);
  else if (command.kind === "drag" && command.target === "mazeString") {
    dragHeard(world, m, command.on, command.fromMilli);
  }
}

/** The thumb, unchanged. */
function valveHeard(m: MazeState, on: boolean, dir: -1 | 1): void {
  if (m.phase !== "read") return;
  if (!on) {
    if (m.turn === dir) m.turn = 0;
    return;
  }
  breakDetent(m);
  m.turn = dir;
}

/**
 * The hand, and the whole of the new gesture.
 *
 * `fromMilli` is how far the hand has come from where it grabbed, in
 * thousandths of a tile — a displacement and not a place, and `Command` in
 * `types.ts` has why. The wheel moves by the **change** in it since the last
 * message, which is the same total as measuring the whole way back to the grab
 * and is what makes a click cost nothing to bookkeep: the wheel stops on the
 * column, and the hand's position there is already the new zero. A message
 * coalesced away is made good by the next one, because what arrives is always
 * the distance from the grab rather than a step.
 *
 * The lift is answered whatever phase the round is in. A hand that let go
 * while the shot was travelling is a hand that let go, and one left standing
 * would measure the next round's first pull against a wheel two phases old.
 */
function dragHeard(world: World, m: MazeState, on: boolean, fromMilli: number): void {
  if (!on) {
    m.dragging = false;
    m.dragFromMilli = 0;
    return;
  }
  if (m.phase !== "read") return;
  const wheel = mazeCurrent(m);
  if (wheel === null) return;
  if (!m.dragging) {
    m.dragging = true;
    m.dragFromMilli = fromMilli;
    // A hand on the string takes it off the thumb. Two pulls at once is not a
    // thing either player can see, and the hand is the one they can point at.
    m.turn = 0;
    return;
  }
  const moved = fromMilli - m.dragFromMilli;
  // In a click, the hand has to carry on past it before anything moves — and
  // `dragFromMilli` is deliberately left where the click caught it, so the
  // measurement is from the detent and not from wherever the hand has crept
  // to since. Without this a resting hand's own jitter took a pair's column
  // back off them between agreeing on it and saying it.
  if (m.lockedWay >= 0 && Math.abs(moved) < world.cfg.mazeDragBreakMilli) return;
  m.dragFromMilli = fromMilli;
  const turned = Math.round((moved * world.cfg.mazeDragMilliPerTile) / 1000);
  if (turned === 0) return;
  breakDetent(m);
  m.angleMilli = mazeWrap(m.angleMilli + turned);
  clickIntoColumn(world, m, wheel);
}

/**
 * Coming out of a click. That is the whole of "pull again": the detent holds
 * until somebody pulls out of it, and the wheel is disarmed until the rim is
 * clear of every column, or it would click straight back into the one it was
 * just pulled out of.
 */
function breakDetent(m: MazeState): void {
  if (m.lockedWay >= 0) m.armed = false;
  m.lockedCol = -1;
  m.lockedWay = -1;
}

/**
 * A way in onto a column, if one has come round to one and the wheel is armed
 * for it. Called by both gestures rather than written twice: which angle counts
 * as *on* a column is one rule, and a second copy of it is how the thumb and
 * the hand come to stop in two different places.
 */
function clickIntoColumn(world: World, m: MazeState, wheel: MazeWheel): boolean {
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
    return true;
  }
  // Between two columns the wheel is armed again, and the next one catches.
  if (clear) m.armed = true;
  return false;
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
  clickIntoColumn(world, m, wheel);
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
  world.events.push({
    type: "mazeProbe",
    ring: mouth.ring,
    sector: mouth.sector,
    of: route.length,
  });
}
